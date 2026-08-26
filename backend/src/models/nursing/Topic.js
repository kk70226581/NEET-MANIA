const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  topicCode: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  topicSlug: {
    type: String,
    unique: true,
    required: true
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingChapter',
    required: true
  },
  displayOrder: {
    type: Number,
    required: true
  },
  learningObjective: String,
  expectedWeightage: {
    type: Number,
    default: 1
  },
  pyqCount: { type: Number, default: 0 },
  practiceQuestionCount: { type: Number, default: 0 },
  targetQuestionCount: { type: Number, default: 40 },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingTopic', TopicSchema);
