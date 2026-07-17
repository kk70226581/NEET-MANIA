const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');

async function getChapterBreakdown() {
  try {
    await connectDB();
    
    // Aggregate by Subject and Chapter
    const breakdown = await Question.aggregate([
      { 
        $group: { 
          _id: { subject: "$subject", chapter: "$chapter" }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { "_id.subject": 1, count: -1 } }
    ]);
    
    console.log(`\n=================================================`);
    console.log(`📊 CHAPTER-WISE BREAKDOWN OF QUESTIONS`);
    console.log(`=================================================\n`);
    
    let currentSubject = "";
    breakdown.forEach(item => {
      if (item._id.subject !== currentSubject) {
        currentSubject = item._id.subject;
        console.log(`\n--- SUBJECT: ${currentSubject ? currentSubject.toUpperCase() : 'UNKNOWN'} ---`);
      }
      console.log(`• ${item._id.chapter || 'Unknown Chapter'}: ${item.count} questions`);
    });
    
  } catch (error) {
    console.error('Error fetching breakdown:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

getChapterBreakdown();
