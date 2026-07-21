require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

const spellingFixes = [
  { pattern: /sporuphyte/gi, replacement: 'sporophyte' },
  { pattern: /oamectoptyte/gi, replacement: 'gametophyte' },
  { pattern: /melosis/gi, replacement: 'meiosis' },
  { pattern: /gynoceium/gi, replacement: 'gynoecium' },
  { pattern: /androceium/gi, replacement: 'androecium' },
  { pattern: /raddish/gi, replacement: 'radish' },
  { pattern: /interfasicular/gi, replacement: 'interfascicular' },
  { pattern: /intrafasicular/gi, replacement: 'intrafascicular' },
  { pattern: /cuscutta/gi, replacement: 'cuscuta' },
  { pattern: /cichild/gi, replacement: 'cichlid' },
  { pattern: /selting/gi, replacement: 'setting' },
  { pattern: /\bIna typical\b/gi, replacement: 'In a typical' },
  { pattern: /\bThinn\b/gi, replacement: 'Thin' },
  { pattern: /\bmuliathi\b/gi, replacement: 'mulethi' },
  { pattern: /polydephous/gi, replacement: 'polyadelphous' },
  { pattern: /\bHow may\b/gi, replacement: 'How many' },
  { pattern: /\bchina rose\b/gi, replacement: 'China rose' },
  { pattern: /\bchina-rose\b/gi, replacement: 'China rose' },
  { pattern: /\bchina-Rose\b/gi, replacement: 'China rose' },
  { pattern: /\bchina Rose\b/gi, replacement: 'China rose' }
];

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    const questions = await Question.find({});
    console.log(`Scanning ${questions.length} questions for spelling and OCR errors...`);

    const bulkOps = [];
    let fixedCount = 0;

    for (const q of questions) {
      let isModified = false;

      // Clean question text spelling
      let text = q.questionText || '';
      if (q.questionText) {
        for (const fix of spellingFixes) {
          if (fix.pattern.test(text)) {
            text = text.replace(fix.pattern, fix.replacement);
            isModified = true;
          }
        }

        // Specific cleanups for garbage OCR text sequences
        if (text.includes('sporophyte\n2v, Pa') || text.includes('meiosis\nCham')) {
          text = text.replace(/sporophyte\s*\n\s*2v,\s*Pa\s*\n\s*-\s*a\s*\n\s*meiosis\s*\n\s*Cham\s*a=\s*\n\s*n\.\s*\n\s*\\L\s*gametophyte\s*Ha\s*\n\s*\[2/gi, '');
          isModified = true;
        }

        if (isModified) {
          q.questionText = text.trim();
        }
      }

      // Clean options spelling
      if (q.options) {
        for (const key of ['A', 'B', 'C', 'D']) {
          if (q.options[key] && q.options[key].text) {
            let optText = q.options[key].text;
            let optModified = false;
            for (const fix of spellingFixes) {
              if (fix.pattern.test(optText)) {
                optText = optText.replace(fix.pattern, fix.replacement);
                optModified = true;
              }
            }
            if (optModified) {
              q.options[key].text = optText.trim();
              isModified = true;
            }
          }
        }
      }

      if (isModified) {
        bulkOps.push({
          updateOne: {
            filter: { _id: q._id },
            update: {
              $set: {
                questionText: q.questionText,
                options: q.options,
                updatedAt: new Date()
              }
            }
          }
        });
        fixedCount++;
      }
    }

    console.log(`Prepared ${bulkOps.length} updates.`);

    if (bulkOps.length > 0) {
      console.log('Executing bulk updates for spelling fixes...');
      const chunkSize = 500;
      for (let i = 0; i < bulkOps.length; i += chunkSize) {
        const chunk = bulkOps.slice(i, i + chunkSize);
        console.log(`Writing batch ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(bulkOps.length / chunkSize)}...`);
        await Question.bulkWrite(chunk);
      }
    }

    console.log(`\nSpelling and OCR errors fixed in ${fixedCount} questions.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
