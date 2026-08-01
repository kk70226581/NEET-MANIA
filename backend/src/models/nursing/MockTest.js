const mongoose = require('mongoose');

const MockTestSchema = new mongoose.Schema({
  testId: {
    type: String,
    unique: true,
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion'
  }],
  testPhase: {
    type: String,
    enum: ['foundation', 'practice', 'advanced', 'final_revision'],
    default: 'foundation'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingMockTest', MockTestSchema);
