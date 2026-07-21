require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    const questions = await Question.find({});
    console.log(`Found ${questions.length} total questions in database.`);

    let matchedCount = 0;
    const samples = [];

    for (const q of questions) {
      let matched = false;
      const text = q.questionText || '';
      
      let optionText = '';
      if (q.options) {
        optionText = [q.options.A?.text, q.options.B?.text, q.options.C?.text, q.options.D?.text].filter(Boolean).join(' ');
      }

      const combinedText = text + ' | ' + optionText;

      if (combinedText.includes('(Pg') || combinedText.includes('(Page') || /Pg\d+/i.test(combinedText)) {
        matched = true;
      }

      if (matched) {
        matchedCount++;
        if (samples.length < 15) {
          samples.push({
            id: q._id,
            text: q.questionText,
            options: q.options
          });
        }
      }
    }

    console.log(`\nMatched ${matchedCount} questions with potential page patterns.`);
    console.log('\nSamples:');
    console.log(JSON.stringify(samples, null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
