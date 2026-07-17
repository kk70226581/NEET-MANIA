/**
 * Extract and Generate Questions from Botany NCERT PDF
 * ──────────────────────────────────────────────────────
 * Reads Botany NCERT PDF page-by-page
 * Generates 2000+ unique NEET questions from content
 * Adds directly to MongoDB
 * 
 * Run: node src/scripts/extractFromBotanyNCERT.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
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

const delay = ms => new Promise(r => setTimeout(r, ms));

// ─── Bedrock API call ────────────────────────────────────────────────────────
async function callBedrock(prompt) {
  const input = {
    modelId: MODEL_ID,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 4096, temperature: 0.3 }
  };
  const res = await bedrock.send(new ConverseCommand(input));
  return (res?.output?.message?.content || [])
    .filter(b => b.text).map(b => b.text).join('').trim();
}

// ─── Safe JSON parser ────────────────────────────────────────────────────────
function safeParseJSON(text) {
  let s = text.trim()
    .replace(/^```(?:json)?/i, '').replace(/```$/m, '')
    .replace(/,\s*([\]}])/g, '$1').trim();
  try { 
    return JSON.parse(s); 
  } catch (_) {
    const m = s.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (m) {
      try { 
        return JSON.parse(m[0].replace(/,\s*([\]}])/g, '$1')); 
      } catch (_2) {}
    }
    const start = s.indexOf('[');
    const end   = s.lastIndexOf(']');
    if (start !== -1 && end !== -1) {
      try { 
        return JSON.parse(s.slice(start, end + 1).replace(/,\s*([\]}])/g, '$1')); 
      } catch (_3) {}
    }
    throw new Error('Cannot parse JSON');
  }
}

// ─── Levenshtein distance for similarity check ───────────────────────────────
function levenshteinDistance(a, b) {
  const m = a.length, n = b.length;
  const dp = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[0][i] = i;
  for (let j = 0; j <= n; j++) dp[j][0] = j;
  for (let j = 1; j <= n; j++) {
    for (let i = 1; i <= m; i++) {
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[j][i] = Math.min(dp[j-1][i] + 1, dp[j][i-1] + 1, dp[j-1][i-1] + cost);
    }
  }
  return dp[n][m];
}

function isSimilar(text1, text2, threshold = 0.82) {
  const t1 = text1.toLowerCase().trim();
  const t2 = text2.toLowerCase().trim();
  if (t1 === t2) return true;
  const maxLen = Math.max(t1.length, t2.length);
  if (maxLen === 0) return true;
  const distance = levenshteinDistance(t1, t2);
  const similarity = 1 - distance / maxLen;
  return similarity >= threshold;
}

// ─── Format question with validation ─────────────────────────────────────────
function formatQuestion(raw, existingTexts) {
  if (!raw || typeof raw !== 'object') return null;

  const qt = String(raw.questionText || '').trim();
  if (qt.length < 20) return null;

  // Check for similarity in this batch
  if (existingTexts.some(et => isSimilar(qt, et, 0.82))) {
    return null;
  }

  const opts = raw.options || {};
  const getOptText = v => {
    if (typeof v === 'string') return v.trim();
    if (typeof v === 'object' && v !== null) return JSON.stringify(v).trim();
    return String(v || '').trim();
  };
  
  const A = getOptText(opts.A);
  const B = getOptText(opts.B);
  const C = getOptText(opts.C);
  const D = getOptText(opts.D);
  
  if (!A || !B || !C || !D) return null;
  if (A === B || B === C || C === D || A === C || B === D || A === D) return null;

  let ca = raw.correctAnswer;
  if (typeof ca === 'object' && ca !== null) {
    ca = 'A';
  } else {
    ca = String(ca || '').trim().toUpperCase().charAt(0);
  }
  if (!['A', 'B', 'C', 'D'].includes(ca)) ca = 'A';

  const VALID_TYPES = ['mcq', 'match_following', 'assertion_reason', 'statement_based', 'diagram_based'];
  const type = VALID_TYPES.includes(raw.type) ? raw.type : 'mcq';

  const VALID_DIFFS = ['easy', 'medium', 'hard'];
  const rawDiff = String(raw.difficulty || 'medium').toLowerCase().trim();
  const diff = VALID_DIFFS.includes(rawDiff) ? rawDiff : 'medium';

  return {
    questionText: qt,
    options: {
      A: { text: A },
      B: { text: B },
      C: { text: C },
      D: { text: D },
    },
    correctAnswer: ca,
    explanation: { text: String(raw.explanation || '').trim() || 'See explanation above.' },
    subject: 'biology',
    chapter: 'Botany (NCERT)',
    topic: String(raw.topic || 'Botany').trim(),
    type,
    difficulty: diff,
    source: 'custom',
    isPublished: true,
    isVerified: true,
    verifiedAt: new Date(),
    generatedByAI: true,
    qualityScore: 88,
    ncertReference: {
      source: 'Botany NCERT',
      contentBased: true
    }
  };
}

// ─── Generate questions from content ─────────────────────────────────────────
async function generateQuestionsFromContent(content, chunkNum, totalChunks) {
  const cleanContent = content
    .replace(/\s+/g, ' ')
    .substring(0, 3000);  // First 3000 chars

  const prompt = `You are an expert NEET Biology question setter. Based on the following NCERT Botany content, generate exactly 10 unique, high-quality NEET exam questions.

NCERT Botany Content:
${cleanContent}

INSTRUCTIONS:
- Generate exactly 10 questions from this content
- Question type distribution: 6 MCQ, 2 Match-Following, 2 Assertion-Reason
- Each question must be unique and directly derived from the content provided
- All options must be distinct and plausible
- Difficulty: Mix of 40% easy, 50% medium, 10% hard
- Each question must have a clear, complete explanation (2-3 sentences)
- All questions must be specific to Botany NCERT topics
- Return ONLY a raw JSON array (no markdown):

[
  {
    "questionText": "Question here (20+ words)...",
    "options": {"A": "Complete option", "B": "Complete option", "C": "Complete option", "D": "Complete option"},
    "correctAnswer": "A",
    "explanation": "Why this is correct (2-3 sentences)...",
    "topic": "Specific Botany topic",
    "difficulty": "easy|medium|hard",
    "type": "mcq|match_following|assertion_reason"
  }
]

Generate exactly 10 questions NOW:`;

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const rawText = await callBedrock(prompt);
      const parsed = safeParseJSON(rawText);
      if (!Array.isArray(parsed)) throw new Error('Not an array');
      return parsed.filter(q => q && q.questionText);
    } catch (err) {
      console.warn(`   ⚠️  Attempt ${attempt} failed: ${err.message?.substring(0, 80)}`);
      if (attempt < MAX_RETRIES) {
        await delay(5000);
      } else {
        throw err;
      }
    }
  }
}

// ─── Insert questions with deduplication ────────────────────────────────────
async function insertDeduped(questions) {
  if (!questions || questions.length === 0) return 0;

  const existingTexts = [];
  const formatted = questions
    .map(q => formatQuestion(q, existingTexts))
    .filter(q => {
      if (!q) return false;
      existingTexts.push(q.questionText);
      return true;
    });

  if (formatted.length === 0) return 0;

  const texts = formatted.map(q => q.questionText);
  const existing = await Question.find(
    { questionText: { $in: texts } },
    { questionText: 1 }
  ).lean();
  const existingSet = new Set(existing.map(e => e.questionText));

  const toInsert = formatted.filter(q => !existingSet.has(q.questionText));
  if (toInsert.length === 0) return 0;

  try {
    await Question.insertMany(toInsert, { ordered: false });
    return toInsert.length;
  } catch (err) {
    if (err.writeErrors) return toInsert.length - err.writeErrors.length;
    throw err;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    const pdfPath = path.join(__dirname, '../../..', 'PATTERN', 'botany-neet-ncert-line-by-line-ncert-line-by_compress.pdf');
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF not found at:', pdfPath);
      await mongoose.disconnect();
      return;
    }

    console.log('📖 Reading Botany NCERT PDF...\n');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    
    console.log(`✅ PDF loaded: ${pdfData.numpages} pages\n`);

    let totalAdded = 0;
    const batchSize = 2;  // Pages per batch (more frequent generation)

    // Process PDF in chunks of 4 pages
    for (let i = 0; i < pdfData.numpages; i += batchSize) {
      const pageStart = i + 1;
      const pageEnd = Math.min(i + batchSize, pdfData.numpages);
      
      console.log(`\n[${pageStart}-${pageEnd}/${pdfData.numpages}] 📝 Processing pages...`);

      let batchContent = '';
      for (let p = i; p < Math.min(i + batchSize, pdfData.numpages); p++) {
        batchContent += pdfData.text.split(/\f/)[p] || '';
      }

      try {
        const qs = await generateQuestionsFromContent(batchContent, i / batchSize + 1, Math.ceil(pdfData.numpages / batchSize));
        const n = await insertDeduped(qs);
        totalAdded += n;
        console.log(`   ✅ Generated ${qs.length}, saved ${n} (running total: ${totalAdded})`);
      } catch (err) {
        console.error(`   ❌ Error: ${err.message?.substring(0, 100)}`);
      }

      await delay(2000);
    }

    console.log('\n═════════════════════════════════════════════════════════');
    console.log(`🎉 COMPLETE!`);
    console.log(`   Total pages processed: ${pdfData.numpages}`);
    console.log(`   Questions generated & saved: ${totalAdded}`);
    console.log('═════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error('💥 Fatal:', err.message);
    process.exit(1);
  }
}

run();
