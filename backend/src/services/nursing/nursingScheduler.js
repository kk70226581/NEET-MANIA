const NursingScraperService = require('./nursingScraperService');
const NursingQuestionGenerator = require('./nursingQuestionGenerator');
const NursingValidationPipeline = require('./nursingValidationPipeline');
const { Chapter, Question, DuplicateQuestionRecord } = require('../../models/nursing');

class NursingScheduler {
  static init() {
    console.log('⏰ Initializing B.Sc. Nursing background schedulers...');

    // 1. Check exam notifications & application dates once every day
    setInterval(async () => {
      try {
        console.log('⏰ Running scheduled job: Exam Notifications & Dates Scan');
        await NursingScraperService.collectOfficialContent();
      } catch (err) {
        console.error('Job scan failed:', err);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

    // 2. Content gap checking & generation scan once every week
    setInterval(async () => {
      try {
        console.log('⏰ Running scheduled job: Content Gap Detection');
        await this.detectAndFillContentGaps();
      } catch (err) {
        console.error('Content gap job failed:', err);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    // 3. Duplicate checks scan once every week
    setInterval(async () => {
      try {
        console.log('⏰ Running scheduled job: Duplicate Detection Scan');
        await this.detectDuplicatesInDB();
      } catch (err) {
        console.error('Duplicate detection scan failed:', err);
      }
    }, 7 * 24 * 60 * 60 * 1000); // 7 days
  }

  /**
   * Scan syllabus chapters to verify question counts.
   * If a chapter falls below the target of 100 questions, flag it or trigger AI-generation.
   */
  static async detectAndFillContentGaps() {
    const chapters = await Chapter.find();
    console.log(`Gap Detector: Scanning ${chapters.length} chapters...`);

    for (const chapter of chapters) {
      const count = await Question.countDocuments({ chapter: chapter._id });
      if (count < 100) {
        console.warn(`⚠️ Content Gap: Chapter "${chapter.name}" has only ${count}/100 questions. Queueing generation...`);
        
        // Find an existing question in the chapter to use as seed/inspiration
        const seedQuestion = await Question.findOne({ chapter: chapter._id });
        if (seedQuestion) {
          try {
            // Generate a fresh question
            const newQ = await NursingQuestionGenerator.generateQuestion(seedQuestion, 'medium');
            const savedQ = await Question.create(newQ);
            
            // Validate the generated question
            await NursingValidationPipeline.validateQuestion(savedQ);
          } catch (genErr) {
            console.error(`Failed to automatically fill gap for chapter "${chapter.name}":`, genErr.message);
          }
        }
      }
    }
  }

  /**
   * Scans questions in the database and identifies exact or near-duplicate texts.
   */
  static async detectDuplicatesInDB() {
    const questions = await Question.find({ isPublished: true });
    
    for (let i = 0; i < questions.length; i++) {
      for (let j = i + 1; j < questions.length; j++) {
        const textA = questions[i].questionText.toLowerCase().trim();
        const textB = questions[j].questionText.toLowerCase().trim();

        if (textA === textB) {
          const exists = await DuplicateQuestionRecord.findOne({
            $or: [
              { questionA: questions[i]._id, questionB: questions[j]._id },
              { questionA: questions[j]._id, questionB: questions[i]._id }
            ]
          });

          if (!exists) {
            await DuplicateQuestionRecord.create({
              questionA: questions[i]._id,
              questionB: questions[j]._id,
              similarityType: 'exact_match',
              confidenceScore: 100
            });
            console.log(`⚠️ Flagged duplicate questions: [${questions[i].questionId}] & [${questions[j].questionId}]`);
          }
        }
      }
    }
  }
}

module.exports = NursingScheduler;
