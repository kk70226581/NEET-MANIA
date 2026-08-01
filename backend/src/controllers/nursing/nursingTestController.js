const { MockTest, TestBlueprint, TestAttempt, UserAnswer, Question, Exam, MistakeNotebook, UserProgress } = require('../../models/nursing');
const NursingTestGenerator = require('../../services/nursing/nursingTestGenerator');
const crypto = require('crypto');

// Generate mock test or retrieve static scheduled test
exports.generateMockTest = async (req, res) => {
  try {
    const { examId, blueprintId, phase } = req.body;

    let test;
    if (blueprintId) {
      const blueprint = await TestBlueprint.findById(blueprintId);
      if (!blueprint) return res.status(404).json({ success: false, message: 'Blueprint not found' });
      const generated = await NursingTestGenerator.generateFromBlueprint(blueprint);
      
      test = await MockTest.create({
        testId: `MOCK-${crypto.randomUUID()}`,
        testName: `${blueprint.blueprintName} - generated`,
        exam: blueprint.exam,
        duration: generated.duration,
        totalQuestions: generated.totalQuestions,
        totalMarks: generated.totalMarks,
        questions: generated.questions,
        testPhase: phase || 'practice',
        isPublished: true
      });
    } else {
      // Dynamic balanced generation
      const exam = await Exam.findById(examId);
      if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

      // Gather random questions
      const questionIds = await NursingTestGenerator.generateTest({
        questionCount: exam.totalQuestions,
        isPublished: true
      });

      test = await MockTest.create({
        testId: `MOCK-${crypto.randomUUID()}`,
        testName: `${exam.examName} Practice Mock`,
        exam: exam._id,
        duration: exam.duration,
        totalQuestions: questionIds.length,
        totalMarks: questionIds.length * (exam.markingScheme?.correctAnswers || 1),
        questions: questionIds,
        testPhase: phase || 'practice',
        isPublished: true
      });
    }

    res.status(201).json({ success: true, data: test });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Start a test attempt
exports.startTestAttempt = async (req, res) => {
  try {
    const { testId } = req.params;
    const student = req.user.id;

    const mockTest = await MockTest.findById(testId).populate('exam');
    if (!mockTest) return res.status(404).json({ success: false, message: 'Mock test not found' });

    // Check if an in-progress attempt already exists to allow resume support
    let attempt = await TestAttempt.findOne({
      student,
      mockTest: mockTest._id,
      status: 'in_progress'
    });

    if (!attempt) {
      attempt = await TestAttempt.create({
        attemptId: `ATTEMPT-${crypto.randomUUID()}`,
        student,
        mockTest: mockTest._id,
        status: 'in_progress',
        startTime: new Date(),
        timeRemaining: mockTest.duration * 60, // in seconds
        maxScore: mockTest.totalMarks
      });
    }

    res.json({ success: true, data: attempt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get test questions (for palette & rendering)
exports.getTestQuestions = async (req, res) => {
  try {
    const { testId } = req.params;
    const mockTest = await MockTest.findById(testId).populate('questions');
    if (!mockTest) return res.status(404).json({ success: false, message: 'Mock test not found' });
    res.json({ success: true, count: mockTest.questions.length, data: mockTest.questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Periodic answer auto-save (Resume support)
exports.saveAnswerResponse = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOption, timeSpent, markedForReview, timeRemaining } = req.body;

    const attempt = await TestAttempt.findOne({ attemptId });
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Test already submitted' });
    }

    // Resolve correctness of answer
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const isCorrect = selectedOption === question.correctAnswer;

    // Upsert response
    await UserAnswer.findOneAndUpdate(
      { attempt: attempt._id, question: questionId },
      {
        selectedOption,
        isCorrect,
        timeSpent: timeSpent || 0,
        markedForReview: markedForReview || false
      },
      { upsert: true, new: true }
    );

    if (timeRemaining !== undefined) {
      attempt.timeRemaining = timeRemaining;
      await attempt.save();
    }

    res.json({ success: true, message: 'Response auto-saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Submit mock test & score exam-specific marking
exports.submitTestAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findOne({ attemptId }).populate('mockTest');
    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
    if (attempt.status === 'completed' || attempt.status === 'submitted') {
      return res.status(400).json({ success: false, message: 'Test has already been submitted' });
    }

    const exam = await Exam.findById(attempt.mockTest.exam);
    const correctVal = exam?.markingScheme?.correctAnswers || 1;
    const incorrectVal = exam?.markingScheme?.incorrectAnswers || 0;

    const answers = await UserAnswer.find({ attempt: attempt._id }).populate('question');

    let attemptedCount = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let totalScore = 0;

    for (const ans of answers) {
      if (ans.selectedOption) {
        attemptedCount++;
        if (ans.isCorrect) {
          correctCount++;
          totalScore += correctVal;
        } else {
          wrongCount++;
          totalScore += incorrectVal; // This adds a negative number e.g. -0.33

          // Auto add to Mistake Notebook
          await MistakeNotebook.findOneAndUpdate(
            { student: attempt.student, question: ans.question._id },
            {
              selectedOption: ans.selectedOption,
              correctOption: ans.question.correctAnswer,
              lastAttemptAt: new Date(),
              $inc: { timesRepeated: 1 },
              revisionStatus: 'pending'
            },
            { upsert: true }
          );
        }

        // Update student progress statistics per chapter
        await UserProgress.findOneAndUpdate(
          {
            student: attempt.student,
            subject: ans.question.subject,
            chapter: ans.question.chapter
          },
          {
            $inc: { questionsAttempted: 1, questionsCorrect: ans.isCorrect ? 1 : 0 },
            lastStudiedAt: new Date()
          },
          { upsert: true }
        );
      }
    }

    attempt.status = 'completed';
    attempt.endTime = new Date();
    attempt.score = totalScore;
    attempt.analysis = {
      totalQuestions: attempt.mockTest.totalQuestions,
      attempted: attemptedCount,
      correct: correctCount,
      wrong: wrongCount,
      skipped: attempt.mockTest.totalQuestions - attemptedCount,
      accuracy: attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0,
      averageTimePerQuestion: attemptedCount > 0 ? Math.round((attempt.mockTest.duration * 60 - attempt.timeRemaining) / attemptedCount) : 0
    };

    await attempt.save();
    res.json({ success: true, data: attempt, message: 'Test submitted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Retrieve attempt results & recommendations
exports.getAttemptResults = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await TestAttempt.findOne({ attemptId })
      .populate({
        path: 'mockTest',
        populate: { path: 'exam' }
      });

    if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

    const answers = await UserAnswer.find({ attempt: attempt._id }).populate('question');

    // Build subject and chapter wise analysis
    const subjectWise = {};
    const chapterWise = {};

    for (const ans of answers) {
      const q = ans.question;
      if (!q) continue;

      if (!subjectWise[q.subject]) {
        subjectWise[q.subject] = { total: 0, attempted: 0, correct: 0 };
      }
      if (!chapterWise[q.chapter]) {
        chapterWise[q.chapter] = { total: 0, attempted: 0, correct: 0 };
      }

      subjectWise[q.subject].total++;
      chapterWise[q.chapter].total++;

      if (ans.selectedOption) {
        subjectWise[q.subject].attempted++;
        chapterWise[q.chapter].attempted++;
        if (ans.isCorrect) {
          subjectWise[q.subject].correct++;
          chapterWise[q.chapter].correct++;
        }
      }
    }

    // Identify weak areas (accuracy < 60%)
    const weakAreas = [];
    const strongAreas = [];
    for (const [chapId, stats] of Object.entries(chapterWise)) {
      const acc = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0;
      if (acc < 60) {
        weakAreas.push(chapId);
      } else {
        strongAreas.push(chapId);
      }
    }

    res.json({
      success: true,
      data: {
        attempt,
        answers,
        analysis: {
          subjectAnalysis: subjectWise,
          chapterAnalysis: chapterWise,
          weakAreas,
          strongAreas
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Retrieve student attempts list
exports.getStudentAttempts = async (req, res) => {
  try {
    const attempts = await TestAttempt.find({ student: req.user.id })
      .populate('mockTest')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
