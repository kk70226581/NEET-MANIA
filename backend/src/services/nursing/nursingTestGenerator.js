const Question = require('../../models/Question');
const Exam = require('../../models/nursing/Exam');

class NursingTestGenerator {
  /**
   * Generates a test based on the specific nursing rules (Topic, Foundation, Standard, Mastery)
   */
  static async generateTest({ type, chapter, topic, subject }) {
    try {
      console.log(`🎲 Generating nursing test of type: ${type}`);
      const query = { isPublished: true, subject: subject || 'Nursing' };
      if (chapter) query.chapter = chapter;
      if (topic) query.topic = topic;

      let blueprint = {};

      switch(type) {
        case 'Topic Quiz':
          blueprint = { total: 10, easy: 5, medium: 5, hard: 0 };
          break;
        case 'Chapter Foundation Test':
          blueprint = { total: 20, easy: 12, medium: 6, hard: 2 };
          break;
        case 'Chapter Standard Test':
          blueprint = { total: 30, easy: 9, medium: 15, hard: 6 };
          break;
        case 'Chapter Mastery Test':
          blueprint = { total: 50, easy: 10, medium: 25, hard: 15 };
          break;
        default:
          blueprint = { total: 20, easy: 10, medium: 10, hard: 0 };
      }

      const [easyQ, mediumQ, hardQ] = await Promise.all([
        this.fetchQuestions({ ...query, difficulty: 'easy' }, blueprint.easy),
        this.fetchQuestions({ ...query, difficulty: 'medium' }, blueprint.medium),
        this.fetchQuestions({ ...query, difficulty: 'hard' }, blueprint.hard)
      ]);

      let questions = [...easyQ, ...mediumQ, ...hardQ];

      // Fallback if exact difficulty distribution not met
      if (questions.length < blueprint.total) {
        const selectedIds = questions.map(q => q._id);
        const remaining = blueprint.total - questions.length;
        const extraQs = await this.fetchQuestions(
          { ...query, _id: { $nin: selectedIds } },
          remaining
        );
        questions = [...questions, ...extraQs];
      }

      return this.shuffle(questions.map(q => q._id));
    } catch (error) {
      console.error('❌ Nursing Test Generator Error:', error);
      throw error;
    }
  }

  static async fetchQuestions(query, limitVal) {
    if (limitVal <= 0) return [];
    return Question.aggregate([
      { $match: query },
      { $sample: { size: Number(limitVal) } }
    ]);
  }

  static shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

module.exports = NursingTestGenerator;
