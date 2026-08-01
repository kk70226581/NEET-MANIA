const mongoose = require('mongoose');

const ExamEventSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    required: true
  },
  eventName: {
    type: String,
    required: true,
    enum: ['notification', 'application_start', 'application_end', 'admit_card', 'exam_date', 'result_date', 'counselling_start', 'other']
  },
  eventTitle: {
    type: String,
    required: true
  },
  eventDescription: String,
  date: {
    type: Date,
    required: true
  },
  isTentative: {
    type: Boolean,
    default: true
  },
  sourceUrl: String,
  sourceName: String,
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  dateLastVerified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingExamEvent', ExamEventSchema);
