require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Question = require('../models/Question');
const User = require('../models/User');

const clearDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🧹 Clearing questions collection...');
    const result = await Question.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} questions.`);

    console.log('🧹 Clearing attempts and other collections if any...');
    if (mongoose.connection.collections['tests']) {
      await mongoose.connection.collections['tests'].deleteMany({});
      console.log('✅ Cleared tests collection.');
    }
    if (mongoose.connection.collections['testattempts']) {
      await mongoose.connection.collections['testattempts'].deleteMany({});
      console.log('✅ Cleared testattempts collection.');
    }

    console.log('✨ Database cleared successfully! (Admin user was preserved for login)');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
