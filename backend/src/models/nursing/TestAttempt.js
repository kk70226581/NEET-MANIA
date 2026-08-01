const mongoose = require('mongoose');

const TestAttemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    unique: true,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mockTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingMockTest',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'submitted', 'completed'],
    default: 'not_started'
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: Date,
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 100
  },
  timeRemaining: Number, // in seconds
  analysis: {
    totalQuestions: { type: Number, default: 0 },
    attempted: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    averageTimePerQuestion: { type: Number, default: 0 } // in seconds
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('NursingTestAttempt', TestAttemptSchema);
