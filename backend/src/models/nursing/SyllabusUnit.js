const mongoose = require('mongoose');

const SyllabusUnitSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    required: true
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
  subtopics: [String],
  importance: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  expectedWeightage: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingSyllabusUnit', SyllabusUnitSchema);
