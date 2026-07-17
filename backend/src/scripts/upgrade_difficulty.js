const mongoose = require('mongoose');

async function upgradeDifficulty() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/neet_db');
    console.log('Connected to MongoDB');
    
    const Question = mongoose.model('Question', new mongoose.Schema({}, { strict: false }));
    
    // Update all questions that are not 'hard' to 'hard'
    const result = await Question.updateMany(
      { difficulty: { $ne: 'hard' } },
      { $set: { difficulty: 'hard' } }
    );
    
    console.log(`Successfully upgraded ${result.modifiedCount} questions to 'hard' difficulty.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error upgrading difficulty:', error);
    process.exit(1);
  }
}

upgradeDifficulty();
