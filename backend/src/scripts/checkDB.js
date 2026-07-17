require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Question = require('../models/Question');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const total = await Question.countDocuments();
  const bySubject = await Question.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } }
  ]);
  const byChapter = await Question.aggregate([
    { $group: { _id: { subject: '$subject', chapter: '$chapter' }, count: { $sum: 1 } } },
    { $sort: { '_id.subject': 1, count: 1 } }
  ]);
  console.log('=== DB STATUS ===');
  console.log('Total questions:', total);
  console.log('\nBy Subject:');
  bySubject.forEach(s => console.log(` ${s._id}: ${s.count}`));
  console.log('\nBy Chapter (sorted by count):');
  byChapter.forEach(c => console.log(` [${c._id.subject}] ${c._id.chapter}: ${c.count}`));
  await mongoose.disconnect();
}
check().catch(console.error);
