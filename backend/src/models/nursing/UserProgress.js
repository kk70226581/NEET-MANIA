const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingSubject',
    required: true
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingChapter',
    required: true
  },
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingTopic'
  },
  questionsAttempted: {
    type: Number,
    default: 0
  },
  questionsCorrect: {
    type: Number,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  confidenceScore: {
    type: Number,
    default: 50
  },
  lastStudiedAt: {
    type: Date,
    default: Date.now
  }
});

UserProgressSchema.index({ student: 1, subject: 1, chapter: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('NursingUserProgress', UserProgressSchema);
