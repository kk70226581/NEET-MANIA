const crypto = require('crypto');
const { Question, DuplicateQuestionRecord } = require('../../models/nursing');

const OPTION_KEYS = ['A', 'B', 'C', 'D'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const optionText = (option) => typeof option === 'string' ? option : option?.text;

const normalizeText = (value = '') => value
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[^a-z0-9\s]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const contentHash = (value) => crypto.createHash('sha256').update(normalizeText(value)).digest('hex');

const tokenSet = (value) => new Set(normalizeText(value).split(' ').filter(token => token.length > 2));

const lexicalSimilarity = (left, right) => {
  const a = tokenSet(left);
  const b = tokenSet(right);
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter(token => b.has(token)).length;
  const union = new Set([...a, ...b]).size;
  return Math.round((intersection / union) * 100);
};

const normalizeOptions = (options = {}) => Object.fromEntries(
  OPTION_KEYS.map(key => [key, { text: String(optionText(options[key]) || '').trim() }])
);

const validateQuestionDraft = (draft, taxonomy = {}) => {
  const errors = [];
  const warnings = [];
  const questionText = String(draft.questionText || draft.question || '').trim();
  const options = normalizeOptions(draft.options || {
    A: draft.optionA, B: draft.optionB, C: draft.optionC, D: draft.optionD
  });
  const answer = String(draft.correctAnswer || '').toUpperCase();
  const difficulty = String(draft.difficulty || '').toLowerCase();

  if (questionText.length < 12) errors.push('Question must contain at least 12 characters.');
  OPTION_KEYS.forEach(key => {
    if (!options[key].text) errors.push(`Option ${key} is required.`);
  });
  const normalizedOptions = OPTION_KEYS.map(key => normalizeText(options[key].text));
  if (new Set(normalizedOptions.filter(Boolean)).size !== normalizedOptions.filter(Boolean).length) {
    errors.push('Options must be unique.');
  }
  if (!OPTION_KEYS.includes(answer)) errors.push('Correct answer must be A, B, C, or D.');
  if (!DIFFICULTIES.includes(difficulty)) errors.push('Difficulty must be easy, medium, or hard.');
  if (!String(draft.explanation?.text || draft.explanation || '').trim()) warnings.push('Explanation is missing.');
  if (taxonomy.subject && !draft.subject) errors.push('Subject is required.');
  if (taxonomy.chapter && !draft.chapter) errors.push('Chapter is required.');

  const clarity = questionText.length >= 25 ? 20 : 12;
  const answerUniqueness = errors.some(error => error.includes('Options')) ? 0 : 20;
  const explanationQuality = warnings.length ? 0 : 10;
  const qualityScore = Math.max(0, Math.min(100, 30 + clarity + answerUniqueness + explanationQuality + 10 + 5 + 5));

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    qualityScore,
    normalized: {
      ...draft,
      questionText,
      options,
      correctAnswer: answer,
      difficulty,
      explanation: { text: String(draft.explanation?.text || draft.explanation || '').trim() },
      normalizedText: normalizeText(questionText),
      contentHash: contentHash(questionText)
    }
  };
};

const findPotentialDuplicates = async (draft, { threshold = Number(process.env.NURSING_DUPLICATE_THRESHOLD || 78), limit = 8 } = {}) => {
  const normalized = normalizeText(draft.questionText || draft.question);
  const hash = contentHash(normalized);
  const exact = await Question.findOne({ $or: [{ contentHash: hash }, { normalizedText: normalized }] })
    .select('_id questionId questionText')
    .lean();
  if (exact) return [{ ...exact, similarity: 100, similarityType: 'exact_match' }];

  const candidates = await Question.find({
    ...(draft.chapter ? { chapter: draft.chapter } : {}),
    lifecycleStatus: { $ne: 'ARCHIVED' }
  }).select('_id questionId questionText').sort({ createdAt: -1 }).limit(250).lean();

  return candidates
    .map(candidate => ({
      ...candidate,
      similarity: lexicalSimilarity(normalized, candidate.questionText),
      similarityType: 'near_duplicate'
    }))
    .filter(candidate => candidate.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
};

const recordDuplicate = async (questionId, duplicate) => {
  if (!duplicate?._id || String(questionId) === String(duplicate._id)) return;
  const [questionA, questionB] = [String(questionId), String(duplicate._id)].sort();
  await DuplicateQuestionRecord.findOneAndUpdate(
    { questionA, questionB },
    {
      questionA,
      questionB,
      similarityType: duplicate.similarityType,
      confidenceScore: duplicate.similarity,
      status: 'pending_resolution'
    },
    { upsert: true, setDefaultsOnInsert: true }
  );
};

module.exports = {
  OPTION_KEYS,
  normalizeText,
  contentHash,
  lexicalSimilarity,
  normalizeOptions,
  validateQuestionDraft,
  findPotentialDuplicates,
  recordDuplicate
};
