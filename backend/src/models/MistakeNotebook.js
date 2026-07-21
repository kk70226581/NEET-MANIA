const mongoose = require('mongoose');

const MistakeNotebookSchema = new mongoose.Schema({
  // Reference
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  testAttempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestAttempt'
  },

  // Question Details
  questionDetails: {
    questionText: String,
    subject: String,
    chapter: String,
    topic: String,
    difficulty: String
  },

  // Student's Response
  studentResponse: {
    selectedOption: {
      type: String,
      enum: ['A', 'B', 'C', 'D', null, '']
    },
    isCorrect: Boolean,
    isSkipped: {
      type: Boolean,
      default: false
    },
    timeSpent: Number
  },

  // Correct Answer
  correctAnswer: {
    option: {
      type: String,
      enum: ['A', 'B', 'C', 'D']
    },
    explanation: String,
    conceptsInvolved: [String]
  },

  // Analysis
  errorAnalysis: {
    errorType: {
      type: String,
      enum: ['careless', 'conceptual', 'calculation', 'reading', 'time_management'],
      required: true
    },
    rootCause: String,
    conceptsMissed: [String]
  },

  // Learning
  learningNotes: String,
  aiExplanation: String,
  conceptsToReview: [String],
  similarQuestions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    }
  ],

  // Revision
  revisionStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  revisionDates: [Date],
  revisedAt: Date,
  timesRevisited: {
    type: Number,
    default: 0
  },

  // Importance
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  isMarkedImportant: {
    type: Boolean,
    default: false
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
  firstAttemptDate: Date,
  lastReviewDate: Date
});

// Indexes
MistakeNotebookSchema.index({ student: 1, question: 1 }, { unique: true });
MistakeNotebookSchema.index({ student: 1, revisionStatus: 1 });
MistakeNotebookSchema.index({ student: 1, priority: 1 });
MistakeNotebookSchema.index({ student: 1, 'errorAnalysis.errorType': 1 });

module.exports = mongoose.model('MistakeNotebook', MistakeNotebookSchema);
