const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Load environment variables
const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : fs.existsSync(path.join(process.cwd(), 'backend', '.env'))
    ? path.join(process.cwd(), 'backend', '.env')
    : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');
const PDFExtractor = require('../services/pdfExtractor');
const { getGeminiText } = require('../services/geminiClient');
const { PHYSICS_CHAPTERS, CHEMISTRY_CHAPTERS, BIOLOGY_CHAPTERS } = require('../config/constants');

const PATTERN_DIR = path.join(__dirname, '..', '..', 'PATTERN');

// Helper to determine subject from text or filename
function detectSubject(filename, sampleText) {
  const name = filename.toLowerCase();
  const text = sampleText.toLowerCase();

  if (name.includes('biology') || name.includes('botany') || name.includes('zoology') || name.includes('bio')) {
    return 'biology';
  }
  if (name.includes('chemistry') || name.includes('chem')) {
    return 'chemistry';
  }
  if (name.includes('physics') || name.includes('phy')) {
    return 'physics';
  }

  // Fallback to text matching
  if (text.includes('photosynthesis') || text.includes('cell') || text.includes('organism') || text.includes('genetics')) {
    return 'biology';
  }
  if (text.includes('organic chemistry') || text.includes('mole concept') || text.includes('chemical bonding')) {
    return 'chemistry';
  }
  if (text.includes('motion') || text.includes('mechanics') || text.includes('current electricity') || text.includes('optics')) {
    return 'physics';
  }

  return 'biology'; // default
}

async function runIngestion() {
  console.log('⚡ Starting automatic PDF question ingestion...');
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

    try {
      const fileMock = {
        path: filePath,
        originalname: file,
        mimetype: 'application/pdf'
      };

      // Extract raw text first to analyze subject and do page split
      let text = '';
      try {
        text = await PDFExtractor.extractSelectablePdfText(fileMock);
      } catch (err) {
        console.warn(`⚠️ Selectable text extraction failed: ${err.message}. Retrying with general parse.`);
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(fs.readFileSync(filePath));
        text = data.text || '';
      }

      if (!text || text.trim().length < 100) {
        console.warn(`⚠️ Warning: Insufficient text extracted from ${file}. Skipping or requires OCR.`);
        continue;
      }

      const subject = detectSubject(file, text.slice(0, 5000));
      console.log(`🧬 Detected Subject: ${subject}`);

      // We will slice the text into pages or sections to parse with Gemini
      let pages = text.split('\f');
      if (pages.length <= 1) {
        pages = text.split(/Page\s+\d+/i);
      }
      pages = pages.map(p => p.trim()).filter(p => p.length > 100);

      console.log(`Extracted ${pages.length} pages/sections.`);

      // Group pages to avoid too many small requests
      const chunkCount = Math.min(pages.length, 30); // process up to 30 pages/chunks per file to avoid token blowups
      const pagesToProcess = pages.slice(0, chunkCount);

      let totalInsertedForFile = 0;

      for (let i = 0; i < pagesToProcess.length; i++) {
        console.log(`  Processing page/chunk ${i + 1}/${pagesToProcess.length}...`);
        const pageText = pagesToProcess[i];

        try {
          const prompt = `You are a NEET/JEE question compiler. Parse the following text and extract all multiple-choice questions (MCQs).
          
For each question, extract:
- questionText: The full question statement (if it references a diagram, write description of diagram in brackets)
- options: A, B, C, D text
- correctAnswer: A, B, C, or D
- explanation: Detailed conceptual answer explanation
- chapter: NCERT chapter name
- topic: specific topic name
- difficulty: easy, medium, or hard
- source: 'ncert' (if it is a direct fact question), 'pyq' (if it mentions years like 2018, 2020 or NEET/AIPMT), 'coaching' (if it is advanced coaching style), 'custom' (for others)
- sourceDetails: { year: numeric year if mentioned, examType: 'neet', 'aipmt', 'jee_main' if mentioned }

Text to parse:
${pageText}

Available chapters to choose from:
${subject === 'physics' ? PHYSICS_CHAPTERS.join(', ') : subject === 'chemistry' ? CHEMISTRY_CHAPTERS.join(', ') : BIOLOGY_CHAPTERS.join(', ')}

Return ONLY a valid JSON array of questions. No markdown, no triple backticks.`;

          const aiResponse = await getGeminiText({
            systemInstruction: 'You are an expert NEET question parser. Return a JSON array only.',
            prompt,
            maxOutputTokens: 8000,
            temperature: 0.1,
            responseMimeType: 'application/json'
          });

          const questions = PDFExtractor.parseJsonQuestions(aiResponse);
          if (Array.isArray(questions) && questions.length > 0) {
            // Normalize and enrich
            const normalized = questions.map(q => {
              const options = {};
              ['A', 'B', 'C', 'D'].forEach(k => {
                options[k] = { text: q.options?.[k]?.text || q.options?.[k] || `Option ${k}` };
              });

              const isPYQ = q.source === 'pyq' || !!q.sourceDetails?.year;

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
                  year: q.sourceDetails?.year || undefined,
                  examType: q.sourceDetails?.examType || (isPYQ ? 'neet' : undefined),
                  testName: file
                },
                pyq: {
                  isPYQ,
                  reference: isPYQ ? `NEET/AIPMT ${q.sourceDetails?.year || ''}`.trim() : undefined
                },
                inSyllabus: true,
                isPublished: true, // auto-publish directly as requested
                isVerified: true,
                verifiedAt: new Date(),
                tags: [subject, q.chapter || 'Unclassified', q.topic || '', q.source || 'custom'].filter(Boolean)
              };
            });

            const inserted = await Question.insertMany(normalized);
            totalInsertedForFile += inserted.length;
            console.log(`  ✅ Successfully saved ${inserted.length} questions from chunk ${i + 1}.`);
          }
        } catch (e) {
          console.error(`  ❌ Error processing chunk ${i + 1}: ${e.message}`);
        }

        // Delay to avoid rate limit
        await new Promise(r => setTimeout(r, 2000));
      }

      console.log(`🎉 Finished file: ${file}. Total questions inserted: ${totalInsertedForFile}`);
    } catch (err) {
      console.error(`❌ Critical error processing file ${file}: ${err.message}`);
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
