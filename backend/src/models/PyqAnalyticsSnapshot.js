const mongoose = require('mongoose');

const PyqAnalyticsSnapshotSchema = new mongoose.Schema({
  cacheKey: { type: String, required: true, unique: true, index: true },
  scope: { type: String, enum: ['global', 'subject', 'year'], default: 'global' },
  filters: mongoose.Schema.Types.Mixed,
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  questionVersion: { type: String, default: '1' },
  computedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('PyqAnalyticsSnapshot', PyqAnalyticsSnapshotSchema);
