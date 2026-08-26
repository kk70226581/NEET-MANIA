const { Question, Bookmark, MistakeNotebook, UserProgress, Chapter } = require('../../models/nursing');
const mongoose = require('mongoose');

// Get daily practice questions (randomly selected or personalized based on weak chapters)
exports.getDailyPractice = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const studentId = req.user.id;

    // Fetch student weak areas from progress
    const progress = await UserProgress.find({ student: studentId, accuracy: { $lt: 60 } }).populate('chapter');
    let targetChapterIds = progress.map(p => p.chapter._id);

    if (targetChapterIds.length === 0) {
      // Fallback to any random chapters
      const chapters = await Chapter.find().limit(5);
      targetChapterIds = chapters.map(c => c._id);
    }

    const questions = await Question.aggregate([
      { $match: { chapter: { $in: targetChapterIds }, isPublished: true } },
      { $sample: { size: limit } }
    ]);

    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get questions by chapter with paginated results
exports.getChapterPractice = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { difficulty, type } = req.query;

    const query = { chapter: new mongoose.Types.ObjectId(chapterId), isPublished: true };
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;

    const questions = await Question.find(query).select('-correctAnswer -explanation').limit(50);
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get bookmarks
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ student: req.user.id }).populate('question');
    res.json({ success: true, count: bookmarks.length, data: bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add or remove a bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const { questionId } = req.body;
    const student = req.user.id;

    const existing = await Bookmark.findOne({ student, question: questionId });
    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.json({ success: true, bookmarked: false, message: 'Bookmark removed successfully' });
    } else {
      await Bookmark.create({ student, question: questionId });
      return res.json({ success: true, bookmarked: true, message: 'Bookmark added successfully' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get mistake notebook
exports.getMistakes = async (req, res) => {
  try {
    const query = { student: req.user.id };
    if (req.query.status) query.revisionStatus = req.query.status;
    if (req.query.category) query.mistakeCategory = req.query.category;

    const mistakes = await MistakeNotebook.find(query).populate('question');
    res.json({ success: true, count: mistakes.length, data: mistakes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Add a mistake
exports.addMistake = async (req, res) => {
  try {
    const { questionId, selectedOption, correctOption, mistakeCategory } = req.body;
    const student = req.user.id;

    const existing = await MistakeNotebook.findOne({ student, question: questionId });
    if (existing) {
      existing.timesRepeated += 1;
      existing.lastAttemptAt = new Date();
      existing.selectedOption = selectedOption;
      existing.revisionStatus = 'pending'; // Reset back to review status
      await existing.save();
      return res.json({ success: true, data: existing, message: 'Repeated mistake logged' });
    }

    const mistake = await MistakeNotebook.create({
      student,
      question: questionId,
      selectedOption,
      correctOption,
      mistakeCategory: mistakeCategory || 'conceptual'
    });

    res.json({ success: true, data: mistake, message: 'Mistake added to notebook' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update mistake status/notes
exports.updateMistakeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, category } = req.body;

    const mistake = await MistakeNotebook.findOne({ _id: id, student: req.user.id });
    if (!mistake) return res.status(404).json({ success: false, message: 'Mistake not found' });

    if (status) mistake.revisionStatus = status;
    if (category) mistake.mistakeCategory = category;
    await mistake.save();

    res.json({ success: true, data: mistake, message: 'Mistake notebook updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Start chapter topic explainer (Calls Bedrock AI)
exports.startChapterExplainer = async (req, res) => {
  try {
    const { chapterId } = req.body;
    const { getBedrockText } = require('../../services/geminiClient');
    const chapter = await Chapter.findById(chapterId).populate('subject');
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const prompt = `
You are an expert tutor preparing a student for a B.Sc. Nursing Entrance Exam.
The current subject is: ${chapter.subject.name}.
The chapter to explain is: "${chapter.fullChapterName}".

Your task:
1. Identify and explain the first core topic of this chapter in very simple, easy-to-understand terms.
2. Ask exactly one multiple-choice question on this topic to test the student's understanding.
3. The question must follow the B.Sc. Nursing exam pattern (4 options: A, B, C, D).

Format your response as a valid JSON object with the following fields:
- topicName: (string) The name of the topic explained.
- explanation: (string) Simple, clear explanation of the topic.
- questionText: (string) The test question.
- options: (object) keys A, B, C, D each with string values.
- correctAnswer: (string, one of 'A', 'B', 'C', 'D')
`;

    const systemInstruction = "You are a friendly nursing tutor. Speak clearly, explain simply, and return ONLY a valid JSON object. Do not include markdown backticks or fences.";

    const response = await getBedrockText({
      prompt,
      systemInstruction,
      maxOutputTokens: 2000,
      temperature: 0.7,
      responseMimeType: 'application/json'
    });

    const cleanJson = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Grade answer and continue explainer to next topic (Calls Bedrock AI)
exports.continueChapterExplainer = async (req, res) => {
  try {
    const { chapterId, topicName, previousQuestion, userAnswer, correctAnswer } = req.body;
    const { getBedrockText } = require('../../services/geminiClient');
    const chapter = await Chapter.findById(chapterId).populate('subject');
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const prompt = `
You are an expert tutor preparing a student for a B.Sc. Nursing Entrance Exam.
Subject: ${chapter.subject.name}
Chapter: ${chapter.fullChapterName}
Last Topic Explained: ${topicName}
Question Asked: "${previousQuestion}"
Correct Answer: ${correctAnswer}
Student Selected: ${userAnswer}

Your task:
1. Provide constructive, friendly feedback on whether the student's answer was correct or incorrect, explaining why.
2. Introduce the next logical core topic in the chapter "${chapter.fullChapterName}", explain it simply, and ask exactly one multiple-choice question on it with options A, B, C, D.

Format your response as a JSON object with:
- feedback: (string) Grade the student's answer and explain why it is correct/incorrect.
- nextTopicName: (string) Name of the new topic.
- nextExplanation: (string) Clear explanation of the new topic.
- nextQuestionText: (string) The new question.
- nextOptions: (object) keys A, B, C, D with string values.
- nextCorrectAnswer: (string, one of 'A', 'B', 'C', 'D')
`;

    const systemInstruction = "You are a friendly nursing tutor. Return ONLY valid JSON with no markdown formatting.";

    const response = await getBedrockText({
      prompt,
      systemInstruction,
      maxOutputTokens: 2000,
      temperature: 0.7,
      responseMimeType: 'application/json'
    });

    const cleanJson = response.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
