require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');
    const chapters = await Question.distinct('chapter');
    console.log('Chapters present in database:', chapters);
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}
run();
