require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Question = require('../models/nursing/Question');

const publishEligibleQuestions = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured');
  }

  await connectDB();

  const before = await Question.aggregate([
    {
      $group: {
        _id: {
          published: '$isPublished',
          status: '$lifecycleStatus'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.status': 1 } }
  ]);

  const result = await Question.updateMany(
    {
      $or: [
        { isPublished: { $ne: true } },
        { lifecycleStatus: { $ne: 'PUBLISHED' } }
      ],
      lifecycleStatus: { $nin: ['REJECTED', 'ARCHIVED'] }
    },
    {
      $set: {
        isPublished: true,
        isVerified: true,
        lifecycleStatus: 'PUBLISHED',
        reviewStatus: 'approved',
        verificationStatus: 'verified',
        publishedAt: new Date(),
        updatedAt: new Date(),
        'sourceMetadata.verificationStatus': 'verified'
      }
    }
  );

  const after = await Question.aggregate([
    {
      $group: {
        _id: {
          published: '$isPublished',
          status: '$lifecycleStatus'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.status': 1 } }
  ]);

  console.log(JSON.stringify({
    matched: result.matchedCount,
    modified: result.modifiedCount,
    before,
    after
  }, null, 2));
};

publishEligibleQuestions()
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  });
