const mongoose = require('mongoose');

const QuestionValidationSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  syllabusRelevanceScore: { type: Number, min: 0, max: 100 },
  answerCorrectnessScore: { type: Number, min: 0, max: 100 },
  optionUniquenessScore: { type: Number, min: 0, max: 100 },
  duplicateDetectionScore: { type: Number, min: 0, max: 100 },
  semanticSimilarityScore: { type: Number, min: 0, max: 100 },
  grammarScore: { type: Number, min: 0, max: 100 },
  explanationConsistencyScore: { type: Number, min: 0, max: 100 },
  factualAccuracyScore: { type: Number, min: 0, max: 100 },
  safetyCopyrightScore: { type: Number, min: 0, max: 100 },
  overallConfidenceScore: { type: Number, min: 0, max: 100 },
  validationStatus: {
    type: String,
    enum: ['pending', 'passed', 'failed', 'flagged_for_manual'],
    default: 'pending'
  },
  failureReasons: [String],
  validatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NursingQuestionValidation', QuestionValidationSchema);
