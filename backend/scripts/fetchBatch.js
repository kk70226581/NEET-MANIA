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
    
    // Fetch 50 questions that contain "(Pg." or have not been updated recently
    const questions = await Question.find({
      $or: [
        { questionText: /\(Pg\./i },
        { questionText: /page/i }
      ]
    }).limit(50);
    
    const outputData = questions.map(q => ({
      id: q._id.toString(),
      questionText: q.questionText,
      options: {
        A: q.options?.A?.text,
        B: q.options?.B?.text,
        C: q.options?.C?.text,
        D: q.options?.D?.text
      },
      correctAnswer: q.correctAnswer,
      isPYQ: q.pyq?.isPYQ || false
    }));

    const outputPath = 'C:\\Users\\karan\\.gemini\\antigravity\\brain\\06514d81-d498-44fe-b71c-0999cfcf4fd7\\scratch\\batch_to_improve.json';
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`Successfully fetched ${questions.length} questions to ${outputPath}`);
  } catch (error) {
    console.error('Error fetching questions:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
