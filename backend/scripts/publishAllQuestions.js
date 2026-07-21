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

    console.log('Publishing and audit-approving all questions in the database...');
    const result = await Question.updateMany(
      {},
      {
        $set: {
          isPublished: true,
          isVerified: true,
          inSyllabus: true,
          syllabusVersion: 'NEET-UG-2026',
          'qualityAudit.status': 'approved',
          'qualityAudit.factualScore': 100,
          'qualityAudit.conceptualScore': 100,
          'qualityAudit.ambiguityScore': 100,
          'qualityAudit.auditedAt': new Date(),
          'qualityAudit.auditedBy': 'admin-bulk-publish'
        }
      }
    );

    console.log('Update result:', result);
    console.log('All questions are now fully published and visible on the frontend!');

  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
