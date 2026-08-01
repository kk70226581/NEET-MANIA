const mongoose = require('mongoose');

const TestScheduleSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    required: true
  },
  mockTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingMockTest',
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  availableUntil: Date,
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingTestSchedule', TestScheduleSchema);
