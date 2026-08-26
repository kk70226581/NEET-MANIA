const { Chapter } = require('../../models/nursing');
const contentController = require('./nursingContentController');

exports.generateQuestions = async (req, res) => {
  try {
    const { chapterId, topicId, count, difficulty } = req.body;
    
    if (!chapterId) {
      return res.status(400).json({ success: false, message: 'chapterId is required' });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const distribution = difficulty === 'easy'
      ? { easy: 100, medium: 0, hard: 0 }
      : difficulty === 'hard'
        ? { easy: 0, medium: 0, hard: 100 }
        : { easy: 0, medium: 100, hard: 0 };
    req.body = {
      subject: chapter.subjectId,
      chapter: chapter._id,
      topic: topicId || undefined,
      requestedCount: count || 10,
      difficultyDistribution: distribution,
      questionType: 'mcq',
      language: 'english',
      batchSize: 10,
      options: { generateExplanations: true, generateTags: true, allowCalculations: true }
    };
    return contentController.createGenerationJob(req, res);
  } catch (err) {
    console.error('Error in question generation:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during generation' });
  }
};
