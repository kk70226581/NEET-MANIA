/**
 * Monitor Question Generation Progress
 * Run periodically to check database status during bulk generation
 * 
 * Run: node src/scripts/monitorGeneration.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);

    const total = await Question.countDocuments();
    
    console.log(`📊 DATABASE STATUS`);
    console.log(`   Total questions: ${total}`);
    console.log('');

    // By subject
    const bySubject = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    console.log('📚 By Subject:');
    bySubject.forEach(s => {
      const pct = ((s.count / total) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(s.count / 50)) + '░'.repeat(Math.max(0, 20 - Math.floor(s.count / 50)));
      console.log(`   ${s._id.padEnd(12)} [${bar}] ${s.count.toString().padStart(4)} (${pct}%)`);
    });
    console.log('');

    // By chapter (top 20)
    const byChapter = await Question.aggregate([
      { $group: { _id: '$chapter', count: { $sum: 1 }, subject: { $first: '$subject' } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    console.log('🎯 Top 20 Chapters by Question Count:');
    byChapter.forEach((c, i) => {
      const icon = c.count >= 50 ? '✅' : c.count >= 40 ? '⚠️ ' : '📝';
      console.log(`   ${icon} ${(i+1).toString().padStart(2)}. [${c.subject}] ${c._id.padEnd(50)} ${c.count.toString().padStart(3)} questions`);
    });
    console.log('');

    // Chapters needing questions
    const needingQuestions = await Question.aggregate([
      { $group: { _id: '$chapter', count: { $sum: 1 }, subject: { $first: '$subject' } } },
      { $match: { count: { $lt: 50 } } },
      { $sort: { count: 1 } },
      { $limit: 15 }
    ]);

    console.log('🔄 Chapters Still Needing Questions (< 50):');
    needingQuestions.forEach((c, i) => {
      const need = 50 - c.count;
      const bar = '█'.repeat(c.count / 5) + '░'.repeat((50 - c.count) / 5);
      console.log(`   ${(i+1).toString().padStart(2)}. [${bar}] ${c.count}/50 (need ${need} more) — ${c._id}`);
    });
    console.log('');

    // By type
    const byType = await Question.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('📋 By Question Type:');
    byType.forEach(t => {
      const pct = ((t.count / total) * 100).toFixed(1);
      console.log(`   ${t._id.padEnd(20)} ${t.count.toString().padStart(4)} questions (${pct}%)`);
    });
    console.log('');

    // By difficulty
    const byDiff = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('📈 By Difficulty Level:');
    byDiff.forEach(d => {
      const pct = ((d.count / total) * 100).toFixed(1);
      console.log(`   ${d._id.padEnd(10)} ${d.count.toString().padStart(4)} questions (${pct}%)`);
    });
    console.log('');

    // AI Generated status
    const aiGen = await Question.countDocuments({ generatedByAI: true });
    const aiPct = ((aiGen / total) * 100).toFixed(1);
    console.log('🤖 AI Generation:');
    console.log(`   AI-generated: ${aiGen} (${aiPct}%)`);
    console.log(`   Manual: ${total - aiGen}`);
    console.log('');

    // Published status
    const published = await Question.countDocuments({ isPublished: true });
    const pubPct = ((published / total) * 100).toFixed(1);
    console.log('🔓 Publication Status:');
    console.log(`   Published: ${published} (${pubPct}%)`);
    console.log(`   Unpublished: ${total - published}`);
    console.log('');

    console.log('═════════════════════════════════════════════════════════');
    console.log(`✅ Check complete. Database contains ${total} questions.`);
    console.log('═════════════════════════════════════════════════════════\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
