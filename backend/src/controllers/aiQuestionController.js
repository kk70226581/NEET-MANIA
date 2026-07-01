const Question = require('../models/Question');
const aiService = require('../services/aiQuestionGenerator');

// Generate candidate questions and return for review (don't save yet)
async function generate(req, res, next) {
  try {
    const { subject, chapter, topic, difficulty, bloomLevel, count } = req.body;
    const candidates = await aiService.generateCandidates({ subject, chapter, topic, difficulty, bloomLevel, count });
    return res.json({ success: true, candidates });
  } catch (err) {
    next(err);
  }
}

// Save approved question to DB after review
async function approveAndSave(req, res, next) {
  try {
    const { question } = req.body; // full question object from frontend after review
    if (!question) return res.status(400).json({ success: false, message: 'Question payload required' });

    const q = new Question(question);
    q.generatedByAI = true;
    q.aiMetadata = q.aiMetadata || {};
    q.aiMetadata.generatedAt = new Date();

    await q.save();
    return res.json({ success: true, question: q });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  generate,
  approveAndSave
};
