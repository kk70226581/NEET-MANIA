const questionGenerator = require('../../services/nursing/nursingQuestionGenerator');
const validationPipeline = require('../../services/nursing/nursingValidationPipeline');

exports.generateQuestions = async (req, res) => {
  try {
    const { chapterId, topicId, count, difficulty } = req.body;
    
    if (!chapterId) {
      return res.status(400).json({ success: false, message: 'chapterId is required' });
    }

    // Generate batch
    const newQuestions = await questionGenerator.generateBatch({
      chapterId,
      topicId,
      count: count || 10,
      difficulty: difficulty || 'medium'
    });

    // Validate and save
    const savedQuestions = await validationPipeline.validateBatch(newQuestions);

    const approvedCount = savedQuestions.filter(q => q.isPublished).length;

    res.json({ 
      success: true, 
      message: `Generated ${savedQuestions.length} questions. ${approvedCount} auto-approved.`,
      questions: savedQuestions 
    });
  } catch (err) {
    console.error('Error in question generation:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error during generation' });
  }
};
