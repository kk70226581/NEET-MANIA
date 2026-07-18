require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const { curriculum, NEET_SYLLABUS_VERSION, NCERT_EDITION } = require('../config/ncertCurriculum');

const dnsServers = process.env.DNS_SERVERS?.split(',').map((value) => value.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const questions = await Question.find({
    syllabusVersion: NEET_SYLLABUS_VERSION,
    'qualityAudit.status': 'approved'
  }).lean();

  const failures = [];
  const subjectCounts = {};
  const classCounts = {};
  const chapterCounts = new Map();
  const answerCounts = { A: 0, B: 0, C: 0, D: 0 };
  const stems = new Set();

  questions.forEach((question) => {
    subjectCounts[question.subject] = (subjectCounts[question.subject] || 0) + 1;
    classCounts[question.ncertReference?.class] = (classCounts[question.ncertReference?.class] || 0) + 1;
    chapterCounts.set(`${question.subject}|${question.chapter}`, (chapterCounts.get(`${question.subject}|${question.chapter}`) || 0) + 1);
    answerCounts[question.correctAnswer] = (answerCounts[question.correctAnswer] || 0) + 1;

    const stem = normalize(question.questionText);
    if (stems.has(stem)) failures.push(`${question.questionId}: duplicate stem`);
    stems.add(stem);

    const options = ['A', 'B', 'C', 'D'].map((key) => normalize(question.options?.[key]?.text));
    if (options.some((option) => !option) || new Set(options).size !== 4) failures.push(`${question.questionId}: invalid options`);
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) failures.push(`${question.questionId}: invalid answer`);
    if (question.difficulty !== 'hard' || question.bloomsLevel !== 'analyze') failures.push(`${question.questionId}: difficulty metadata`);
    if (!question.isPublished || !question.isVerified || !question.inSyllabus) failures.push(`${question.questionId}: publication metadata`);
    if (question.ncertReference?.edition !== NCERT_EDITION) failures.push(`${question.questionId}: edition mismatch`);
    if (!question.ncertReference?.pdfPage || !question.ncertReference?.quotedLine) failures.push(`${question.questionId}: missing page reference`);
    if (!String(question.ncertReference?.sourceUrl || '').startsWith('https://ncert.nic.in/textbook/pdf/')) failures.push(`${question.questionId}: unofficial source URL`);
  });

  ['physics', 'chemistry', 'biology'].forEach((subject) => {
    if (subjectCounts[subject] !== 200) failures.push(`${subject}: expected 200, found ${subjectCounts[subject] || 0}`);
  });
  curriculum.forEach((entry) => {
    if (!chapterCounts.has(`${entry.subject}|${entry.chapter}`)) failures.push(`${entry.subject}/${entry.chapter}: no approved questions`);
  });
  Object.entries(answerCounts).forEach(([answer, count]) => {
    if (count < 120 || count > 180) failures.push(`answer ${answer}: imbalanced count ${count}`);
  });

  console.log(JSON.stringify({
    total: questions.length,
    subjectCounts,
    classCounts,
    answerCounts,
    chaptersCovered: chapterCounts.size,
    expectedChapters: curriculum.length,
    failures: failures.slice(0, 25),
    failureCount: failures.length
  }, null, 2));

  if (failures.length) process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => mongoose.disconnect().catch(() => {}));
