/**
 * Robust NEET PYQ Seeder - Extracts 800+ questions from seedPYQQuestions.js
 * Run using: node src/scripts/seedAllQuestions.js
 */
const path = require('path');
const fs   = require('fs');
const mongoose = require('mongoose');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question  = require('../models/Question');

function findClosingBrace(str, startPos) {
  let depth = 0;
  let inString = false;
  let stringChar = null;
  let escaped = false;

  for (let i = startPos; i < str.length; i++) {
    const char = str[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (inString) {
      if (char === stringChar) {
        inString = false;
      }
      continue;
    }
    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }
    if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function normalizeQuestion(q) {
  // Option normalization
  const getOptText = (opt) => {
    if (!opt) return '';
    if (typeof opt === 'object') return opt.text || '';
    return String(opt);
  };

  // Validations according to config/constants.js
  const validSubjects = ['physics', 'chemistry', 'biology', 'botany', 'zoology'];
  let subject = String(q.subject || 'biology').trim().toLowerCase();
  if (!validSubjects.includes(subject)) {
    subject = 'biology';
  }

  const validDiffs = ['easy', 'medium', 'hard'];
  let difficulty = String(q.difficulty || 'medium').trim().toLowerCase();
  if (!validDiffs.includes(difficulty)) {
    difficulty = 'medium';
  }

  const validTypes = ['mcq', 'assertion_reason', 'match_following', 'diagram_based', 'statement_based', 'numerical'];
  let type = String(q.type || 'mcq').trim().toLowerCase();
  if (!validTypes.includes(type)) {
    type = 'mcq';
  }

  const validSources = ['pyq', 'mock', 'dpp', 'ncert', 'coaching', 'custom'];
  let source = String(q.source || 'pyq').trim().toLowerCase();
  if (!validSources.includes(source)) {
    source = 'custom';
  }

  return {
    questionText: (q.questionText || q.statement || 'Question text missing').trim(),
    options: {
      A: { text: getOptText(q.options?.A) || 'Option A' },
      B: { text: getOptText(q.options?.B) || 'Option B' },
      C: { text: getOptText(q.options?.C) || 'Option C' },
      D: { text: getOptText(q.options?.D) || 'Option D' }
    },
    correctAnswer: ['A','B','C','D'].includes(String(q.correctAnswer || q.answer).trim().toUpperCase()) 
      ? String(q.correctAnswer || q.answer).trim().toUpperCase() 
      : 'A',
    subject,
    chapter: String(q.chapter || 'Unclassified').trim(),
    topic: String(q.topic || '').trim(),
    difficulty,
    type,
    source,
    sourceDetails: q.sourceDetails || {
      year: q.year || 2020,
      examType: 'neet'
    },
    pyq: q.pyq || { isPYQ: source === 'pyq', reference: q.reference || 'NEET PYQ' },
    explanation: typeof q.explanation === 'object' ? q.explanation : { text: String(q.explanation || '') },
    inSyllabus: true,
    isPublished: true,
    isVerified: true,
    qualityScore: 90,
    trendingFrequency: 'high',
  };
}

async function run() {
  console.log('🚀 Running robust question extractor...');
  
  try {
    await connectDB();
    console.log('🔌 MongoDB Connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }

  const pyqFilePath = path.join(__dirname, 'seedPYQQuestions.js');
  if (!fs.existsSync(pyqFilePath)) {
    console.error(`❌ seedPYQQuestions.js not found at: ${pyqFilePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(pyqFilePath, 'utf8');
  const questions = [];

  console.log('🔍 Scanning file for question objects...');
  let index = 0;
  while (true) {
    index = content.indexOf('questionText', index);
    if (index === -1) break;

    let startBrace = -1;
    let searchPos = index;
    let depth = 0;
    
    while (searchPos >= 0) {
      if (content[searchPos] === '{') {
        if (depth === 0) {
          startBrace = searchPos;
          break;
        } else {
          depth--;
        }
      } else if (content[searchPos] === '}') {
        depth++;
      }
      searchPos--;
    }

    if (startBrace !== -1) {
      const endBrace = findClosingBrace(content, startBrace);
      if (endBrace !== -1) {
        const objStr = content.substring(startBrace, endBrace + 1);
        try {
          const obj = new Function(`return (${objStr});`)();
          if (obj && (obj.questionText || obj.statement)) {
            questions.push(obj);
          }
        } catch (err) {
          // Skip invalid JS syntax in individual objects if any
        }
      }
    }
    index += 12;
  }

  console.log(`📊 Found ${questions.length} question objects. Normalizing and removing duplicates...`);

  const uniqueNormalized = [];
  const seenTexts = new Set();

  questions.forEach(q => {
    const norm = normalizeQuestion(q);
    const normText = norm.questionText.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 80);
    if (!seenTexts.has(normText) && norm.questionText.length > 10) {
      seenTexts.add(normText);
      uniqueNormalized.push(norm);
    }
  });

  console.log(`📦 Seeding ${uniqueNormalized.length} unique questions to DB via bulk insert...`);

  try {
    const docs = await Question.insertMany(uniqueNormalized, { ordered: false });
    console.log(`✅ Successfully bulk-inserted ${docs.length} questions!`);
  } catch (err) {
    const insertedCount = err.result?.nInserted || 0;
    const writeErrorsCount = err.writeErrors?.length || 0;
    console.log(`⚠️ Bulk insert partially completed:`);
    console.log(`   Inserted : ${insertedCount} questions`);
    console.log(`   Duplicates/Errors skipped: ${writeErrorsCount}`);
    if (err.writeErrors && err.writeErrors.length > 0 && err.writeErrors.length < 5) {
      console.log('Errors:', err.writeErrors.map(e => e.errmsg));
    }
  }

  // Verify DB total
  const total = await Question.countDocuments();
  console.log(`\n📈 Current total questions in DB: ${total}`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
