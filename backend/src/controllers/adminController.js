const mongoose = require('mongoose');
const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');

const safeCompanyDetails = () => ({
  name: process.env.COMPANY_NAME || 'Medical Mania',
  website: process.env.COMPANY_WEBSITE_URL || 'https://medicalmania.site',
  supportEmail: process.env.COMPANY_SUPPORT_EMAIL || process.env.ADMIN_EMAIL || '',
});

// @route   GET /api/admin/overview
// @access  Private/Admin
exports.getOverview = async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const [
    totalStudents,
    activeStudents,
    newStudents,
    totalQuestions,
    publishedQuestions,
    pendingQuestions,
    totalTests,
    publishedTests,
    totalAttempts,
    recentAttempts,
    subjectDistribution,
    recentStudents,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'student', createdAt: { $gte: since } }),
    Question.countDocuments(),
    Question.countDocuments({ isPublished: true }),
    Question.countDocuments({ $or: [{ isPublished: false }, { status: 'pending' }] }),
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
      .limit(6)
      .select('firstName lastName email createdAt lastLogin subscription.plan isActive')
      .lean(),
  ]);

  res.json({
    success: true,
    data: {
      company: safeCompanyDetails(),
      service: {
        api: 'operational',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'unavailable',
        uptimeSeconds: Math.floor(process.uptime()),
        environment: process.env.NODE_ENV || 'development',
        generatedAt: new Date().toISOString(),
      },
      metrics: {
        totalStudents,
        activeStudents,
        newStudents,
        totalQuestions,
        publishedQuestions,
        pendingQuestions,
        totalTests,
        publishedTests,
        totalAttempts,
        recentAttempts,
      },
      subjectDistribution: subjectDistribution.map(({ _id, count }) => ({ subject: _id || 'Unclassified', count })),
      recentStudents,
    },
  });
};
