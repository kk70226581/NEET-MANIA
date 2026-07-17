const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const TestGenerator = require('./testGenerator');
const Question = require('../models/Question');

async function run() {
  await connectDB();
  console.log('⚡ Running Mock Test Verification...');
  
  try {
    const mockTest = await TestGenerator.generateFullMockTest();
    console.log(`\n✅ Generated Mock Test with ${mockTest.totalQuestions} total questions.`);
    console.log(`Physics: ${mockTest.distribution.physics}`);
    console.log(`Chemistry: ${mockTest.distribution.chemistry}`);
    console.log(`Biology: ${mockTest.distribution.biology}`);
    
    // Fetch the actual questions to verify chapters
    const questions = await Question.find({ _id: { $in: mockTest.questions } }).select('subject chapter difficulty type');
    
    const breakdown = { physics: {}, chemistry: {}, biology: {} };
    let hardCount = 0;
    
    questions.forEach(q => {
      let subj = q.subject;
      if (subj === 'botany' || subj === 'zoology') subj = 'biology';
      
      if (!breakdown[subj]) breakdown[subj] = {};
      if (!breakdown[subj][q.chapter]) breakdown[subj][q.chapter] = 0;
      
      breakdown[subj][q.chapter]++;
      
      if (q.difficulty === 'hard') hardCount++;
    });
    
    console.log('\n📊 Detailed Biology Chapter Breakdown:');
    Object.entries(breakdown.biology).sort((a,b) => b[1] - a[1]).forEach(([chap, count]) => {
      console.log(`  - ${chap}: ${count} questions`);
    });
    
    console.log('\n📊 Detailed Physics Chapter Breakdown:');
    Object.entries(breakdown.physics).sort((a,b) => b[1] - a[1]).forEach(([chap, count]) => {
      console.log(`  - ${chap}: ${count} questions`);
    });
    
    console.log('\n📊 Detailed Chemistry Chapter Breakdown:');
    Object.entries(breakdown.chemistry).sort((a,b) => b[1] - a[1]).forEach(([chap, count]) => {
      console.log(`  - ${chap}: ${count} questions`);
    });

    console.log(`\n💪 Total Hard Questions: ${hardCount} / 180`);
    
  } catch (err) {
    console.error('Test generation failed:', err);
  }
  
  await mongoose.disconnect();
}

run();
