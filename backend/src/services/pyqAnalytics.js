const crypto = require('crypto');
const Question = require('../models/Question');
const PyqAnalyticsSnapshot = require('../models/PyqAnalyticsSnapshot');

const DISCLAIMER = 'Historical trends are provided for preparation guidance only. They do not guarantee the questions or weightage of future NEET examinations.';
const difficultyValue = { easy: 1, medium: 2, hard: 3 };

const yearsConsecutive = (years) => {
  const values = [...new Set(years)].sort((a, b) => b - a);
  let best = 0;
  let run = 0;
  let previous;
  values.forEach((year) => {
    run = previous === year + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = year;
  });
  return best;
};

const priorityLabel = (score) => score >= 75 ? 'Very High Priority' : score >= 58 ? 'High Priority' : score >= 38 ? 'Medium Priority' : 'Low Priority';

function summarise(items, key, allYears) {
  const groups = new Map();
  items.forEach((question) => {
    const name = question[key] || 'Unclassified';
    const groupKey = `${question.subject}|${name}`;
    if (!groups.has(groupKey)) groups.set(groupKey, { name, subject: question.subject, items: [] });
    groups.get(groupKey).items.push(question);
  });
  const maxCount = Math.max(1, ...[...groups.values()].map((group) => group.items.length));
  const latestYear = Math.max(...allYears);

  return [...groups.values()].map((group) => {
    const yearCounts = Object.fromEntries(allYears.map((year) => [year, 0]));
    group.items.forEach((question) => { yearCounts[question.sourceDetails?.year] = (yearCounts[question.sourceDetails?.year] || 0) + 1; });
    const recent = group.items.filter((question) => question.sourceDetails?.year >= latestYear - 2).length;
    const earlier = group.items.length - recent;
    const accuracyValues = group.items.map((question) => question.statistics?.accuracy).filter(Number.isFinite);
    const averageAccuracy = accuracyValues.length ? accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length : 0;
    const averageDifficulty = group.items.reduce((sum, question) => sum + (difficultyValue[question.difficulty] || 2), 0) / group.items.length;
    const repeated = group.items.filter((question) => question.pyqDetails?.repeatedConcept).length;
    const ncert = group.items.filter((question) => question.pyqDetails?.ncertBased).length;
    const years = group.items.map((question) => question.sourceDetails?.year).filter(Boolean);
    const consecutive = yearsConsecutive(years);
    const recentShare = recent / Math.max(1, group.items.length);
    const priority = Math.round(
      (group.items.length / maxCount) * 25 +
      recentShare * 20 +
      Math.min(group.items.length / Math.max(1, allYears.length * 2), 1) * 15 +
      Math.min(consecutive / 5, 1) * 10 +
      (ncert / group.items.length) * 10 +
      (1 - Math.min(averageAccuracy, 100) / 100) * 8 +
      (repeated / group.items.length) * 7 + 5
    );
    const recentRate = recent / 3;
    const earlierRate = earlier / Math.max(1, allYears.length - 3);
    const trend = recentRate > earlierRate * 1.25 ? 'Rising' : recentRate < earlierRate * 0.75 ? 'Falling' : consecutive >= 3 ? 'Stable' : 'Irregular';
    return {
      ...group,
      items: undefined,
      totalQuestions: group.items.length,
      totalMarks: group.items.reduce((sum, question) => sum + (question.pyqDetails?.marks || 4), 0),
      averagePerYear: Number((group.items.length / Math.max(1, allYears.length)).toFixed(1)),
      averageAccuracy: Number(averageAccuracy.toFixed(1)),
      averageDifficulty: Number(averageDifficulty.toFixed(2)),
      averageTime: Math.round(group.items.reduce((sum, question) => sum + (question.statistics?.averageTimeSpent || question.estimatedTime || 60), 0) / group.items.length),
      lastAppeared: Math.max(...years),
      consecutiveAppearances: consecutive,
      repeatedConcepts: repeated,
      ncertBased: ncert,
      trend,
      priorityScore: Math.min(100, priority),
      priority: priorityLabel(priority),
      priorityReason: `${group.items.length} appearances, ${recent} in the latest three years, ${ncert} NCERT-linked, and ${averageAccuracy.toFixed(0)}% observed accuracy.`,
      yearCounts,
      difficulty: {
        easy: group.items.filter((question) => question.difficulty === 'easy').length,
        medium: group.items.filter((question) => question.difficulty === 'medium').length,
        hard: group.items.filter((question) => question.difficulty === 'hard').length
      }
    };
  }).sort((a, b) => b.priorityScore - a.priorityScore || b.totalQuestions - a.totalQuestions);
}

async function calculateTrends(filters = {}) {
  const match = {
    'pyq.isPYQ': true,
    isPublished: true,
    isVerified: true,
    'pyqDetails.legalStatus': { $in: ['user_provided', 'licensed', 'original_sample'] }
  };
  if (filters.subject) match.subject = filters.subject === 'biology' ? { $in: ['biology', 'botany', 'zoology'] } : filters.subject;
  if (filters.classLevel) match['pyqDetails.classLevel'] = String(filters.classLevel);
  if (filters.questionType) match.type = filters.questionType;
  const questions = await Question.find(match).select('subject chapter topic difficulty type sourceDetails.year pyqDetails statistics estimatedTime').lean();
  const years = [...new Set(questions.map((question) => question.sourceDetails?.year).filter(Boolean))].sort((a, b) => a - b);
  const chapterAnalysis = summarise(questions, 'chapter', years);
  const topicAnalysis = summarise(questions, 'topic', years);
  const subjectYear = {};
  const classYear = {};
  questions.forEach((question) => {
    const year = question.sourceDetails?.year;
    if (!year) return;
    subjectYear[year] ||= {};
    subjectYear[year][question.subject] = (subjectYear[year][question.subject] || 0) + 1;
    classYear[year] ||= { '11': 0, '12': 0 };
    classYear[year][question.pyqDetails?.classLevel] = (classYear[year][question.pyqDetails?.classLevel] || 0) + 1;
  });
  return {
    disclaimer: DISCLAIMER,
    generatedAt: new Date(),
    years,
    totals: {
      questions: questions.length,
      years: years.length,
      chapters: chapterAnalysis.length,
      topics: topicAnalysis.length,
      ncertBased: questions.filter((question) => question.pyqDetails?.ncertBased).length,
      repeated: questions.filter((question) => question.pyqDetails?.repeatedConcept).length
    },
    subjectYear,
    classYear,
    chapterAnalysis,
    topicAnalysis,
    heatmap: chapterAnalysis.map(({ name, subject, yearCounts, totalQuestions }) => ({ name, subject, totalQuestions, years: yearCounts }))
  };
}

async function getTrends(filters = {}, refresh = false) {
  const cacheKey = `trends:${crypto.createHash('sha1').update(JSON.stringify(filters)).digest('hex')}`;
  if (!refresh) {
    const cached = await PyqAnalyticsSnapshot.findOne({ cacheKey, computedAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) } }).lean();
    if (cached) return { ...cached.payload, cached: true };
  }
  const payload = await calculateTrends(filters);
  await PyqAnalyticsSnapshot.findOneAndUpdate({ cacheKey }, { cacheKey, scope: filters.subject ? 'subject' : 'global', filters, payload, computedAt: new Date() }, { upsert: true, new: true });
  return { ...payload, cached: false };
}

module.exports = { DISCLAIMER, calculateTrends, getTrends, priorityLabel };
