const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Question = require('../src/models/Question');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const qList = await Question.find({ questionText: /match/i }).limit(5);
  console.log(JSON.stringify(qList.map(q => q.questionText), null, 2));
  process.exit();
}
check();
