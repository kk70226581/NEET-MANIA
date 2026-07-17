const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');

async function checkDb() {
  try {
    await connectDB();
    const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({}, { strict: false }));
    
    const countPYQ = await Question.countDocuments({ source: /pyq/i });
    const countJEE = await Question.countDocuments({ tags: /JEE/i });
    const countNEET = await Question.countDocuments({ tags: /NEET/i });
    console.log(`PYQ count: ${countPYQ}`);
    console.log(`JEE count: ${countJEE}`);
    console.log(`NEET count: ${countNEET}`);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

checkDb();
