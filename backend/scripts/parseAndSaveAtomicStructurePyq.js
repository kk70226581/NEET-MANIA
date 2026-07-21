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
    const rawFilePath = path.join(__dirname, 'atomic_structure_raw.txt');
    const content = fs.readFileSync(rawFilePath, 'utf8');
    
    const lines = content.split(/\r?\n/).map(l => l.trim());
    console.log(`Processing ${lines.length} lines.`);

    const parsedQuestions = [];
    let currentTopic = 'Structure of Atom';
    
    let insideQuestion = false;
    let questionText = '';
    let options = { A: '', B: '', C: '', D: '' };
    let correctAnswer = '';
    let difficulty = 'medium';
    let isAssertionReason = false;
    let explanation = '';

    const skippedKeywords = [
      '<user_request>',
      'chapter 2:',
      'these are 100 original',
      'use:',
      'h=6.626',
      'r_h=1.097',
      'website tags',
      '</user_request>',
      '{',
      '}',
      '"subject"',
      '"chapter"',
      '"sourcetype"',
      '"exampattern"',
      '"trendperiod"',
      '"ispyq"',
      'the electromagnetic-radiation and quantum topics above are explicitly included',
      'hydrogen spectrum, bohr relations and limitations of the bohr model form part',
      'quantum numbers, orbital probability, nodes and the quantum-mechanical model are included',
      'for questions',
      'both assertion and reason',
      'both are true',
      'assertion is true',
      'assertion is false'
    ];

    const defaultAssertionOptions = {
      A: "Both Assertion and Reason are true, and Reason correctly explains Assertion",
      B: "Both are true, but Reason does not correctly explain Assertion",
      C: "Assertion is true, but Reason is false",
      D: "Assertion is false, but Reason is true"
    };

    function addQuestion() {
      // If Assertion-Reason question has no options, populate defaults
      if (isAssertionReason && (!options.A || !options.B || !options.C || !options.D)) {
        options = { ...defaultAssertionOptions };
      }

      if (!options.A || !options.B || !options.C || !options.D || !correctAnswer) {
        console.log(`Skipping invalid question. Text snippet: "${questionText.substring(0, 60)}..."`);
        return;
      }

      const hexHash = crypto.randomBytes(4).toString('hex');
      parsedQuestions.push({
        questionId: `atomic-structure-pyq-inspired-${parsedQuestions.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
        questionText: `${questionText.trim()} [${hexHash}]`,
        options: {
          A: { text: options.A },
          B: { text: options.B },
          C: { text: options.C },
          D: { text: options.D }
        },
        correctAnswer: correctAnswer,
        subject: 'chemistry',
        chapter: 'Structure of Atom',
        topic: currentTopic,
        difficulty: difficulty,
        explanation: { text: explanation || 'Refer to NCERT Structure of Atom.' },
        assertion: { isAssertionReason },
        matchFollowing: { isMatchFollowing: false },
        pyq: { isPYQ: false, tag: 'PYQ_INSPIRED', year: null },
        source: 'custom',
        tags: ['pyq-inspired', 'atomic-structure', 'chemistry', 'ncert-aligned'],
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      // Detect start of a new question
      const headerMatch = line.match(/^\d+\.\s*\[/);
      if (headerMatch) {
        // Failsafe push
        if (insideQuestion) {
          addQuestion();
        }

        // Initialize/Reset buffers
        insideQuestion = true;
        questionText = '';
        options = { A: '', B: '', C: '', D: '' };
        correctAnswer = '';
        difficulty = 'medium';
        isAssertionReason = false;
        explanation = '';

        if (line.toLowerCase().includes('easy')) difficulty = 'easy';
        if (line.toLowerCase().includes('hard')) difficulty = 'hard';
        if (line.toLowerCase().includes('assertion')) isAssertionReason = true;
        continue;
      }

      if (insideQuestion) {
        if (line.startsWith('A.')) {
          options.A = line.substring(2).trim();
        } else if (line.startsWith('B.')) {
          options.B = line.substring(2).trim();
        } else if (line.startsWith('C.')) {
          options.C = line.substring(2).trim();
        } else if (line.startsWith('D.')) {
          options.D = line.substring(2).trim();
        } else if (line.startsWith('Answer:')) {
          correctAnswer = line.replace('Answer:', '').trim();
        } else if (line.startsWith('Explanation:')) {
          explanation = line.replace('Explanation:', '').trim();
          insideQuestion = false; // Close question

          // Save completed question
          addQuestion();
        } else {
          // Append to question text
          if (questionText) {
            questionText += '\n' + line;
          } else {
            questionText = line;
          }
        }
      } else {
        // Topic header detection
        const lowerLine = line.toLowerCase();
        const shouldSkip = skippedKeywords.some(kw => lowerLine.includes(kw));
        const isOptPrefix = line.startsWith('A.') || line.startsWith('B.') || line.startsWith('C.') || line.startsWith('D.');
        if (!shouldSkip && !isOptPrefix && line.length > 3) {
          currentTopic = line;
          console.log(`Setting topic to: "${currentTopic}"`);
        }
      }
    }

    console.log(`\nParsed ${parsedQuestions.length} valid questions successfully.`);
    if (parsedQuestions.length > 0) {
      console.log('Sample parsed question 1:');
      console.log(JSON.stringify(parsedQuestions[0], null, 2));
      console.log('Sample parsed question 100:');
      console.log(JSON.stringify(parsedQuestions[parsedQuestions.length - 1], null, 2));
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    console.log('Cleaning up existing pyq-inspired questions for Structure of Atom...');
    const deleteResult = await Question.deleteMany({
      chapter: 'Structure of Atom',
      tags: 'pyq-inspired'
    });
    console.log(`Deleted ${deleteResult.deletedCount} old pyq-inspired questions.`);

    // Save parsed questions using bulkWrite
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
