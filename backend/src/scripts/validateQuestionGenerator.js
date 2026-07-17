/**
 * Question Generator Validator
 * Tests the question generator with a small sample to ensure quality
 * before running the full 1000+ question generation
 * 
 * Run: node src/scripts/validateQuestionGenerator.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');
const Question = require('../models/Question');

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const bedrock = new BedrockRuntimeClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function callBedrock(prompt) {
  const input = {
    modelId: MODEL_ID,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 4096, temperature: 0.4 }
  };
  const res = await bedrock.send(new ConverseCommand(input));
  return (res?.output?.message?.content || [])
    .filter(b => b.text).map(b => b.text).join('').trim();
}

function safeParseJSON(text) {
  let s = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/m, '').replace(/,\s*([\]}])/g, '$1').trim();
  try { 
    return JSON.parse(s); 
  } catch (_) {
    const m = s.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (m) {
      try { 
        return JSON.parse(m[0].replace(/,\s*([\]}])/g, '$1')); 
      } catch (_2) {}
    }
    throw new Error('Cannot parse JSON');
  }
}

function validateQuestion(q) {
  const errors = [];
  
  // Check question text
  const qt = String(q.questionText || '').trim();
  if (qt.length < 20) errors.push('❌ Question text too short (<20 chars)');
  // Skip ? check for assertion_reason and statement_based types
  
  // Check options
  const opts = q.options || {};
  if (!opts.A?.text && !opts.A) errors.push('❌ Option A missing');
  if (!opts.B?.text && !opts.B) errors.push('❌ Option B missing');
  if (!opts.C?.text && !opts.C) errors.push('❌ Option C missing');
  if (!opts.D?.text && !opts.D) errors.push('❌ Option D missing');
  
  // Check answer
  if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) errors.push('❌ Invalid correct answer');
  
  // Check type
  const validTypes = ['mcq', 'match_following', 'assertion_reason', 'statement_based', 'diagram_based'];
  if (!validTypes.includes(q.type)) errors.push('❌ Invalid type: ' + q.type);
  
  // Check difficulty
  const validDiff = ['easy', 'medium', 'hard'];
  if (!validDiff.includes(q.difficulty?.toLowerCase())) errors.push('❌ Invalid difficulty');
  
  // Check explanation
  if (!q.explanation || String(q.explanation).trim().length < 10) errors.push('⚠️  Explanation too short or missing');
  
  return errors;
}

async function run() {
  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!\n');

  const testSamples = [
    { subject: 'physics', chapter: 'Laws of Motion', count: 3 },
    { subject: 'chemistry', chapter: 'Chemical Bonding and Molecular Structure', count: 3 },
    { subject: 'biology', chapter: 'Cell: The Unit of Life', count: 3 }
  ];

  let totalQs = 0;
  let totalErrors = 0;

  for (const { subject, chapter, count } of testSamples) {
    console.log(`\n📝 Testing: ${subject.toUpperCase()} → ${chapter}`);
    console.log(`   Generating ${count} questions...`);

    const prompt = `Generate exactly ${count} high-quality NEET questions for ${subject} - ${chapter}.
Return ONLY a JSON array with type "mcq" (${Math.floor(count * 0.6)} questions), 
type "assertion_reason" (${Math.floor(count * 0.4)} questions).

Each question must have: questionText, options (A,B,C,D as text), correctAnswer (A|B|C|D), 
explanation, topic, difficulty (easy|medium|hard), type.

JSON only, no markdown:`;

    try {
      const rawText = await callBedrock(prompt);
      const qs = safeParseJSON(rawText);
      
      console.log(`   ✅ Generated ${qs.length} questions\n`);
      
      qs.forEach((q, i) => {
        totalQs++;
        const errors = validateQuestion(q);
        const status = errors.length === 0 ? '✅' : '⚠️ ';
        console.log(`   ${status} Q${i+1} [${q.type}] [${q.difficulty}]`);
        console.log(`      "${q.questionText.substring(0, 70)}..."`);
        if (errors.length > 0) {
          errors.forEach(e => console.log(`      ${e}`));
          totalErrors += errors.length;
        }
      });
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log('\n═════════════════════════════════════════════════════════');
  console.log(`📊 VALIDATION REPORT`);
  console.log(`   Total questions tested: ${totalQs}`);
  console.log(`   Total issues found    : ${totalErrors}`);
  if (totalErrors === 0) {
    console.log(`   ✅ All questions passed validation!`);
    console.log(`\n   Ready to run full generation:  node src/scripts/addBulkQuestions.js`);
  } else {
    console.log(`   ⚠️  Fix issues before running full generation`);
  }
  console.log('═════════════════════════════════════════════════════════\n');

  await mongoose.disconnect();
}

run().catch(err => {
  console.error('💥 Fatal:', err.message);
  process.exit(1);
});
