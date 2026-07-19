require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../models/Question');

const apply = process.argv.includes('--apply');
const AUTHOR = 'codex-original-physics-numericals-v1';
const dnsServers = process.env.DNS_SERVERS?.split(',').map((item) => item.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(process.env.MONGODB_URI);
  const filter = { 'qualityAudit.auditedBy': AUTHOR, isPublished: true };
  const candidates = await Question.find(filter).select('questionId chapter questionText').lean();
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    candidates: candidates.length,
    chapters: new Set(candidates.map((question) => question.chapter)).size,
    sample: candidates.slice(0, 3).map((question) => ({ id: question.questionId, chapter: question.chapter, text: question.questionText }))
  }, null, 2));
  if (!apply) return;

  const result = await Question.updateMany(filter, {
    $set: {
      isPublished: false,
      isVerified: false,
      'qualityAudit.status': 'rejected',
      'review.status': 'rejected',
      'review.reviewedAt': new Date(),
      'review.reviewNotes': 'Quarantined: parameter-only numerical variants repeated one stem and did not meet the question-bank variety standard.'
    },
    $addToSet: {
      tags: { $each: ['quarantined', 'repetitive-template-removed'] },
      'qualityAudit.notes': 'Removed from student delivery after the question-variety audit.'
    }
  });
  const remaining = await Question.countDocuments(filter);
  console.log(JSON.stringify({ matched: result.matchedCount, modified: result.modifiedCount, stillPublished: remaining }, null, 2));
  if (remaining) throw new Error(`Expected no visible repetitive numerical variants; found ${remaining}`);
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; }).finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
