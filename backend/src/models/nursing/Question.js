const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    unique: true,
    required: true
  },
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    A: { text: { type: String, required: true } },
    B: { text: { type: String, required: true } },
    C: { text: { type: String, required: true } },
    D: { text: { type: String, required: true } }
  },
  correctAnswer: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    required: true
  },
  explanation: {
    text: String,
    optionExplanations: {
      A: String,
      B: String,
      C: String,
      D: String
    }
  },
  exams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    index: true
  }],
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingSubject',
    required: true,
    index: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingChapter',
    required: true,
    index: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingTopic',
    index: true
  },
  type: {
    type: String,
    enum: ['mcq', 'assertion_reason', 'statement_based', 'match_following', 'case_based', 'numerical', 'diagram_based', 'english', 'gk', 'nursing_aptitude', 'logical_reasoning'],
    default: 'mcq'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    index: true
  },
  source: {
    type: String,
    enum: ['pyq', 'mock', 'dpp', 'custom', 'official', 'imported', 'ai_generated', 'admin_created'],
    default: 'custom'
  },
  sourceType: {
    type: String,
    enum: ['official', 'public-domain', 'licensed', 'permitted', 'reference-only', 'ai-generated', 'admin-created'],
    default: 'admin-created',
    index: true
  },
  sourceMetadata: {
    sourceName: String,
    sourceURL: String,
    sourceTitle: String,
    sourcePublisher: String,
    sourceYear: Number,
    sourceExam: String,
    retrievedAt: Date,
    license: String,
    attribution: String,
    attributionRequired: { type: Boolean, default: false },
    reusePermission: {
      type: String,
      enum: ['verified', 'pending', 'denied', 'not-required'],
      default: 'pending'
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'needs-review', 'unverified'],
      default: 'unverified'
    },
    lastVerifiedAt: Date
  },
  generatedByAI: {
    type: Boolean,
    default: false,
    index: true
  },
  isPYQ: {
    type: Boolean,
    default: false,
    index: true
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  confidenceScore: { type: Number, min: 0, max: 100, default: 0 },
  duplicateScore: { type: Number, min: 0, max: 100, default: 0 },
  concept: String,
  learningObjective: String,
  commonMistake: String,
  tags: [String],
  language: { type: String, default: 'english', index: true },
  translationGroupId: String,
  currentAffairs: {
    headline: String,
    eventDate: Date,
    month: Number,
    year: Number,
    category: String,
    publishedAt: Date,
    validFrom: Date,
    reviewRequiredAfter: { type: Date, index: true },
    verifiedAt: Date
  },
  lifecycleStatus: {
    type: String,
    enum: ['DRAFT', 'IMPORTED', 'AI_GENERATED', 'VALIDATING', 'NEEDS_REVIEW', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'],
    default: 'DRAFT',
    index: true
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending',
    index: true
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'verified', 'needs-review'],
    default: 'unverified',
    index: true
  },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  publishedAt: Date,
  normalizedText: { type: String, index: true },
  contentHash: { type: String, index: true },
  canonicalQuestionId: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingQuestion' },
  duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingQuestion' },
  embedding: { type: [Number], select: false },
  embeddingModel: String,
  embeddingVersion: String,
  aiMetadata: {
    model: String,
    promptVersion: String,
    generatedAt: Date,
    generationJob: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingGenerationJob' },
    generatorResult: mongoose.Schema.Types.Mixed,
    validatorResult: mongoose.Schema.Types.Mixed,
    validationWarnings: [String]
  },
  currentVersion: { type: Number, default: 1 },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

QuestionSchema.index({ subject: 1, chapter: 1, difficulty: 1 });
QuestionSchema.index({ questionId: 1 }, { unique: true });
QuestionSchema.index({ lifecycleStatus: 1, reviewStatus: 1, createdAt: -1 });
QuestionSchema.index({ questionText: 'text', concept: 'text', tags: 'text' });

module.exports = mongoose.model('NursingQuestion', QuestionSchema);
