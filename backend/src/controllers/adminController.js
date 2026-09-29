const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const {
  getAIConfigurationDiagnostics,
  testAIConnectivity
} = require('../services/geminiClient');

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email || '';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
};

const safeCompanyDetails = () => ({
  name: process.env.COMPANY_NAME || 'Medical Mania',
  website: process.env.COMPANY_WEBSITE_URL || 'https://medicalmania.site',
  supportEmail: process.env.COMPANY_SUPPORT_EMAIL || process.env.ADMIN_EMAIL || 'support@medicalmania.site',
  configuredAdminEmail: process.env.ADMIN_EMAIL ? maskEmail(process.env.ADMIN_EMAIL) : 'Not configured in environment',
});

// @route   GET /api/admin/overview
// @access  Private/Admin
exports.getOverview = async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [
      totalStudents,
      activeStudents,
      newStudents,
      totalQuestions,
      publishedQuestions,
      pendingQuestions,
      aiGeneratedQuestions,
      totalTests,
      publishedTests,
      totalAttempts,
      recentAttempts,
      subjectDistribution,
      recentStudentsRaw,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'student', createdAt: { $gte: since } }),
      Question.countDocuments(),
      Question.countDocuments({ isPublished: true }),
      Question.countDocuments({ $or: [{ isPublished: false }, { status: 'pending' }, { status: 'needs-review' }] }),
      Question.countDocuments({ generatedByAI: true }),
      Test.countDocuments(),
      Test.countDocuments({ isPublished: true, isActive: true }),
      TestAttempt.countDocuments(),
      TestAttempt.countDocuments({ createdAt: { $gte: since } }),
      Question.aggregate([
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.find({ role: 'student' })
        .sort({ createdAt: -1 })
        .limit(8)
        .select('firstName lastName email createdAt lastLogin subscription.plan isActive')
        .lean(),
    ]);

    // Attach attempt count for recent students
    const studentIds = recentStudentsRaw.map((s) => s._id);
    const attemptCounts = await TestAttempt.aggregate([
      { $match: { user: { $in: studentIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const attemptMap = new Map(attemptCounts.map((a) => [String(a._id), a.count]));

    const recentStudents = recentStudentsRaw.map((s) => ({
      ...s,
      attemptCount: attemptMap.get(String(s._id)) || 0,
    }));

    const memoryUsage = process.memoryUsage();
    const aiDiagnostics = getAIConfigurationDiagnostics();

    res.json({
      success: true,
      data: {
        company: safeCompanyDetails(),
        service: {
          api: 'operational',
          database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
          uptimeSeconds: Math.floor(process.uptime()),
          environment: process.env.NODE_ENV || 'development',
          nodeVersion: process.version,
          memoryMb: Math.round(memoryUsage.rss / 1024 / 1024),
          generatedAt: new Date().toISOString(),
        },
        ai: aiDiagnostics,
        metrics: {
          totalStudents,
          activeStudents,
          newStudents,
          totalQuestions,
          publishedQuestions,
          pendingQuestions,
          aiGeneratedQuestions,
          totalTests,
          publishedTests,
          totalAttempts,
          recentAttempts,
        },
        subjectDistribution: subjectDistribution.map(({ _id, count }) => ({
          subject: _id || 'Unclassified',
          count,
        })),
        recentStudents,
      },
    });
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    res.status(500).json({ success: false, message: 'Could not fetch admin overview: ' + error.message });
  }
};

// @route   GET /api/admin/ai-status
// @access  Private/Admin
exports.getAiStatus = async (req, res) => {
  try {
    const diagnostics = getAIConfigurationDiagnostics();
    res.json({
      success: true,
      data: diagnostics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   POST /api/admin/test-ai
// @access  Private/Admin
exports.testAiConnection = async (req, res) => {
  try {
    const { prompt } = req.body || {};
    const result = await testAIConnectivity(prompt);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to execute AI test: ' + error.message,
    });
  }
};

// @route   GET /api/admin/students
// @access  Private/Admin
exports.getStudentsList = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 20, status = 'all' } = req.query;
    const query = { role: 'student' };

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search.trim()) {
      query.$or = [
        { firstName: { $regex: search.trim(), $options: 'i' } },
        { lastName: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('firstName lastName email createdAt lastLogin isActive subscription')
        .lean(),
      User.countDocuments(query),
    ]);

    const studentIds = students.map((s) => s._id);
    const attemptCounts = await TestAttempt.aggregate([
      { $match: { user: { $in: studentIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);
    const attemptMap = new Map(attemptCounts.map((a) => [String(a._id), a.count]));

    const enrichedStudents = students.map((s) => ({
      ...s,
      attemptCount: attemptMap.get(String(s._id)) || 0,
    }));

    res.json({
      success: true,
      data: {
        students: enrichedStudents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
