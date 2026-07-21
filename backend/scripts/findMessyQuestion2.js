require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    // Find question
    const q = await Question.findOne({ questionText: /Higher yield of NO/i });
    if (q) {
      console.log('FOUND QUESTION:');
      console.log(JSON.stringify(q, null, 2));
    } else {
      console.log('NOT FOUND');
    }
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
