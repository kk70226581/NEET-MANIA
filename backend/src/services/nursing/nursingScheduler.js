const NursingScraperService = require('./nursingScraperService');
const { Chapter, Question, DuplicateQuestionRecord } = require('../../models/nursing');

class NursingScheduler {
  static init() {
    if (process.env.NURSING_SCHEDULER_ENABLED !== 'true') {
      console.log('B.Sc. Nursing schedulers are disabled. Enable only after configuring approved sources.');
      return;
    }

    setInterval(async () => {
      try {
        await NursingScraperService.collectOfficialContent();
      } catch (error) {
        console.error('Approved-source check failed:', error.message);
      }
    }, 24 * 60 * 60 * 1000);

    setInterval(async () => {
      try {
        await this.detectContentGaps();
        await this.detectDuplicatesInDB();
      } catch (error) {
        console.error('Nursing content audit failed:', error.message);
      }
    }, 7 * 24 * 60 * 60 * 1000);
  }

  static async detectContentGaps() {
    const chapters = await Chapter.find();
    for (const chapter of chapters) {
      const count = await Question.countDocuments({ chapter: chapter._id, lifecycleStatus: { $nin: ['REJECTED', 'ARCHIVED'] } });
      const target = chapter.targetQuestionCount || 200;
      if (count < target) {
        console.warn(`Content gap: chapter "${chapter.fullChapterName}" has ${count}/${target} questions.`);
      }
    }
  }

  static async detectDuplicatesInDB() {
    const questions = await Question.find({ isPublished: true }).select('_id questionId contentHash normalizedText');
    const byHash = new Map();
    for (const question of questions) {
      const key = question.contentHash || question.normalizedText;
      if (!key) continue;
      if (!byHash.has(key)) {
        byHash.set(key, question);
        continue;
      }
      const first = byHash.get(key);
      const [questionA, questionB] = [String(first._id), String(question._id)].sort();
      await DuplicateQuestionRecord.findOneAndUpdate(
        { questionA, questionB },
        { questionA, questionB, similarityType: 'exact_match', confidenceScore: 100, status: 'pending_resolution' },
        { upsert: true, setDefaultsOnInsert: true }
      );
    }
  }
}

module.exports = NursingScheduler;
