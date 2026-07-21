require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const MistakeNotebook = require('../src/models/MistakeNotebook');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB.');
    const mistakes = await MistakeNotebook.find().lean();
    console.log(`Total mistakes: ${mistakes.length}`);
    if (mistakes.length > 0) {
      console.log('First mistake document:', JSON.stringify(mistakes[0], null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}
run();
