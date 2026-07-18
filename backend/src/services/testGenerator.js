const Question = require('../models/Question');
const { MARKING_SCHEME, TEST_CONFIG } = require('../config/constants');

const VERIFIED_QUESTION_FILTER = {
  isPublished: true,
  inSyllabus: true,
  syllabusVersion: 'NEET-UG-2026',
  'qualityAudit.status': 'approved'
};

// Chapter weightage mapping (1-10) based on NEET pattern
const CHAPTER_WEIGHTAGES = {
  // Physics
  'Current Electricity': 9,
  'System of Particles and Rotational Motion': 8,
  'Semiconductor Electronics': 8,
  'Laws of Motion': 7,
  'Thermodynamics': 7,
  'Electrostatic Potential and Capacitance': 6,
  'Ray Optics and Optical Instruments': 9,
  'Wave Optics': 8,
  'Motion in a Straight Line': 5,
  'Motion in a Plane': 5,
  'Work Energy and Power': 6,
  'Gravitation': 5,
  
  // Chemistry
  'Chemical Bonding and Molecular Structure': 9,
  'The p-Block Elements': 8,
  'Coordination Compounds': 8,
  'Organic Chemistry - Some Basic Principles and Techniques': 9,
  'Some Basic Concepts of Chemistry': 6,
  'Structure of Atom': 6,
  'Equilibrium': 8,
  'Hydrocarbons': 7,
  
  // Biology
  'Genetics': 10,
  'Cell Structure and Function': 9,
  'Human Physiology': 10,
  'Plant Physiology': 8,
  'Ecology': 9,
  'Molecular Basis of Inheritance': 10,
  'Evolution': 7,
  'Reproduction in Humans': 8
};

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

      // Perform difficulty balancing if not explicitly set
      // target: 30% easy, 50% medium, 20% hard
      if (!filters.difficulty || (Array.isArray(filters.difficulty) && filters.difficulty.length > 1)) {
        const count = filters.questionCount || 30;
        const targetEasy = 0; // Removed easy questions
        const targetHard = Math.round(count * 0.6); // 60% hard for high conceptual level
        const targetMedium = count - targetHard;

        const [easyQ, mediumQ, hardQ] = await Promise.all([
          this.fetchQuestionsByDifficulty(query, 'easy', targetEasy),
          this.fetchQuestionsByDifficulty(query, 'medium', targetMedium),
          this.fetchQuestionsByDifficulty(query, 'hard', targetHard)
        ]);

        let questions = [...easyQ, ...mediumQ, ...hardQ];

        // If we fall short of questions, fetch any remaining matching questions
        if (questions.length < count) {
          const excludedIds = questions.map(q => q._id);
          const remainingCount = count - questions.length;
          const extraQuery = { ...query, _id: { $nin: excludedIds } };
          const extraQ = await this.fetchQuestionsWithWeightage(extraQuery, remainingCount);
          questions = [...questions, ...extraQ];
        }

        console.log(`✅ Generated balanced test with ${questions.length} questions`);
        const questionIds = questions.map(q => q._id);
        return this.shuffleArray(questionIds);
      }

      // Default fallback if a specific difficulty is requested
      const questions = await this.fetchQuestionsWithWeightage(query, filters.questionCount);
      console.log(`✅ Generated test with ${questions.length} questions`);
      const questionIds = questions.map(q => q._id);
      return this.shuffleArray(questionIds);

    } catch (error) {
      console.error('❌ Test Generation Error:', error);
      throw error;
    }
  }

  /**
   * Helper to fetch questions for a specific difficulty
   */
  static async fetchQuestionsByDifficulty(query, difficulty, count) {
    if (count <= 0) return [];
    return this.fetchQuestionsWithWeightage({ ...query, difficulty }, count);
  }

  /**
   * Fetch questions incorporating chapter weightages
   */
  static async fetchQuestionsWithWeightage(query, count) {
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          chapterWeight: {
            $switch: {
              branches: Object.entries(CHAPTER_WEIGHTAGES).map(([chapter, w]) => ({
                case: { $eq: ['$chapter', chapter] },
                then: w
              })),
              default: 3
            }
          }
        }
      },
      {
        $addFields: {
          selectionScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$qualityScore', 50] }, 0.2] },
              { $multiply: ['$chapterWeight', 10] },
              { $multiply: [{ $ifNull: ['$weightage', 1] }, 5] },
              { $multiply: [{ $rand: {} }, 30] }
            ]
          }
        }
      },
      { $sort: { selectionScore: -1 } },
      { $limit: Number(count) }
    ];

    return Question.aggregate(pipeline);
  }

  /**
   * Generate chapter-wise test
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
   * Generate subject-wise test
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
   * Helper to fetch questions for a specific chapter favoring hard difficulty
   */
  static async fetchWeightageQuestions(subject, chapter, min, max, globalSubjectQues) {
    // Determine random target count between min and max
    const targetCount = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Create query excluding already selected questions for this subject
    const query = {
      ...VERIFIED_QUESTION_FILTER,
      subject: subject === 'biology' ? { $in: ['biology', 'botany', 'zoology'] } : subject,
      chapter: new RegExp(chapter, 'i'),
      _id: { $nin: globalSubjectQues }
    };
    
    // Fetch prioritizing Hard questions, and deduplicating by questionText
    let qs = await Question.aggregate([
      { $match: query },
      { $sort: { difficulty: -1 } }, // 'hard' comes before 'medium', 'easy'
      { $group: {
          _id: "$questionText",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $addFields: {
          sortScore: {
            $multiply: [
              { $rand: {} }, // Base true randomness
              { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1.5, 1.0] }, // 50% boost to Hard questions
              { $cond: [{ $eq: ['$difficulty', 'easy'] }, 0.1, 1.0] }, // 90% penalty to Easy questions
              // 40% probability penalty to Assertion/Statement questions to prevent clustering, but still allow them
              { $cond: [{ $regexMatch: { input: "$questionText", regex: /given below are two statements|assertion/i } }, 0.6, 1.0] },
              // 40% probability penalty to Match the following to prevent them from repeating
              { $cond: [{ $regexMatch: { input: "$questionText", regex: /match list|match the following/i } }, 0.6, 1.0] }
            ]
          }
        }
      },
      { $sort: { sortScore: -1 } },
      { $limit: targetCount }
    ]);
    
    return qs.map(q => q._id);
  }

  /**
   * Generate full NEET mock test
   * Supports custom subject and chapter selection, or builds weightage-based Full Mock
   * @param {Object} options - Custom subject/chapters selection
   */
  static async generateFullMockTest(options = {}) {
    try {
      const { subject, chapters } = options;
      console.log('🎲 Generating Full Mock Test. Options:', options);

      // If user selected specific subject and chapters
      if (subject && Array.isArray(chapters) && chapters.length > 0) {
        console.log(`Generating custom mock of 180 questions for subject: ${subject}, chapters: ${chapters.join(', ')}`);
        const questionIds = await this.generateTest({
          subject,
          chapter: { $in: chapters },
          questionCount: 180,
          isPublished: true
        });

        return {
          totalQuestions: questionIds.length,
          totalTime: 180,
          questions: questionIds,
          distribution: {
            [subject]: questionIds.length
          }
        };
      }

      // Default standard NEET syllabus mock test (45 Phys, 45 Chem, 90 Bio)
      // Using Exact Weightage Distribution from premium platform requirements
      const NEET_MOCK_DISTRIBUTION = {
        biology: [
          { chapter: 'Molecular Basis of Inheritance', min: 6, max: 8 },
          { chapter: 'Principles of Inheritance', min: 5, max: 6 },
          { chapter: 'Human Reproduction', min: 4, max: 6 },
          { chapter: 'Reproductive Health', min: 3, max: 5 },
          { chapter: 'Sexual Reproduction in Flowering Plants', min: 4, max: 6 },
          { chapter: 'Biotechnology', min: 6, max: 10 }, // Combined principles and applications
          { chapter: 'Human Health and Disease', min: 3, max: 5 },
          { chapter: 'Cell: The Unit of Life', min: 3, max: 5 },
          { chapter: 'Biomolecules', min: 2, max: 4 },
          { chapter: 'Respiration', min: 2, max: 3 },
          { chapter: 'Photosynthesis', min: 2, max: 3 },
          { chapter: 'Plant Growth', min: 2, max: 3 },
          { chapter: 'Animal Kingdom', min: 3, max: 5 },
          { chapter: 'Plant Kingdom', min: 2, max: 4 },
          { chapter: 'Biological Classification', min: 2, max: 3 },
          { chapter: 'Living World', min: 1, max: 2 },
          { chapter: 'Morphology', min: 2, max: 3 },
          { chapter: 'Anatomy', min: 2, max: 3 },
          { chapter: 'Structural Organisation', min: 1, max: 2 },
          { chapter: 'Body Fluids', min: 2, max: 3 },
          { chapter: 'Breathing', min: 2, max: 3 },
          { chapter: 'Excretory', min: 2, max: 3 },
          { chapter: 'Locomotion', min: 1, max: 2 },
          { chapter: 'Neural Control', min: 2, max: 3 },
          { chapter: 'Chemical Coordination', min: 2, max: 3 },
          { chapter: 'Evolution', min: 2, max: 3 },
          { chapter: 'Organisms', min: 2, max: 3 },
          { chapter: 'Ecosystem', min: 2, max: 3 },
          { chapter: 'Biodiversity', min: 2, max: 3 },
          { chapter: 'Environmental', min: 1, max: 2 },
          { chapter: 'Microbes', min: 1, max: 2 }
        ],
        physics: [
          { chapter: 'Current Electricity', min: 3, max: 5 },
          { chapter: 'Electrostatics', min: 3, max: 4 },
          { chapter: 'Ray Optics', min: 3, max: 4 },
          { chapter: 'Moving Charges', min: 2, max: 3 },
          { chapter: 'Magnetism', min: 1, max: 2 },
          { chapter: 'Electromagnetic Induction', min: 2, max: 3 },
          { chapter: 'Alternating Current', min: 2, max: 2 },
          { chapter: 'Modern Physics', min: 4, max: 5 },
          { chapter: 'Semiconductor', min: 2, max: 3 },
          { chapter: 'Units and', min: 1, max: 2 },
          { chapter: 'Kinematics', min: 2, max: 3 },
          { chapter: 'Laws of Motion', min: 2, max: 2 },
          { chapter: 'Work, Energy', min: 2, max: 2 },
          { chapter: 'Rotational', min: 2, max: 2 },
          { chapter: 'Gravitation', min: 2, max: 3 },
          { chapter: 'Oscillations', min: 1, max: 2 },
          { chapter: 'Waves', min: 1, max: 2 },
          { chapter: 'Thermodynamics', min: 2, max: 3 },
          { chapter: 'Kinetic Theory', min: 1, max: 1 },
          { chapter: 'Properties of Matter', min: 2, max: 2 }
        ],
        chemistry: [
          { chapter: 'Chemical Bonding', min: 3, max: 5 },
          { chapter: 'Coordination', min: 3, max: 5 },
          { chapter: 'Organic Chemistry', min: 3, max: 4 },
          { chapter: 'Hydrocarbons', min: 2, max: 3 },
          { chapter: 'Haloalkanes', min: 2, max: 2 },
          { chapter: 'Alcohols', min: 2, max: 2 },
          { chapter: 'Aldehydes', min: 2, max: 2 },
          { chapter: 'Amines', min: 2, max: 2 },
          { chapter: 'Biomolecules', min: 1, max: 2 },
          { chapter: 'Atomic Structure', min: 2, max: 3 },
          { chapter: 'Thermodynamics', min: 2, max: 2 },
          { chapter: 'Equilibrium', min: 2, max: 2 },
          { chapter: 'Chemical Kinetics', min: 2, max: 2 },
          { chapter: 'Electrochemistry', min: 2, max: 3 },
          { chapter: 'Solutions', min: 2, max: 2 },
          { chapter: 'Block Elements', min: 4, max: 6 },
          { chapter: 'Periodic Table', min: 1, max: 2 }
        ]
      };

      const fillSubject = async (subject, targetCount) => {
        let selectedQuestions = [];
        const distribution = NEET_MOCK_DISTRIBUTION[subject] || [];
        
        // Pass 1: Try to hit weightage for every chapter
        for (const chap of distribution) {
          const qIds = await this.fetchWeightageQuestions(subject, chap.chapter, chap.min, chap.max, selectedQuestions);
          selectedQuestions = [...selectedQuestions, ...qIds];
        }

        // Pass 2: Fallback filler if we don't have enough (due to empty DB chapters)
        if (selectedQuestions.length < targetCount) {
          const remaining = targetCount - selectedQuestions.length;
          const query = {
            ...VERIFIED_QUESTION_FILTER,
            subject: subject === 'biology' ? { $in: ['biology', 'botany', 'zoology'] } : subject,
            _id: { $nin: selectedQuestions }
          };
          const fallback = await Question.aggregate([
            { $match: query },
            { $sort: { difficulty: -1 } },
            { $group: { _id: "$questionText", doc: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$doc" } },
            { $sample: { size: remaining } }
          ]);
          selectedQuestions = [...selectedQuestions, ...fallback.map(q => q._id)];
        }

        // Pass 3: Truncate if we accidentally fetched too many due to max bounds
        if (selectedQuestions.length > targetCount) {
          selectedQuestions = this.shuffleArray(selectedQuestions).slice(0, targetCount);
        }

        // Always shuffle the final subject questions to prevent chapter-clustering
        return this.shuffleArray(selectedQuestions);
      };

      const physicsQuestions = await fillSubject('physics', 45);
      const chemistryQuestions = await fillSubject('chemistry', 45);
      const biologyQuestions = await fillSubject('biology', 90);

      const allQuestions = [
        ...physicsQuestions,
        ...chemistryQuestions,
        ...biologyQuestions
      ];

      return {
        totalQuestions: allQuestions.length,
        totalTime: 180,
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
   */
  static buildQuery(filters) {
    const query = { ...VERIFIED_QUESTION_FILTER };

    if (filters.subject) {
      query.subject = filters.subject === 'biology'
        ? { $in: ['biology', 'botany', 'zoology'] }
        : Array.isArray(filters.subject)
          ? { $in: filters.subject }
          : filters.subject;
    }
    
    // Support either single chapter or array of chapters
    if (filters.chapter) {
      query.chapter = filters.chapter;
    }
    
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
   */
  static getTestConfig(testType) {
    return TEST_CONFIG[String(testType || '').toUpperCase()] || { timeLimit: 45, questionCount: 30 };
  }

  /**
   * Calculate marking scheme
   */
  static calculateScore(correct, wrong) {
    return (correct * MARKING_SCHEME.CORRECT) + (wrong * MARKING_SCHEME.INCORRECT);
  }
}

module.exports = TestGenerator;
