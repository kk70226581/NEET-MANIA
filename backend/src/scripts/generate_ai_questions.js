require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Question = require('../models/Question');
const { PHYSICS_CHAPTERS, CHEMISTRY_CHAPTERS, BIOLOGY_CHAPTERS } = require('../config/constants');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiDirect(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 8000,
      responseMimeType: 'application/json'
    }
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini API error status ${response.status}`);
  }

  return payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim() || '';
}

function robustParseJSON(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0].replace(/,\s*([\]}])/g, '$1'));
    }
    throw e;
  }
}

const generateForChapter = async (subject, chapter, count = 15) => {
  const prompt = `You are a professional medical/NEET exam creator. Generate exactly ${count} highly conceptual, unique, and syllabus-compliant NEET-style questions for the subject "${subject}" and chapter "${chapter}".

For each question, return a JSON object with:
- questionText: Complete question statement. Make sure it is clear and complete.
- options: An object with keys A, B, C, D (each a string representing the option value).
- correctAnswer: "A", "B", "C", or "D".
- explanation: Detailed step-by-step conceptual explanation.
- topic: The specific topic within this chapter.
- difficulty: "easy", "medium", or "hard".
- type: "mcq" or "match_following".

IMPORTANT RULES:
1. Make sure 2 or 3 questions are "match_following" type where Column I has A, B, C, D and Column II has (i), (ii), (iii), (iv), and the options A, B, C, D show the matching combinations.
2. Return ONLY a valid JSON array of ${count} questions. No markdown wrap, no other text.`;

  const responseText = await callGeminiDirect(prompt);
  return robustParseJSON(responseText);
};

const runGenerator = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    const allChapters = [
      ...PHYSICS_CHAPTERS.map(c => ({ subject: 'physics', name: c })),
      ...CHEMISTRY_CHAPTERS.map(c => ({ subject: 'chemistry', name: c })),
      ...BIOLOGY_CHAPTERS.map(c => ({ subject: 'biology', name: c }))
    ];

    console.log(`Starting question generation sequentially for ${allChapters.length} chapters with auto-retry...`);

    let totalAdded = 0;

    for (let i = 0; i < allChapters.length; i++) {
      const chap = allChapters[i];
      
      // First check how many questions we already have in this chapter
      const existingCount = await Question.countDocuments({ chapter: chap.name });
      if (existingCount >= 30) {
        console.log(`[${i+1}/${allChapters.length}] Chapter "${chap.name}" already has ${existingCount} questions. Skipping.`);
        continue;
      }

      const needed = 35 - existingCount; // Target at least 35 questions per chapter
      console.log(`[${i+1}/${allChapters.length}] Generating ${needed} questions for "${chap.name}" (${chap.subject})...`);
      
      try {
        const questions = await generateForChapter(chap.subject, chap.name, needed);
        
        if (Array.isArray(questions) && questions.length > 0) {
          const formatted = [];
          for (const q of questions) {
            if (!q.questionText) continue;
            
            // Check for duplicate text
            const dup = await Question.findOne({ questionText: q.questionText.trim() });
            if (dup) continue;

            const options = {};
            ['A', 'B', 'C', 'D'].forEach(k => {
              options[k] = { text: q.options?.[k] || `Option ${k}` };
            });

            formatted.push({
              questionText: q.questionText.trim(),
              options,
              correctAnswer: ['A', 'B', 'C', 'D'].includes(q.correctAnswer) ? q.correctAnswer : 'A',
              explanation: { text: q.explanation || '' },
              subject: chap.subject,
              chapter: chap.name,
              topic: q.topic || chap.name,
              type: q.type || 'mcq',
              difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
              source: 'custom',
              isPublished: true,
              isVerified: true,
              verifiedAt: new Date()
            });
          }

          if (formatted.length > 0) {
            await Question.insertMany(formatted);
            totalAdded += formatted.length;
            console.log(`  ✅ Saved ${formatted.length} questions for "${chap.name}". Total added: ${totalAdded}`);
          }
        }
      } catch (err) {
        console.error(`  ❌ Error on chapter "${chap.name}":`, err.message);
        
        if (err.message.includes('quota') || err.message.includes('Quota') || err.message.includes('rate') || err.message.includes('Rate') || err.message.includes('limit') || err.message.includes('retry')) {
          // Parse retry time or sleep 45s
          let waitSeconds = 45;
          const match = err.message.match(/retry in ([\d\.]+)s/);
          if (match) {
            waitSeconds = Math.ceil(parseFloat(match[1])) + 2;
          }
          console.warn(`  ⚠️ Quota limit hit. Sleeping for ${waitSeconds} seconds before retrying chapter "${chap.name}"...`);
          await delay(waitSeconds * 1000);
          i--; // Decrement index to retry the same chapter
          continue;
        }
      }

      // Safe 8 seconds delay between chapters
      await delay(8000);
    }

    const currentTotal = await Question.countDocuments({});
    console.log(`🎉 Finished! Added ${totalAdded} new questions. Total questions in DB: ${currentTotal}`);

  } catch (error) {
    console.error('Fatal execution error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runGenerator();
