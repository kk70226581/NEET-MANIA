/**
 * Test Controller
 */

const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question');
const TestGenerator = require('../services/testGenerator');
const AIAnalyzer = require('../services/aiAnalyzer');
const MistakeNotebook = require('../models/MistakeNotebook');
const User = require('../models/User');
const { MARKING_SCHEME } = require('../config/constants');

const isAIConfigured = () => {
  const key = String(process.env.GEMINI_API_KEY || '');
  return key.length >= 20 && !/your|change_me|placeholder/i.test(key);
};

// @route   POST /api/tests/generate
// @desc    Generate a test based on filters
// @access  Private
exports.generateTest = async (req, res) => {
  try {
    const { testType, subject, chapter, questionCount, difficulty, source } = req.body;
    const supportedTypes = ['full_mock', 'chapter_test', 'topic_test', 'subject_test', 'pyq_test', 'dpp_test', 'custom_test'];
    const parsedCount = Number(questionCount);

    if (!supportedTypes.includes(testType)) {
      return res.status(400).json({ success: false, message: 'Unsupported test type' });
    }
    if (testType !== 'full_mock' && !subject) {
      return res.status(400).json({ success: false, message: 'Subject is required' });
    }
    if (testType === 'chapter_test' && !chapter) {
      return res.status(400).json({ success: false, message: 'Chapter is required' });
    }
    if (testType === 'topic_test' && !req.body.topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }
    if (testType !== 'full_mock' && (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 180)) {
      return res.status(400).json({ success: false, message: 'Question count must be between 1 and 180' });
    }

    let questionIds = [];

    if (testType === 'full_mock') {
      const mockTest = await TestGenerator.generateFullMockTest({
        subject: req.body.subject,
        chapters: req.body.chapters,
        customChapters: req.body.customChapters
      });
      questionIds = mockTest.questions;
    } else if (testType === 'chapter_test') {
      questionIds = await TestGenerator.generateChapterTest(subject, chapter, parsedCount, difficulty);
    } else if (testType === 'topic_test') {
      questionIds = await TestGenerator.generateTopicTest(subject, req.body.topic, parsedCount, difficulty);
    } else if (testType === 'subject_test') {
      questionIds = await TestGenerator.generateSubjectTest(subject, parsedCount, difficulty);
    } else if (testType === 'pyq_test') {
      questionIds = await TestGenerator.generatePYQTest(subject, 5, parsedCount);
    } else if (testType === 'dpp_test') {
      questionIds = await TestGenerator.generateTest({
        subject,
        questionCount: parsedCount,
        difficulty,
        source: 'dpp',
        isPublished: true
      });
    } else {
      questionIds = await TestGenerator.generateTest({
        subject,
        chapter,
        questionCount: parsedCount,
        difficulty,
        source,
        isPublished: true
      });
    }

    // Validate that we have enough questions
    if (!questionIds || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Not enough questions available for the requested test configuration'
      });
    }

    const config = TestGenerator.getTestConfig(testType);

    const test = await Test.create({
      testName: `${testType.replace(/_/g, ' ')} - ${new Date().toLocaleDateString()}`,
      testType,
      questions: questionIds,
      totalQuestions: questionIds.length,
      totalTime: config.timeLimit,
      filters: { difficulty, source },
      difficulty: difficulty || 'mixed',
      source: testType === 'pyq_test' ? 'pyq' : testType === 'dpp_test' ? 'dpp' : 'mixed',
      createdBy: req.userId,
      isPublished: false
    });

    res.status(201).json({
      success: true,
      message: 'Test generated successfully',
      data: {
        testId: test._id,
        questionCount: test.totalQuestions,
        timeLimit: test.totalTime
      }
    });

  } catch (error) {
    console.error('❌ Test Generation Error:', error);
    const isAvailabilityError = /^Only \d+ questions available/.test(error.message);
    res.status(isAvailabilityError ? 400 : 500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/tests/:testId
// @desc    Get test details
// @access  Private
exports.getTest = async (req, res) => {
  try {
    const test = await Test.findOne({
      _id: req.params.testId,
      $or: [{ createdBy: req.userId }, { isPublished: true }]
    })
      .populate('questions', 'questionText difficulty subject chapter -_id');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    res.status(200).json({
      success: true,
      data: test
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/tests/:testId/questions
// @desc    Get test questions for exam
// @access  Private
exports.getTestQuestions = async (req, res) => {
  try {
    const test = await Test.findOne({
      _id: req.params.testId,
      $or: [{ createdBy: req.userId }, { isPublished: true }]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Fetch questions with all details
    const questions = await Question.find({ _id: { $in: test.questions } })
      .select('-correctAnswer -explanation -uploadedBy -verifiedBy');
    const questionMap = new Map(questions.map((question) => [question._id.toString(), question]));
    const orderedQuestions = test.questions
      .map((questionId) => questionMap.get(questionId.toString()))
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        testId: test._id,
        totalQuestions: test.totalQuestions,
        totalTime: test.totalTime,
        questions: orderedQuestions.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          image: q.image,
          type: q.type,
          estimatedTime: q.estimatedTime,
          subject: q.subject,
          chapter: q.chapter,
          topic: q.topic,
          difficulty: q.difficulty,
          images: q.images
        }))
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   POST /api/tests/:testId/start
// @desc    Start a test attempt
// @access  Private
exports.startTest = async (req, res) => {
  try {
    const test = await Test.findOne({
      _id: req.params.testId,
      $or: [{ createdBy: req.userId }, { isPublished: true }]
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    const existingAttempt = await TestAttempt.findOne({
      student: req.userId,
      test: test._id,
      status: 'in_progress'
    });

    if (existingAttempt) {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - existingAttempt.startTime.getTime()) / 1000));
      const durationSeconds = test.totalTime * 60;
      return res.status(200).json({
        success: true,
        message: 'Test resumed',
        data: {
          attemptId: existingAttempt._id,
          totalTime: test.totalTime,
          timeRemaining: Math.max(0, durationSeconds - elapsedSeconds),
          responses: existingAttempt.responses.map((response) => ({
            questionId: response.questionId,
            selectedOption: response.selectedOption,
            markedForReview: response.markedForReview,
            timeSpent: response.timeSpent,
            status: response.status
          }))
        }
      });
    }

    // Create test attempt
    const attempt = await TestAttempt.create({
      student: req.userId,
      test: test._id,
      startTime: new Date(),
      responses: test.questions.map(qId => ({
        questionId: qId,
        status: 'not_visited'
      })),
      maxScore: test.questions.length * MARKING_SCHEME.CORRECT,
      status: 'in_progress'
    });

    res.status(201).json({
      success: true,
      message: 'Test started',
      data: {
        attemptId: attempt._id,
        totalTime: test.totalTime,
        timeRemaining: test.totalTime * 60,
        responses: []
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   PUT /api/tests/attempts/:attemptId/response
// @desc    Save question response
// @access  Private
exports.saveResponse = async (req, res) => {
  try {
    const { questionId, selectedOption, markedForReview, timeSpent } = req.body;

    const attempt = await TestAttempt.findOne({
      _id: req.params.attemptId,
      student: req.userId,
      status: 'in_progress'
    }).populate('test', 'totalTime');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }
    if (attempt.status !== 'in_progress') {
      return res.status(409).json({
        success: false,
        message: 'This test has already been submitted'
      });
    }
    const expiresAt = attempt.startTime.getTime() + (attempt.test.totalTime * 60 * 1000);
    if (Date.now() >= expiresAt) {
      return res.status(409).json({
        success: false,
        message: 'Time has expired. Submit the test to view your result.'
      });
    }

    // Find and update response
    const responseIndex = attempt.responses.findIndex(
      r => r.questionId.toString() === questionId
    );

    if (responseIndex !== -1) {
      attempt.responses[responseIndex].selectedOption = selectedOption || null;
      attempt.responses[responseIndex].markedForReview = markedForReview || false;
      attempt.responses[responseIndex].timeSpent = Math.max(
        attempt.responses[responseIndex].timeSpent || 0,
        Number(timeSpent) || 0
      );
      attempt.responses[responseIndex].status = selectedOption ? 'answered' : (markedForReview ? 'marked_review' : 'unanswered');
      attempt.responses[responseIndex].answeredAt = new Date();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Question does not belong to this test attempt'
      });
    }

    await attempt.save();

    res.status(200).json({
      success: true,
      message: 'Response saved'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   PUT /api/tests/attempts/:attemptId/submit
// @desc    Submit test
// @access  Private
exports.submitTest = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.attemptId,
      student: req.userId
    })
      .populate('test');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }
    if (attempt.status !== 'in_progress') {
      return res.status(409).json({
        success: false,
        message: 'This test has already been submitted'
      });
    }

    // Calculate score
    let correct = 0, wrong = 0, unanswered = 0;
    const questionIds = attempt.responses.map(r => r.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach(q => {
      questionMap[q._id.toString()] = q;
    });

    attempt.responses.forEach(response => {
      const question = questionMap[response.questionId.toString()];
      if (!question || !response.selectedOption) {
        unanswered++;
      } else {
        const isCorrect = response.selectedOption === question.correctAnswer;
        response.isCorrect = isCorrect;
        response.points = isCorrect ? MARKING_SCHEME.CORRECT : MARKING_SCHEME.INCORRECT;

        if (isCorrect) correct++;
        else wrong++;
      }
    });

    const subjectBuckets = {};
    const chapterBuckets = {};
    attempt.responses.forEach((response) => {
      const question = questionMap[response.questionId.toString()];
      if (!question) return;
      const subject = question.subject;
      const chapter = question.chapter;
      const initialize = () => ({ attempted: 0, correct: 0, wrong: 0, skipped: 0, score: 0 });
      if (!subjectBuckets[subject]) subjectBuckets[subject] = initialize();
      if (!chapterBuckets[chapter]) chapterBuckets[chapter] = { ...initialize(), chapterName: chapter, subject };
      [subjectBuckets[subject], chapterBuckets[chapter]].forEach((bucket) => {
        if (!response.selectedOption) bucket.skipped += 1;
        else {
          bucket.attempted += 1;
          if (response.isCorrect) {
            bucket.correct += 1;
            bucket.score += MARKING_SCHEME.CORRECT;
          } else {
            bucket.wrong += 1;
            bucket.score += MARKING_SCHEME.INCORRECT;
          }
        }
      });
    });

    Object.values(subjectBuckets).forEach((bucket) => {
      bucket.accuracy = bucket.attempted ? (bucket.correct / bucket.attempted) * 100 : 0;
    });
    const chapterAnalysis = Object.values(chapterBuckets).map((bucket) => ({
      ...bucket,
      totalQuestions: bucket.attempted + bucket.skipped,
      accuracy: bucket.attempted ? (bucket.correct / bucket.attempted) * 100 : 0
    }));
    attempt.subjectAnalysis = subjectBuckets;
    attempt.chapterAnalysis = chapterAnalysis;
    attempt.weakAreas = chapterAnalysis.filter((item) => item.attempted && item.accuracy < 60).sort((a, b) => a.accuracy - b.accuracy).slice(0, 5).map((item) => item.chapterName);
    attempt.strongAreas = chapterAnalysis.filter((item) => item.attempted && item.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy).slice(0, 5).map((item) => item.chapterName);

    // Calculate analysis
    attempt.calculateAnalysis();
    attempt.calculateScore();

    // Predict rank
    const normalizedScore = attempt.maxScore > 0
      ? Math.max(0, Math.round((attempt.score / attempt.maxScore) * 720))
      : 0;
    const rankPrediction = await AIAnalyzer.predictNEETRank(normalizedScore);
    attempt.rankPrediction = rankPrediction.estimatedRank.min;

    // Set status
    attempt.status = 'submitted';
    attempt.endTime = new Date();
    attempt.totalTimeSpent = Math.round((attempt.endTime - attempt.startTime) / 60000);

    await attempt.save();

    if (isAIConfigured()) {
      AIAnalyzer.generatePerformanceAnalysis(attempt)
        .then((generated) => {
          if (!generated.error) {
            return TestAttempt.findByIdAndUpdate(attempt._id, { aiAnalysis: generated.analysis });
          }
          return null;
        })
        .catch((error) => console.error('AI analysis background job failed:', error.message));
    }

    const completedAttempts = await TestAttempt.find({
      student: req.userId,
      status: { $in: ['submitted', 'completed'] }
    }).select('score maxScore analysis');
    const averageScore = completedAttempts.length
      ? completedAttempts.reduce((sum, item) => sum + ((item.score / Math.max(item.maxScore, 1)) * 100), 0) / completedAttempts.length
      : 0;
    const averageAccuracy = completedAttempts.length
      ? completedAttempts.reduce((sum, item) => sum + (item.analysis?.accuracy || 0), 0) / completedAttempts.length
      : 0;
    await Promise.all([
      User.findByIdAndUpdate(req.userId, {
        $set: {
          'statistics.totalTestsTaken': completedAttempts.length,
          'statistics.totalQuestionsAttempted': completedAttempts.reduce(
            (sum, item) => sum + (item.analysis?.totalQuestionsAttempted || 0),
            0
          ),
          'statistics.totalAccuracy': averageAccuracy,
          'statistics.averageScore': averageScore,
          'statistics.bestScore': Math.max(
            0,
            ...completedAttempts.map((item) => Math.round((item.score / Math.max(item.maxScore, 1)) * 720))
          ),
          'statistics.estimatedRank': attempt.rankPrediction,
          weakChapters: attempt.weakAreas,
          strongChapters: attempt.strongAreas,
          'statistics.lastStudyDate': new Date()
        }
      }),
      Test.findByIdAndUpdate(attempt.test._id, {
        $inc: { 'statistics.totalAttempts': 1 }
      })
    ]);

    if (questions.length) {
      await Question.bulkWrite(questions.map((question) => {
        const response = attempt.responses.find((item) => item.questionId.toString() === question._id.toString());
        return {
          updateOne: {
            filter: { _id: question._id },
            update: {
              $inc: {
                'statistics.totalAttempts': response?.selectedOption ? 1 : 0,
                'statistics.correctAttempts': response?.isCorrect ? 1 : 0
              }
            }
          }
        };
      }));

      const incorrectResponses = attempt.responses.filter(
        (response) => response.selectedOption && !response.isCorrect && questionMap[response.questionId.toString()]
      );
      if (incorrectResponses.length) {
        await MistakeNotebook.bulkWrite(incorrectResponses.map((response) => {
          const question = questionMap[response.questionId.toString()];
          return {
            updateOne: {
              filter: { student: req.userId, question: question._id },
              update: {
                $set: {
                  testAttempt: attempt._id,
                  questionDetails: {
                    questionText: question.questionText,
                    subject: question.subject,
                    chapter: question.chapter,
                    topic: question.topic,
                    difficulty: question.difficulty
                  },
                  studentResponse: {
                    selectedOption: response.selectedOption,
                    isCorrect: false,
                    timeSpent: response.timeSpent
                  },
                  correctAnswer: {
                    option: question.correctAnswer,
                    explanation: question.explanation?.text || '',
                    conceptsInvolved: question.tags || []
                  },
                  'errorAnalysis.errorType': 'conceptual',
                  conceptsToReview: question.tags || [],
                  revisionStatus: 'pending',
                  priority: question.weightage >= 7 ? 'high' : 'medium',
                  updatedAt: new Date()
                },
                $setOnInsert: {
                  student: req.userId,
                  question: question._id,
                  createdAt: new Date(),
                  firstAttemptDate: new Date()
                }
              },
              upsert: true
            }
          };
        }));
      }
    }

    if (attempt.test.source === 'pyq') {
      const PyqInteraction = require('../models/PyqInteraction');
      const PyqAnalyticsSnapshot = require('../models/PyqAnalyticsSnapshot');
      const answeredResponses = attempt.responses.filter(
        (response) => response.selectedOption && questionMap[response.questionId.toString()]?.pyq?.isPYQ
      );
      await Promise.all(answeredResponses.map(async (response) => {
        let interaction = await PyqInteraction.findOne({ user: req.userId, question: response.questionId });
        if (!interaction) interaction = new PyqInteraction({ user: req.userId, question: response.questionId });
        if (!interaction.attempts.length) interaction.firstAttemptCorrect = response.isCorrect;
        else if (response.isCorrect) interaction.retryCorrect = true;
        interaction.attempts.push({ selectedOption: response.selectedOption, isCorrect: response.isCorrect, timeSpent: response.timeSpent || 0, attemptedAt: new Date() });
        interaction.lastSelectedOption = response.selectedOption;
        interaction.lastCorrect = response.isCorrect;
        interaction.lastTimeSpent = response.timeSpent || 0;
        interaction.updatedAt = new Date();
        await interaction.save();
      }));
      await PyqAnalyticsSnapshot.deleteMany({});
    }

    res.status(200).json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        attemptId: attempt._id,
        score: attempt.score,
        accuracy: attempt.analysis.accuracy.toFixed(2),
        totalTime: attempt.totalTimeSpent
      }
    });

  } catch (error) {
    console.error('❌ Test Submit Error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/tests/attempts/:attemptId/results
// @desc    Get test results and analysis
// @access  Private
exports.getResults = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.attemptId,
      student: req.userId
    }).populate('test');

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Test attempt not found'
      });
    }

    if (!['submitted', 'completed'].includes(attempt.status)) {
      return res.status(409).json({
        success: false,
        message: 'Submit the test before viewing results'
      });
    }
    const deterministicRecommendation = attempt.weakAreas?.length
      ? `Prioritize ${attempt.weakAreas.slice(0, 3).join(', ')}. Review each incorrect concept, then take a focused chapter test.`
      : 'Review every incorrect answer, note the concept behind it, and take a focused test next.';

    const incorrectResponses = attempt.responses.filter((response) => response.selectedOption && !response.isCorrect);
    const incorrectQuestions = await Question.find({
      _id: { $in: incorrectResponses.map((response) => response.questionId) }
    }).select('questionText options correctAnswer explanation subject chapter topic ncertReference').lean();
    const questionById = new Map(incorrectQuestions.map((question) => [String(question._id), question]));
    const questionReview = incorrectResponses.map((response) => {
      const question = questionById.get(String(response.questionId));
      if (!question) return null;
      return {
        questionId: question._id,
        questionText: question.questionText,
        subject: question.subject,
        chapter: question.chapter,
        topic: question.topic,
        selectedOption: response.selectedOption,
        selectedAnswer: question.options?.[response.selectedOption]?.text || '',
        correctOption: question.correctAnswer,
        correctAnswer: question.options?.[question.correctAnswer]?.text || '',
        explanation: question.explanation?.text || '',
        ncertReference: question.ncertReference || null
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        score: attempt.score,
        maxScore: attempt.maxScore,
        accuracy: attempt.analysis.accuracy.toFixed(2),
        analysis: attempt.aiAnalysis || deterministicRecommendation,
        questionsAttempted: attempt.analysis.totalQuestionsAttempted,
        questionsCorrect: attempt.analysis.totalQuestionsCorrect,
        questionsWrong: attempt.analysis.totalQuestionsWrong,
        questionsSkipped: attempt.analysis.totalQuestionsSkipped,
        totalQuestions: attempt.responses.length,
        averageTimePerQuestion: attempt.analysis.averageTimePerQuestion.toFixed(2),
        rankPrediction: attempt.rankPrediction,
        negativeMarks: attempt.analysis.negativeMarksCount,
        subjectAnalysis: attempt.subjectAnalysis,
        chapterAnalysis: attempt.chapterAnalysis,
        weakAreas: attempt.weakAreas,
        strongAreas: attempt.strongAreas,
        questionReview
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/tests/attempts
// @desc    Get user's test attempts
// @access  Private
exports.getUserAttempts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const attempts = await TestAttempt.find({ student: req.userId })
      .populate('test', 'testName testType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TestAttempt.countDocuments({ student: req.userId });

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
