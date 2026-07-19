require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const dns = require('dns');
const Question = require('../models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map((value) => value.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);

const ANSWERS = ['A', 'B', 'C', 'D'];
const weakPatterns = [
  { key: 'codexFeatureTemplate', regex: /A student connects this NCERT feature/i },
  { key: 'codexChapterTemplate', regex: /In the NCERT chapter .+ which statement about/i },
  { key: 'ocrRestoreTemplate', regex: /Which option restores the biologically correct NCERT statement/i },
  { key: 'blankFillTemplate', regex: /_{3,}/ },
  { key: 'sampleDisclosureInStem', regex: /original \d{4} practice/i }
];

const add = (map, key) => map.set(key || '(missing)', (map.get(key || '(missing)') || 0) + 1);
const asObject = (map) => Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1]));

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(process.env.MONGODB_URI);

  const questions = await Question.find({}).select([
    'questionId', 'questionText', 'options', 'correctAnswer', 'subject', 'chapter', 'source',
    'isPublished', 'isVerified', 'qualityAudit', 'review.status', 'generatedByAI', 'pyq',
    'pyqDetails.legalStatus', 'sourceDetails.year', 'ncertReference'
  ].join(' ')).lean();

  const source = new Map();
  const auditOwner = new Map();
  const legalStatus = new Map();
  const subject = new Map();
  const patterns = Object.fromEntries(weakPatterns.map(({ key }) => [key, { total: 0, published: 0, approved: 0 }]));
  const structuralFailures = [];
  let published = 0;
  let approved = 0;
  let publishedRejected = 0;
  let publishedPending = 0;
  let publishedNcertWithoutCitation = 0;

  questions.forEach((question) => {
    add(source, question.source);
    add(subject, question.subject);
    add(auditOwner, question.qualityAudit?.auditedBy);
    if (question.pyq?.isPYQ) add(legalStatus, question.pyqDetails?.legalStatus);
    if (question.isPublished) published += 1;
    if (question.qualityAudit?.status === 'approved') approved += 1;
    if (question.isPublished && question.qualityAudit?.status === 'rejected') publishedRejected += 1;
    if (question.isPublished && question.qualityAudit?.status === 'pending') publishedPending += 1;
    if (question.isPublished && question.source === 'ncert' && (!question.ncertReference?.sourceUrl || !question.ncertReference?.pdfPage)) {
      publishedNcertWithoutCitation += 1;
    }
    weakPatterns.forEach(({ key, regex }) => {
      if (regex.test(question.questionText || '')) {
        patterns[key].total += 1;
        if (question.isPublished) patterns[key].published += 1;
        if (question.qualityAudit?.status === 'approved') patterns[key].approved += 1;
      }
    });
    const optionTexts = ANSWERS.map((answer) => question.options?.[answer]?.text?.trim()).filter(Boolean);
    if (!question.questionText?.trim() || optionTexts.length !== 4 || new Set(optionTexts).size !== 4 || !ANSWERS.includes(question.correctAnswer)) {
      structuralFailures.push(question.questionId || String(question._id));
    }
  });

  const unknownPyqSamples = questions
    .filter((question) => question.pyq?.isPYQ && !['user_provided', 'licensed', 'original_sample'].includes(question.pyqDetails?.legalStatus))
    .slice(0, 12)
    .map((question) => ({
      id: question.questionId,
      year: question.sourceDetails?.year,
      subject: question.subject,
      chapter: question.chapter,
      published: question.isPublished,
      auditedBy: question.qualityAudit?.auditedBy,
      text: question.questionText?.slice(0, 180)
    }));

  console.log(JSON.stringify({
    total: questions.length,
    published,
    approved,
    publishedRejected,
    publishedPending,
    publishedNcertWithoutCitation,
    generatedByAI: questions.filter((question) => question.generatedByAI).length,
    structuralFailureCount: structuralFailures.length,
    structuralFailureSamples: structuralFailures.slice(0, 20),
    weakPatterns: patterns,
    bySubject: asObject(subject),
    bySource: asObject(source),
    byAuditOwner: asObject(auditOwner),
    pyqLegalStatus: asObject(legalStatus),
    unknownPyqSamples
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
