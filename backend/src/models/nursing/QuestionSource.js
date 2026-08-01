const mongoose = require('mongoose');

const QuestionSourceSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NursingQuestion',
    required: true
  },
  sourceType: {
    type: String,
    enum: ['pdf_import', 'web_scrape', 'licensed_bank', 'ai_generation', 'user_contribution'],
    required: true
  },
  fileName: String,
  sourceUrl: String,
  sourceName: String,
  copyrightStatus: {
    type: String,
    enum: ['public_domain', 'licensed', 'fair_use', 'restricted', 'pending'],
    default: 'pending'
  },
  importDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('NursingQuestionSource', QuestionSourceSchema);
