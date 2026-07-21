require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Find all questions with typical OCR garbage characters
    const garbagePatterns = [
      /®/i,
      /\\N/i,
      /==/i,
      /\|\s*\|/i,
      /—\s*\d/i,
      /—\./i,
      /~\s*-/i,
      /\\L/i,
      /\|\s*@/i,
      /HE\)/i
    ];

    const questions = await Question.find({});
    console.log(`Scanning ${questions.length} questions...`);

    const messyQuestions = [];
    for (const q of questions) {
      let isMessy = false;
      const text = q.questionText || '';

      for (const pattern of garbagePatterns) {
        if (pattern.test(text)) {
          isMessy = true;
          break;
        }
      }

      if (isMessy) {
        messyQuestions.push({
          id: q._id,
          text: q.questionText,
          chapter: q.chapter,
          correctAnswer: q.correctAnswer,
          options: q.options
        });
      }
    }

    console.log(`Found ${messyQuestions.length} messy questions.`);
    
    const outputPath = 'C:\\Users\\karan\\.gemini\\antigravity\\brain\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\scratch\\messy_questions.json';
    require('fs').writeFileSync(outputPath, JSON.stringify(messyQuestions, null, 2));
    console.log(`Saved messy questions list to ${outputPath}`);

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
