const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

// Load environment variables
const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : fs.existsSync(path.join(process.cwd(), 'backend', '.env'))
    ? path.join(process.cwd(), 'backend', '.env')
    : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');
const { PHYSICS_CHAPTERS, CHEMISTRY_CHAPTERS, BIOLOGY_CHAPTERS } = require('../config/constants');

const PATTERN_DIR = path.join(__dirname, '..', '..', '..', 'PATTERN');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const PDF_RENDERER_PATH = process.env.PDF_RENDERER_PATH || 'pdftoppm';

// Resilient JSON parser that repairs common AI output syntax errors
function robustParseJSON(text) {
  let cleaned = text.trim();
  
  // Strip markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  }

  // Handle trailing commas before closing brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  // Attempt standard parse first
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // If it fails, try a regex-based search for JSON array
    const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0].replace(/,\s*([\]}])/g, '$1'));
      } catch (e2) {
        // Fallback: replace common characters that break parse
        try {
          const repaired = arrayMatch[0]
            .replace(/[\u0000-\u001F]+/g, '') // remove control chars
            .replace(/\\(?!["\\\/bfnrtu])/g, '\\\\'); // escape single backslashes
          return JSON.parse(repaired);
        } catch (e3) {
          throw new Error(`Failed to parse repaired JSON: ${e3.message}`);
        }
      }
    }
    throw e;
  }
}

// Call Gemini directly supporting inline image/pdf base64 data
async function callGeminiDirect({ prompt, imageBase64, mimeType }) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  const parts = [];
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType: mimeType,
        data: imageBase64
      }
    });
  }
  parts.push({ text: prompt });

  const requestBody = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      temperature: 0.1,
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

// Helper to determine subject
function detectSubject(filename) {
  const name = filename.toLowerCase();
  if (name.includes('biology') || name.includes('botany') || name.includes('zoology') || name.includes('bio')) {
    return 'biology';
  }
  if (name.includes('chemistry') || name.includes('chem')) {
    return 'chemistry';
  }
  if (name.includes('physics') || name.includes('phy')) {
    return 'physics';
  }
  return 'biology'; // default
}

async function runIngestion() {
  console.log('⚡ Starting robust PDF question ingestion...');
  await connectDB();

  if (!fs.existsSync(PATTERN_DIR)) {
    console.error(`❌ PATTERN directory not found at: ${PATTERN_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(PATTERN_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${files.length} PDF files in PATTERN folder.`);

  for (const file of files) {
    const filePath = path.join(PATTERN_DIR, file);
    console.log(`\n========================================`);
    console.log(`📖 Processing file: ${file}`);
    console.log(`========================================`);

    const subject = detectSubject(file);
    console.log(`🧬 Subject set to: ${subject}`);

    // Create a temporary folder to render scanned PDF pages to images if needed
    const tempDir = fs.mkdtempSync(path.join(require('os').tmpdir(), 'ingest-ocr-'));
    const outputPrefix = path.join(tempDir, 'page');

    try {
      console.log(`Rendering PDF pages to images using pdftoppm...`);
      // We render the first 15 pages of each document to keep it fast and stay within token/rate limits
      await execFileAsync(PDF_RENDERER_PATH, [
        '-png',
        '-r', '150',
        '-f', '1',
        '-l', '15',
        filePath,
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
          const base64Data = fs.readFileSync(imagePath).toString('base64');

          const prompt = `Analyze this page image containing chemistry, physics, or biology questions.
Extract ALL multiple-choice questions (MCQs) present on this page.
For each question, return:
- questionText: Full question statement (preserve math/formatting, clean up any scanner artifacts)
- options: A, B, C, D (each containing option text)
- correctAnswer: A, B, C, or D
- explanation: Detailed step-by-step conceptual explanation
- chapter: NCERT chapter name
- topic: specific topic name
- difficulty: easy, medium, or hard
- source: 'ncert', 'pyq' (for NEET/AIPMT previous years), 'coaching', 'custom'

Choose the chapter ONLY from this list:
${subject === 'physics' ? PHYSICS_CHAPTERS.join(', ') : subject === 'chemistry' ? CHEMISTRY_CHAPTERS.join(', ') : BIOLOGY_CHAPTERS.join(', ')}

Return a valid JSON array of questions. Ensure no trailing commas or incomplete JSON blocks.`;

          const responseText = await callGeminiDirect({
            prompt,
            imageBase64: base64Data,
            mimeType: 'image/png'
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
                explanation: { text: q.explanation || '' },
                subject,
                chapter: q.chapter || 'Unclassified',
                topic: q.topic || '',
                type: 'mcq',
                difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
                source: q.source || 'custom',
                sourceDetails: {
                  testName: file,
                  examType: 'neet'
                },
                pyq: {
                  isPYQ: q.source === 'pyq',
                  reference: q.source === 'pyq' ? 'NEET Previous Year' : undefined
                },
                inSyllabus: true,
                isPublished: true,
                isVerified: true,
                verifiedAt: new Date()
              };
            });

            const inserted = await Question.insertMany(normalized);
            totalInserted += inserted.length;
            console.log(`    ✅ Saved ${inserted.length} questions from Page ${i + 1}.`);
          }
        } catch (e) {
          console.error(`    ❌ Error processing Page ${i + 1}: ${e.message}`);
        }

        // Delay to avoid rate limits
        await new Promise(r => setTimeout(r, 2000));
      }

      console.log(`🎉 Completed file: ${file}. Total questions added: ${totalInserted}`);
    } catch (err) {
      console.error(`❌ Error rendering/processing file ${file}: ${err.message}`);
    } finally {
      // Clean up temp images
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }

  console.log('\n🏁 Ingestion complete. Disconnecting from MongoDB.');
  await mongoose.connection.close();
  process.exit(0);
}

runIngestion().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
