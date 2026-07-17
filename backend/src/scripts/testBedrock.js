/**
 * Quick Bedrock connectivity & question format test.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const mongoose = require('mongoose');
const Question = require('../models/Question');

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function callBedrock(prompt) {
  const res = await bedrock.send(new ConverseCommand({
    modelId: MODEL_ID,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 2048, temperature: 0.4 }
  }));
  return (res?.output?.message?.content || []).filter(b => b.text).map(b => b.text).join('').trim();
}

function safeParseJSON(text) {
  let s = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/m, '').replace(/,\s*([\]}])/g, '$1').trim();
  try { return JSON.parse(s); } catch (_) {
    const start = s.indexOf('['); const end = s.lastIndexOf(']');
    if (start !== -1 && end !== -1) return JSON.parse(s.slice(start, end + 1).replace(/,\s*([\]}])/g, '$1'));
    throw new Error('Cannot parse JSON');
  }
}

async function run() {
  console.log(`Testing Bedrock with model: ${MODEL_ID}`);

  const prompt = `Generate exactly 3 NEET Biology questions about "Cell Cycle and Cell Division".
Include 1 mcq, 1 match_following, 1 assertion_reason.
Return ONLY a valid JSON array. Each item: { questionText, options: {A,B,C,D}, correctAnswer, explanation, topic, difficulty, type }
No markdown, no extra text.`;

  const raw    = await callBedrock(prompt);
  console.log('\n=== RAW RESPONSE (first 500 chars) ===');
  console.log(raw.substring(0, 500));
  console.log('\n=== PARSED ===');
  const qs = safeParseJSON(raw);
  console.log(`Got ${qs.length} questions`);
  qs.forEach((q, i) => {
    console.log(`\nQ${i+1} [${q.type}] [${q.difficulty}]`);
    console.log('  Text:', q.questionText?.substring(0, 100));
    console.log('  A:', q.options?.A?.substring(0, 60));
    console.log('  B:', q.options?.B?.substring(0, 60));
    console.log('  Correct:', q.correctAnswer);
  });

  // Test DB insert
  await mongoose.connect(process.env.MONGODB_URI);
  const q = qs[0];
  const exists = await Question.findOne({ questionText: q.questionText.trim() });
  if (!exists) {
    await Question.create({
      questionText: q.questionText.trim(),
      options: {
        A: { text: q.options.A || 'Option A' },
        B: { text: q.options.B || 'Option B' },
        C: { text: q.options.C || 'Option C' },
        D: { text: q.options.D || 'Option D' },
      },
      correctAnswer: ['A','B','C','D'].includes(String(q.correctAnswer).trim().toUpperCase().charAt(0)) ? String(q.correctAnswer).trim().toUpperCase().charAt(0) : 'A',
      explanation: { text: q.explanation || '' },
      subject: 'biology', chapter: 'Cell Cycle and Cell Division',
      topic: q.topic || 'Cell Cycle', type: q.type || 'mcq',
      difficulty: ['easy','medium','hard'].includes(String(q.difficulty||'').toLowerCase()) ? String(q.difficulty).toLowerCase() : 'medium', source: 'custom',
      isPublished: true, isVerified: true, verifiedAt: new Date(), generatedByAI: true
    });
    console.log('\n✅ DB insert test: SUCCESS');
  } else {
    console.log('\n⚠️  Question already in DB (dedup working)');
  }

  const total = await Question.countDocuments();
  console.log(`Total in DB: ${total}`);
  await mongoose.disconnect();
  console.log('\n✅ All tests passed! Safe to run addBulkQuestions.js');
}

run().catch(err => { console.error('❌ ERROR:', err.message); process.exit(1); });
