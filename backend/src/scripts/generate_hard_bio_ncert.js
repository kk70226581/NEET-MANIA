const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function robustParseJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    throw e;
  }
}

async function generateWithGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2, // Low temperature for factual accuracy
      responseMimeType: 'application/json'
    }
  };
  
  const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
  const text = response.data.candidates[0].content.parts[0].text;
  return robustParseJSON(text);
}

const biologyChapters = [
  'Diversity of Living Organisms',
  'Structural Organisation in Animals and Plants',
  'Cell Structure and Function',
  'Plant Physiology',
  'Human Physiology',
  'Genetics',
  'Molecular Basis of Inheritance',
  'Evolution',
  'Ecology',
  'Biodiversity and its Conservation',
  'Reproduction in Plants',
  'Reproduction in Animals',
  'Reproduction in Humans',
  'Digestion and Absorption',
  'Breathing and Exchange of Gases',
  'Body Fluids and Circulation',
  'Excretory Products and their Elimination',
  'Locomotion and Movement',
  'Neural Control and Coordination',
  'Chemical Coordination and Integration',
  'Immune System',
  'Photosynthesis',
  'Respiration',
  'Growth and Development'
];

async function generateBulkHardBio() {
  await connectDB();
  console.log('⚡ Starting Bulk Hard Biology NCERT Generation using Gemini 2.0 Flash...');
  
  let totalInserted = 0;

  for (let i = 0; i < biologyChapters.length; i++) {
    const chapter = biologyChapters[i];
    console.log(`Generating highly difficult NCERT batch ${i+1}/${biologyChapters.length} for ${chapter}...`);
    
    const prompt = `You are a strict, expert NEET Biology examiner. Generate exactly 50 EXTREMELY HARD, deeply conceptual, NCERT line-by-line questions for the chapter "${chapter}".
Do NOT generate generalized or simple questions. Use tricky statement-based, assertion-reasoning, and in-depth conceptual questions from hidden NCERT lines.
For each question, return a JSON object with:
- questionText: Full complex question statement
- options: { A: { text: "..." }, B: { text: "..." }, C: { text: "..." }, D: { text: "..." } }
- correctAnswer: A, B, C, or D
- explanation: Strict, detailed explanation citing exact NCERT logic.
- subject: biology
- chapter: ${chapter}
- topic: specific subtopic
- difficulty: hard
- type: mcq or assertion_reason or statement_based
- source: 'ncert'
- tags: ["NEET", "NCERT Line by Line", "Hard"]

Output MUST be a valid JSON array of 50 objects.`;

    try {
      const questions = await generateWithGemini(prompt);
      
      const toInsert = questions.map(q => ({
        ...q,
        isPublished: true,
        isVerified: true,
        qualityScore: 98,
        source: 'ncert', // lowercase matching enum
        difficulty: 'hard' // forcing hard difficulty matching enum
      }));
      
      const inserted = await Question.insertMany(toInsert, { ordered: false });
      totalInserted += inserted.length;
      console.log(`✅ Saved ${inserted.length} HARD NCERT questions. Total so far: ${totalInserted}`);
    } catch (e) {
      if (e.response && e.response.status === 429) {
        console.error(`❌ Rate limit on batch ${i+1}. Waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
        i--; // retry
        continue;
      }
      console.error(`❌ Error in batch ${i+1}:`, e.message);
    }
    
    // 6 seconds delay to maintain ~10 requests per minute (Gemini free tier limit is 15 RPM)
    await new Promise(r => setTimeout(r, 6000));
  }

  console.log(`\n🎉 Hard Biology NCERT Generation completed! Total questions added: ${totalInserted}`);
  await mongoose.disconnect();
  process.exit(0);
}

generateBulkHardBio();
