const mongoose = require('mongoose');

const DuplicateQuestionRecordSchema = new mongoose.Schema({
  questionA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  questionB: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  similarityType: {
    type: String,
    enum: ['exact_match', 'near_duplicate', 'semantic_match'],
    required: true
  },
  confidenceScore: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending_resolution', 'resolved_kept', 'resolved_deleted'],
    default: 'pending_resolution'
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingDuplicateQuestionRecord', DuplicateQuestionRecordSchema);
