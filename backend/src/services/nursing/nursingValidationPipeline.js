const Question = require('../../models/Question');
const Chapter = require('../../models/nursing/Chapter');

exports.validateBatch = async (questions) => {
  const validatedQuestions = [];
  
  for (const q of questions) {
    let isValid = true;
    let failureReason = [];

    // 1. Grammatical & Completeness check
    if (!q.questionText || q.questionText.trim().length < 10) {
      isValid = false;
      failureReason.push('Question text too short or missing');
    }
    
    if (!q.options || Object.keys(q.options).length !== 4) {
      isValid = false;
      failureReason.push('Must have exactly 4 options');
    }

    // 2. Duplicate Detection (Simple text match)
    const exists = await Question.findOne({ questionText: q.questionText });
    if (exists) {
      isValid = false;
      failureReason.push('Exact question text already exists');
    }

    // 3. Syllabus Bounds Check
    const chapterExists = await Chapter.findOne({ fullChapterName: q.chapter });
    if (!chapterExists) {
      isValid = false;
      failureReason.push('Chapter name does not match master syllabus');
    }

    if (isValid) {
      q.review = { status: 'approved' }; // Auto-publish high confidence
      q.isPublished = true;
      validatedQuestions.push(q);
    } else {
      q.review = { status: 'rejected', reviewNotes: failureReason.join(', ') };
      q.isPublished = false;
      validatedQuestions.push(q);
    }
  }

  // Save to DB
  try {
    const saved = await Question.insertMany(validatedQuestions, { ordered: false });
    return saved;
  } catch (err) {
    console.error('Batch save error:', err);
    throw err;
  }
};
