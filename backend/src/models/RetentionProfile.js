const mongoose = require('mongoose');

const RetentionProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  strengthDays: { type: Number, default: 2.5, min: 0.5, max: 90 },
  lastReviewedAt: { type: Date, default: Date.now },
  nextReviewAt: { type: Date, default: Date.now, index: true },
  lastScore: { type: Number, default: 0, min: 0, max: 5 },
  challengesCompleted: { type: Number, default: 0 },
  consecutivePasses: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  source: { type: String, enum: ['mistake_history', 'test_history', 'starter'], default: 'starter' },
  activeChallenge: {
    challengeId: String,
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    startedAt: Date,
    expiresAt: Date,
    completedAt: Date
  },
  history: [{
    score: Number,
    retentionBefore: Number,
    strengthBefore: Number,
    strengthAfter: Number,
    completedAt: Date
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

RetentionProfileSchema.index({ user: 1, chapter: 1 }, { unique: true });
RetentionProfileSchema.index({ user: 1, nextReviewAt: 1 });

module.exports = mongoose.model('RetentionProfile', RetentionProfileSchema);
