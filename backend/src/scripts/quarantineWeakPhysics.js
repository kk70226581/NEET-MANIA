require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../models/Question');

const apply = process.argv.includes('--apply');
const dnsServers = process.env.DNS_SERVERS?.split(',').map((value) => value.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);

const filter = {
  subject: 'physics',
  isPublished: true,
  $or: [
    { 'qualityAudit.auditedBy': 'grounded-ncert-pipeline-v1' },
    { 'qualityAudit.auditedBy': 'codex-pyq-sample-v1' }
  ]
};

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  await mongoose.connect(process.env.MONGODB_URI);
  const candidates = await Question.find(filter)
    .select('questionId questionText difficulty qualityAudit.auditedBy')
    .lean();
  const byAuditor = candidates.reduce((counts, item) => {
    const auditor = item.qualityAudit?.auditedBy || 'unknown';
    counts[auditor] = (counts[auditor] || 0) + 1;
    return counts;
  }, {});
  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    candidates: candidates.length,
    byAuditor,
    samples: candidates.slice(0, 5).map(({ questionId, difficulty, questionText }) => ({ questionId, difficulty, questionText }))
  }, null, 2));
  if (!apply) return;

  const result = await Question.updateMany(filter, {
    $set: {
      isPublished: false,
      isVerified: false,
      'qualityAudit.status': 'rejected',
      'review.status': 'rejected',
      'review.reviewedAt': new Date(),
      'review.reviewNotes': 'Quarantined: generic/easy Physics content did not meet the numerical-heavy verified-source policy.'
    },
    $addToSet: {
      tags: { $each: ['quarantined', 'weak-physics-removed'] },
      'qualityAudit.notes': 'Removed from student delivery after the July 2026 numerical/PYQ quality audit.'
    }
  });
  const remaining = await Question.countDocuments(filter);
  console.log(JSON.stringify({ matched: result.matchedCount, modified: result.modifiedCount, remaining }, null, 2));
  if (remaining !== 0) throw new Error(`Expected zero weak published Physics questions; ${remaining} remain`);
}

main()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) await mongoose.disconnect();
  });
