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
    const jsonPath = path.join(__dirname, 'genetics_questions.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const rawQuestions = JSON.parse(rawData);
    
    console.log(`Loaded ${rawQuestions.length} questions from JSON.`);

    const parsedQuestions = [];
    
    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      
      const difficulty = q.level?.toLowerCase() === 'easy' ? 'easy' : (q.level?.toLowerCase() === 'hard' ? 'hard' : 'medium');
      const isAssertionReason = q.type?.toLowerCase().includes('assertion');
      const isMatchFollowing = q.type?.toLowerCase().includes('match');

      parsedQuestions.push({
        questionId: `genetics-practice-${i + 1}-${Math.random().toString(36).substring(2, 7)}`,
        questionText: q.q.trim(),
        options: {
          A: { text: q.opts[0] || '' },
          B: { text: q.opts[1] || '' },
          C: { text: q.opts[2] || '' },
          D: { text: q.opts[3] || '' }
        },
        correctAnswer: q.ans,
        subject: 'biology',
        chapter: 'Principles of Inheritance and Variation',
        topic: q.topic || 'Principles of Inheritance and Variation',
        difficulty: difficulty,
        explanation: { text: q.exp || 'Refer to NCERT Principles of Inheritance and Variation.' },
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
        tags: ['practice', 'principles-of-inheritance', 'biology', 'ncert-aligned'],
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

    console.log(`Prepared ${parsedQuestions.length} biology genetics questions for insertion.`);
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

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
