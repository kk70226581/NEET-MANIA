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
    enum: ['pyq', 'mock', 'dpp', 'custom'],
    default: 'custom'
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
  learningObjective: String,
  commonMistake: String,
  tags: [String],
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

module.exports = mongoose.model('NursingQuestion', QuestionSchema);
