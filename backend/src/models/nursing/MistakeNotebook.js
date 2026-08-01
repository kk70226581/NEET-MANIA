const mongoose = require('mongoose');

const MistakeNotebookSchema = new mongoose.Schema({
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
  selectedOption: String,
  correctOption: String,
  mistakeCategory: {
    type: String,
    enum: ['conceptual', 'calculation', 'memory', 'reading', 'time_management', 'guessing'],
    default: 'conceptual'
  },
  timesRepeated: {
    type: Number,
    default: 1
  },
  revisionStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  },
  lastAttemptAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

MistakeNotebookSchema.index({ student: 1, question: 1 }, { unique: true });

module.exports = mongoose.model('NursingMistakeNotebook', MistakeNotebookSchema);
