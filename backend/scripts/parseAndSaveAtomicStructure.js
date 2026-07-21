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
    const rawFilePath = path.join(__dirname, 'atomic_structure_raw.txt');
    const content = fs.readFileSync(rawFilePath, 'utf8');
    
    // Split blocks by blank lines
    const blocks = content.split(/\r?\n\r?\n/);
    console.log(`Found ${blocks.length} raw blocks in text file.`);

    const parsedQuestions = [];
    
    for (let index = 0; index < blocks.length; index++) {
      const block = blocks[index];
      const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length < 3) continue;

      let questionText = '';
      let options = { A: '', B: '', C: '', D: '' };
      let correctAnswer = '';
      let typeStr = '';
      let levelStr = '';
      let ncertTopic = '';
      let explanation = '';

      let foundMetadata = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Parse metadata line
        if (line.includes('Answer:') && line.includes('|')) {
          foundMetadata = true;
          const parts = line.split('|').map(p => p.trim());
          for (const part of parts) {
            if (part.startsWith('Answer:')) {
              correctAnswer = part.replace('Answer:', '').trim();
            } else if (part.startsWith('Type:')) {
              typeStr = part.replace('Type:', '').trim();
            } else if (part.startsWith('Level:')) {
              levelStr = part.replace('Level:', '').trim();
            } else if (part.startsWith('NCERT topic:')) {
              ncertTopic = part.replace('NCERT topic:', '').trim();
            }
          }
          continue;
        }

        // Parse explanation line
        if (line.startsWith('Explanation:')) {
          explanation = line.replace('Explanation:', '').trim();
          continue;
        }

        // Parse options lines
        if (line.startsWith('A.')) {
          options.A = line.substring(2).trim();
          continue;
        }
        if (line.startsWith('B.')) {
          options.B = line.substring(2).trim();
          continue;
        }
        if (line.startsWith('C.')) {
          options.C = line.substring(2).trim();
          continue;
        }
        if (line.startsWith('D.')) {
          options.D = line.substring(2).trim();
          continue;
        }

        // Parse question text (if it's not any of the above metadata or options)
        if (questionText) {
          questionText += '\n' + line;
        } else {
          // Strip leading number index (e.g. "152. ")
          questionText = line.replace(/^\d+\.\s*/, '');
        }
      }

      // If we didn't find the metadata line or options, this is likely header info, skip it
      if (!foundMetadata || !options.A || !options.B || !options.C || !options.D || !correctAnswer) {
        console.log(`Skipping non-question block ${index + 1}. First line: "${lines[0]}"`);
        continue;
      }

      const isAssertionReason = typeStr.toLowerCase().includes('assertion');
      const difficulty = levelStr.toLowerCase().includes('jee') ? 'hard' : 'medium';

      parsedQuestions.push({
        questionId: `atomic-structure-practice-${parsedQuestions.length + 1}-${Math.random().toString(36).substring(2, 7)}`,
        questionText: questionText.trim(),
        options: {
          A: { text: options.A },
          B: { text: options.B },
          C: { text: options.C },
          D: { text: options.D }
        },
        correctAnswer: correctAnswer,
        subject: 'chemistry',
        chapter: 'Structure of Atom',
        topic: ncertTopic || 'Atomic Structure',
        difficulty: difficulty,
        explanation: { text: explanation || 'Refer to NCERT Structure of Atom.' },
        assertion: {
          isAssertionReason: isAssertionReason
        },
        pyq: {
          isPYQ: false,
          tag: 'Practice',
          year: null
        },
        source: 'custom',
        tags: ['practice', 'atomic-structure', 'chemistry', 'ncert-aligned'],
        isPublished: true,
        isVerified: true
      });
    }

    console.log(`\nParsed ${parsedQuestions.length} valid questions successfully.`);
    if (parsedQuestions.length > 0) {
      console.log('Sample parsed question:');
      console.log(JSON.stringify(parsedQuestions[0], null, 2));
      console.log('Last parsed question:');
      console.log(JSON.stringify(parsedQuestions[parsedQuestions.length - 1], null, 2));
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

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
