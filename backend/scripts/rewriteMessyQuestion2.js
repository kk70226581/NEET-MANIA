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

    const result = await Question.updateOne(
      { _id: new mongoose.Types.ObjectId("6a5c5ea14549ba9646bf0b66") },
      {
        $set: {
          questionText: "A higher yield of NO in the chemical equilibrium reaction:\n$$\\text{N}_2\\text{(g)} + \\text{O}_2\\text{(g)} \\rightleftharpoons 2\\text{NO(g)} \\quad [\\Delta H = +180.7\\text{ kJ mol}^{-1}]$$\n\ncan be obtained under which of the following conditions?\n\nA. Higher temperature\nB. Lower temperature\nC. Higher concentration of $\\text{N}_2$\nD. Higher concentration of $\\text{O}_2$\n\nChoose the correct answer from the options given below:",
          options: {
            A: { text: "A, D only" },
            B: { text: "B, C only" },
            C: { text: "B, C, D only" },
            D: { text: "A, C, D only" }
          },
          correctAnswer: "D",
          chapter: "Equilibrium",
          topic: "Chemical Equilibrium",
          tags: ["verified-pyq", "neet-ug", "2025", "chemistry", "equilibrium"],
          updatedAt: new Date()
        }
      }
    );

    console.log('Update result:', result);
  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
