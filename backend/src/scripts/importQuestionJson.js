/**
 * Import a user-provided JSON array into the main Question collection.
 *
 * Dry run: node src/scripts/importQuestionJson.js <file>
 * Store as pending: node src/scripts/importQuestionJson.js <file> --apply
 * Approve for tests: node src/scripts/importQuestionJson.js <file> --apply --approve
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const fs = require('fs');
const path = require('path');
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const { findCurriculumEntry, NEET_SYLLABUS_VERSION } = require('../config/ncertCurriculum');

const ANSWERS = ['A', 'B', 'C', 'D'];
const VALID_SUBJECTS = new Set(['physics', 'chemistry', 'biology', 'botany', 'zoology']);
const apply = process.argv.includes('--apply');
const approve = process.argv.includes('--approve');
const inputArg = process.argv.slice(2).find((arg) => !['--apply', '--approve'].includes(arg));
const dnsServers = process.env.DNS_SERVERS?.split(',').map((value) => value.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);

function clean(value) {
  return String(value ?? '')
    .replace(/Â°/g, '°')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(raw, index) {
  const subject = clean(raw.subject).toLowerCase();
  if (!VALID_SUBJECTS.has(subject)) throw new Error(`Item ${index + 1}: invalid subject "${raw.subject}"`);

  const questionText = clean(raw.questionText || raw.question);
  const suppliedChapter = clean(raw.chapter);
  const curriculumEntry = findCurriculumEntry(subject, suppliedChapter);
  const chapter = curriculumEntry?.chapter;
  const correctAnswer = clean(raw.correctAnswer || raw.answer).toUpperCase();
  const options = Object.fromEntries(ANSWERS.map((answer) => [answer, { text: clean(raw.options?.[answer]?.text || raw.options?.[answer]) }]));

  if (!questionText || !suppliedChapter) throw new Error(`Item ${index + 1}: question text and chapter are required`);
  if (!curriculumEntry) throw new Error(`Item ${index + 1}: chapter "${suppliedChapter}" is not in the configured NEET curriculum`);
  if (!ANSWERS.includes(correctAnswer)) throw new Error(`Item ${index + 1}: correctAnswer must be A, B, C, or D`);
  if (ANSWERS.some((answer) => !options[answer].text)) throw new Error(`Item ${index + 1}: all four options are required`);
  if (new Set(ANSWERS.map((answer) => options[answer].text.toLowerCase())).size !== 4) {
    throw new Error(`Item ${index + 1}: options must be distinct`);
  }

  const isPYQ = Boolean(raw.pyqTag ?? raw.pyq?.isPYQ);
  const year = raw.year == null ? undefined : Number(raw.year);
  const examName = clean(raw.exam);
  if (year !== undefined && (!Number.isInteger(year) || year < 1900 || year > 2100)) {
    throw new Error(`Item ${index + 1}: invalid year "${raw.year}"`);
  }

  return {
    questionText,
    options,
    correctAnswer,
    explanation: { text: clean(raw.explanation?.text || raw.explanation) },
    subject,
    chapter,
    topic: clean(raw.topic || chapter),
    type: 'mcq',
    difficulty: clean(raw.difficulty || 'medium').toLowerCase(),
    source: isPYQ ? 'pyq' : 'custom',
    sourceDetails: {
      ...(year !== undefined ? { year } : {}),
      ...(examName ? { examType: examName.toLowerCase().replace(/\s+/g, '_'), testName: examName } : {})
    },
    pyq: {
      isPYQ,
      reference: isPYQ ? [examName, year].filter(Boolean).join(' ') : ''
    },
    generatedByAI: false,
    inSyllabus: true,
    ...(approve ? { syllabusVersion: NEET_SYLLABUS_VERSION } : {}),
    isVerified: approve,
    isPublished: true,
    qualityScore: approve ? 80 : 50,
    qualityAudit: {
      status: approve ? 'approved' : 'pending',
      ...(approve ? { factualScore: 80, conceptualScore: 80, ambiguityScore: 80 } : {}),
      notes: [approve
        ? 'Imported from a user-provided structured question set and explicitly approved for the test bank.'
        : 'Imported from a user-provided structured question set; approval is still required.'],
      auditedAt: new Date(),
      auditedBy: 'user-json-import-v1'
    },
    review: {
      status: approve ? 'approved' : 'pending',
      ...(approve ? { reviewedAt: new Date() } : {}),
      reviewNotes: approve
        ? 'User explicitly approved this structured question set for the test bank.'
        : 'User-provided structured question set awaiting test-bank approval.'
    },
    tags: ['user-import', subject, clean(raw.topic || chapter).toLowerCase()],
    updatedAt: new Date()
  };
}

async function main() {
  if (!inputArg) throw new Error('Usage: node src/scripts/importQuestionJson.js <file> [--apply] [--approve]');
  const inputPath = path.resolve(inputArg);
  const parsed = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Input must be a non-empty JSON array');

  const documents = parsed.map(normalize);
  const unique = [];
  const seen = new Set();
  for (const document of documents) {
    const key = document.questionText.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(document);
    }
  }

  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', approval: approve ? 'approved-for-tests' : 'pending', input: parsed.length, validUnique: unique.length, duplicatesInFile: documents.length - unique.length }, null, 2));
  if (!apply) return;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');

  await mongoose.connect(process.env.MONGODB_URI);
  const existing = await Question.find(
    { questionText: { $in: unique.map((item) => item.questionText) } },
    { questionText: 1, tags: 1 }
  ).lean();
  const existingByText = new Map(existing.map((item) => [item.questionText, item]));
  const operations = unique.flatMap((document) => {
    const current = existingByText.get(document.questionText);
    if (current && !current.tags?.includes('user-import')) return [];
    return [{
      updateOne: {
        filter: { questionText: document.questionText },
        update: current ? { $set: document } : { $setOnInsert: document },
        upsert: !current
      }
    }];
  });
  const externalDuplicates = unique.length - operations.length;
  const result = await Question.bulkWrite(operations, { ordered: true });
  const stored = await Question.countDocuments({ questionText: { $in: unique.map((item) => item.questionText) } });
  const visibleImportedTotal = await Question.countDocuments({
    tags: 'user-import',
    isPublished: true,
    inSyllabus: true,
    syllabusVersion: NEET_SYLLABUS_VERSION,
    'qualityAudit.status': 'approved'
  });
  console.log(JSON.stringify({ inserted: result.upsertedCount, refreshedImports: result.matchedCount, externalDuplicates, stored, visibleImportedTotal }, null, 2));
  if (stored !== unique.length) throw new Error(`Expected ${unique.length} stored questions, found ${stored}`);
}

main()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
