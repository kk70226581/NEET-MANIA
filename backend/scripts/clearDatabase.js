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

    console.log('Wiping all questions from the database...');
    const result = await Question.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} questions.`);
    console.log('Database is now clean and empty!');

  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
