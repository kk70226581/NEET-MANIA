const crypto = require('crypto');
const mongoose = require('mongoose');
const {
  Exam,
  Subject,
  Chapter,
  Topic,
  Question,
  Bookmark,
  MistakeNotebook,
  UserProgress,
  TestAttempt,
  SourceRegistry,
  GenerationJob,
  QuestionVersion,
  ImportBatch,
  DuplicateQuestionRecord
} = require('../../models/nursing');
const {
  validateQuestionDraft,
  findPotentialDuplicates,
  recordDuplicate,
  normalizeText,
  contentHash
} = require('../../services/nursing/questionPlatformService');
const { buildGenerationHash, processNextBatch } = require('../../services/nursing/generationJobService');
const aiClient = require('../../services/geminiClient');
const prompts = require('../../config/nursingPrompts');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const asObjectId = (value) => mongoose.isValidObjectId(value) ? new mongoose.Types.ObjectId(value) : null;
const publishedFilter = { isPublished: true, lifecycleStatus: { $nin: ['REJECTED', 'ARCHIVED'] } };
const allowedQuestionFields = [
  'questionText', 'options', 'correctAnswer', 'explanation', 'subject', 'chapter', 'topic', 'exams',
  'type', 'difficulty', 'concept', 'learningObjective', 'commonMistake', 'tags', 'language',
  'translationGroupId', 'source', 'sourceType', 'sourceMetadata', 'lifecycleStatus', 'reviewStatus',
  'currentAffairs',
  'verificationStatus', 'qualityScore', 'confidenceScore', 'generatedByAI', 'isPYQ'
];

const pickQuestionFields = (body) => Object.fromEntries(
  allowedQuestionFields.filter(key => body[key] !== undefined).map(key => [key, body[key]])
);

const questionPopulate = [
  { path: 'subject', select: 'name subjectSlug subjectCode' },
  { path: 'chapter', select: 'fullChapterName chapterSlug chapterCode' },
  { path: 'topic', select: 'name topicSlug topicCode' },
  { path: 'exams', select: 'examName examCode' }
];

exports.getCatalog = async (req, res) => {
  const [exams, subjects, chapters, topics] = await Promise.all([
    Exam.find({ isActive: true }).sort({ examName: 1 }).lean(),
    Subject.find().sort({ displayOrder: 1 }).lean(),
    Chapter.find({ status: 'active' }).sort({ subjectId: 1, displayOrder: 1 }).lean(),
    Topic.find().sort({ chapterId: 1, displayOrder: 1 }).lean()
  ]);
  res.json({ success: true, data: { exams, subjects, chapters, topics } });
};

exports.getQuestions = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const query = { ...publishedFilter };
  ['subject', 'chapter', 'topic'].forEach(field => {
    const id = asObjectId(req.query[field]);
    if (id) query[field] = id;
  });
  if (req.query.exam && asObjectId(req.query.exam)) query.exams = asObjectId(req.query.exam);
  if (['easy', 'medium', 'hard'].includes(req.query.difficulty)) query.difficulty = req.query.difficulty;
  if (req.query.sourceType) query.sourceType = req.query.sourceType;
  if (req.query.language) query.language = req.query.language;
  if (req.query.year) query['sourceMetadata.sourceYear'] = Number(req.query.year);
  if (req.query.previousYear === 'true') {
    query.isPYQ = true;
    query['sourceMetadata.reusePermission'] = 'verified';
  }
  if (req.query.search?.trim()) {
    const search = new RegExp(escapeRegex(req.query.search.trim()), 'i');
    query.$or = [{ questionText: search }, { concept: search }, { tags: search }];
  }

  const sort = req.query.sort === 'oldest' ? { createdAt: 1 } :
    req.query.sort === 'difficulty' ? { difficulty: 1, createdAt: -1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    Question.find(query)
      .select('-correctAnswer -explanation.optionExplanations -aiMetadata.generatorResult -aiMetadata.validatorResult')
      .populate(questionPopulate)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Question.countDocuments(query)
  ]);

  let bookmarked = new Set();
  if (req.userId && items.length) {
    const rows = await Bookmark.find({ student: req.userId, question: { $in: items.map(item => item._id) } }).select('question').lean();
    bookmarked = new Set(rows.map(row => String(row.question)));
  }
  res.json({
    success: true,
    data: items.map(item => ({ ...item, bookmarked: bookmarked.has(String(item._id)) })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
};

exports.getQuestion = async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, ...publishedFilter })
    .select('-correctAnswer -explanation.optionExplanations -aiMetadata.generatorResult -aiMetadata.validatorResult')
    .populate(questionPopulate)
    .lean();
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  res.json({ success: true, data: question });
};

exports.answerQuestion = async (req, res) => {
  const selectedAnswer = String(req.body.selectedAnswer || '').toUpperCase();
  if (!['A', 'B', 'C', 'D'].includes(selectedAnswer)) {
    return res.status(400).json({ success: false, message: 'Select A, B, C, or D.' });
  }
  const question = await Question.findOne({ _id: req.params.id, ...publishedFilter });
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  const isCorrect = selectedAnswer === question.correctAnswer;
  const progressKey = { student: req.userId, subject: question.subject, chapter: question.chapter, topic: question.topic || null };
  const progress = await UserProgress.findOne(progressKey);
  if (progress) {
    progress.questionsAttempted += 1;
    if (isCorrect) progress.questionsCorrect += 1;
    progress.accuracy = Math.round((progress.questionsCorrect / progress.questionsAttempted) * 1000) / 10;
    progress.lastStudiedAt = new Date();
    await progress.save();
  } else {
    await UserProgress.create({ ...progressKey, questionsAttempted: 1, questionsCorrect: isCorrect ? 1 : 0, accuracy: isCorrect ? 100 : 0 });
  }
  if (isCorrect) {
    await MistakeNotebook.deleteOne({ student: req.userId, question: question._id });
  } else {
    await MistakeNotebook.findOneAndUpdate(
      { student: req.userId, question: question._id },
      {
        selectedOption: selectedAnswer,
        correctOption: question.correctAnswer,
        revisionStatus: 'pending',
        lastAttemptAt: new Date(),
        $inc: { timesRepeated: 1 }
      },
      { upsert: true, setDefaultsOnInsert: true }
    );
  }
  res.json({
    success: true,
    data: {
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      removedFromWrongQuestions: isCorrect
    }
  });
};

exports.getAnalytics = async (req, res) => {
  const [progress, attempts, bookmarks, mistakes] = await Promise.all([
    UserProgress.find({ student: req.userId }).populate('subject', 'name').populate('chapter', 'fullChapterName').lean(),
    TestAttempt.find({ student: req.userId, status: { $in: ['completed', 'submitted'] } }).sort({ createdAt: -1 }).limit(10).lean(),
    Bookmark.countDocuments({ student: req.userId }),
    MistakeNotebook.countDocuments({ student: req.userId, revisionStatus: { $ne: 'resolved' } })
  ]);
  const totalAttempted = progress.reduce((sum, item) => sum + item.questionsAttempted, 0);
  const totalCorrect = progress.reduce((sum, item) => sum + item.questionsCorrect, 0);
  const subjectMap = new Map();
  progress.forEach(item => {
    const key = item.subject?.name || 'Unknown';
    const current = subjectMap.get(key) || { name: key, attempted: 0, correct: 0 };
    current.attempted += item.questionsAttempted;
    current.correct += item.questionsCorrect;
    subjectMap.set(key, current);
  });
  const subjectPerformance = [...subjectMap.values()].map(item => ({
    ...item,
    accuracy: item.attempted ? Math.round((item.correct / item.attempted) * 1000) / 10 : 0
  })).sort((a, b) => b.accuracy - a.accuracy);
  const chapterPerformance = progress.map(item => ({
    chapter: item.chapter?.fullChapterName || 'Unknown',
    attempted: item.questionsAttempted,
    accuracy: item.accuracy
  })).sort((a, b) => a.accuracy - b.accuracy);
  res.json({
    success: true,
    data: {
      totalAttempted,
      totalCorrect,
      totalIncorrect: totalAttempted - totalCorrect,
      accuracy: totalAttempted ? Math.round((totalCorrect / totalAttempted) * 1000) / 10 : 0,
      testsCompleted: attempts.length,
      averageScore: attempts.length ? Math.round(attempts.reduce((sum, item) => sum + item.score, 0) / attempts.length * 10) / 10 : 0,
      bookmarks,
      wrongQuestions: mistakes,
      subjectPerformance,
      chapterPerformance,
      strongSubject: subjectPerformance[0] || null,
      weakSubject: subjectPerformance[subjectPerformance.length - 1] || null,
      recommendations: chapterPerformance.filter(item => item.attempted >= 3 && item.accuracy < 65).slice(0, 5)
        .map(item => `Practice 15 medium questions from ${item.chapter}; your accuracy is ${item.accuracy}%.`),
      recentAttempts: attempts
    }
  });
};

exports.getAdminQuestions = async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
  const query = {};
  ['subject', 'chapter', 'topic'].forEach(field => { if (asObjectId(req.query[field])) query[field] = asObjectId(req.query[field]); });
  if (req.query.status) query.lifecycleStatus = req.query.status;
  if (req.query.reviewStatus) query.reviewStatus = req.query.reviewStatus;
  if (req.query.search?.trim()) query.questionText = new RegExp(escapeRegex(req.query.search.trim()), 'i');
  const [data, total] = await Promise.all([
    Question.find(query).populate(questionPopulate).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Question.countDocuments(query)
  ]);
  res.json({ success: true, data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.createQuestion = async (req, res) => {
  const draft = pickQuestionFields(req.body);
  const validation = validateQuestionDraft(draft, { subject: true, chapter: true });
  if (!validation.valid) return res.status(422).json({ success: false, errors: validation.errors, warnings: validation.warnings });
  const duplicates = await findPotentialDuplicates(validation.normalized);
  const question = await Question.create({
    ...validation.normalized,
    questionId: req.body.questionId || `NSG-ADM-${crypto.randomUUID()}`,
    source: draft.source || 'admin_created',
    sourceType: draft.sourceType || 'admin-created',
    qualityScore: validation.qualityScore,
    duplicateScore: duplicates[0]?.similarity || 0,
    lifecycleStatus: duplicates.length ? 'NEEDS_REVIEW' : (draft.lifecycleStatus || 'DRAFT'),
    reviewStatus: duplicates.length ? 'flagged' : (draft.reviewStatus || 'pending'),
    isPublished: false
  });
  if (duplicates[0]) await recordDuplicate(question._id, duplicates[0]);
  res.status(201).json({ success: true, data: question, warnings: validation.warnings, duplicates });
};

exports.updateQuestion = async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  await QuestionVersion.create({
    question: question._id,
    version: question.currentVersion,
    snapshot: question.toObject(),
    changedBy: req.userId,
    changeReason: req.body.changeReason || 'Admin edit'
  });
  const updates = pickQuestionFields(req.body);
  Object.assign(question, updates);
  question.currentVersion += 1;
  question.normalizedText = normalizeText(question.questionText);
  question.contentHash = contentHash(question.questionText);
  question.isPublished = question.lifecycleStatus === 'PUBLISHED';
  question.publishedAt = question.isPublished ? (question.publishedAt || new Date()) : undefined;
  await question.save();
  res.json({ success: true, data: question });
};

exports.archiveQuestion = async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, {
    lifecycleStatus: 'ARCHIVED', isPublished: false, reviewStatus: 'rejected'
  }, { new: true });
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  res.json({ success: true, message: 'Question archived. It can be restored from version history.' });
};

exports.reviewQuestions = async (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids.filter(mongoose.isValidObjectId) : [];
  const action = req.body.action;
  if (!ids.length || !['approve', 'publish', 'reject', 'flag'].includes(action)) {
    return res.status(400).json({ success: false, message: 'Valid ids and review action are required.' });
  }
  const map = {
    approve: { lifecycleStatus: 'APPROVED', reviewStatus: 'approved', isPublished: false },
    publish: { lifecycleStatus: 'PUBLISHED', reviewStatus: 'approved', verificationStatus: 'verified', isPublished: true, publishedAt: new Date() },
    reject: { lifecycleStatus: 'REJECTED', reviewStatus: 'rejected', isPublished: false },
    flag: { lifecycleStatus: 'NEEDS_REVIEW', reviewStatus: 'flagged', isPublished: false }
  };
  const result = await Question.updateMany({ _id: { $in: ids } }, { ...map[action], reviewerId: req.userId, reviewedAt: new Date() });
  res.json({ success: true, modifiedCount: result.modifiedCount });
};

exports.validateQuestion = async (req, res) => {
  const validation = validateQuestionDraft(req.body, { subject: true, chapter: true });
  const duplicates = validation.normalized.questionText ? await findPotentialDuplicates(validation.normalized) : [];
  res.json({ success: true, data: { ...validation, duplicates } });
};

exports.getVersions = async (req, res) => {
  const data = await QuestionVersion.find({ question: req.params.id }).populate('changedBy', 'firstName lastName').sort({ version: -1 }).lean();
  res.json({ success: true, data });
};

exports.restoreVersion = async (req, res) => {
  const [question, version] = await Promise.all([
    Question.findById(req.params.id),
    QuestionVersion.findOne({ question: req.params.id, version: Number(req.params.version) })
  ]);
  if (!question || !version) return res.status(404).json({ success: false, message: 'Question or version not found.' });
  await QuestionVersion.create({ question: question._id, version: question.currentVersion, snapshot: question.toObject(), changedBy: req.userId, changeReason: `Before restoring v${version.version}` });
  const restored = pickQuestionFields(version.snapshot);
  Object.assign(question, restored, { currentVersion: question.currentVersion + 1, lifecycleStatus: 'NEEDS_REVIEW', reviewStatus: 'pending', isPublished: false });
  await question.save();
  res.json({ success: true, data: question });
};

const parseCSV = (text) => {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"' && quoted && text[index + 1] === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      row.push(field); field = '';
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
    } else field += char;
  }
  row.push(field); if (row.some(cell => cell.trim())) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map(header => header.trim());
  return rows.slice(1).map(values => Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || ''])));
};

const importRows = (body) => {
  if (body.format === 'json') {
    const parsed = typeof body.content === 'string' ? JSON.parse(body.content) : body.content;
    return Array.isArray(parsed) ? parsed : parsed.questions || [];
  }
  return parseCSV(String(body.content || ''));
};

const resolveImportRow = async (row) => {
  const subject = asObjectId(row.subject) ? await Subject.findById(row.subject) : await Subject.findOne({ name: new RegExp(`^${escapeRegex(row.subject || '')}$`, 'i') });
  const chapter = asObjectId(row.chapter) ? await Chapter.findById(row.chapter) : await Chapter.findOne({ fullChapterName: new RegExp(`^${escapeRegex(row.chapter || '')}$`, 'i'), ...(subject ? { subjectId: subject._id } : {}) });
  const topic = row.topic ? (asObjectId(row.topic) ? await Topic.findById(row.topic) : await Topic.findOne({ name: new RegExp(`^${escapeRegex(row.topic)}$`, 'i'), ...(chapter ? { chapterId: chapter._id } : {}) })) : null;
  const draft = {
    questionText: row.questionText || row.question,
    options: row.options || { A: row.optionA, B: row.optionB, C: row.optionC, D: row.optionD },
    correctAnswer: row.correctAnswer,
    explanation: row.explanation,
    difficulty: row.difficulty,
    subject: subject?._id,
    chapter: chapter?._id,
    topic: topic?._id,
    concept: row.concept,
    tags: Array.isArray(row.tags) ? row.tags : String(row.tags || '').split('|').map(tag => tag.trim()).filter(Boolean),
    language: row.language || 'english',
    source: 'imported',
    sourceType: row.sourceType || 'reference-only',
    sourceMetadata: {
      sourceName: row.source || row.sourceName,
      sourceURL: row.sourceURL || row.sourceUrl,
      sourceYear: row.year ? Number(row.year) : undefined,
      sourceExam: row.exam,
      license: row.license,
      reusePermission: row.reusePermission || 'pending',
      verificationStatus: 'needs-review'
    },
    lifecycleStatus: 'IMPORTED'
  };
  const validation = validateQuestionDraft(draft, { subject: true, chapter: true });
  if (!subject) validation.errors.push('Unknown subject.');
  if (!chapter) validation.errors.push('Unknown chapter.');
  validation.valid = validation.errors.length === 0;
  const duplicates = validation.normalized.questionText ? await findPotentialDuplicates(validation.normalized) : [];
  return { draft: validation.normalized, valid: validation.valid && !duplicates.length, errors: validation.errors, warnings: validation.warnings, duplicates };
};

exports.previewImport = async (req, res) => {
  let rows;
  try { rows = importRows(req.body); } catch (error) { return res.status(400).json({ success: false, message: `Invalid import file: ${error.message}` }); }
  if (!rows.length) return res.status(400).json({ success: false, message: 'No import rows found.' });
  if (rows.length > 5000) return res.status(413).json({ success: false, message: 'Import files are limited to 5,000 rows per batch.' });
  const results = [];
  for (const row of rows) results.push(await resolveImportRow(row));
  const errors = results.map((result, index) => ({ row: index + 2, messages: result.errors })).filter(item => item.messages.length);
  const batch = await ImportBatch.create({
    fileName: req.body.fileName,
    format: req.body.format,
    totalRows: rows.length,
    validRows: results.filter(result => result.valid).length,
    invalidRows: results.filter(result => !result.valid).length,
    errors: errors.slice(0, 200),
    preview: results.slice(0, 25).map(result => ({ draft: result.draft, valid: result.valid, errors: result.errors, duplicateScore: result.duplicates[0]?.similarity || 0 })),
    importedBy: req.userId
  });
  res.json({ success: true, data: batch });
};

exports.commitImport = async (req, res) => {
  let rows;
  try { rows = importRows(req.body); } catch (error) { return res.status(400).json({ success: false, message: `Invalid import file: ${error.message}` }); }
  const batch = await ImportBatch.findById(req.body.batchId);
  if (!batch || String(batch.importedBy) !== String(req.userId)) return res.status(404).json({ success: false, message: 'Import preview not found.' });
  if (batch.status !== 'PREVIEWED') return res.status(409).json({ success: false, message: 'This import was already committed.' });
  let imported = 0;
  for (const row of rows) {
    const result = await resolveImportRow(row);
    if (!result.valid) continue;
    await Question.create({
      ...result.draft,
      questionId: `NSG-IMP-${crypto.randomUUID()}`,
      generatedByAI: false,
      isPublished: false,
      isVerified: false,
      lifecycleStatus: 'NEEDS_REVIEW',
      reviewStatus: 'pending',
      verificationStatus: 'needs-review'
    });
    imported += 1;
  }
  batch.importedRows = imported;
  batch.status = imported === rows.length ? 'IMPORTED' : (imported ? 'PARTIAL' : 'FAILED');
  await batch.save();
  res.json({ success: true, data: batch });
};

exports.getSources = async (req, res) => {
  const data = await SourceRegistry.find().sort({ sourceName: 1 }).lean();
  res.json({ success: true, data });
};

exports.createSource = async (req, res) => {
  let domain;
  try { domain = new URL(req.body.domain.includes('://') ? req.body.domain : `https://${req.body.domain}`).hostname.replace(/^www\./, ''); }
  catch { return res.status(400).json({ success: false, message: 'Enter a valid source domain.' }); }
  const source = await SourceRegistry.create({ ...req.body, domain, createdBy: req.userId });
  res.status(201).json({ success: true, data: source });
};

exports.updateSource = async (req, res) => {
  const source = await SourceRegistry.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!source) return res.status(404).json({ success: false, message: 'Source not found.' });
  res.json({ success: true, data: source });
};

exports.getCoverage = async (req, res) => {
  const chapters = await Chapter.find().populate('subjectId', 'name').sort({ subjectId: 1, displayOrder: 1 }).lean();
  const counts = await Question.aggregate([
    { $match: { lifecycleStatus: { $nin: ['REJECTED', 'ARCHIVED'] } } },
    { $group: { _id: { chapter: '$chapter', difficulty: '$difficulty' }, count: { $sum: 1 } } }
  ]);
  const map = new Map();
  counts.forEach(item => {
    const key = String(item._id.chapter);
    const current = map.get(key) || { total: 0, easy: 0, medium: 0, hard: 0 };
    current.total += item.count; current[item._id.difficulty] = item.count; map.set(key, current);
  });
  const data = chapters.map(chapter => {
    const count = map.get(String(chapter._id)) || { total: 0, easy: 0, medium: 0, hard: 0 };
    const target = chapter.targetQuestionCount || 200;
    return {
      chapterId: chapter._id,
      chapter: chapter.fullChapterName,
      subjectId: chapter.subjectId?._id,
      subject: chapter.subjectId?.name,
      target,
      ...count,
      missing: Math.max(0, target - count.total),
      coverage: target ? Math.min(100, Math.round((count.total / target) * 1000) / 10) : 100
    };
  });
  res.json({ success: true, data });
};

exports.getAdminStats = async (req, res) => {
  const [total, published, review, rejected, ai, official, imported, duplicates, lowConfidence, bySubject] = await Promise.all([
    Question.countDocuments(), Question.countDocuments({ isPublished: true }), Question.countDocuments({ lifecycleStatus: 'NEEDS_REVIEW' }),
    Question.countDocuments({ lifecycleStatus: 'REJECTED' }), Question.countDocuments({ generatedByAI: true }), Question.countDocuments({ sourceType: 'official' }),
    Question.countDocuments({ source: 'imported' }), DuplicateQuestionRecord.countDocuments({ status: 'pending_resolution' }),
    Question.countDocuments({ confidenceScore: { $lt: Number(process.env.NURSING_AUTO_APPROVE_THRESHOLD || 85) }, lifecycleStatus: { $ne: 'PUBLISHED' } }),
    Question.aggregate([{ $group: { _id: '$subject', count: { $sum: 1 } } }, { $lookup: { from: 'nursingsubjects', localField: '_id', foreignField: '_id', as: 'subject' } }, { $unwind: { path: '$subject', preserveNullAndEmptyArrays: true } }])
  ]);
  res.json({ success: true, data: { total, published, review, rejected, ai, official, imported, duplicates, lowConfidence, bySubject: bySubject.map(item => ({ name: item.subject?.name || 'Unknown', count: item.count })) } });
};

exports.createGenerationJob = async (req, res) => {
  const requestedCount = Math.min(1000, Math.max(1, Number(req.body.requestedCount) || 10));
  if (!asObjectId(req.body.subject) || !asObjectId(req.body.chapter)) return res.status(400).json({ success: false, message: 'Valid subject and chapter are required.' });
  const distribution = req.body.difficultyDistribution || { easy: 40, medium: 40, hard: 20 };
  if (Number(distribution.easy) + Number(distribution.medium) + Number(distribution.hard) !== 100) return res.status(400).json({ success: false, message: 'Difficulty percentages must total 100.' });
  const input = { ...req.body, requestedCount, difficultyDistribution: distribution };
  const generationHash = buildGenerationHash(input);
  const existing = await GenerationJob.findOne({ generationHash, status: { $in: ['QUEUED', 'PROCESSING', 'COMPLETED'] } }).sort({ createdAt: -1 });
  if (existing && req.body.force !== true) return res.status(409).json({ success: false, message: 'An equivalent generation job already exists.', data: existing });
  const job = await GenerationJob.create({
    ...input,
    generationHash,
    requestedBy: req.userId,
    model: aiClient.getGeminiModel(),
    batchSize: Math.min(20, Math.max(1, Number(req.body.batchSize) || Number(process.env.NURSING_AI_BATCH_SIZE || 10)))
  });
  res.status(202).json({ success: true, data: job });
};

exports.getGenerationJobs = async (req, res) => {
  const data = await GenerationJob.find().populate('subject', 'name').populate('chapter', 'fullChapterName').populate('topic', 'name').sort({ createdAt: -1 }).limit(100).lean();
  res.json({ success: true, data });
};

exports.processGenerationJob = async (req, res) => {
  const job = await processNextBatch(req.params.id);
  res.json({ success: true, data: job });
};

exports.retryGenerationJob = async (req, res) => {
  const job = await GenerationJob.findById(req.params.id);
  if (!job) return res.status(404).json({ success: false, message: 'Generation job not found.' });
  if (!['FAILED', 'PARTIAL'].includes(job.status)) return res.status(409).json({ success: false, message: 'Only failed or partial jobs can be retried.' });
  if (job.retryCount >= job.maxRetries) return res.status(409).json({ success: false, message: 'Retry limit reached.' });
  job.failedCount = 0; job.status = 'QUEUED'; job.lastError = undefined; await job.save();
  res.json({ success: true, data: job });
};

exports.cancelGenerationJob = async (req, res) => {
  const job = await GenerationJob.findOneAndUpdate({ _id: req.params.id, status: { $nin: ['COMPLETED', 'CANCELLED'] } }, { status: 'CANCELLED' }, { new: true });
  if (!job) return res.status(409).json({ success: false, message: 'Job cannot be cancelled.' });
  res.json({ success: true, data: job });
};

exports.fillCoverageGap = async (req, res) => {
  const chapter = await Chapter.findById(req.params.chapterId);
  if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found.' });
  const current = await Question.countDocuments({ chapter: chapter._id, lifecycleStatus: { $nin: ['REJECTED', 'ARCHIVED'] } });
  const requestedCount = Math.min(1000, Math.max(0, (chapter.targetQuestionCount || 200) - current));
  if (!requestedCount) return res.json({ success: true, message: 'This chapter already meets its coverage target.' });
  req.body = { subject: chapter.subjectId, chapter: chapter._id, requestedCount, difficultyDistribution: { easy: 40, medium: 40, hard: 20 }, questionType: 'mcq', language: 'english' };
  return exports.createGenerationJob(req, res);
};

exports.improveQuestion = async (req, res) => {
  const question = await Question.findById(req.params.id).populate(questionPopulate);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  const operation = req.body.operation || 'improve';
  const prompt = `Create an improved draft version of this B.Sc. Nursing question. Operation: ${operation}.
Preserve the tested learning objective unless the operation explicitly changes difficulty. Do not fabricate provenance.
Return {"questionText":"","options":{"A":{"text":""},"B":{"text":""},"C":{"text":""},"D":{"text":""}},"correctAnswer":"A","explanation":{"text":""},"difficulty":"${question.difficulty}","concept":"","tags":[]}.
Original: ${JSON.stringify({ questionText: question.questionText, options: question.options, correctAnswer: question.correctAnswer, explanation: question.explanation, concept: question.concept })}`;
  const response = await aiClient.getGeminiText({ prompt, systemInstruction: 'Return only valid JSON. This is a draft requiring human review.', maxOutputTokens: 1800, temperature: 0.25, responseMimeType: 'application/json' });
  const draft = JSON.parse(String(response).replace(/```json/gi, '').replace(/```/g, '').trim());
  const validation = validateQuestionDraft({ ...draft, subject: question.subject._id, chapter: question.chapter._id, topic: question.topic?._id, exams: question.exams?.map(exam => exam._id) }, { subject: true, chapter: true });
  if (!validation.valid) return res.status(422).json({ success: false, message: 'AI improvement failed validation.', errors: validation.errors });
  const improved = await Question.create({
    ...validation.normalized,
    questionId: `NSG-AI-${crypto.randomUUID()}`,
    source: 'ai_generated', sourceType: 'ai-generated', generatedByAI: true, isPublished: false,
    lifecycleStatus: 'NEEDS_REVIEW', reviewStatus: 'pending', verificationStatus: 'needs-review',
    canonicalQuestionId: question.canonicalQuestionId || question._id,
    aiMetadata: { model: aiClient.getGeminiModel(), promptVersion: prompts.QUESTION_IMPROVEMENT, generatedAt: new Date(), validationWarnings: validation.warnings }
  });
  res.status(201).json({ success: true, data: improved });
};
