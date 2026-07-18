const mongoose = require('mongoose');
const Question = require('../models/Question');
const Test = require('../models/Test');
const PyqInteraction = require('../models/PyqInteraction');
const PyqAnalyticsSnapshot = require('../models/PyqAnalyticsSnapshot');
const { curriculum, normalizeChapter, findCurriculumEntry } = require('../config/ncertCurriculum');
const { getTrends, DISCLAIMER } = require('../services/pyqAnalytics');

const list = (value) => Array.isArray(value) ? value : String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
const bool = (value) => value === true || value === 'true';
const pyqBase = {
  'pyq.isPYQ': true,
  isPublished: true,
  isVerified: true,
  'pyqDetails.legalStatus': { $in: ['user_provided', 'licensed', 'original_sample'] }
};

function buildQuery(input = {}) {
  const query = { ...pyqBase };
  const years = list(input.year || input.years).map(Number).filter(Number.isFinite);
  const subjects = list(input.subject || input.subjects);
  const chapters = list(input.chapter || input.chapters).map(normalizeChapter);
  const topics = list(input.topic || input.topics);
  const difficulties = list(input.difficulty);
  const types = list(input.questionType || input.type);
  if (years.length) query['sourceDetails.year'] = { $in: years };
  if (subjects.length) query.subject = subjects.includes('biology') ? { $in: [...new Set([...subjects, 'botany', 'zoology'])] } : { $in: subjects };
  if (input.classLevel) query['pyqDetails.classLevel'] = String(input.classLevel);
  if (input.unit) query['pyqDetails.unit'] = { $in: list(input.unit) };
  if (chapters.length) query.chapter = { $in: chapters };
  if (topics.length) query.topic = { $in: topics };
  if (input.subtopic) query.subtopic = { $in: list(input.subtopic) };
  if (difficulties.length) query.difficulty = { $in: difficulties };
  if (types.length) query.type = { $in: types };
  if (input.ncertBased !== undefined) query['pyqDetails.ncertBased'] = bool(input.ncertBased);
  if (input.repeated !== undefined) query['pyqDetails.repeatedConcept'] = bool(input.repeated);
  if (input.highFrequency === 'true') query['pyqDetails.repetitionCount'] = { $gte: 3 };
  if (input.search) {
    const escaped = String(input.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = ['questionText', 'chapter', 'topic', 'subtopic'].map((field) => ({ [field]: { $regex: escaped, $options: 'i' } }));
  }
  return query;
}

exports.getMetadata = async (req, res) => {
  const [years, subjects, units, chapters, topics, subtopics, types] = await Promise.all([
    Question.distinct('sourceDetails.year', pyqBase), Question.distinct('subject', pyqBase), Question.distinct('pyqDetails.unit', pyqBase),
    Question.distinct('chapter', pyqBase), Question.distinct('topic', pyqBase), Question.distinct('subtopic', pyqBase), Question.distinct('type', pyqBase)
  ]);
  res.json({ success: true, data: { years: years.filter(Boolean).sort((a, b) => b - a), subjects, units: units.filter(Boolean), chapters: chapters.filter(Boolean), topics: topics.filter(Boolean), subtopics: subtopics.filter(Boolean), types } });
};

exports.explore = async (req, res) => {
  const query = buildQuery(req.query);
  const state = req.query.state;
  if (state) {
    const interactionQuery = { user: req.userId };
    if (state === 'bookmarked') interactionQuery.bookmarked = true;
    if (state === 'incorrect') interactionQuery.lastCorrect = false;
    const interactions = await PyqInteraction.find(interactionQuery).select('question').lean();
    const ids = interactions.map((item) => item.question);
    query._id = state === 'unattempted' ? { $nin: ids } : { $in: ids };
  }
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
  const sortMap = {
    latest: { 'sourceDetails.year': -1, 'pyqDetails.originalOrder': 1 }, oldest: { 'sourceDetails.year': 1 }, repeated: { 'pyqDetails.repetitionCount': -1 },
    hardest: { difficulty: -1 }, easiest: { difficulty: 1 }, attempted: { 'statistics.totalAttempts': -1 }, lowAccuracy: { 'statistics.accuracy': 1 }, highAccuracy: { 'statistics.accuracy': -1 }
  };
  const sort = sortMap[req.query.sort] || sortMap.latest;
  const [total, questions] = await Promise.all([
    Question.countDocuments(query),
    Question.find(query).select('-correctAnswer -explanation -pyqDetails.optionExplanations -pyqDetails.shortSolution -pyqDetails.fastestMethod -pyqDetails.conceptExplanation').sort(sort).skip((page - 1) * limit).limit(limit).lean()
  ]);
  const interactions = await PyqInteraction.find({ user: req.userId, question: { $in: questions.map((question) => question._id) } }).lean();
  const states = new Map(interactions.map((item) => [String(item.question), item]));
  res.json({ success: true, data: questions.map((question) => ({ ...question, userState: states.get(String(question._id)) || null })), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.getQuestionAnalysis = async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, ...pyqBase }).lean();
  if (!question) return res.status(404).json({ success: false, message: 'PYQ not found' });
  const interaction = await PyqInteraction.findOne({ user: req.userId, question: question._id }).lean();
  const related = await Question.find({ ...pyqBase, _id: { $ne: question._id }, $or: [{ topic: question.topic }, { chapter: question.chapter, 'pyqDetails.repeatedConcept': true }] }).select('questionText subject chapter topic sourceDetails.year difficulty').limit(6).lean();
  const wrongOptions = interaction?.attempts?.filter((attempt) => !attempt.isCorrect && attempt.selectedOption) || [];
  const selectedCounts = wrongOptions.reduce((result, attempt) => ({ ...result, [attempt.selectedOption]: (result[attempt.selectedOption] || 0) + 1 }), {});
  const mostSelectedWrong = Object.entries(selectedCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  res.json({ success: true, data: { question, interaction, related, mostSelectedWrong, disclaimer: DISCLAIMER } });
};

exports.submitAttempt = async (req, res) => {
  const { selectedOption, timeSpent = 0 } = req.body;
  if (!['A', 'B', 'C', 'D'].includes(selectedOption)) return res.status(400).json({ success: false, message: 'Select one option from A to D' });
  const question = await Question.findOne({ _id: req.params.id, ...pyqBase });
  if (!question) return res.status(404).json({ success: false, message: 'PYQ not found' });
  const isCorrect = question.correctAnswer === selectedOption;
  let interaction = await PyqInteraction.findOne({ user: req.userId, question: question._id });
  if (!interaction) interaction = new PyqInteraction({ user: req.userId, question: question._id });
  if (!interaction.attempts.length) interaction.firstAttemptCorrect = isCorrect;
  else if (isCorrect) interaction.retryCorrect = true;
  interaction.attempts.push({ selectedOption, isCorrect, timeSpent: Math.max(0, Number(timeSpent) || 0) });
  interaction.lastSelectedOption = selectedOption;
  interaction.lastCorrect = isCorrect;
  interaction.lastTimeSpent = Math.max(0, Number(timeSpent) || 0);
  interaction.updatedAt = new Date();
  await interaction.save();
  const totalAttempts = (question.statistics?.totalAttempts || 0) + 1;
  const correctAttempts = (question.statistics?.correctAttempts || 0) + (isCorrect ? 1 : 0);
  const oldTime = question.statistics?.averageTimeSpent || 0;
  question.statistics = { ...question.statistics?.toObject?.() || question.statistics, totalAttempts, correctAttempts, accuracy: (correctAttempts / totalAttempts) * 100, averageTimeSpent: ((oldTime * (totalAttempts - 1)) + Number(timeSpent || 0)) / totalAttempts };
  await question.save();
  await PyqAnalyticsSnapshot.deleteMany({});
  res.json({ success: true, data: { isCorrect, correctAnswer: question.correctAnswer, explanation: question.explanation, pyqDetails: question.pyqDetails, ncertReference: question.ncertReference, interaction } });
};

exports.updateBookmark = async (req, res) => {
  const interaction = await PyqInteraction.findOneAndUpdate({ user: req.userId, question: req.params.id }, { $set: { bookmarked: bool(req.body.bookmarked), updatedAt: new Date() } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.json({ success: true, data: interaction });
};

exports.updateNote = async (req, res) => {
  const note = String(req.body.note || '').slice(0, 4000);
  const interaction = await PyqInteraction.findOneAndUpdate({ user: req.userId, question: req.params.id }, { $set: { note, updatedAt: new Date() } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.json({ success: true, data: interaction });
};

exports.reportQuestion = async (req, res) => {
  const report = { reason: req.body.reason || 'other', details: String(req.body.details || '').slice(0, 2000), createdAt: new Date() };
  const interaction = await PyqInteraction.findOneAndUpdate({ user: req.userId, question: req.params.id }, { $push: { reports: report }, $set: { updatedAt: new Date() } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  res.status(201).json({ success: true, data: interaction.reports.at(-1) });
};

exports.getTrends = async (req, res) => {
  const filters = { subject: req.query.subject, classLevel: req.query.classLevel, questionType: req.query.questionType };
  Object.keys(filters).forEach((key) => !filters[key] && delete filters[key]);
  res.json({ success: true, data: await getTrends(filters, bool(req.query.refresh)) });
};

exports.getPapers = async (req, res) => {
  const rows = await Question.aggregate([
    { $match: pyqBase },
    { $group: { _id: { year: '$sourceDetails.year', exam: '$pyqDetails.examName', phase: '$pyqDetails.phase' }, questions: { $sum: 1 }, subjects: { $addToSet: '$subject' }, marks: { $sum: { $ifNull: ['$pyqDetails.marks', 4] } }, attempts: { $sum: '$statistics.totalAttempts' }, averageAccuracy: { $avg: '$statistics.accuracy' }, averageDifficulty: { $avg: { $switch: { branches: [{ case: { $eq: ['$difficulty', 'easy'] }, then: 1 }, { case: { $eq: ['$difficulty', 'hard'] }, then: 3 }], default: 2 } } } } },
    { $sort: { '_id.year': -1 } }
  ]);
  res.json({ success: true, data: rows.map((row) => ({ year: row._id.year, examName: row._id.exam, phase: row._id.phase, questions: row.questions, subjects: row.subjects, totalMarks: row.marks, duration: Math.max(30, Math.round(row.questions)), attempts: row.attempts, averageAccuracy: Number((row.averageAccuracy || 0).toFixed(1)), difficulty: row.averageDifficulty >= 2.5 ? 'Hard' : row.averageDifficulty >= 1.7 ? 'Moderate' : 'Easy' })) });
};

exports.getPerformance = async (req, res) => {
  const interactions = await PyqInteraction.find({ user: req.userId, 'attempts.0': { $exists: true } }).populate('question', 'subject chapter topic difficulty sourceDetails.year estimatedTime').lean();
  const dimensions = { subject: {}, chapter: {}, topic: {}, year: {}, difficulty: {} };
  let attempts = 0, correct = 0, time = 0, retries = 0, retained = 0;
  interactions.forEach((item) => {
    const question = item.question;
    if (!question) return;
    const latest = item.attempts.at(-1);
    attempts += item.attempts.length;
    correct += item.attempts.filter((attempt) => attempt.isCorrect).length;
    time += item.attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
    if (item.attempts.length > 1) retries += 1;
    if (item.firstAttemptCorrect && latest?.isCorrect) retained += 1;
    [['subject', question.subject], ['chapter', question.chapter], ['topic', question.topic || 'Unclassified'], ['year', question.sourceDetails?.year], ['difficulty', question.difficulty]].forEach(([dimension, key]) => {
      if (!key) return;
      dimensions[dimension][key] ||= { attempted: 0, correct: 0, time: 0 };
      dimensions[dimension][key].attempted += item.attempts.length;
      dimensions[dimension][key].correct += item.attempts.filter((attempt) => attempt.isCorrect).length;
      dimensions[dimension][key].time += item.attempts.reduce((sum, attempt) => sum + (attempt.timeSpent || 0), 0);
    });
  });
  Object.values(dimensions).forEach((groups) => Object.values(groups).forEach((group) => { group.accuracy = Number(((group.correct / Math.max(1, group.attempted)) * 100).toFixed(1)); group.averageTime = Math.round(group.time / Math.max(1, group.attempted)); }));
  const chapterEntries = Object.entries(dimensions.chapter).sort((a, b) => a[1].accuracy - b[1].accuracy);
  const recommendations = chapterEntries.slice(0, 4).map(([chapter, data]) => `Revise ${chapter} and retry its incorrect PYQs (${data.accuracy}% accuracy).`);
  res.json({ success: true, data: { overall: { attempts, correct, accuracy: Number(((correct / Math.max(1, attempts)) * 100).toFixed(1)), averageTime: Math.round(time / Math.max(1, attempts)), retries, retentionScore: Number(((retained / Math.max(1, interactions.length)) * 100).toFixed(1)) }, dimensions, weakChapters: chapterEntries.slice(0, 5).map(([name, data]) => ({ name, ...data })), strongChapters: chapterEntries.slice(-5).reverse().map(([name, data]) => ({ name, ...data })), recommendations } });
};

exports.createCustomTest = async (req, res) => {
  const query = buildQuery(req.body);
  if (req.body.state) {
    const interactionQuery = { user: req.userId };
    if (req.body.state === 'bookmarked') interactionQuery.bookmarked = true;
    if (req.body.state === 'incorrect') interactionQuery.lastCorrect = false;
    const ids = (await PyqInteraction.find(interactionQuery).select('question').lean()).map((item) => item.question);
    query._id = req.body.state === 'unattempted' ? { $nin: ids } : { $in: ids };
  }
  const count = Math.min(180, Math.max(1, Number(req.body.questionCount) || 30));
  const available = await Question.countDocuments(query);
  if (!available) return res.status(400).json({ success: false, message: 'No verified PYQs match these filters' });
  const questions = await Question.aggregate([{ $match: query }, { $sample: { size: Math.min(count, available) } }, { $project: { _id: 1 } }]);
  const test = await Test.create({
    testName: req.body.name || `Custom PYQ Practice - ${new Date().toLocaleDateString('en-IN')}`,
    testType: 'pyq_test', description: 'Custom verified PYQ practice test', questions: questions.map((item) => item._id), totalQuestions: questions.length,
    totalTime: Math.min(180, Math.max(10, Number(req.body.duration) || questions.length)), difficulty: list(req.body.difficulty).length === 1 ? list(req.body.difficulty)[0] : 'mixed',
    source: 'pyq', filters: { chapters: list(req.body.chapter || req.body.chapters), topics: list(req.body.topic || req.body.topics), difficulty: list(req.body.difficulty), source: ['pyq'] },
    randomized: req.body.order !== 'original', createdBy: req.userId, isPublished: false, accessLevel: 'private', allowedUsers: [req.userId]
  });
  res.status(201).json({ success: true, data: { testId: test._id, questionCount: test.totalQuestions, timeLimit: test.totalTime, available } });
};

function validateImportItem(item, index, seen) {
  const errors = [];
  ['questionText', 'subject', 'chapter', 'topic', 'correctAnswer'].forEach((field) => { if (!item[field]) errors.push(`Missing ${field}`); });
  if (!['A', 'B', 'C', 'D'].includes(item.correctAnswer)) errors.push('Correct answer must be A, B, C, or D');
  const options = ['A', 'B', 'C', 'D'].map((key) => item.options?.[key]?.text || item.options?.[key]);
  if (options.some((option) => !option)) errors.push('Four options are required');
  const year = Number(item.year || item.sourceDetails?.year);
  if (!Number.isInteger(year) || year < 2015 || year > new Date().getFullYear()) errors.push('Exam year is invalid');
  if (item.subject && item.chapter && !findCurriculumEntry(item.subject, item.chapter)) errors.push('Chapter is not in the standardized NCERT curriculum');
  const normalized = String(item.questionText || '').toLowerCase().replace(/\W+/g, ' ').trim();
  if (seen.has(normalized)) errors.push('Duplicate question in import');
  seen.add(normalized);
  if (!item.explanation?.text && !item.detailedSolution) errors.push('Detailed solution is required');
  return { index, valid: !errors.length, errors };
}

exports.validateImport = async (req, res) => {
  const items = Array.isArray(req.body.questions) ? req.body.questions : [];
  if (!items.length || items.length > 1000) return res.status(400).json({ success: false, message: 'Provide 1 to 1000 questions' });
  const seen = new Set();
  const results = items.map((item, index) => validateImportItem(item, index, seen));
  res.json({ success: true, data: { total: items.length, valid: results.filter((item) => item.valid).length, invalid: results.filter((item) => !item.valid).length, results, publishBlocked: true } });
};

exports.importQuestions = async (req, res) => {
  const items = Array.isArray(req.body.questions) ? req.body.questions : [];
  const seen = new Set();
  const validation = items.map((item, index) => validateImportItem(item, index, seen));
  if (validation.some((item) => !item.valid)) return res.status(422).json({ success: false, message: 'Import validation failed; nothing was inserted', data: validation });
  const existing = new Set((await Question.find({ questionText: { $in: items.map((item) => item.questionText) } }).select('questionText').lean()).map((item) => item.questionText));
  if (existing.size) return res.status(409).json({ success: false, message: `${existing.size} questions already exist; nothing was inserted` });
  const documents = items.map((item, index) => {
    const entry = findCurriculumEntry(item.subject, item.chapter);
    const options = Object.fromEntries(['A', 'B', 'C', 'D'].map((key) => [key, { text: item.options[key]?.text || item.options[key] }]));
    return {
      questionId: item.questionId || `PYQ-IMPORT-${Date.now()}-${index}`, questionText: item.questionText, options, correctAnswer: item.correctAnswer,
      explanation: item.explanation || { text: item.detailedSolution }, subject: item.subject, chapter: entry.chapter, topic: item.topic, subtopic: item.subtopic,
      type: item.type || 'mcq', difficulty: item.difficulty || 'medium', source: 'pyq', sourceDetails: { ...item.sourceDetails, year: Number(item.year || item.sourceDetails?.year), examType: item.examName || item.sourceDetails?.examType || 'NEET' },
      inSyllabus: true, syllabusVersion: 'NEET-UG-2026', pyq: { isPYQ: true, reference: item.reference },
      pyqDetails: { ...item.pyqDetails, examName: item.examName || item.pyqDetails?.examName || 'NEET', classLevel: entry.classLevel, legalStatus: item.legalStatus || 'pending', shortSolution: item.shortSolution, fastestMethod: item.fastestMethod, conceptExplanation: item.conceptExplanation, formulaConcept: item.formulaConcept, optionExplanations: item.optionExplanations, verification: { questionText: false, answer: false, explanation: false, classification: false, examYear: false } },
      ncertReference: item.ncertReference,
      image: item.image,
      images: item.images,
      tags: item.tags,
      keywords: item.keywords,
      isVerified: false, isPublished: false, review: { status: 'pending', reviewNotes: 'Imported through PYQ validation; expert verification required.' }, qualityAudit: { status: 'pending' }, uploadedBy: req.userId
    };
  });
  await Question.insertMany(documents, { ordered: true });
  await PyqAnalyticsSnapshot.deleteMany({});
  res.status(201).json({ success: true, data: { inserted: documents.length, published: 0, status: 'pending verification' } });
};

exports.getAdminReports = async (req, res) => {
  const rows = await PyqInteraction.find({ 'reports.status': { $in: ['open', 'reviewing'] } }).populate('user', 'firstName lastName email').populate('question', 'questionText questionId chapter').lean();
  res.json({ success: true, data: rows.flatMap((row) => row.reports.filter((report) => ['open', 'reviewing'].includes(report.status)).map((report) => ({ interactionId: row._id, report, user: row.user, question: row.question }))) });
};

exports.getAdminQueue = async (req, res) => {
  const questions = await Question.find({ 'pyq.isPYQ': true, $or: [{ isPublished: false }, { isVerified: false }, { 'review.status': { $ne: 'approved' } }] })
    .select('questionId questionText subject chapter topic sourceDetails pyqDetails explanation isPublished isVerified review createdAt')
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();
  res.json({ success: true, data: questions });
};

exports.verifyQuestion = async (req, res) => {
  const legalStatus = req.body.legalStatus;
  if (!['user_provided', 'licensed'].includes(legalStatus)) {
    return res.status(400).json({ success: false, message: 'Choose user-provided or licensed provenance' });
  }
  const question = await Question.findOne({ _id: req.params.id, 'pyq.isPYQ': true });
  if (!question) return res.status(404).json({ success: false, message: 'PYQ not found' });
  if (!question.questionText || !question.correctAnswer || !question.explanation?.text || !question.pyqDetails?.shortSolution || !question.chapter || !question.topic || !question.sourceDetails?.year) {
    return res.status(422).json({ success: false, message: 'Complete the question, answer, detailed/short solutions, classification, and year before verification' });
  }
  question.pyqDetails.legalStatus = legalStatus;
  question.pyqDetails.verification = {
    questionText: true,
    answer: true,
    explanation: true,
    classification: true,
    examYear: true,
    verifiedAt: new Date(),
    verifiedByName: `${req.user.firstName} ${req.user.lastName}`.trim()
  };
  question.review.status = 'pending';
  question.review.reviewNotes = 'Expert field verification complete; awaiting explicit publication approval.';
  await question.save();
  res.json({ success: true, data: question });
};

exports.publishVerifiedQuestion = async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, 'pyq.isPYQ': true });
  if (!question) return res.status(404).json({ success: false, message: 'PYQ not found' });
  const verification = question.pyqDetails?.verification;
  const complete = ['questionText', 'answer', 'explanation', 'classification', 'examYear'].every((key) => verification?.[key]);
  const legal = ['user_provided', 'licensed', 'original_sample'].includes(question.pyqDetails?.legalStatus);
  if (!complete || !legal) return res.status(422).json({ success: false, message: 'Complete expert and provenance verification before publication' });
  question.isVerified = true;
  question.isPublished = true;
  question.verifiedBy = req.userId;
  question.review.status = 'approved';
  question.review.reviewedAt = new Date();
  question.review.reviewNotes = 'Expert verified and explicitly published from the PYQ quality workspace.';
  question.qualityAudit.status = 'approved';
  question.qualityAudit.auditedAt = new Date();
  question.qualityAudit.auditedBy = 'pyq-expert-workflow';
  await question.save();
  await PyqAnalyticsSnapshot.deleteMany({});
  res.json({ success: true, data: question });
};

exports.resolveReport = async (req, res) => {
  const interaction = await PyqInteraction.findOneAndUpdate({ _id: req.params.interactionId, 'reports._id': req.params.reportId }, { $set: { 'reports.$.status': req.body.status || 'resolved' } }, { new: true });
  if (!interaction) return res.status(404).json({ success: false, message: 'Report not found' });
  res.json({ success: true, data: interaction });
};

exports.getCurriculum = (req, res) => res.json({ success: true, data: curriculum.map(({ subject, classLevel, chapter }) => ({ subject, classLevel, chapter })) });

exports.handleError = (error, req, res, next) => {
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ success: false, message: 'Invalid identifier' });
  next(error);
};
