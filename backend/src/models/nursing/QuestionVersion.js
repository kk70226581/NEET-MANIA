const mongoose = require('mongoose');

const QuestionVersionSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingQuestion', required: true, index: true },
  version: { type: Number, required: true },
  snapshot: { type: mongoose.Schema.Types.Mixed, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changeReason: { type: String, required: true }
}, { timestamps: true });

QuestionVersionSchema.index({ question: 1, version: 1 }, { unique: true });
module.exports = mongoose.model('NursingQuestionVersion', QuestionVersionSchema);
