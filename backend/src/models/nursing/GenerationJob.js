const mongoose = require('mongoose');

const GenerationJobSchema = new mongoose.Schema({
  generationHash: { type: String, required: true, index: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingExam' },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingSubject', required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingChapter', required: true },
  topic: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingTopic' },
  requestedCount: { type: Number, required: true, min: 1, max: 1000 },
  completedCount: { type: Number, default: 0 },
  validatedCount: { type: Number, default: 0 },
  failedCount: { type: Number, default: 0 },
  batchSize: { type: Number, default: 10, min: 1, max: 20 },
  status: {
    type: String,
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'PARTIAL', 'FAILED', 'CANCELLED'],
    default: 'QUEUED',
    index: true
  },
  difficultyDistribution: {
    easy: { type: Number, default: 40 },
    medium: { type: Number, default: 40 },
    hard: { type: Number, default: 20 }
  },
  questionType: { type: String, default: 'mcq' },
  language: { type: String, default: 'english' },
  options: {
    generateExplanations: { type: Boolean, default: true },
    generateTags: { type: Boolean, default: true },
    useReferences: { type: Boolean, default: false },
    previousYearStyle: { type: Boolean, default: false },
    allowCalculations: { type: Boolean, default: true }
  },
  promptVersion: { type: String, default: 'question_generation_v1' },
  model: String,
  retryCount: { type: Number, default: 0 },
  maxRetries: { type: Number, default: 2 },
  logs: [{
    batch: Number,
    startedAt: Date,
    endedAt: Date,
    success: Boolean,
    generated: Number,
    validated: Number,
    rejected: Number,
    error: String
  }],
  lastError: String,
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

GenerationJobSchema.index({ generationHash: 1, status: 1 });
module.exports = mongoose.model('NursingGenerationJob', GenerationJobSchema);
