const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const dnsServers = process.env.DNS_SERVERS?.split(',').map(server => server.trim()).filter(Boolean);
    if (dnsServers && dnsServers.length) {
      dns.setServers(dnsServers);
      console.log(`🔎 Using custom DNS servers: ${dnsServers.join(', ')}`);
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    console.error('Make sure MONGODB_URI is set in your .env file');
    // Exit process with failure code
    process.exit(1);
  }
};

module.exports = connectDB;
