const mongoose = require('mongoose');

const PyqInteractionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true, index: true },
  bookmarked: { type: Boolean, default: false, index: true },
  note: { type: String, trim: true, maxlength: 4000, default: '' },
  attempts: [{
    selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    isCorrect: Boolean,
    timeSpent: { type: Number, min: 0, default: 0 },
    attemptedAt: { type: Date, default: Date.now }
  }],
  lastSelectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
  lastCorrect: Boolean,
  lastTimeSpent: { type: Number, default: 0 },
  firstAttemptCorrect: Boolean,
  retryCorrect: Boolean,
  reports: [{
    reason: { type: String, enum: ['incorrect_answer', 'unclear', 'classification', 'broken_image', 'other'], default: 'other' },
    details: { type: String, maxlength: 2000 },
    status: { type: String, enum: ['open', 'reviewing', 'resolved', 'rejected'], default: 'open' },
    createdAt: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

PyqInteractionSchema.index({ user: 1, question: 1 }, { unique: true });
PyqInteractionSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('PyqInteraction', PyqInteractionSchema);
