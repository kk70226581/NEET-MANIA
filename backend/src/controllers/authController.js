/**
 * Authentication Controller
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

const adminConfigurationIsValid = () => (
  process.env.ADMIN_EMAIL
  && process.env.ADMIN_PASSWORD
  && process.env.ADMIN_PASSWORD !== 'change_me_in_production'
);

const adminResponse = (res, user, message = 'Admin login successful') => {
  const token = generateToken(user._id);
  return res.status(200).json({
    success: true,
    message,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, phone, class: studentClass } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = String(phone || '').replace(/\D/g, '') || undefined;

    // Validation
    if (!firstName || !lastName || !email || !password || !studentClass) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const duplicateFilters = [{ email: normalizedEmail }];
    if (normalizedPhone) duplicateFilters.push({ phone: normalizedPhone });
    const existingUser = await User.findOne({ $or: duplicateFilters });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === normalizedEmail
          ? 'Email already registered'
          : 'Phone number already registered'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      password,
      phone: normalizedPhone,
      class: studentClass,
      role: 'student'
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error('❌ Registration Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const identifier = String(email || '').trim();

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Get user with password
    const normalizedPhone = identifier.replace(/\D/g, '');
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        ...(normalizedPhone.length === 10 ? [{ phone: normalizedPhone }] : [])
      ]
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('❌ Login Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   POST /api/auth/admin/login
// @desc    Login the single owner account configured through environment variables.
// @access  Public
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const configuredEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();

    if (!adminConfigurationIsValid()) {
      return res.status(503).json({
        success: false,
        message: 'Owner admin access is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server.',
      });
    }

    if (String(email || '').trim().toLowerCase() !== configuredEmail || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, message: 'Invalid admin ID or password' });
    }

    let user = await User.findOne({ email: configuredEmail }).select('+password');
    if (!user) {
      user = await User.create({
        firstName: 'Medical',
        lastName: 'Mania Admin',
        email: configuredEmail,
        password: process.env.ADMIN_PASSWORD,
        class: 'just-exploring',
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
    } else {
      user.role = 'admin';
      user.isActive = true;
      if (!(await user.comparePassword(process.env.ADMIN_PASSWORD))) user.password = process.env.ADMIN_PASSWORD;
      user.lastLogin = new Date();
      await user.save();
    }

    return adminResponse(res, user);
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Unable to complete admin login' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, preferences, targetYear } = req.body;
    const update = {};
    if (firstName !== undefined) update.firstName = String(firstName).trim();
    if (lastName !== undefined) update.lastName = String(lastName).trim();
    if (phone !== undefined) {
      const normalizedPhone = String(phone).replace(/\D/g, '');
      update.phone = normalizedPhone || undefined;
    }
    if (preferences !== undefined) update.preferences = preferences;
    if (targetYear !== undefined) update.targetYear = targetYear;

    const user = await User.findByIdAndUpdate(
      req.userId,
      update,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required'
      });
    }

    const user = await User.findById(req.userId).select('+password');

    // Check current password
    const isCorrect = await user.comparePassword(currentPassword);

    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};
