require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');
const fs = require('fs');

// Override DNS to fix MongoDB Atlas connection issues
const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    const filePath = 'C:\\Users\\karan\\.gemini\\antigravity\\brain\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\scratch\\batch_improved.json';
    const rawData = fs.readFileSync(filePath, 'utf8');
    const improvedQuestions = JSON.parse(rawData);

    console.log(`Loaded ${improvedQuestions.length} improved questions from JSON.`);

    let updatedCount = 0;
    for (const res of improvedQuestions) {
      const isPYQ = res.isPYQ;
      
      const updateData = {
        questionText: res.questionText,
        'options.A.text': res.options.A,
        'options.B.text': res.options.B,
        'options.C.text': res.options.C,
        'options.D.text': res.options.D,
        correctAnswer: res.correctAnswer,
        'pyq.isPYQ': isPYQ,
        'pyq.tag': isPYQ ? 'PYQ' : 'Practice',
        'pyq.year': isPYQ ? 2023 : null,
        updatedAt: new Date()
      };

      try {
        const updated = await Question.findByIdAndUpdate(res.id, { $set: updateData }, { new: true });
        if (updated) {
          updatedCount++;
        } else {
          console.warn(`Question ID ${res.id} not found in database.`);
        }
      } catch (dbErr) {
        console.error(`Failed to update question ID ${res.id}:`, dbErr.message);
      }
    }

    console.log(`Successfully updated ${updatedCount} questions in the database using Antigravity AI!`);
  } catch (error) {
    console.error('Fatal error during update:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
