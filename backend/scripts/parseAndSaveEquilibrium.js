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

    const rawPath = path.resolve(__dirname, 'equilibrium_raw.json');
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
      const questionId = `equilibrium-pyq-inspired-${idx + 1}-${hash}`;

      // Build explanation text incorporating detailed solution and key formula
      let explanationText = q['Detailed Solution'] || '';
      if (q['Key Formula']) {
        explanationText += `\n\nKey Formula: ${q['Key Formula']}`;
      }

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
          text: explanationText
        },
        subject: 'chemistry',
        chapter: 'Equilibrium',
        topic: q['Topic'] || '',
        subtopic: q['Subtopic'] || '',
        type,
        difficulty: (q['Difficulty'] || 'medium').toLowerCase(),
        source: 'custom',
        inSyllabus: true,
        syllabusVersion: 'NEET-UG-2026',
        isPublished: true,
        isVerified: true,
        pyq: {
          isPYQ: false,
          reference: 'PYQ_INSPIRED'
        },
        qualityAudit: {
          status: 'approved',
          factualScore: 100,
          conceptualScore: 100,
          ambiguityScore: 100,
          auditedAt: new Date(),
          auditedBy: 'admin-bulk-publish'
        },
        ncertReference: {
          class: String(q['Class'] || '11'),
          book: 'Chemistry',
          chapter: 'Equilibrium',
          topic: q['Topic'] || '',
          edition: '2026-27'
        }
      };
    });

    console.log('Sample parsed question 1:', JSON.stringify(formattedQuestions[0], null, 2));
    console.log('Sample parsed question 100:', JSON.stringify(formattedQuestions[99], null, 2));

    console.log('Cleaning up existing questions for chapter Equilibrium...');
    const deleteResult = await Question.deleteMany({ chapter: 'Equilibrium' });
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
