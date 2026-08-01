const mongoose = require('mongoose');

const ContentCollectionJobSchema = new mongoose.Schema({
  jobName: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  recordsFound: { type: Number, default: 0 },
  recordsUpdated: { type: Number, default: 0 },
  errorLogs: [String],
  startedAt: Date,
  completedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NursingContentCollectionJob', ContentCollectionJobSchema);
