/**
 * Quick test — generates 5 questions for one chapter to verify the pipeline works.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const Question = require('../models/Question');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL   = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

async function callGemini(prompt) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 4096, responseMimeType: 'application/json' }
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error?.message || `Gemini HTTP ${res.status}`);
  return (payload.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
}

function safeParseJSON(text) {
  let s = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').replace(/,\s*([\]}])/g, '$1').trim();
  try { return JSON.parse(s); } catch (_) {
    const m = s.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (m) return JSON.parse(m[0].replace(/,\s*([\]}])/g, '$1'));
    throw new Error('Cannot parse JSON');
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const prompt = `Generate exactly 5 NEET-quality questions for Biology chapter "Cell Cycle and Cell Division".
Include 1 match_following, 1 assertion_reason, 1 statement_based, 2 mcq.
Return ONLY a JSON array. Each object: { questionText, options: {A,B,C,D}, correctAnswer, explanation, topic, difficulty, type }`;

  const raw = await callGemini(prompt);
  const qs  = safeParseJSON(raw);
  console.log(`\nParsed ${qs.length} questions:`);
  qs.forEach((q, i) => {
    console.log(`\n--- Q${i+1} [${q.type}] [${q.difficulty}] ---`);
    console.log('Q:', q.questionText?.substring(0, 100));
    console.log('A:', q.options?.A?.substring(0, 60));
    console.log('B:', q.options?.B?.substring(0, 60));
    console.log('Correct:', q.correctAnswer);
  });

  // Try inserting 1 question
  const first = qs[0];
  if (first && first.questionText) {
    const exists = await Question.findOne({ questionText: first.questionText.trim() });
    if (!exists) {
      await Question.create({
        questionText: first.questionText.trim(),
        options: {
          A: { text: first.options.A || 'Option A' },
          B: { text: first.options.B || 'Option B' },
          C: { text: first.options.C || 'Option C' },
          D: { text: first.options.D || 'Option D' },
        },
        correctAnswer: first.correctAnswer,
        explanation: { text: first.explanation || '' },
        subject: 'biology',
        chapter: 'Cell Cycle and Cell Division',
        topic: first.topic || 'Cell Cycle and Cell Division',
        type: first.type || 'mcq',
        difficulty: first.difficulty || 'medium',
        source: 'custom',
        isPublished: true,
        isVerified: true,
        verifiedAt: new Date(),
        generatedByAI: true
      });
      console.log('\n✅ Test insert successful!');
    } else {
      console.log('\n⚠️  Question already exists in DB (dedup working correctly)');
    }
  }

  const total = await Question.countDocuments();
  console.log(`Total questions in DB: ${total}`);
  await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
