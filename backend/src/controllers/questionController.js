/**
 * Question Controller - FIXED VERSION
 * Resolves "Question is not defined" error
 */

const Question = require('../models/Question');
const PDFExtractor = require('../services/pdfExtractor');
const PatternImporter = require('../services/patternImporter');
const { getGeminiText } = require('../services/geminiClient');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const { findCurriculumEntry, normalizeSubject } = require('../config/ncertCurriculum');

const QUESTION_SUBJECTS = ['physics', 'chemistry', 'biology', 'botany', 'zoology'];

// Helper functions
const parseAIJson = (text) => {
  const raw = String(text || '').trim();
  const withoutFences = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const cleaned = withoutFences.replace(/,\s*([}\]])/g, '$1');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error('AI response did not contain valid JSON');
  }
  return JSON.parse(match[0]);
};

const getFixPrompt = (question) => {
  const optionsText = ['A', 'B', 'C', 'D']
    .map(k => `${k}: ${question.options?.[k]?.text || ''}`)
    .join('\n');

  return `You are a NEET question editor and classifier. The question below may have been extracted from a PDF and may contain garbled text or wrong metadata. Do two things in one pass:

1. CLEAN the question text and options.
2. CORRECTLY classify the question, including subject, chapter, topic, difficulty, and correct option.

Return EXACT JSON only, no markdown.

Current saved values:
Subject: ${question.subject}
Question Text: ${question.questionText}
Options:
${optionsText}
Correct Answer: ${question.correctAnswer}

Return exactly this JSON shape:
{
  "questionText": "...",
  "options": {
    "A": { "text": "..." },
    "B": { "text": "..." },
    "C": { "text": "..." },
    "D": { "text": "..." }
  },
  "correctAnswer": "A",
  "explanation": "...",
  "difficulty": "easy|medium|hard",
  "topic": "...",
  "chapter": "...",
  "subject": "physics|chemistry|biology|botany|zoology"
}`;
};

const fixQuestionWithAI = async (question) => {
  const content = await getGeminiText({
    prompt: getFixPrompt(question),
    maxOutputTokens: 1200,
    temperature: 0.1,
    responseMimeType: 'application/json'
  });
  return parseAIJson(content);
};

// ────────────────────────────────────────────────────────────────
// BASIC CRUD OPERATIONS
// ────────────────────────────────────────────────────────────────

exports.getQuestions = async (req, res) => {
  try {
    const { subject, chapter, topic, difficulty, source, search, page = 1, limit = 20 } = req.query;
    const safeLimit = Math.min(100, Math.max(1, Number(limit) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * safeLimit;
    const query = { isPublished: true };
    
    if (subject) query.subject = subject;
    if (chapter) query.chapter = chapter;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (source) query.source = source;
    if (search) {
      const pattern = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ questionText: pattern }, { chapter: pattern }, { topic: pattern }];
    }

    const [questions, total] = await Promise.all([
      Question.find(query).skip(skip).limit(safeLimit),
      Question.countDocuments(query)
    ]);

    res.status(200).json({ 
      success: true, 
      data: questions, 
      pagination: { total, page: Number(page), pages: Math.ceil(total / safeLimit) } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Question ID is required' });
    }
    
    const q = await Question.findById(req.params.id);
    if (!q) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    res.status(200).json({ success: true, data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    if (!req.body || !req.body.questionText) {
      return res.status(400).json({ 
        success: false, 
        message: 'questionText is required' 
      });
    }

    const payload = {
      ...req.body,
      uploadedBy: req.userId,
      isPublished: false
    };

    const q = await Question.create(payload);
    res.status(201).json({ success: true, data: q });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Question ID is required' });
    }

    const existing = await Question.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const snapshot = {
      questionText: existing.questionText,
      options: existing.options,
      correctAnswer: existing.correctAnswer,
      explanation: existing.explanation,
      subject: existing.subject,
      chapter: existing.chapter,
      topic: existing.topic,
      subtopic: existing.subtopic,
      difficulty: existing.difficulty,
      ncertReference: existing.ncertReference,
      pyqDetails: existing.pyqDetails,
      isPublished: existing.isPublished,
      isVerified: existing.isVerified
    };
    const q = await Question.findByIdAndUpdate(req.params.id, {
      $set: req.body,
      $inc: { contentVersion: 1 },
      $push: {
        versionHistory: {
          version: existing.contentVersion || 1,
          changedAt: new Date(),
          changedBy: req.userId,
          changeSummary: String(req.body.changeSummary || 'Question content updated').slice(0, 300),
          snapshot
        }
      }
    }, { new: true, runValidators: true });

    if (existing.pyq?.isPYQ) {
      const PyqAnalyticsSnapshot = require('../models/PyqAnalyticsSnapshot');
      await PyqAnalyticsSnapshot.deleteMany({});
    }

    res.status(200).json({ success: true, data: q });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Question ID is required' });
    }

    const q = await Question.findByIdAndDelete(req.params.id);
    if (!q) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    res.status(200).json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.publishQuestion = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Question ID is required' });
    }

    const existing = await Question.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    if (existing.pyq?.isPYQ) {
      const verification = existing.pyqDetails?.verification;
      const checks = ['questionText', 'answer', 'explanation', 'classification', 'examYear'];
      const legal = ['user_provided', 'licensed', 'original_sample'].includes(existing.pyqDetails?.legalStatus);
      const complete = checks.every((key) => verification?.[key]) && existing.explanation?.text && existing.pyqDetails?.shortSolution;
      if (!legal || !complete) {
        return res.status(422).json({
          success: false,
          message: 'PYQ publication blocked: verify question, answer, solution, classification, year, and legal provenance first.'
        });
      }
    }
    existing.isPublished = true;
    existing.isVerified = true;
    existing.verifiedBy = req.userId;
    existing.review.status = 'approved';
    existing.review.reviewedAt = new Date();
    await existing.save();
    if (existing.pyq?.isPYQ) {
      const PyqAnalyticsSnapshot = require('../models/PyqAnalyticsSnapshot');
      await PyqAnalyticsSnapshot.deleteMany({});
    }
    const q = existing;

    res.status(200).json({ success: true, data: q });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────
// AI QUESTION GENERATION
// ────────────────────────────────────────────────────────────────

exports.generateQuestions = async (req, res) => {
  try {
    const {
      subject = 'biology',
      chapter = '',
      topic = '',
      questionTypes = ['mcq'],
      count = 10,
      includePYQ = true,
      includePredicted = true,
      difficulty = 'mixed',
      source = 'custom'
    } = req.body;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { PHYSICS_CHAPTERS, CHEMISTRY_CHAPTERS, BIOLOGY_CHAPTERS } = require('../config/constants');
    const chapterMap = {
      physics: PHYSICS_CHAPTERS,
      chemistry: CHEMISTRY_CHAPTERS,
      biology: BIOLOGY_CHAPTERS,
      botany: BIOLOGY_CHAPTERS,
      zoology: BIOLOGY_CHAPTERS
    };

    const chapterList = (chapterMap[subject.toLowerCase()] || []).join(', ');
    const safeCount = Math.min(20, Math.max(1, Number(count) || 10));
    const safeTypes = Array.isArray(questionTypes) ? questionTypes : [questionTypes];

    const difficultyInstruction = difficulty === 'mixed'
      ? 'Distribute difficulty: roughly 30% easy, 40% medium, 30% hard.'
      : `All questions should be ${difficulty} difficulty.`;

    const typeInstructions = {
      mcq: `MCQ FORMAT:
{
  "type": "mcq",
  "questionText": "Complete question stem",
  "options": {"A":{"text":"..."},"B":{"text":"..."},"C":{"text":"..."},"D":{"text":"..."}},
  "correctAnswer": "A",
  "explanation": "Why the answer is correct",
  "difficulty": "easy|medium|hard",
  "topic": "specific sub-topic"
}`,
      assertion_reason: `ASSERTION-REASON FORMAT:
{
  "type": "assertion_reason",
  "questionText": "Assertion (A): ...\\nReason (R): ...",
  "options": {
    "A": {"text": "Both A and R are true and R is the correct explanation of A"},
    "B": {"text": "Both A and R are true but R is not the correct explanation of A"},
    "C": {"text": "A is true but R is false"},
    "D": {"text": "A is false but R is true"}
  },
  "correctAnswer": "A",
  "explanation": "...",
  "difficulty": "easy|medium|hard",
  "topic": "..."
}`,
      match_following: `MATCH THE FOLLOWING FORMAT:
{
  "type": "match_following",
  "questionText": "Match Column I with Column II:...",
  "options": {"A":{"text":"1-a, 2-b, 3-c, 4-d"},...},
  "correctAnswer": "A",
  "explanation": "...",
  "difficulty": "easy|medium|hard",
  "topic": "..."
}`,
      statement_based: `STATEMENT-BASED FORMAT:
{
  "type": "statement_based",
  "questionText": "Which statements are correct?...",
  "options": {"A":{"text":"1 and 2 only"},...},
  "correctAnswer": "A",
  "explanation": "...",
  "difficulty": "easy|medium|hard",
  "topic": "..."
}`
    };

    const requestedTypeInstructions = safeTypes
      .map(t => typeInstructions[t] || typeInstructions.mcq)
      .join('\n\n');

    const prompt = `Generate ${safeCount} NEET questions for ${subject.toUpperCase()} - ${chapter || 'any chapter'}.
Types: ${safeTypes.join(', ')}
${difficultyInstruction}

Question formats:
${requestedTypeInstructions}

Return ONLY a valid JSON array. No markdown.`;

    const content = await getGeminiText({
      systemInstruction: 'Return only valid JSON.',
      prompt,
      maxOutputTokens: 4096,
      temperature: 0.7
    });

    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('AI did not return a valid JSON array');

    const generated = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(generated) || generated.length === 0) {
      throw new Error('AI returned empty array');
    }

    const OPTION_KEYS = ['A', 'B', 'C', 'D'];
    const validDifficulties = ['easy', 'medium', 'hard'];
    const validTypes = ['mcq', 'assertion_reason', 'match_following', 'statement_based'];

    const normalized = generated.map((q, idx) => {
      const qType = validTypes.includes(q.type) ? q.type : 'mcq';
      const qDiff = validDifficulties.includes(q.difficulty) ? q.difficulty : 'medium';

      const options = {};
      OPTION_KEYS.forEach(k => {
        options[k] = { text: q.options?.[k]?.text?.trim() || `Option ${k}` };
      });

      const correctAnswer = OPTION_KEYS.includes(q.correctAnswer) ? q.correctAnswer : 'A';

      return {
        questionText: (q.questionText || `Question ${idx + 1}`).trim(),
        options,
        correctAnswer,
        explanation: { text: q.explanation?.trim() || '' },
        subject: subject.toLowerCase(),
        chapter: q.chapter?.trim() || chapter || 'Unclassified',
        topic: q.topic?.trim() || topic || '',
        type: qType,
        difficulty: qDiff,
        source,
        generatedByAI: true,
        aiMetadata: { generatedAt: new Date() },
        tags: ['ai-generated', qType, qDiff],
        qualityScore: 70,
        isPublished: false,
        review: { status: 'pending' },
        uploadedBy: req.userId
      };
    });

    const saved = await Question.insertMany(normalized);

    res.status(201).json({
      success: true,
      message: `${saved.length} questions generated`,
      data: saved
    });
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ────────────────────────────────────────────────────────────────
// ADDITIONAL EXPORTS
// ────────────────────────────────────────────────────────────────

exports.aiFixQuestion = async (req, res) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ success: false, message: 'Question ID required' });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const fixed = await fixQuestionWithAI(question);
    const updated = await Question.findByIdAndUpdate(req.params.id, fixed, { new: true });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestionStats = async (req, res) => {
  try {
    const bySubject = await Question.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPublished: await Question.countDocuments({ isPublished: true }),
        totalPending: await Question.countDocuments({ isPublished: false }),
        bySubject
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQuestionMetadata = async (req, res) => {
  try {
    const rows = await Question.aggregate([
      { $match: {
        isPublished: true,
        inSyllabus: true,
        syllabusVersion: 'NEET-UG-2026',
        'qualityAudit.status': 'approved'
      } },
      {
        $group: {
          _id: {
            subject: '$subject',
            chapter: '$chapter',
            topic: '$topic',
            difficulty: '$difficulty'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const merged = new Map();
    rows.forEach((row) => {
      const entry = findCurriculumEntry(row._id.subject, row._id.chapter);
      if (!entry) return;

      const subject = normalizeSubject(row._id.subject);
      const key = [subject, entry.classLevel, entry.chapter, row._id.topic || '', row._id.difficulty || ''].join('|');
      const current = merged.get(key) || {
        _id: {
          subject,
          classLevel: entry.classLevel,
          chapter: entry.chapter,
          topic: row._id.topic || '',
          difficulty: row._id.difficulty
        },
        count: 0
      };
      current.count += row.count;
      merged.set(key, current);
    });

    const metadata = [...merged.values()].sort((a, b) =>
      a._id.subject.localeCompare(b._id.subject) ||
      a._id.classLevel.localeCompare(b._id.classLevel) ||
      a._id.chapter.localeCompare(b._id.chapter)
    );

    res.status(200).json({ success: true, data: metadata });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { subject, chapter } = req.body;
    const { questions } = await PDFExtractor.parseQuestionsFromFile(req.file, {
      subject,
      chapter
    });

    const savedQuestions = await Question.insertMany(
      questions.map(q => ({ ...q, uploadedBy: req.userId, isPublished: false }))
    );

    res.status(201).json({
      success: true,
      message: `${savedQuestions.length} questions extracted`,
      data: savedQuestions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image uploaded' });
    }

    const relativeUrl = `/uploads/${path.basename(req.file.path)}`;

    res.status(201).json({
      success: true,
      data: {
        url: `${req.protocol}://${req.get('host')}${relativeUrl}`,
        publicId: req.file.filename,
        localPath: relativeUrl
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearAllQuestions = async (req, res) => {
  try {
    const result = await Question.deleteMany({});
    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} questions`,
      data: { questionsDeleted: result.deletedCount }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAdminQuestions = async (req, res) => {
  try {
    const { status = 'pending', page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    if (status === 'pending') query.isPublished = false;
    else if (status === 'published') query.isPublished = true;

    const [questions, total] = await Promise.all([
      Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Question.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: questions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.classifyQuestions = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Classification pending' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reviewQuestions = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Review pending' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.importPatternQuestions = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Import pending' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateQuestionsStream = async (req, res) => {
  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.write(`event: done\ndata: {"total": 0}\n\n`);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
