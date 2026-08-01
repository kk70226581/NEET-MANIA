const mongoose = require('mongoose');

const StudyPlanSchema = new mongoose.Schema({
  planName: {
    type: String,
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingExam',
    required: true
  },
  description: String,
  totalDays: {
    type: Number,
    required: true
  },
  dailyTasks: [{
    day: { type: Number, required: true },
    tasks: [{
      taskType: {
        type: String,
        enum: ['read_syllabus', 'practice_chapter', 'take_mock', 'revision'],
        required: true
      },
      description: String,
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NursingSubject'
      },
      chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'NursingChapter'
      },
      questionCount: {
        type: Number,
        default: 10
      }
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingStudyPlan', StudyPlanSchema);
