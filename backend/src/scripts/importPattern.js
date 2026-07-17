const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const PatternImporter = require('../services/patternImporter');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : fs.existsSync(path.join(process.cwd(), 'backend', '.env'))
    ? path.join(process.cwd(), 'backend', '.env')
    : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const args = process.argv.slice(2);
const targetPath = args[0];
const subject = args[1];
const chapter = args[2];
const topic = args[3];
const source = args[4];
const flags = new Set(args.filter(a => a.startsWith('--')));

if (!targetPath && !process.env.PATTERN_DIR) {
  console.log(`\nUsage: node src/scripts/importPattern.js <pdf-directory-or-file> [subject] [chapter] [topic] [source] [--publish] [--local-ocr] [--no-ai] [--skip-duplicates]\n`);
  process.exit(1);
}

const options = {
  subject,
  chapter,
  topic,
  source,
  publish: flags.has('--publish'),
  allowLocalOcr: flags.has('--local-ocr'),
  useAiParsing: !flags.has('--no-ai'),
  skipDuplicates: !flags.has('--skip-duplicates')
};

(async () => {
  try {
    await connectDB();
    const target = targetPath || PatternImporter.getPatternDirectory();
    const summary = await PatternImporter.importPath(target, options);
    console.log(`\nImported ${summary.totalInserted} questions from ${summary.filesProcessed} file(s)`);
    console.log(`Parsed: ${summary.totalParsed}, Skipped: ${summary.totalSkipped}`);
    if (summary.errors.length) {
      console.log(`Errors:\n${summary.errors.join('\n')}`);
    }
  } catch (error) {
    console.error('Import failed:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
})();
