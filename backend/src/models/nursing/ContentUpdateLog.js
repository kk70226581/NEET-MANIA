const mongoose = require('mongoose');

const ContentUpdateLogSchema = new mongoose.Schema({
  entityType: { type: String, required: true }, // e.g. 'ExamEvent', 'Question'
  entityId: mongoose.Schema.Types.ObjectId,
  updateType: { type: String, enum: ['insert', 'update', 'delete'], required: true },
  previousValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  performedBy: String, // 'system_scheduler' or admin user ID
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NursingContentUpdateLog', ContentUpdateLogSchema);
