const mongoose = require('mongoose');

const ExamSourceSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    required: true
  },
  sourceName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  selectorRules: {
    titleSelector: String,
    linkSelector: String,
    dateSelector: String,
    contentSelector: String
  },
  checkFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'biweekly'],
    default: 'daily'
  },
  lastChecked: Date,
  status: {
    type: String,
    enum: ['active', 'broken', 'needs_review'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingExamSource', ExamSourceSchema);
