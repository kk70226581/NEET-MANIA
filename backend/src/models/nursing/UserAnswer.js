const mongoose = require('mongoose');

const UserAnswerSchema = new mongoose.Schema({
  attempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingTestAttempt',
    required: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  selectedOption: {
    type: String,
    enum: ['A', 'B', 'C', 'D', null],
    default: null
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  timeSpent: {
    type: Number,
    default: 0 // in seconds
  },
  markedForReview: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserAnswerSchema.index({ attempt: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('NursingUserAnswer', UserAnswerSchema);
