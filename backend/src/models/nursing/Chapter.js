const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  chapterCode: {
    type: String,
    unique: true,
    required: true
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingSubject',
    required: true
  },
  examIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam'
  }],
  classLevel: {
    type: String,
    enum: ['11', '12', 'General', 'Skill'],
    default: 'General'
  },
  unitName: {
    type: String,
    required: true
  },
  fullChapterName: {
    type: String,
    required: true
  },
  chapterSlug: {
    type: String,
    unique: true,
    required: true
  },
  displayOrder: {
    type: Number,
    required: true
  },
  shortDescription: String,
  detailedDescription: String,
  importantTopics: [String],
  learningObjectives: [String],
  prerequisiteChapterIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingChapter'
  }],
  estimatedStudyMinutes: {
    type: Number,
    default: 120
  },
  expectedWeightage: {
    type: Number,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  pyqCount: { type: Number, default: 0 },
  practiceQuestionCount: { type: Number, default: 0 },
  targetQuestionCount: { type: Number, default: 200 },
  aiQuestionCount: { type: Number, default: 0 },
  testCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  source: {
    type: String,
    default: 'master_syllabus'
  },
  syllabusVersion: {
    type: String,
    default: '1.0'
  },
  lastVerifiedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingChapter', ChapterSchema);
