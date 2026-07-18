require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map((value) => value.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const questions = await Question.find({
    'pyq.isPYQ': true,
    isPublished: true,
    isVerified: true,
    'pyqDetails.legalStatus': { $in: ['user_provided', 'licensed', 'original_sample'] }
  }).lean();
  const failures = [];
  const years = [...new Set(questions.map((item) => item.sourceDetails?.year).filter(Boolean))].sort();
  const samples = questions.filter((item) => item.pyqDetails?.legalStatus === 'original_sample');
  if (years.length < 10) failures.push(`Expected at least 10 years, found ${years.length}`);
  if (samples.length < 80) failures.push(`Expected 80 original samples, found ${samples.length}`);
  samples.forEach((item) => {
    const options = ['A', 'B', 'C', 'D'].map((answer) => item.options?.[answer]?.text);
    if (options.some((option) => !option) || new Set(options).size !== 4) failures.push(`${item.questionId}: options`);
    if (!item.pyqDetails?.shortSolution || !item.pyqDetails?.optionExplanations?.[item.correctAnswer]) failures.push(`${item.questionId}: solution metadata`);
    if (!item.chapter || !item.topic || !item.pyqDetails?.classLevel || !item.pyqDetails?.unit) failures.push(`${item.questionId}: classification`);
    if (item.pyqDetails?.examName !== 'NEET Original Sample Archive') failures.push(`${item.questionId}: misleading exam label`);
  });
  console.log(JSON.stringify({ status: failures.length ? 'failed' : 'passed', totalPyqRecords: questions.length, originalSamples: samples.length, years, subjects: [...new Set(questions.map((item) => item.subject))], failures: failures.slice(0, 30) }, null, 2));
  if (failures.length) process.exitCode = 1;
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; }).finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
