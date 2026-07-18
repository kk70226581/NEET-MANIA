require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const { NEET_SYLLABUS_VERSION } = require('../config/ncertCurriculum');

const apply = process.argv.includes('--apply');
const dnsServers = process.env.DNS_SERVERS?.split(',').map((value) => value.trim()).filter(Boolean);
dns.setServers(dnsServers?.length ? dnsServers : ['8.8.8.8', '8.8.4.4']);

async function main() {
  if (!apply) throw new Error('Safety stop: pass --apply to rebalance answer positions.');
  await mongoose.connect(process.env.MONGODB_URI);
  const questions = await Question.find({
    syllabusVersion: NEET_SYLLABUS_VERSION,
    'qualityAudit.status': 'approved'
  }).sort({ questionId: 1 });

  const keys = ['A', 'B', 'C', 'D'];
  const operations = questions.map((question, index) => {
    const targetKey = keys[index % keys.length];
    const correctText = question.options[question.correctAnswer].text;
    const distractors = keys.filter((key) => key !== question.correctAnswer).map((key) => question.options[key].toObject());
    const reordered = {};
    let distractorIndex = 0;
    keys.forEach((key) => {
      reordered[key] = key === targetKey ? { text: correctText } : distractors[distractorIndex++];
    });
    return {
      updateOne: {
        filter: { _id: question._id },
        update: { $set: { options: reordered, correctAnswer: targetKey, updatedAt: new Date() } }
      }
    };
  });

  if (operations.length) await Question.bulkWrite(operations, { ordered: true });
  console.log(`Rebalanced ${operations.length} approved NCERT questions to an even A/B/C/D distribution.`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => mongoose.disconnect().catch(() => {}));
