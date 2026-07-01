const mongoose = require('mongoose');
const crypto = require('crypto');
const { TEST_TYPES, TEST_CONFIG } = require('../config/constants');

const TestSchema = new mongoose.Schema({
  // Test Identification
  testId: {
    type: String,
    unique: true,
    default: () => `TEST-${crypto.randomUUID()}`
  },
  testName: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true
  },
  testType: {
    type: String,
    enum: Object.values(TEST_TYPES),
    required: true,
    index: true
  },
  description: String,

  // Test Configuration
  subjects: {
    type: Map,
    of: {
      questionCount: Number,
      topics: [String],
      difficulty: [String],
      maxTime: Number
    }
  },

  // Total Configuration
  totalQuestions: {
    type: Number,
    required: true
  },
  totalTime: {
    type: Number,
    required: true,
    default: 180 // minutes
  },

  // Question Distribution
  questionDistribution: {
    physics: { type: Number, default: 0 },
    chemistry: { type: Number, default: 0 },
    botany: { type: Number, default: 0 },
    zoology: { type: Number, default: 0 },
    biology: { type: Number, default: 0 }
  },

  // Questions
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],

  // Metadata
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  source: {
    type: String,
    enum: ['pyq', 'mock', 'dpp', 'coaching', 'mixed'],
    required: true,
    default: 'mixed'
  },

  // Source Details
  sourceDetails: {
    year: Number,
    month: String,
    coachingInstitute: String,
    mockSeriesName: String
  },

  // Filters Applied
  filters: {
    chapters: [String],
    topics: [String],
    difficulty: [String],
    source: [String],
    bloomsLevel: [String]
  },

  // Randomization Settings
  randomized: {
    type: Boolean,
    default: true
  },
  randomSeed: String,

  // Test Statistics
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    averageAccuracy: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    },
    highestScore: {
      type: Number,
      default: 0
    },
    lowestScore: {
      type: Number,
      default: 0
    }
  },

  // Publish Settings
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featuredTest: {
    type: Boolean,
    default: false
  },

  // Access Control
  accessLevel: {
    type: String,
    enum: ['public', 'premium', 'pro', 'private'],
    default: 'public'
  },
  allowedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],

  // Creator Info
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date
});

// Indexes
TestSchema.index({ testType: 1, isPublished: 1 });
TestSchema.index({ source: 1, isPublished: 1 });
TestSchema.index({ 'sourceDetails.year': 1, isPublished: 1 });

module.exports = mongoose.model('Test', TestSchema);
