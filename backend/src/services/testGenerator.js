/**
 * Test Generator Service
 * Generates randomized tests based on filters and configurations
 */

const Question = require('../models/Question');
const { TEST_CONFIG, MARKING_SCHEME } = require('../config/constants');

class TestGenerator {
  /**
   * Generate random test based on filters
   * @param {Object} filters - Test filters and configuration
   * @returns {Promise<Array>} Array of question IDs
   */
  static async generateTest(filters) {
    try {
      console.log('🎲 Generating test with filters:', filters);

      const query = this.buildQuery(filters);
      
      // Get total matching questions
      const totalQuestions = await Question.countDocuments(query);
      
      if (totalQuestions < filters.questionCount) {
        throw new Error(`Only ${totalQuestions} questions available, but ${filters.questionCount} requested`);
      }

      // Prefer well-reviewed and high-weightage questions while keeping enough randomness.
      const questions = await Question.aggregate([
        { $match: query },
        {
          $addFields: {
            selectionScore: {
              $add: [
                { $multiply: [{ $ifNull: ['$qualityScore', 50] }, 0.4] },
                // Multiply weightage (1 to 10) by 8 to give it high preference in selection
                { $multiply: [{ $ifNull: ['$weightage', 1] }, 8] },
                { $multiply: [{ $rand: {} }, 30] }
              ]
            }
          }
        },
        { $sort: { selectionScore: -1 } },
        { $limit: Number(filters.questionCount) },
        { $project: { _id: 1 } }
      ]);

      console.log(`✅ Generated test with ${questions.length} questions`);
      const questionIds = questions.map(q => q._id);
      return this.shuffleArray(questionIds);

    } catch (error) {
      console.error('❌ Test Generation Error:', error);
      throw error;
    }
  }

  /**
   * Generate chapter-wise test
   * @param {string} subject - Subject name
   * @param {string} chapter - Chapter name
   * @param {number} questionCount - Number of questions
   * @param {string[]} difficulties - Difficulty levels
   * @returns {Promise<Array>} Question IDs
   */
  static async generateChapterTest(subject, chapter, questionCount = 30, difficulties = ['easy', 'medium', 'hard']) {
    const filters = {
      subject,
      chapter,
      questionCount,
      difficulty: difficulties,
      isPublished: true
    };

    return this.generateTest(filters);
  }

  /**
   * Generate topic-wise test
   * @param {string} subject - Subject name
   * @param {string} topic - Topic name
   * @param {number} questionCount - Number of questions
   * @returns {Promise<Array>} Question IDs
   */
  static async generateTopicTest(subject, topic, questionCount = 15, difficulty) {
    const filters = {
      subject,
      topic,
      questionCount,
      isPublished: true,
      difficulty
    };

    return this.generateTest(filters);
  }

  /**
   * Generate subject-wise test (NEET format: 60 questions, 90 minutes)
   * @param {string} subject - Subject name
   * @param {number} questionCount - Number of questions (default 60)
   * @returns {Promise<Array>} Question IDs
   */
  static async generateSubjectTest(subject, questionCount = 60, difficulty) {
    const filters = {
      subject,
      questionCount,
      isPublished: true,
      difficulty
    };

    return this.generateTest(filters);
  }

  /**
   * Generate full NEET mock test
   * @returns {Promise<Object>} Full mock test with subject distribution
   */
  static async generateFullMockTest() {
    try {
      console.log('🎲 Generating Full Mock Test (NEET Format)');

      // Physics: 45 questions
      const physicsQuestions = await this.generateTest({
        subject: 'physics',
        questionCount: 45,
        isPublished: true
      });

      // Chemistry: 45 questions
      const chemistryQuestions = await this.generateTest({
        subject: 'chemistry',
        questionCount: 45,
        isPublished: true
      });

      // Biology: 90 questions. Botany/Zoology can still be represented by chapter/topic tags.
      const biologyQuestions = await this.generateTest({
        subject: ['biology', 'botany', 'zoology'],
        questionCount: 90,
        isPublished: true
      });

      // Keep NTA-style subject sections together. Selection inside each subject
      // is already randomized by generateTest.
      const allQuestions = [
        ...physicsQuestions,
        ...chemistryQuestions,
        ...biologyQuestions
      ];

      return {
        totalQuestions: allQuestions.length,
        totalTime: 180, // minutes
        questions: allQuestions,
        distribution: {
          physics: physicsQuestions.length,
          chemistry: chemistryQuestions.length,
          biology: biologyQuestions.length
        }
      };

    } catch (error) {
      console.error('❌ Full Mock Generation Error:', error);
      throw error;
    }
  }

  /**
   * Generate previous year questions test
   * @param {string} subject - Subject name
   * @param {number} years - Number of years back
   * @param {number} questionCount - Number of questions
   * @returns {Promise<Array>} Question IDs
   */
  static async generatePYQTest(subject, years = 5, questionCount = 30) {
    const filters = {
      subject,
      source: 'pyq',
      questionCount,
      isPublished: true
    };

    return this.generateTest(filters);
  }

  /**
   * Build MongoDB query from filters
   * @param {Object} filters - Filter object
   * @returns {Object} MongoDB query
   */
  static buildQuery(filters) {
    const query = {};

    if (filters.subject) {
      query.subject = Array.isArray(filters.subject)
        ? { $in: filters.subject }
        : filters.subject;
    }
    if (filters.chapter) query.chapter = filters.chapter;
    if (filters.topic) query.topic = filters.topic;
    
    if (filters.difficulty) {
      if (Array.isArray(filters.difficulty)) {
        query.difficulty = { $in: filters.difficulty };
      } else {
        query.difficulty = filters.difficulty;
      }
    }

    if (filters.source) {
      if (Array.isArray(filters.source)) {
        query.source = { $in: filters.source };
      } else {
        query.source = filters.source;
      }
    }

    if (filters.isPublished !== undefined) query.isPublished = filters.isPublished;

    if (filters.type) query.type = filters.type;

    if (filters.bloomsLevel) query.bloomsLevel = { $in: filters.bloomsLevel };

    return query;
  }

  /**
   * Fisher-Yates shuffle algorithm
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled array
   */
  static shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Calculate test configuration
   * @param {string} testType - Type of test
   * @returns {Object} Test configuration
   */
  static getTestConfig(testType) {
    return TEST_CONFIG[String(testType || '').toUpperCase()] || { timeLimit: 45, questionCount: 30 };
  }

  /**
   * Calculate marking scheme
   * @param {number} correct - Number of correct answers
   * @param {number} wrong - Number of wrong answers
   * @returns {number} Total score
   */
  static calculateScore(correct, wrong) {
    return (correct * MARKING_SCHEME.CORRECT) + (wrong * MARKING_SCHEME.INCORRECT);
  }
}

module.exports = TestGenerator;
