const mongoose = require('mongoose');

const AIQuestionGenerationSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  sourceInspirationReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion' // The original PYQ or concept question
  },
  modelName: {
    type: String,
    default: 'gemini-2.0-flash'
  },
  promptUsed: String,
  promptVersion: { type: String, default: 'question_generation_v1' },
  generationJob: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingGenerationJob' },
  similarityScoreWithOriginal: Number,
  similarityExplanation: String,
  learningObjective: String,
  generationStatus: {
    type: String,
    enum: ['pending_review', 'approved', 'rejected'],
    default: 'pending_review'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingAIQuestionGeneration', AIQuestionGenerationSchema);
