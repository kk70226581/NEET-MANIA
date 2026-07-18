require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const dns = require('dns');
const Question = require('../models/Question');
const { curriculum, NCERT_EDITION } = require('../config/ncertCurriculum');

const GENERATOR_ID = 'codex-curated-ncert-v1';
const TARGET = 600;
const ANSWERS = ['A', 'B', 'C', 'D'];
const dnsServers = process.env.DNS_SERVERS?.split(',').map((value) => value.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(process.env.MONGODB_URI);
  const questions = await Question.find({ 'qualityAudit.auditedBy': GENERATOR_ID }).lean();
  const failures = [];
  const answerCounts = Object.fromEntries(ANSWERS.map((answer) => [answer, 0]));
  const chapterCounts = new Map();

  if (questions.length !== TARGET) failures.push(`expected ${TARGET}, found ${questions.length}`);
  questions.forEach((question) => {
    const id = question.questionId || question._id;
    const options = ANSWERS.map((key) => normalize(question.options?.[key]?.text));
    if (options.some((value) => !value) || new Set(options).size !== 4) failures.push(`${id}: invalid options`);
    if (!ANSWERS.includes(question.correctAnswer)) failures.push(`${id}: invalid answer`);
    else answerCounts[question.correctAnswer] += 1;
    if (question.subject !== 'biology' || question.difficulty !== 'hard' || question.source !== 'ncert') failures.push(`${id}: classification mismatch`);
    if (question.bloomsLevel !== 'analyze' || !question.inSyllabus) failures.push(`${id}: learning metadata mismatch`);
    if (!question.isPublished || !question.isVerified || question.review?.status !== 'approved') failures.push(`${id}: publication workflow mismatch`);
    if (question.qualityAudit?.status !== 'approved' || question.qualityScore < 90) failures.push(`${id}: quality approval mismatch`);
    if (!question.generatedByAI || !String(question.aiMetadata?.model).startsWith('Codex')) failures.push(`${id}: Codex provenance missing`);
    if (question.ncertReference?.edition !== NCERT_EDITION || !question.ncertReference?.pdfPage || !question.ncertReference?.quotedLine) failures.push(`${id}: NCERT citation missing`);
    if (!String(question.ncertReference?.sourceUrl || '').startsWith('https://ncert.nic.in/textbook/pdf/')) failures.push(`${id}: unofficial source`);
    if (/_{3,}|all of the above|none of the above/i.test(question.questionText)) failures.push(`${id}: weak question pattern`);
    chapterCounts.set(question.chapter, (chapterCounts.get(question.chapter) || 0) + 1);
  });

  ANSWERS.forEach((answer) => {
    if (answerCounts[answer] !== TARGET / 4) failures.push(`answer ${answer}: expected ${TARGET / 4}, found ${answerCounts[answer]}`);
  });
  curriculum.filter((entry) => entry.subject === 'biology').forEach((entry) => {
    if (!chapterCounts.has(entry.chapter)) failures.push(`${entry.chapter}: no Codex questions`);
  });

  const activeBiology = await Question.countDocuments({
    subject: 'biology',
    isPublished: true,
    isVerified: true,
    inSyllabus: true,
    'qualityAudit.status': 'approved'
  });
  if (activeBiology !== 800) failures.push(`active biology: expected 800, found ${activeBiology}`);

  console.log(JSON.stringify({
    status: failures.length ? 'failed' : 'passed',
    codexQuestions: questions.length,
    activeBiology,
    chapters: chapterCounts.size,
    answerCounts,
    chapterCounts: Object.fromEntries([...chapterCounts.entries()].sort())
  }, null, 2));
  if (failures.length) throw new Error(`Audit failed:\n- ${failures.slice(0, 80).join('\n- ')}`);
}

main()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
