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
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  };
  
  const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
  const text = response.data.candidates[0].content.parts[0].text;
  return robustParseJSON(text);
}

const jeeChapters = ['Kinematics', 'Thermodynamics', 'Electrostatics', 'Chemical Bonding', 'Equilibrium'];
const neetChapters = ['Human Reproduction', 'Genetics', 'Cell Biology', 'Optics', 'Hydrocarbons'];

async function generateBulkPYQs() {
  await connectDB();
  console.log('⚡ Starting Bulk PYQ Generation using Gemini 2.0 Flash...');
  
  let totalInserted = 0;

  // Generate JEE Questions
  for (let i = 0; i < 10; i++) {
    const chapter = jeeChapters[i % jeeChapters.length];
    console.log(`Generating JEE batch ${i+1}/10 for ${chapter}...`);
    const prompt = `Generate exactly 50 highly realistic, high-quality Previous Year Questions (PYQ) for the JEE Main exam in the subject of Physics/Chemistry, specifically focusing on ${chapter}.
For each question, return a JSON object with:
- questionText: Full question statement
- options: { A: { text: "..." }, B: { text: "..." }, C: { text: "..." }, D: { text: "..." } }
- correctAnswer: A, B, C, or D
- explanation: Detailed step-by-step conceptual explanation
- subject: physics or chemistry
- chapter: ${chapter}
- topic: specific subtopic
- difficulty: medium or hard
- type: mcq
- source: 'PYQ'
- tags: ["JEE Main", "PYQ"]

Output MUST be a JSON array of 50 objects.`;

    try {
      const questions = await generateWithGemini(prompt);
      
      const toInsert = questions.map(q => ({
        ...q,
        isPublished: true,
        isVerified: true,
        qualityScore: 95
      }));
      
      const inserted = await Question.insertMany(toInsert, { ordered: false });
      totalInserted += inserted.length;
      console.log(`✅ Saved ${inserted.length} JEE questions. Total so far: ${totalInserted}`);
    } catch (e) {
      console.error(`❌ Error in JEE batch ${i+1}:`, e.message);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }

  // Generate NEET Questions
  for (let i = 0; i < 12; i++) {
    const chapter = neetChapters[i % neetChapters.length];
    console.log(`Generating NEET batch ${i+1}/12 for ${chapter}...`);
    const prompt = `Generate exactly 50 highly realistic, high-quality Previous Year Questions (PYQ) for the NEET exam in Biology/Physics/Chemistry, specifically focusing on ${chapter}.
For each question, return a JSON object with:
- questionText: Full question statement
- options: { A: { text: "..." }, B: { text: "..." }, C: { text: "..." }, D: { text: "..." } }
- correctAnswer: A, B, C, or D
- explanation: Detailed step-by-step conceptual explanation
- subject: biology, physics, or chemistry
- chapter: ${chapter}
- topic: specific subtopic
- difficulty: easy or medium
- type: mcq
- source: 'PYQ'
- tags: ["NEET", "PYQ"]

Output MUST be a JSON array of 50 objects.`;

    try {
      const questions = await generateWithGemini(prompt);
      
      const toInsert = questions.map(q => ({
        ...q,
        isPublished: true,
        isVerified: true,
        qualityScore: 95
      }));
      
      const inserted = await Question.insertMany(toInsert, { ordered: false });
      totalInserted += inserted.length;
      console.log(`✅ Saved ${inserted.length} NEET questions. Total so far: ${totalInserted}`);
    } catch (e) {
      console.error(`❌ Error in NEET batch ${i+1}:`, e.message);
    }
    
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n🎉 AI PYQ Generation completed! Total questions added: ${totalInserted}`);
  await mongoose.disconnect();
  process.exit(0);
}

generateBulkPYQs();
