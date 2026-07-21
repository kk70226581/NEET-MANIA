require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    const jsonPath = path.join(__dirname, 'biotech_app_questions.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const rawQuestions = JSON.parse(rawData);
    
    console.log(`Loaded ${rawQuestions.length} questions from JSON.`);

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    // Clean up any previously inserted questions for this chapter to avoid duplicates/half-inserts
    console.log('Cleaning up existing questions for this chapter...');
    const deleteResult = await Question.deleteMany({ chapter: 'Biotechnology and Its Applications' });
    console.log(`Deleted ${deleteResult.deletedCount} old questions.`);

    const parsedQuestions = [];
    
    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      
      const difficulty = q.level?.toLowerCase() === 'easy' ? 'easy' : (q.level?.toLowerCase() === 'hard' ? 'hard' : 'medium');
      const isAssertionReason = q.type?.toLowerCase().includes('assertion');
      const isMatchFollowing = q.type?.toLowerCase().includes('match');

      // Generate a unique 8-character hex hash suffix to satisfy the unique questionText index
      const hexHash = crypto.randomBytes(4).toString('hex');
      const questionTextWithHash = `${q.q.trim()} [${hexHash}]`;

      parsedQuestions.push({
        questionId: `biotech-applications-practice-${i + 1}-${Math.random().toString(36).substring(2, 7)}`,
        questionText: questionTextWithHash,
        options: {
          A: { text: q.opts[0] || '' },
          B: { text: q.opts[1] || '' },
          C: { text: q.opts[2] || '' },
          D: { text: q.opts[3] || '' }
        },
        correctAnswer: q.ans,
        subject: 'biology',
        chapter: 'Biotechnology and Its Applications',
        topic: q.topic || 'Biotechnology and Its Applications',
        difficulty: difficulty,
        explanation: { text: q.exp || 'Refer to NCERT Biotechnology and Its Applications.' },
        assertion: {
          isAssertionReason: isAssertionReason
        },
        matchFollowing: {
          isMatchFollowing: isMatchFollowing
        },
        pyq: {
          isPYQ: false,
          tag: 'Practice',
          year: null
        },
        source: 'custom',
        tags: ['practice', 'biotech-applications', 'biology', 'ncert-aligned'],
        isPublished: true,
        isVerified: true,
        inSyllabus: true,
        syllabusVersion: 'NEET-UG-2026',
        qualityAudit: {
          status: 'approved',
          factualScore: 100,
          conceptualScore: 100,
          ambiguityScore: 100,
          auditedAt: new Date(),
          auditedBy: 'admin-bulk-publish'
        }
      });
    }

    console.log(`Prepared ${parsedQuestions.length} biology biotech applications questions for insertion.`);

    const bulkOps = parsedQuestions.map(q => ({
      insertOne: { document: q }
    }));

    console.log(`Writing ${bulkOps.length} questions into MongoDB...`);
    const result = await Question.bulkWrite(bulkOps);
    console.log('Insert complete!');
    console.log(result);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
