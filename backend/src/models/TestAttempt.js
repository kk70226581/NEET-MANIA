const mongoose = require('mongoose');
const crypto = require('crypto');
const { RESPONSE_STATUS, TEST_STATUS, MARKING_SCHEME } = require('../config/constants');

const TestAttemptSchema = new mongoose.Schema({
  // Attempt Identification
  attemptId: {
    type: String,
    unique: true,
    default: () => `ATTEMPT-${crypto.randomUUID()}`
  },

  // References
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  test: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
    index: true
  },

  // Status
  status: {
    type: String,
    enum: Object.values(TEST_STATUS),
    default: 'not_started'
  },

  // Responses
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        required: true
      },
      selectedOption: {
        type: String,
        enum: ['A', 'B', 'C', 'D', null],
        default: null
      },
      status: {
        type: String,
        enum: Object.values(RESPONSE_STATUS),
        default: 'not_visited'
      },
      markedForReview: {
        type: Boolean,
        default: false
      },
      timeSpent: {
        type: Number,
        default: 0 // seconds
      },
      isCorrect: Boolean,
      points: {
        type: Number,
        default: 0
      },
      visitedAt: Date,
      answeredAt: Date
    }
  ],

  // Timing
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  totalTimeSpent: {
    type: Number,
    default: 0 // minutes
  },
  timeRemaining: {
    type: Number,
    default: 0
  },
  isTimeExpired: {
    type: Boolean,
    default: false
  },

  // Scoring
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 720
  },
  percentile: Number,
  rankPrediction: Number,

  // Question-wise Analysis
  analysis: {
    totalQuestionsAttempted: {
      type: Number,
      default: 0
    },
    totalQuestionsCorrect: {
      type: Number,
      default: 0
    },
    totalQuestionsWrong: {
      type: Number,
      default: 0
    },
    totalQuestionsSkipped: {
      type: Number,
      default: 0
    },
    totalQuestionsMarkedReview: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0 // seconds
    },
    negativeMarksCount: {
      type: Number,
      default: 0
    }
  },

  // Subject-wise Analysis
  subjectAnalysis: {
    physics: {
      attempted: Number,
      correct: Number,
      wrong: Number,
      skipped: Number,
      score: Number,
      accuracy: Number
    },
    chemistry: {
      attempted: Number,
      correct: Number,
      wrong: Number,
      skipped: Number,
      score: Number,
      accuracy: Number
    },
    biology: {
      attempted: Number,
      correct: Number,
      wrong: Number,
      skipped: Number,
      score: Number,
      accuracy: Number
    },
    botany: {
      attempted: Number,
      correct: Number,
      wrong: Number,
      skipped: Number,
      score: Number,
      accuracy: Number
    },
    zoology: {
      attempted: Number,
      correct: Number,
      wrong: Number,
      skipped: Number,
      score: Number,
      accuracy: Number
    }
  },

  // Chapter-wise Analysis
  chapterAnalysis: [
    {
      chapterName: String,
      subject: String,
      totalQuestions: Number,
      attempted: Number,
      correct: Number,
      wrong: Number,
      skipped: Number,
      score: Number,
      accuracy: Number
    }
  ],

  // Performance Data
  performanceData: {
    easyQuestions: {
      total: Number,
      correct: Number,
      accuracy: Number
    },
    mediumQuestions: {
      total: Number,
      correct: Number,
      accuracy: Number
    },
    hardQuestions: {
      total: Number,
      correct: Number,
      accuracy: Number
    }
  },

  // Weak & Strong Areas Identified
  weakAreas: [String],
  strongAreas: [String],

  // Recommendations
  recommendations: {
    chaptersToFocus: [String],
    suggestedMockTests: [String],
    improvementSuggestions: [String]
  },
  aiAnalysis: String,

  // Device & Environment Info
  deviceInfo: {
    userAgent: String,
    ip: String,
    os: String
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
  submittedAt: Date,
  reviewedAt: Date
});

// Indexes
TestAttemptSchema.index({ student: 1, test: 1 });
TestAttemptSchema.index({ student: 1, createdAt: -1 });
TestAttemptSchema.index({ test: 1, 'analysis.accuracy': -1 });

// Calculate total score
TestAttemptSchema.methods.calculateScore = function() {
  let totalScore = 0;
  this.responses.forEach(response => {
    if (response.isCorrect) {
      totalScore += MARKING_SCHEME.CORRECT;
    } else if (response.selectedOption && !response.isCorrect) {
      totalScore += MARKING_SCHEME.INCORRECT;
    }
  });
  this.score = totalScore;
  return totalScore;
};

// Calculate analysis
TestAttemptSchema.methods.calculateAnalysis = function() {
  let attempted = 0, correct = 0, wrong = 0, skipped = 0, markedReview = 0;
  let totalTime = 0;

  this.responses.forEach(response => {
    if (response.selectedOption) {
      attempted += 1;
      if (response.isCorrect) correct += 1;
      if (!response.isCorrect && response.selectedOption) wrong += 1;
    } else {
      skipped += 1;
    }
    if (response.markedForReview) markedReview += 1;
    totalTime += response.timeSpent || 0;
  });

  this.analysis.totalQuestionsAttempted = attempted;
  this.analysis.totalQuestionsCorrect = correct;
  this.analysis.totalQuestionsWrong = wrong;
  this.analysis.totalQuestionsSkipped = skipped;
  this.analysis.totalQuestionsMarkedReview = markedReview;
  this.analysis.accuracy = attempted > 0 ? (correct / attempted) * 100 : 0;
  this.analysis.averageTimePerQuestion = attempted > 0 ? totalTime / attempted : 0;
  this.analysis.negativeMarksCount = wrong * Math.abs(MARKING_SCHEME.INCORRECT);

  return this.analysis;
};

module.exports = mongoose.model('TestAttempt', TestAttemptSchema);
