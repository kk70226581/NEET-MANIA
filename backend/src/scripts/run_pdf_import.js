require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const PatternImporter = require('../services/patternImporter');

(async () => {
  try {
    await connectDB();
    const target = path.resolve(__dirname, '..', '..', '..', 'PATTERN');
    console.log(`Starting PDF import from: ${target}`);
    const summary = await PatternImporter.importPath(target, {
      publish: true,
      allowLocalOcr: true,
      useAiParsing: true,
      skipDuplicates: true
    });
    console.log(`Import Summary:`, JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.connection.close();
  }
})();
