const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');

async function getBreakdown() {
  try {
    await connectDB();
    
    const totalCount = await Question.countDocuments();
    console.log(`\n=================================================`);
    console.log(`📊 TOTAL QUESTIONS IN DATABASE: ${totalCount}`);
    console.log(`=================================================\n`);

    // Breakdown by Source
    const sourceBreakdown = await Question.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`--- BREAKDOWN BY SOURCE ---`);
    sourceBreakdown.forEach(item => {
      console.log(`• ${item._id || 'Unknown'}: ${item.count} questions`);
    });
    console.log();

    // Breakdown by Subject
    const subjectBreakdown = await Question.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`--- BREAKDOWN BY SUBJECT ---`);
    subjectBreakdown.forEach(item => {
      console.log(`• ${item._id || 'Unknown'}: ${item.count} questions`);
    });
    console.log();

    // Breakdown by Tags (JEE/NEET specifically)
    const jeeCount = await Question.countDocuments({ tags: /JEE/i });
    const neetCount = await Question.countDocuments({ tags: /NEET/i });
    
    console.log(`--- EXAM CATEGORY (Tags) ---`);
    console.log(`• NEET: ${neetCount} questions`);
    console.log(`• JEE Main: ${jeeCount} questions`);
    console.log();
    
    // Breakdown by Difficulty
    const difficultyBreakdown = await Question.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log(`--- BREAKDOWN BY DIFFICULTY ---`);
    difficultyBreakdown.forEach(item => {
      console.log(`• ${item._id || 'Unknown'}: ${item.count} questions`);
    });
    console.log();
    
  } catch (error) {
    console.error('Error fetching breakdown:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

getBreakdown();
