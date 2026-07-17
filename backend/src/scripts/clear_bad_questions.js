const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');

async function clearBadQuestions() {
  try {
    await connectDB();
    const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({}, { strict: false }));
    
    // Remove all procedurally generated 'custom' questions if they are bad
    const deleteResult = await Question.deleteMany({ source: 'custom' });
    console.log(`Deleted ${deleteResult.deletedCount} old 'custom' questions that were not up to the mark.`);
    
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

clearBadQuestions();
