const nursingAiExplainer = require('../../services/nursing/nursingAiExplainer');
const Topic = require('../../models/nursing/Topic');

exports.explainTopic = async (req, res) => {
  try {
    const { topicId, language } = req.body;
    
    if (!topicId) {
      return res.status(400).json({ success: false, message: 'topicId is required' });
    }
    
    // In a real scenario, fetch user's accuracy from UserProgress model
    // Using a default of 50 for now
    const userAccuracy = 50; 

    const explanation = await nursingAiExplainer.generateTopicExplanation({
      topicId,
      language,
      accuracy: userAccuracy
    });

    res.json({ success: true, explanation });
  } catch (err) {
    console.error('Error generating topic explanation:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

exports.solveDoubt = async (req, res) => {
  try {
    const { doubtText, chapterSlug, topicSlug } = req.body;
    
    if (!doubtText) {
      return res.status(400).json({ success: false, message: 'doubtText is required' });
    }
    
    const answer = await nursingAiExplainer.solveDoubt({
      doubtText,
      chapterSlug,
      topicSlug
    });

    res.json({ success: true, answer });
  } catch (err) {
    console.error('Error solving doubt:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};
