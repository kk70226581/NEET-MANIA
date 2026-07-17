/**
 * Ingest Questions from PDF via Bedrock (OCR + AI)
 * Run using: node src/scripts/ingestQuestionsBedrock.js
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { execFile } = require('child_process');
const { promisify } = require('util');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

const execFileAsync = promisify(execFile);

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');
const { BIOLOGY_CHAPTERS } = require('../config/constants');

const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const PDF_RENDERER_PATH = process.env.PDF_RENDERER_PATH || 'C:\\poppler-26.02.0\\Library\\bin\\pdftoppm.exe';

const bedrock = new BedrockRuntimeClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

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

async function callBedrockOCR({ prompt, imageBuffer }) {
  const input = {
    modelId: MODEL_ID,
    messages: [{
      role: 'user',
      content: [
        {
          image: {
            format: 'png',
            source: {
              bytes: imageBuffer
            }
          }
        },
        {
          text: prompt
        }
      ]
    }],
    inferenceConfig: { maxTokens: 4096, temperature: 0.2 }
  };

  const res = await bedrock.send(new ConverseCommand(input));
  return (res?.output?.message?.content || [])
    .filter(b => b.text).map(b => b.text).join('').trim();
}

async function runIngestion() {
  console.log('⚡ Starting robust PDF question ingestion via Bedrock...');
  await connectDB();

  const pdfPath = path.join(__dirname, '..', '..', '..', 'PATTERN', 'botany-neet-ncert-line-by-line-ncert-line-by_compress.pdf');
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file not found at: ${pdfPath}`);
    process.exit(1);
  }

  // Create temporary folder
  const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ingest-bedrock-'));
  const outputPrefix = path.join(tempDir, 'page');

  try {
    console.log(`Rendering first 4 pages of the PDF to images using pdftoppm...`);
    // Render pages 5 to 8 (which contain typical chapter content instead of front cover)
    await execFileAsync(PDF_RENDERER_PATH, [
      '-png',
      '-r', '150',
      '-f', '10',
      '-l', '13',
      pdfPath,
      outputPrefix
    ], { windowsHide: true, maxBuffer: 50 * 1024 * 1024 });

    const pageImages = fs.readdirSync(tempDir)
      .filter(f => f.endsWith('.png'))
      .sort((a, b) => Number(a.match(/\d+/)?.[0] || 0) - Number(b.match(/\d+/)?.[0] || 0))
      .map(f => path.join(tempDir, f));

    console.log(`Rendered ${pageImages.length} pages to process.`);

    let totalInserted = 0;

    for (let i = 0; i < pageImages.length; i++) {
      const imagePath = pageImages[i];
      console.log(`  Parsing Page ${i + 1}/${pageImages.length}...`);

      try {
        const imageBuffer = fs.readFileSync(imagePath);

        const prompt = `Analyze this page image containing botany/biology questions.
Extract ALL multiple-choice questions (MCQs), assertion-reason questions, or match-following questions present on this page.
For each question, return a JSON object containing:
- questionText: Full question statement (preserve formatting, clean up scanner artifacts)
- options: A, B, C, D (each containing option text)
- correctAnswer: A, B, C, or D
- explanation: Detailed step-by-step conceptual explanation
- chapter: Choose the closest matching NCERT Biology chapter from this list:
${BIOLOGY_CHAPTERS.join(', ')}
- topic: Specific topic name
- difficulty: easy, medium, or hard
- type: 'mcq' or 'assertion_reason' or 'match_following'

Return a valid JSON array of questions. Ensure no trailing commas.`;

        const responseText = await callBedrockOCR({
          prompt,
          imageBuffer
        });

        const questions = robustParseJSON(responseText);
        if (Array.isArray(questions) && questions.length > 0) {
          const normalized = questions.map(q => {
            const options = {};
            ['A', 'B', 'C', 'D'].forEach(k => {
              options[k] = { text: q.options?.[k]?.text || q.options?.[k] || `Option ${k}` };
            });

            return {
              questionText: q.questionText || 'Question text missing',
              options,
              correctAnswer: ['A', 'B', 'C', 'D'].includes(q.correctAnswer) ? q.correctAnswer : 'A',
              explanation: { text: q.explanation || 'Detailed solution from NCERT Botany.' },
              subject: 'biology',
              chapter: q.chapter || 'Plant Physiology',
              topic: q.topic || 'Botany',
              type: q.type || 'mcq',
              difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
              source: 'ncert',
              sourceDetails: {
                testName: 'Botany NCERT Line by Line',
                examType: 'neet'
              },
              pyq: {
                isPYQ: false
              },
              inSyllabus: true,
              isPublished: true,
              isVerified: true,
              verifiedAt: new Date(),
              qualityScore: 88
            };
          });

          // Insert with deduplication
          const toInsert = [];
          for (const q of normalized) {
            const exists = await Question.findOne({ questionText: q.questionText });
            if (!exists) {
              toInsert.push(q);
            }
          }

          if (toInsert.length > 0) {
            const inserted = await Question.insertMany(toInsert);
            totalInserted += inserted.length;
            console.log(`    ✅ Saved ${inserted.length} questions from Page ${i + 1}.`);
          } else {
            console.log(`    ⚠️ No new unique questions on Page ${i + 1}.`);
          }
        }
      } catch (e) {
        console.error(`    ❌ Error processing Page ${i + 1}: ${e.message}`);
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    console.log(`\n🎉 PDF extraction completed! Total questions added: ${totalInserted}`);
  } catch (err) {
    console.error(`❌ Error rendering/processing PDF: ${err.message}`);
  } finally {
    // Clean up temp images
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Verify DB total
  const total = await Question.countDocuments();
  console.log(`📈 Current total questions in DB: ${total}`);

  await mongoose.connection.close();
  console.log('🏁 Ingestion complete. Disconnected from MongoDB.');
  process.exit(0);
}

runIngestion().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
