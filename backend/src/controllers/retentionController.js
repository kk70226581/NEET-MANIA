const crypto = require('crypto');
const Question = require('../models/Question');
const MistakeNotebook = require('../models/MistakeNotebook');
const RetentionProfile = require('../models/RetentionProfile');
const { retentionProbability, nextReviewDate, updateStrength, DAY_MS } = require('../services/retentionEngine');

const safeQuestionQuery = {
  isPublished: true,
  isVerified: true,
  inSyllabus: true,
  'qualityAudit.status': 'approved',
  difficulty: { $in: ['medium', 'hard'] }
};

const viewProfile = (profile, now = new Date()) => {
  const retention = retentionProbability(profile.lastReviewedAt, profile.strengthDays, now);
  const due = profile.nextReviewAt <= now || retention <= 0.78;
  return {
    id: profile._id,
    subject: profile.subject,
    chapter: profile.chapter,
    retention: Math.round(retention * 100),
    strengthDays: Number(profile.strengthDays.toFixed(1)),
    nextReviewAt: profile.nextReviewAt,
    due,
    lastScore: profile.lastScore,
    challengesCompleted: profile.challengesCompleted,
    consecutivePasses: profile.consecutivePasses,
    xp: profile.xp
  };
};

async function syncProfilesFromMistakes(userId) {
  const mistakes = await MistakeNotebook.find({ student: userId })
    .select('questionDetails.subject questionDetails.chapter createdAt updatedAt priority')
    .sort({ updatedAt: -1 })
    .lean();
  const chapters = new Map();
  mistakes.forEach((mistake) => {
    const chapter = mistake.questionDetails?.chapter;
    if (!chapter) return;
    const current = chapters.get(chapter) || {
      subject: mistake.questionDetails?.subject || 'biology',
      count: 0,
      lastSeen: mistake.updatedAt || mistake.createdAt || new Date()
    };
    current.count += 1;
    chapters.set(chapter, current);
  });
  await Promise.all([...chapters.entries()].map(([chapter, data]) => {
    const strengthDays = Math.max(0.75, 3 - Math.min(data.count, 8) * 0.25);
    return RetentionProfile.updateOne(
      { user: userId, chapter },
      {
        $setOnInsert: {
          user: userId,
          chapter,
          subject: data.subject,
          strengthDays,
          lastReviewedAt: data.lastSeen,
          nextReviewAt: nextReviewDate(data.lastSeen, strengthDays),
          source: 'mistake_history'
        }
      },
      { upsert: true }
    );
  }));
}

async function ensureStarterProfile(userId) {
  const count = await RetentionProfile.countDocuments({ user: userId });
  if (count) return;
  const lastReviewedAt = new Date(Date.now() - 3 * DAY_MS);
  await RetentionProfile.create({
    user: userId,
    subject: 'chemistry',
    chapter: 'Chemical Bonding and Molecular Structure',
    strengthDays: 2.5,
    lastReviewedAt,
    nextReviewAt: nextReviewDate(lastReviewedAt, 2.5),
    source: 'starter'
  });
}

exports.getDueChallenges = async (req, res) => {
  await syncProfilesFromMistakes(req.userId);
  await ensureStarterProfile(req.userId);
  const profiles = await RetentionProfile.find({ user: req.userId }).sort({ nextReviewAt: 1 }).lean();
  const items = profiles.map((profile) => viewProfile(profile)).sort((a, b) => Number(b.due) - Number(a.due) || a.retention - b.retention);
  const due = items.filter((item) => item.due);
  res.json({
    success: true,
    data: {
      due,
      upcoming: items.filter((item) => !item.due).slice(0, 6),
      headline: due.length
        ? `You are about to forget ${due[0].chapter}. Complete this 2-minute challenge.`
        : 'Your memory is holding. A quick retrieval round will keep it strong.',
      method: 'Retention is estimated with an exponential forgetting curve and updated from retrieval scores; it is a study aid, not a medical prediction.'
    }
  });
};

exports.startChallenge = async (req, res) => {
  await syncProfilesFromMistakes(req.userId);
  await ensureStarterProfile(req.userId);
  const requestedChapter = String(req.body.chapter || '').trim();
  const profile = requestedChapter
    ? await RetentionProfile.findOne({ user: req.userId, chapter: requestedChapter })
    : await RetentionProfile.findOne({ user: req.userId }).sort({ nextReviewAt: 1 });
  if (!profile) return res.status(404).json({ success: false, message: 'No review topic is available yet.' });

  const candidates = await Question.aggregate([
    { $match: { ...safeQuestionQuery, chapter: profile.chapter } },
    { $sample: { size: 5 } },
    { $project: { questionText: 1, options: 1, subject: 1, chapter: 1, topic: 1, difficulty: 1, type: 1 } }
  ]);
  if (candidates.length < 5) return res.status(422).json({ success: false, message: `At least five approved questions are required for ${profile.chapter}.` });

  const now = new Date();
  const challengeId = crypto.randomUUID();
  profile.activeChallenge = {
    challengeId,
    questionIds: candidates.map((question) => question._id),
    startedAt: now,
    expiresAt: new Date(now.getTime() + 2 * 60 * 1000)
  };
  profile.updatedAt = now;
  await profile.save();
  res.status(201).json({
    success: true,
    data: {
      challengeId,
      chapter: profile.chapter,
      subject: profile.subject,
      durationSeconds: 120,
      expiresAt: profile.activeChallenge.expiresAt,
      questions: candidates
    }
  });
};

exports.submitChallenge = async (req, res) => {
  const { challengeId, answers = {} } = req.body;
  const profile = await RetentionProfile.findOne({ user: req.userId, 'activeChallenge.challengeId': challengeId });
  if (!profile) return res.status(404).json({ success: false, message: 'Challenge not found or already replaced.' });
  if (profile.activeChallenge.completedAt) return res.status(409).json({ success: false, message: 'This challenge is already complete.' });

  const questions = await Question.find({ _id: { $in: profile.activeChallenge.questionIds } })
    .select('questionText options correctAnswer explanation ncertReference chapter topic')
    .lean();
  const ordered = profile.activeChallenge.questionIds.map((id) => questions.find((question) => String(question._id) === String(id))).filter(Boolean);
  let score = 0;
  const review = ordered.map((question) => {
    const selected = answers[String(question._id)] || null;
    const correct = selected === question.correctAnswer;
    if (correct) score += 1;
    return {
      questionId: question._id,
      questionText: question.questionText,
      selectedOption: selected,
      correctOption: question.correctAnswer,
      correctAnswer: question.options?.[question.correctAnswer]?.text,
      isCorrect: correct,
      explanation: question.explanation?.text || '',
      ncertReference: question.ncertReference || null
    };
  });

  const now = new Date();
  const retentionBefore = retentionProbability(profile.lastReviewedAt, profile.strengthDays, now);
  const strengthBefore = profile.strengthDays;
  const strengthAfter = updateStrength(strengthBefore, score);
  const xpEarned = score * 20 + (score === 5 ? 50 : 0);
  profile.lastReviewedAt = now;
  profile.strengthDays = strengthAfter;
  profile.nextReviewAt = nextReviewDate(now, strengthAfter);
  profile.lastScore = score;
  profile.challengesCompleted += 1;
  profile.consecutivePasses = score >= 4 ? profile.consecutivePasses + 1 : 0;
  profile.xp += xpEarned;
  profile.activeChallenge.completedAt = now;
  profile.history.push({ score, retentionBefore, strengthBefore, strengthAfter, completedAt: now });
  if (profile.history.length > 40) profile.history = profile.history.slice(-40);
  profile.updatedAt = now;
  await profile.save();

  res.json({
    success: true,
    data: {
      score,
      total: 5,
      xpEarned,
      expired: now > profile.activeChallenge.expiresAt,
      retentionBefore: Math.round(retentionBefore * 100),
      strengthBefore: Number(strengthBefore.toFixed(1)),
      strengthAfter: Number(strengthAfter.toFixed(1)),
      nextReviewAt: profile.nextReviewAt,
      message: score >= 4 ? 'Memory strengthened. Excellent retrieval.' : 'Review the corrections now; this topic will return sooner.',
      review
    }
  });
};

exports._private = { viewProfile, syncProfilesFromMistakes };
