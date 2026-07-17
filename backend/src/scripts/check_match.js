const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/neet_db');
  const Question = mongoose.model('Question', new mongoose.Schema({}, { strict: false }));
  
  const q = await Question.findOne({ questionText: { $regex: 'match', $options: 'i' } });
  
  if (q) {
    console.log(q.questionText);
  } else {
    console.log("No Match question found.");
  }
  
  process.exit(0);
}

check();
