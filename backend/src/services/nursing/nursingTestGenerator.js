const { Question, Exam } = require('../../models/nursing');

class NursingTestGenerator {
  static async generateTest({ type, chapter, topic, subject, questionCount, isPublished = true }) {
    const query = { isPublished, lifecycleStatus: { $nin: ['REJECTED', 'ARCHIVED'] } };
    if (chapter) query.chapter = chapter;
    if (topic) query.topic = topic;
    if (subject) query.subject = subject;

    const presets = {
      'Topic Quiz': { total: 10, easy: 5, medium: 5, hard: 0 },
      'Chapter Foundation Test': { total: 20, easy: 12, medium: 6, hard: 2 },
      'Chapter Standard Test': { total: 30, easy: 9, medium: 15, hard: 6 },
      'Chapter Mastery Test': { total: 50, easy: 10, medium: 25, hard: 15 }
    };
    const total = Math.max(1, Number(questionCount) || presets[type]?.total || 20);
    const blueprint = presets[type] || {
      total,
      easy: Math.round(total * 0.3),
      medium: Math.round(total * 0.5),
      hard: total - Math.round(total * 0.3) - Math.round(total * 0.5)
    };

    const [easy, medium, hard] = await Promise.all([
      this.fetchQuestions({ ...query, difficulty: 'easy' }, blueprint.easy),
      this.fetchQuestions({ ...query, difficulty: 'medium' }, blueprint.medium),
      this.fetchQuestions({ ...query, difficulty: 'hard' }, blueprint.hard)
    ]);
    let questions = [...easy, ...medium, ...hard];
    if (questions.length < total) {
      const extra = await this.fetchQuestions({ ...query, _id: { $nin: questions.map(question => question._id) } }, total - questions.length);
      questions = [...questions, ...extra];
    }
    return this.shuffle(questions.map(question => question._id)).slice(0, total);
  }

  static async generateFromBlueprint(blueprint) {
    const exam = await Exam.findById(blueprint.exam);
    if (!exam) throw new Error('Blueprint exam not found.');
    let ids = [];
    for (const allocation of blueprint.subjectDistribution || []) {
      const selected = await this.generateTest({
        subject: allocation.subject,
        questionCount: allocation.count,
        isPublished: true
      });
      ids.push(...selected);
    }
    if (ids.length < blueprint.totalQuestions) {
      const extras = await this.fetchQuestions({
        isPublished: true,
        lifecycleStatus: { $nin: ['REJECTED', 'ARCHIVED'] },
        _id: { $nin: ids }
      }, blueprint.totalQuestions - ids.length);
      ids.push(...extras.map(question => question._id));
    }
    const correctMarks = exam.negativeMarking?.correctAnswers || 1;
    return {
      questions: this.shuffle(ids).slice(0, blueprint.totalQuestions),
      totalQuestions: Math.min(ids.length, blueprint.totalQuestions),
      totalMarks: Math.min(ids.length, blueprint.totalQuestions) * correctMarks,
      duration: exam.duration
    };
  }

  static async fetchQuestions(query, limit) {
    if (limit <= 0) return [];
    return Question.aggregate([{ $match: query }, { $sample: { size: Number(limit) } }]);
  }

  static shuffle(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [result[index], result[swap]] = [result[swap], result[index]];
    }
    return result;
  }
}

module.exports = NursingTestGenerator;
