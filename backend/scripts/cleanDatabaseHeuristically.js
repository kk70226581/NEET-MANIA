require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');
const { SOURCE_TYPES } = require('../src/config/constants');

// Override DNS to fix MongoDB Atlas connection issues
const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

function cleanString(text) {
  if (!text) return '';
  let cleaned = text;
  
  // 1. Remove page patterns: (Pg42, E), (Pg. 64, E), (Page 72), etc.
  const pgRegex = /\s*\(\s*(?:Pg\.|Page|Pg|Page-|Pg-)\s*\d*(?:\s*,\s*[A-Z])?\s*\)/gi;
  cleaned = cleaned.replace(pgRegex, '');
  
  // 2. Remove Paragraph references: Paragraph — 5.1\nThe Root
  const paragraphRegex = /\s*Paragraph\s*[-—–:]?\s*\d*(?:\s*,\s*[A-Z0-9.]+)*\s*(?:\r?\n.*)*$/i;
  cleaned = cleaned.replace(paragraphRegex, '');
  
  // 3. Remove LINE BY LINE references
  const lineByLineRegex = /\s*LINE\s*BY\s*LINE\s*(?:v\d+)?\s*$/gi;
  cleaned = cleaned.replace(lineByLineRegex, '');

  // 4. Remove trailing dashes, colons, underscores or whitespace
  cleaned = cleaned.replace(/[\s\-\—\–\:\_]+$/, '');

  return cleaned.trim();
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Database.');

    console.log('Fetching all questions...');
    const questions = await Question.find({});
    console.log(`Found ${questions.length} total questions.`);

    const bulkOps = [];
    const duplicatesToDelete = [];
    const seenTexts = new Set();

    let cleanedCount = 0;
    let pyqFixedCount = 0;
    let sourceFixedCount = 0;

    const validSources = Object.values(SOURCE_TYPES);

    for (const q of questions) {
      let isModified = false;

      // 1. Clean the question text
      let cleanedText = q.questionText || '';
      if (q.questionText) {
        cleanedText = cleanString(q.questionText);
        if (cleanedText !== q.questionText) {
          isModified = true;
        }
      }

      // 2. Clean the options text
      if (q.options) {
        for (const key of ['A', 'B', 'C', 'D']) {
          if (q.options[key] && q.options[key].text) {
            const cleanedOpt = cleanString(q.options[key].text);
            if (cleanedOpt !== q.options[key].text) {
              q.options[key].text = cleanedOpt;
              isModified = true;
            }
          }
        }
      }

      // 3. Fix PYQ tags and text if the question is marked as a practice question
      const isPYQ = q.pyq?.isPYQ || false;
      if (!isPYQ) {
        if (q.pyq?.tag !== 'Practice') {
          q.pyq = q.pyq || {};
          q.pyq.isPYQ = false;
          q.pyq.tag = 'Practice';
          q.pyq.year = null;
          isModified = true;
          pyqFixedCount++;
        }

        if (cleanedText && cleanedText.includes('PYQ')) {
          cleanedText = cleanedText.replace(/\bPYQ\b/g, 'Practice');
          isModified = true;
        }
      }

      // 4. Fix invalid source field values to comply with mongoose validation
      let sourceVal = q.source;
      if (q.source && !validSources.includes(q.source)) {
        sourceVal = 'custom';
        isModified = true;
        sourceFixedCount++;
      }

      // Deduplication check
      const lookupKey = cleanedText.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seenTexts.has(lookupKey)) {
        duplicatesToDelete.push(q._id);
        continue;
      }
      seenTexts.add(lookupKey);

      if (isModified) {
        bulkOps.push({
          updateOne: {
            filter: { _id: q._id },
            update: {
              $set: {
                questionText: cleanedText,
                options: q.options,
                pyq: q.pyq,
                source: sourceVal,
                updatedAt: new Date()
              }
            }
          }
        });
        cleanedCount++;
      }
    }

    console.log(`\nPrepared ${bulkOps.length} updates and ${duplicatesToDelete.length} duplicates to delete.`);

    if (bulkOps.length > 0) {
      console.log('Executing bulk updates...');
      const chunkSize = 500;
      for (let i = 0; i < bulkOps.length; i += chunkSize) {
        const chunk = bulkOps.slice(i, i + chunkSize);
        console.log(`Writing batch ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(bulkOps.length / chunkSize)}...`);
        await Question.bulkWrite(chunk);
      }
    }

    if (duplicatesToDelete.length > 0) {
      console.log('Deleting duplicate questions...');
      const chunkSize = 500;
      for (let i = 0; i < duplicatesToDelete.length; i += chunkSize) {
        const chunk = duplicatesToDelete.slice(i, i + chunkSize);
        console.log(`Deleting batch ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(duplicatesToDelete.length / chunkSize)}...`);
        await Question.deleteMany({ _id: { $in: chunk } });
      }
    }

    console.log(`\nCleanup Complete!`);
    console.log(`- Cleaned and updated ${cleanedCount} questions.`);
    console.log(`- Standardized ${pyqFixedCount} Practice/PYQ tags.`);
    console.log(`- Mapped ${sourceFixedCount} invalid source values to 'custom'.`);
    console.log(`- Deleted ${duplicatesToDelete.length} duplicate questions due to uniqueness constraints.`);
  } catch (error) {
    console.error('Fatal Error during cleanup:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
