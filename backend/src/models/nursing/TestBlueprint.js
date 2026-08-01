const mongoose = require('mongoose');

const TestBlueprintSchema = new mongoose.Schema({
  blueprintName: {
    type: String,
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  subjectDistribution: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NursingSubject'
    },
    count: Number
  }],
  difficultyDistribution: {
    easyPercent: { type: Number, default: 30 },
    mediumPercent: { type: Number, default: 50 },
    hardPercent: { type: Number, default: 20 }
  },
  pyqPercentage: { type: Number, default: 20 },
  aiGeneratedPercentage: { type: Number, default: 40 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingTestBlueprint', TestBlueprintSchema);
