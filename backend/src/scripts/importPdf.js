const path = require('path');
const fs = require('fs');

// Determine location of .env file
const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : fs.existsSync(path.join(process.cwd(), 'backend', '.env'))
    ? path.join(process.cwd(), 'backend', '.env')
    : path.join(__dirname, '../../.env');

require('dotenv').config({ path: dotenvPath });

const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Question = require('../models/Question');
const PDFExtractor = require('../services/pdfExtractor');

// Parse args
const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const flags = process.argv.slice(2).filter(arg => arg.startsWith('--'));

if (args.length < 2) {
  console.log(`
Usage:
  node src/scripts/importPdf.js <pdf-file-or-directory-path> <subject> [chapter] [topic] [source]

Arguments:
  pdf-file-or-directory-path: Path to a PDF file or a directory containing PDF files (absolute or relative to current dir)
  subject:                    'physics', 'chemistry', 'biology', 'botany', or 'zoology' (required)
  chapter:                    Optional NCERT chapter name (defaults to 'Unclassified' or derived from filename when importing a directory)
  topic:                      Optional sub-topic name (defaults to '')
  source:                     Optional source label: 'pyq', 'mock', 'dpp', 'ncert', 'coaching', 'custom' (defaults to 'custom')

Flags:
  --publish:     Auto-publish questions directly (sets isPublished to true). Use this to make imported questions visible in the app.
  --local-ocr:   Force local Tesseract OCR (defaults to false)
  --no-ai:       Disable AI parsing, use rule-based regex parsing instead
  `);
  process.exit(1);
}

const rawFilePath = args[0];
const subject = args[1].toLowerCase();
const chapter = args[2] || 'Unclassified';
const topic = args[3] || '';
const source = (args[4] || 'custom').toLowerCase();

const autoPublish = flags.includes('--publish');
const allowLocalOcr = flags.includes('--local-ocr');
const useAiParsing = !flags.includes('--no-ai');

async function main() {
  const filePath = path.resolve(rawFilePath);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Error: PDF file or directory not found at path: ${filePath}`);
    process.exit(1);
  }

  const validSubjects = ['physics', 'chemistry', 'biology', 'botany', 'zoology'];
  if (!validSubjects.includes(subject)) {
    console.error(`❌ Error: Invalid subject. Must be one of: ${validSubjects.join(', ')}`);
    process.exit(1);
  }

  const validSources = ['pyq', 'mock', 'dpp', 'ncert', 'coaching', 'custom'];
  if (!validSources.includes(source)) {
    console.error(`❌ Error: Invalid source. Must be one of: ${validSources.join(', ')}`);
    process.exit(1);
  }

  console.log(`🔌 Connecting to MongoDB...`);
  await connectDB();

  const processFile = async (pdfPath, fileChapter, fileTopic) => {
    const fileMock = {
      path: pdfPath,
      originalname: path.basename(pdfPath),
      mimetype: 'application/pdf'
    };

    console.log(`\n📂 Processing PDF: ${pdfPath}`);
    console.log(`🧬 Subject: ${subject}`);
    console.log(`📚 Chapter: ${fileChapter}`);
    console.log(`🏷️  Topic: ${fileTopic}`);
    console.log(`📌 Source: ${source}`);
    console.log(`🚀 AI Ingestion: ${useAiParsing ? 'ENABLED' : 'DISABLED'}`);
    console.log(`👁️  Local OCR: ${allowLocalOcr ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📢 Auto-Publish: ${autoPublish ? 'YES' : 'NO'}\n`);

    const result = await PDFExtractor.parseQuestionsFromFile(
      fileMock,
      {
        subject,
        chapter: fileChapter,
        topic: fileTopic,
        source,
        sourceDetails: {
          testName: fileMock.originalname,
          examType: 'neet'
        }
      },
      {
        allowLocalOcr,
        useAiParsing
      }
    );

    const parsedQuestions = result.questions || [];
    if (!parsedQuestions.length) {
      throw new Error('No questions parsed from the file.');
    }

    console.log(`✨ Successfully parsed ${parsedQuestions.length} questions from PDF.`);

    const questionsToInsert = parsedQuestions.map(q => ({
      ...q,
      isPublished: autoPublish,
      isVerified: autoPublish,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`💾 Saving questions to MongoDB...`);
    const inserted = await Question.insertMany(questionsToInsert);
    console.log(`✅ Saved ${inserted.length} questions from ${path.basename(pdfPath)} to MongoDB!`);
  };

  const collectPdfFiles = (directory) => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    let files = [];
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(collectPdfFiles(entryPath));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
        files.push(entryPath);
      }
    }
    return files;
  };

  const humanizeName = (filename) => {
    return filename
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const importFiles = async () => {
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      const pdfFiles = collectPdfFiles(filePath);
      if (!pdfFiles.length) {
        throw new Error('No PDF files found in the directory.');
      }

      console.log(`\n📁 Importing ${pdfFiles.length} PDF file(s) from directory: ${filePath}`);

      for (const pdfPath of pdfFiles) {
        const chapterName = chapter || humanizeName(path.basename(pdfPath));
        const topicName = topic || '';
        await processFile(pdfPath, chapterName, topicName);
      }
    } else {
      await processFile(filePath, chapter || 'Unclassified', topic);
    }
  };

  try {
    await importFiles();
    console.log(`\n🎉 Success! All questions have been imported successfully.`);
  } catch (error) {
    console.error(`❌ Extraction failed:`, error.message);
  } finally {
    await mongoose.connection.close();
    console.log(`🔌 Disconnected from MongoDB.`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('💥 Fatal error in script execution:', err);
  process.exit(1);
});
