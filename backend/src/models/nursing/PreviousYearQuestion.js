const mongoose = require('mongoose');

const PreviousYearQuestionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  examName: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  shift: String,
  sourceUrl: String,
  copyrightStatus: {
    type: String,
    enum: ['public_domain', 'licensed', 'fair_use', 'restricted', 'pending'],
    default: 'pending'
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified'],
    default: 'unverified'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
});

module.exports = mongoose.model('NursingPreviousYearQuestion', PreviousYearQuestionSchema);
