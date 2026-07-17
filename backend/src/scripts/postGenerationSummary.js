/**
 * Post-Generation Summary Report
 * Run after bulk generation completes to get final statistics
 * 
 * Run: node src/scripts/postGenerationSummary.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');

const TIMESTAMP = new Date().toLocaleString();

async function run() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         NEET QUESTION DATABASE - GENERATION REPORT         ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log(`Generated: ${TIMESTAMP}\n`);

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!\n');

    // ─── Overall Statistics ──────────────────────────────────────────────────
    const totalQuestions = await Question.countDocuments();
    const aiGeneratedCount = await Question.countDocuments({ generatedByAI: true });
    const publishedCount = await Question.countDocuments({ isPublished: true });
    const verifiedCount = await Question.countDocuments({ isVerified: true });

    console.log('═══ OVERALL STATISTICS ═══\n');
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`AI Generated: ${aiGeneratedCount} (${((aiGeneratedCount/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Published: ${publishedCount} (${((publishedCount/totalQuestions)*100).toFixed(1)}%)`);
    console.log(`Verified: ${verifiedCount} (${((verifiedCount/totalQuestions)*100).toFixed(1)}%)\n`);

    // ─── By Subject ──────────────────────────────────────────────────────────
    const bySubject = await Question.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 }, avg_quality: { $avg: '$qualityScore' } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('═══ BY SUBJECT ═══\n');
    bySubject.forEach(s => {
      const pct = ((s.count / totalQuestions) * 100).toFixed(1);
      console.log(`  ${s._id.padEnd(12)} : ${s.count.toString().padStart(5)} questions (${pct.padStart(5)}%) | Avg Quality: ${s.avg_quality?.toFixed(1) || 'N/A'}/100`);
    });
    console.log('');

    // ─── By Type ────────────────────────────────────────────────────────────
    const byType = await Question.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('═══ BY QUESTION TYPE ═══\n');
    byType.forEach(t => {
      const pct = ((t.count / totalQuestions) * 100).toFixed(1);
      const typeLabel = {
        'mcq': 'Multiple Choice',
        'match_following': 'Match Following',
        'assertion_reason': 'Assertion-Reason',
        'statement_based': 'Statement Based',
        'diagram_based': 'Diagram Based'
      }[t._id] || t._id;
      console.log(`  ${typeLabel.padEnd(20)} : ${t.count.toString().padStart(5)} questions (${pct.padStart(5)}%)`);
    });
    console.log('');

    // ─── By Difficulty ──────────────────────────────────────────────────────
    const byDifficulty = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('═══ BY DIFFICULTY LEVEL ═══\n');
    byDifficulty.forEach(d => {
      const pct = ((d.count / totalQuestions) * 100).toFixed(1);
      console.log(`  ${d._id.padEnd(10)} : ${d.count.toString().padStart(5)} questions (${pct.padStart(5)}%)`);
    });
    console.log('');

    // ─── Top 15 Chapters ────────────────────────────────────────────────────
    const topChapters = await Question.aggregate([
      { $group: { _id: '$chapter', count: { $sum: 1 }, subject: { $first: '$subject' } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    console.log('═══ TOP 15 CHAPTERS BY QUESTION COUNT ═══\n');
    topChapters.forEach((c, i) => {
      const pct = ((c.count / totalQuestions) * 100).toFixed(1);
      const emoji = c.count >= 50 ? '✅' : c.count >= 40 ? '⚠️ ' : '📝';
      console.log(`  ${emoji} ${(i+1).toString().padStart(2)}. [${c.subject.toUpperCase().padEnd(8)}] ${c._id.padEnd(50)} ${c.count.toString().padStart(3)} (${pct.padStart(5)}%)`);
    });
    console.log('');

    // ─── Chapters Below Target ──────────────────────────────────────────────
    const belowTarget = await Question.aggregate([
      { $group: { _id: '$chapter', count: { $sum: 1 }, subject: { $first: '$subject' } } },
      { $match: { count: { $lt: 50 } } },
      { $sort: { count: 1 } }
    ]);

    if (belowTarget.length > 0) {
      console.log(`═══ CHAPTERS BELOW TARGET (< 50 QUESTIONS) ═══\n`);
      belowTarget.forEach((c, i) => {
        const need = 50 - c.count;
        const progress = Math.round((c.count / 50) * 20);
        const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
        console.log(`  ${(i+1).toString().padStart(2)}. [${c.subject.toUpperCase().padEnd(8)}] ${c._id.padEnd(50)} [${bar}] ${c.count}/50 (need ${need})`);
      });
      console.log('');
    } else {
      console.log('✅ ALL CHAPTERS HAVE 50+ QUESTIONS!\n');
    }

    // ─── Quality Score Distribution ─────────────────────────────────────────
    const qualityStats = await Question.aggregate([
      { $group: { 
        _id: null, 
        min_score: { $min: '$qualityScore' },
        max_score: { $max: '$qualityScore' },
        avg_score: { $avg: '$qualityScore' },
        median_score: { $avg: '$qualityScore' } // Simplified
      }}
    ]);

    if (qualityStats[0]) {
      console.log('═══ QUALITY SCORES ═══\n');
      console.log(`  Average Quality Score: ${qualityStats[0].avg_score?.toFixed(2) || 'N/A'}/100`);
      console.log(`  Minimum Score: ${qualityStats[0].min_score || 'N/A'}`);
      console.log(`  Maximum Score: ${qualityStats[0].max_score || 'N/A'}\n`);
    }

    // ─── Source Distribution ────────────────────────────────────────────────
    const bySource = await Question.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('═══ BY SOURCE ═══\n');
    bySource.forEach(s => {
      const pct = ((s.count / totalQuestions) * 100).toFixed(1);
      console.log(`  ${s._id.padEnd(12)} : ${s.count.toString().padStart(5)} questions (${pct.padStart(5)}%)`);
    });
    console.log('');

    // ─── Recommendation ─────────────────────────────────────────────────────
    console.log('═══ RECOMMENDATIONS ═══\n');
    
    let recommendations = [];
    
    if (belowTarget.length > 0) {
      recommendations.push(`📝 Run generation again to reach 50+ questions for ${belowTarget.length} chapters`);
    } else {
      recommendations.push(`✅ All chapters have sufficient questions`);
    }

    if (aiGeneratedCount < totalQuestions * 0.3) {
      recommendations.push(`⚠️ Consider generating more AI questions for better coverage`);
    }

    if (publishedCount < totalQuestions * 0.95) {
      recommendations.push(`📢 Publish more questions: ${totalQuestions - publishedCount} unpublished`);
    }

    if (verifiedCount < totalQuestions * 0.95) {
      recommendations.push(`✔️ Verify more questions: ${totalQuestions - verifiedCount} unverified`);
    }

    recommendations.forEach(r => console.log(`  • ${r}`));
    console.log('');

    // ─── Final Summary ──────────────────────────────────────────────────────
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              DATABASE GENERATION SUCCESSFUL! ✅             ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║ Total Questions: ${totalQuestions.toString().padEnd(48)}║`);
    console.log(`║ AI Generated: ${aiGeneratedCount.toString().padEnd(51)}║`);
    console.log(`║ Published: ${publishedCount.toString().padEnd(53)}║`);
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log('║ Next Steps:                                                ║');
    console.log('║  1. View questions in Dashboard                           ║');
    console.log('║  2. Create a test with these questions                    ║');
    console.log('║  3. Share with students                                   ║');
    console.log('║  4. Monitor student performance                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

run();
