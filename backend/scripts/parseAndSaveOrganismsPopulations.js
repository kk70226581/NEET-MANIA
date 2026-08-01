require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const rawPath = path.resolve(__dirname, 'organisms_populations_raw.json');
    console.log(`Reading raw questions from ${rawPath}...`);
    const rawQuestions = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
    console.log(`Loaded ${rawQuestions.length} questions.`);

    const formattedQuestions = rawQuestions.map((q, idx) => {
      // Map question type
      let type = 'mcq';
      if (q['Question Type'] === 'Assertion–Reason') {
        type = 'assertion_reason';
      } else if (q['Question Type'] === 'Match the Following') {
        type = 'match_following';
      }

      // Generate a short 5-character unique hash
      const hash = Math.random().toString(36).substring(2, 7);
      const questionId = `organisms-populations-pyq-inspired-${idx + 1}-${hash}`;

      return {
        questionId,
        questionText: q['Question'],
        options: {
          A: { text: q['Option A'] },
          B: { text: q['Option B'] },
          C: { text: q['Option C'] },
          D: { text: q['Option D'] }
        },
        correctAnswer: q['Correct Answer'],
        explanation: {
          text: q['Answer Explanation']
        },
        subject: 'biology',
        chapter: 'Organisms and Populations',
        topic: q['Topic'] || q['Section'],
        type,
        difficulty: (q['Difficulty'] || 'medium').toLowerCase(),
        source: 'custom',
        inSyllabus: true,
        syllabusVersion: 'NEET-UG-2026',
        isPublished: true,
        isVerified: true,
        qualityAudit: {
          status: 'approved',
          factualScore: 100,
          conceptualScore: 100,
          ambiguityScore: 100,
          auditedAt: new Date(),
          auditedBy: 'admin-bulk-publish'
        },
        ncertReference: {
          class: '12',
          book: 'Biology',
          chapter: 'Organisms and Populations',
          topic: q['Topic'],
          page: String(q['NCERT Page']),
          pdfPage: Number(q['PDF Page']),
          edition: '2026-27'
        }
      };
    });

    console.log('Sample parsed question 1:', JSON.stringify(formattedQuestions[0], null, 2));
    console.log('Sample parsed question 100:', JSON.stringify(formattedQuestions[99], null, 2));

    console.log('Cleaning up existing questions for chapter Organisms and Populations...');
    const deleteResult = await Question.deleteMany({ chapter: 'Organisms and Populations' });
    console.log(`Deleted ${deleteResult.deletedCount} old questions.`);

    console.log('Writing new questions into MongoDB...');
    const insertResult = await Question.insertMany(formattedQuestions);
    console.log(`Successfully inserted ${insertResult.length} questions.`);

  } catch (e) {
    console.error('Error occurred:', e);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

run();
