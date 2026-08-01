const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const Question = require('../src/models/Question');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const q = await Question.findOne({ "options.A.text": "1-a, 2-b, 3-c, 4-d" });
  if (q) {
    console.log("TEXT:\n" + q.questionText);
  } else {
    console.log("Not found by option A.");
    const q2 = await Question.findOne({ questionText: /Conservative/i });
    if (q2) console.log("TEXT2:\n" + q2.questionText);
  }
  process.exit();
}
check();
