const mongoose = require('mongoose');

const StudentReportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  reportType: {
    type: String,
    enum: ['wrong_answer', 'spelling_mistake', 'wrong_explanation', 'wrong_subject', 'other'],
    required: true
  },
  comments: String,
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingStudentReport', StudentReportSchema);
