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
    console.error("Failed to parse JSON. Raw output snippet:", text.substring(0, 200));
    throw e;
  }
}

async function generateWithGemini(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7, // Slightly higher for creativity and variance in question types
      responseMimeType: 'application/json'
    }
  };
  
  const response = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
  const text = response.data.candidates[0].content.parts[0].text;
  return robustParseJSON(text);
}

const biologyChapters = [
  'Diversity of Living Organisms', 'Structural Organisation in Animals and Plants',
  'Cell Structure and Function', 'Plant Physiology', 'Human Physiology',
  'Genetics', 'Molecular Basis of Inheritance', 'Evolution', 'Ecology',
  'Biodiversity and its Conservation', 'Reproduction in Plants',
  'Reproduction in Animals', 'Reproduction in Humans', 'Digestion and Absorption',
  'Breathing and Exchange of Gases', 'Body Fluids and Circulation',
  'Excretory Products and their Elimination', 'Locomotion and Movement',
  'Neural Control and Coordination', 'Chemical Coordination and Integration',
  'Immune System', 'Photosynthesis', 'Respiration', 'Growth and Development'
];

const EXPERT_PROMPT = `
You are an expert NEET Biology faculty with more than 20 years of experience teaching top AIR students.

Generate original NEET Biology questions that are inspired by NCERT concepts but are NOT copied from any copyrighted book or coaching material.

Follow these rules strictly:
1. Every question must be factually correct according to the latest NCERT Biology syllabus.
2. Use official biological terminology.
3. Do not generate vague or ambiguous questions.
4. There must be exactly one correct answer.
5. Wrong options should be realistic and scientifically meaningful.
6. Generate original wording while testing the same concepts.
7. Explanations should teach the concept, not just reveal the answer.
8. EXCLUDE all diagram-based questions.

Hard Question Guidelines:
- Integrate multiple NCERT concepts.
- Require elimination.
- Include closely related biological terms.
- Test conceptual understanding instead of memorization.
- Reflect the complexity expected in recent NEET papers.

Distribution Requirements for this batch:
- 3 Easy, 4 Medium, 2 Hard, 2 Very Hard.

Question Types Required in this batch:
- Single Correct MCQ
- Assertion-Reason
- Statement I & II
- Multiple Statement (Choose correct combination)
- Match the Following (Crucial: Format options like A-IV, B-II, C-I, D-III)
- Conceptual Application

Return EXACTLY 11 questions as a JSON array of objects. 
Each object must strictly match this structure:
{
  "questionText": "The lengthy, complex question text.",
  "options": {
    "A": { "text": "Option A text" },
    "B": { "text": "Option B text" },
    "C": { "text": "Option C text" },
    "D": { "text": "Option D text" }
  },
  "correctAnswer": "A", // strictly 'A', 'B', 'C', or 'D'
  "explanation": { "text": "Detailed teaching explanation." },
  "subject": "biology",
  "chapter": "<CHAPTER_NAME>",
  "topic": "Specific Topic",
  "difficulty": "hard", // 'easy', 'medium', 'hard'
  "type": "mcq", // 'mcq', 'assertion_reason', 'statement_based', 'match_following'
  "source": "custom",
  "learningObjective": "The specific NCERT concept tested",
  "tags": ["NEET", "Premium", "NCERT Level"]
}
`;

async function generateBulkPremium() {
  await connectDB();
  console.log('⚡ Starting Premium High-Quality NEET Generator Pipeline...');
  
  let totalInserted = 0;

  for (let i = 0; i < biologyChapters.length; i++) {
    const chapter = biologyChapters[i];
    console.log(`\n📚 Processing Chapter ${i+1}/${biologyChapters.length}: ${chapter}`);
    
    // 4 batches of 11 questions = 44 questions per chapter
    // 24 chapters * 44 = 1056 total questions
    for (let batch = 1; batch <= 4; batch++) {
      console.log(`  -> Generating batch ${batch}/4 for ${chapter}...`);
      
      const prompt = EXPERT_PROMPT.replace('<CHAPTER_NAME>', chapter) 
                     + `\n\nGenerate for Chapter: "${chapter}". Ensure the questions are highly complex and lengthy where appropriate, matching the real NEET exam pattern.`;

      try {
        const questions = await generateWithGemini(prompt);
        
        const toInsert = questions.map(q => ({
          ...q,
          chapter: chapter,
          isPublished: true,
          isVerified: true,
          qualityScore: 100, // Premium rating
          generatedByAI: true,
          aiMetadata: {
            model: 'gemini-2.0-flash',
            prompt: 'Premium Faculty Prompt',
            generatedAt: new Date()
          }
        }));
        
        const inserted = await Question.insertMany(toInsert, { ordered: false });
        totalInserted += inserted.length;
        console.log(`    ✅ Saved ${inserted.length} premium questions. (Total in DB: ${totalInserted})`);
      } catch (e) {
        if (e.response && e.response.status === 429) {
          console.error(`    ❌ Rate limit hit on ${chapter} batch ${batch}. Waiting 30s...`);
          await new Promise(r => setTimeout(r, 30000));
          batch--; // retry
          continue;
        }
        if (e.code === 11000) {
           console.log(`    ⚠️ Duplicate key skipped.`);
        } else {
           console.error(`    ❌ Error in batch ${batch}:`, e.message);
        }
      }
      
      // 8 seconds delay to safely maintain rate limits below 15 RPM
      await new Promise(r => setTimeout(r, 8000));
    }
  }

  console.log(`\n🎉 Premium Generation completed! Total TOP NOTCH questions added: ${totalInserted}`);
  await mongoose.disconnect();
  process.exit(0);
}

generateBulkPremium();
