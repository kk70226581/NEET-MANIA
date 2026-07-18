const mongoose = require('mongoose');
const { QUESTION_TYPES, DIFFICULTY, SUBJECTS, SOURCE_TYPES } = require('../config/constants');

const QuestionSchema = new mongoose.Schema({
  // Unique Identifier
  questionId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Content
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  questionTextHindi: String,
  
  // Image
  image: {
    url: String,
    publicId: String, // Cloudinary public ID
    caption: String
  },

  // Options
  options: {
    A: {
      text: { type: String, required: true },
      image: {
        url: String,
        publicId: String
      }
    },
    B: {
      text: { type: String, required: true },
      image: {
        url: String,
        publicId: String
      }
    },
    C: {
      text: { type: String, required: true },
      image: {
        url: String,
        publicId: String
      }
    },
    D: {
      text: { type: String, required: true },
      image: {
        url: String,
        publicId: String
      }
    }
  },

  // Answer
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: [true, 'Correct answer is required']
  },

  // Explanation
  explanation: {
    text: String,
    textHindi: String,
    image: {
      url: String,
      publicId: String
    }
  },

  // Classification
  subject: {
    type: String,
    enum: Object.values(SUBJECTS),
    required: [true, 'Subject is required'],
    index: true
  },
  chapter: {
    type: String,
    required: [true, 'Chapter is required'],
    index: true
  },
  topic: {
    type: String,
    index: true
  },
  subtopic: String,

  // Metadata
  type: {
    type: String,
    enum: Object.values(QUESTION_TYPES),
    default: 'mcq'
  },
  difficulty: {
    type: String,
    enum: [...Object.values(DIFFICULTY), 'pending'],
    default: 'pending',
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: Object.values(SOURCE_TYPES),
    required: true,
    index: true
  },

  // Source Details
  sourceDetails: {
    year: Number,          // e.g., 2024, 2023
    month: String,         // e.g., 'july', 'september'
    examType: String,      // e.g., 'neet', 'jee_main'
    setNumber: Number,
    coachingInstitute: String, // e.g., 'Allen', 'Aakash', 'PW'
    testName: String
  },

  // Additional Info
  bloomsLevel: {
    type: String,
    enum: ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
  },
  weightage: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  inSyllabus: {
    type: Boolean,
    default: true,
    index: true
  },
  trendingFrequency: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium',
    index: true
  },
  qualityScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
    index: true
  },
  learningObjective: String,
  commonMistake: String,
  ncertReference: {
    class: String,
    book: String,
    chapter: String,
    topic: String,
    page: String,
    pdfPage: Number,
    edition: String,
    sourceUrl: String,
    quotedLine: String
  },
  syllabusVersion: String,
  qualityAudit: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    factualScore: Number,
    conceptualScore: Number,
    ambiguityScore: Number,
    notes: [String],
    auditedAt: Date,
    auditedBy: String
  },
  
  // AI & Generation Metadata
  generatedByAI: {
    type: Boolean,
    default: false,
    index: true
  },
  aiMetadata: {
    model: String,
    prompt: String,
    confidence: Number,
    generatedAt: Date
  },

  // PYQ / Previous Year Question flag and reference
  pyq: {
    isPYQ: { type: Boolean, default: false, index: true },
    reference: String
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  estimatedTime: {
    type: Number,
    default: 45 // seconds
  },
  negativeMarking: {
    type: Boolean,
    default: true
  },

  // Assertion-Reason structure (NEET-style)
  assertion: {
    isAssertionReason: { type: Boolean, default: false },
    assertionText: String,
    reasonText: String,
    pairIsCorrect: { type: Boolean }
  },

  // Candidate generated questions (variants / possible questions)
  candidateQuestions: [{
    questionText: String,
    options: mongoose.Schema.Types.Mixed,
    correctAnswer: String,
    confidenceScore: Number,
    source: String,
    generatedAt: Date
  }],

  // Review / approval workflow for AI-generated or imported questions
  review: {
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    reviewNotes: String
  },

  // Statistics
  statistics: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    correctAttempts: {
      type: Number,
      default: 0
    },
    accuracy: {
      type: Number,
      default: 0
    },
    averageTimeSpent: {
      type: Number,
      default: 0
    },
    difficulty_index: {
      type: Number,
      default: 0
    }
  },

  // Content Management
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Tags & Keywords
  tags: [String],
  keywords: [String],

  // Related Questions
  relatedQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],

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
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Indexes for faster queries
QuestionSchema.index({ questionText: 1 }, { unique: true });
QuestionSchema.index({ subject: 1, chapter: 1, difficulty: 1 });
QuestionSchema.index({ subject: 1, topic: 1 });
QuestionSchema.index({ isPublished: 1, subject: 1 });
QuestionSchema.index({ source: 1, 'sourceDetails.year': 1 });

// Calculate accuracy percentage
QuestionSchema.methods.calculateAccuracy = function() {
  if (this.statistics.totalAttempts === 0) return 0;
  return (this.statistics.correctAttempts / this.statistics.totalAttempts) * 100;
};

// Update statistics
QuestionSchema.methods.recordAttempt = function(isCorrect, timeSpent) {
  this.statistics.totalAttempts += 1;
  if (isCorrect) {
    this.statistics.correctAttempts += 1;
  }
  
  // Update average time
  const total = this.statistics.averageTimeSpent * (this.statistics.totalAttempts - 1);
  this.statistics.averageTimeSpent = (total + timeSpent) / this.statistics.totalAttempts;
  
  this.statistics.accuracy = this.calculateAccuracy();
};

module.exports = mongoose.model('Question', QuestionSchema);
