const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://neetadmin:Neet%402026@cluster0.dbwnd.mongodb.net/neet_platform?retryWrites=true&w=majority&appName=Cluster0';

const questionSchema = new mongoose.Schema({
  text: String,
  options: [String],
  correctOption: Number,
  explanation: String,
  subject: String,
  chapter: String,
  difficulty: String,
  source: String,
  tags: [String]
});

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { family: 4 });
    const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
    
    const total = await Question.countDocuments();
    const neet = await Question.countDocuments({ tags: /NEET/i, source: /PYQ/i });
    const jee = await Question.countDocuments({ tags: /JEE/i, source: /PYQ/i });
    const custom = await Question.countDocuments({ source: 'custom' });
    const generalPyq = await Question.countDocuments({ source: 'PYQ' });
    const pyqRegex = await Question.countDocuments({ source: /PYQ/i });

    console.log(`Total: ${total}`);
    console.log(`NEET PYQs: ${neet}`);
    console.log(`JEE PYQs: ${jee}`);
    console.log(`Custom: ${custom}`);
    console.log(`General PYQs (source='PYQ'): ${generalPyq}`);
    console.log(`Regex PYQs (source=/PYQ/i): ${pyqRegex}`);

    // Let's get a sample of PYQ sources and tags
    const pyqs = await Question.find({ source: /pyq/i }).limit(5);
    console.log("Sample PYQs:", JSON.stringify(pyqs.map(q => ({ source: q.source, tags: q.tags, text: q.text.substring(0, 50) })), null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    mongoose.disconnect();
  }
}

run();
