const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  examCode: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  examName: {
    type: String,
    required: true,
    trim: true
  },
  conductingAuthority: {
    type: String,
    required: true
  },
  subjects: [{
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingSubject' },
    questionCount: Number,
    marksCount: Number
  }],
  applicableChapters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingChapter'
  }],
  applicableTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingTopic'
  }],
  examPattern: {
    mode: { type: String, enum: ['CBT', 'OMR', 'Pen & Paper'], default: 'CBT' },
    questionType: { type: String, default: 'MCQs' },
    hasNegativeMarking: { type: Boolean, default: true }
  },
  questionCount: {
    type: Number,
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  negativeMarking: {
    correctAnswers: { type: Number, default: 1 },
    incorrectAnswers: { type: Number, default: -0.33 },
    unattempted: { type: Number, default: 0 }
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  chapterWeightage: [{
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'NursingChapter' },
    weightage: Number
  }],
  officialSyllabusSource: String,
  lastVerificationDate: Date,
  syllabusVersion: { type: String, default: '1.0' },
  isActive: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('NursingExam', ExamSchema);
