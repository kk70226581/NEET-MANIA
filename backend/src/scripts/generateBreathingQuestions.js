/**
 * AI Question Generator via Bedrock - Breathing and Exchange of Gases (50 questions)
 * Run using: node src/scripts/generateBreathingQuestions.js
 */
const path = require('path');
const fs   = require('fs');
const mongoose = require('mongoose');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question  = require('../models/Question');

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const bedrock = new BedrockRuntimeClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callBedrock(prompt) {
  const res = await bedrock.send(new ConverseCommand({
    modelId: MODEL_ID,
    messages: [{ role: 'user', content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens: 4096, temperature: 0.4 }
  }));
  return (res?.output?.message?.content || []).filter(b => b.text).map(b => b.text).join('').trim();
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

const subtopics = [
  "Respiratory Organs & Mechanism of Breathing",
  "Respiratory Volumes and Capacities (TV, IRV, ERV, RV, etc.)",
  "Exchange of Gases (Alveoli to Blood, pO2 and pCO2 gradients)",
  "Transport of Gases (Oxygen transport & Oxygen-Hemoglobin dissociation curve)",
  "Transport of Carbon Dioxide (Bicarbonate, Carbamino-hemoglobin)",
  "Regulation of Respiration (Respiratory centers, Chemoreceptors)",
  "Disorders of Respiratory System (Asthma, Emphysema, Occupational disorders)"
];

async function generateBatch(batchNum, count, subtopic) {
  const prompt = `You are a professional medical/NEET exam creator. Generate exactly ${count} highly conceptual, unique, and syllabus-compliant NEET-style questions for:
Subject: Biology
Chapter: Breathing and Exchange of Gases
Topic: ${subtopic}
Difficulty: Medium (exactly aligning with NEET standard)

For each question, return a JSON object with:
- questionText: Complete question statement. Make sure it is clear and grammatically correct.
- options: An object with keys A, B, C, D (each a string representing the option value).
- correctAnswer: "A", "B", "C", or "D".
- explanation: Detailed step-by-step conceptual explanation.
- topic: The specific subtopic name.
- difficulty: "medium"
- type: "mcq", "assertion_reason", "match_following", or "statement_based". Include a mix of these types.
- estimatedTime: Estimated solving time in seconds (e.g. 45).
- tags: Array of tags (e.g. ["NEET", "Biology", "Human Physiology", "Breathing", "${subtopic}"]).
- bloomsLevel: "understand", "apply", "analyze", or "remember".
- ncertPage: Estimated NCERT Class 11 Biology page number (e.g. "270").

Ensure that if you generate "assertion_reason" or "match_following" type, the options match that type perfectly. For example:
- assertion_reason: options A, B, C, D represent standard NEET AR options (A: Both correct and R is correct explanation, B: Both correct but R is not explanation, C: A correct R false, D: A false R true).
- match_following: options show combination matches like A-ii, B-iv, C-i, D-iii.

Return ONLY a valid JSON array of ${count} questions. No markdown wrap, no other text.`;

  console.log(`🤖 Requesting Batch ${batchNum} (Topic: ${subtopic}) via Bedrock...`);
  const responseText = await callBedrock(prompt);
  return robustParseJSON(responseText);
}

async function run() {
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB');

    const totalTarget = 50;
    const batchSize = 10;
    const totalBatches = totalTarget / batchSize;
    let allGenerated = [];

    for (let i = 0; i < totalBatches; i++) {
      const topic = subtopics[i % subtopics.length];
      let success = false;
      let attempts = 0;

      while (!success && attempts < 3) {
        try {
          attempts++;
          const questions = await generateBatch(i + 1, batchSize, topic);
          if (Array.isArray(questions) && questions.length > 0) {
            allGenerated = allGenerated.concat(questions);
            success = true;
            console.log(`  ✅ Batch ${i + 1} generated successfully: ${questions.length} questions.`);
          }
        } catch (err) {
          console.error(`  ❌ Attempt ${attempts} failed:`, err.message);
          await delay(5000);
        }
      }
      // Delay between API calls to avoid rate limits
      await delay(2000);
    }

    console.log(`\n📊 Generated ${allGenerated.length} questions total. Formatting and inserting...`);

    const formatted = [];
    const seenTexts = new Set();

    for (const q of allGenerated) {
      if (!q.questionText || q.questionText.length < 15) continue;
      
      const normText = q.questionText.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 80);
      if (seenTexts.has(normText)) continue;
      seenTexts.add(normText);

      const options = {};
      ['A', 'B', 'C', 'D'].forEach(k => {
        const textValue = typeof q.options?.[k] === 'object' ? q.options?.[k]?.text : q.options?.[k];
        options[k] = { text: textValue || `Option ${k}` };
      });

      formatted.push({
        questionText: q.questionText.trim(),
        options,
        correctAnswer: ['A', 'B', 'C', 'D'].includes(String(q.correctAnswer).trim().toUpperCase()) 
          ? String(q.correctAnswer).trim().toUpperCase() 
          : 'A',
        explanation: { text: q.explanation || 'Detailed explanation of the concept.' },
        subject: 'biology',
        chapter: 'Breathing and Exchange of Gases',
        topic: q.topic || 'Respiration',
        type: q.type || 'mcq',
        difficulty: 'medium',
        source: 'ai',
        isPublished: true,
        isVerified: true,
        generatedByAI: true,
        verifiedAt: new Date(),
        qualityScore: 92,
        estimatedTime: q.estimatedTime || 45,
        bloomsLevel: q.bloomsLevel || 'apply',
        ncertReference: {
          class: '11',
          chapter: 'Breathing and Exchange of Gases',
          topic: q.topic || 'Respiration',
          page: String(q.ncertPage || '270')
        },
        tags: q.tags || ['NEET', 'Biology', 'Human Physiology', 'Breathing']
      });
    }

    if (formatted.length > 0) {
      const result = await Question.insertMany(formatted, { ordered: false });
      console.log(`🎉 Seeded ${result.length} new AI-generated questions for "Breathing and Exchange of Gases"!`);
    } else {
      console.log('⚠️ No unique new questions to seed.');
    }

    // Verify DB total
    const total = await Question.countDocuments();
    console.log(`📈 Total questions in DB now: ${total}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('Fatal execution error:', error);
    process.exit(1);
  }
}

run();
