// Question Types
const QUESTION_TYPES = {
  MCQ: 'mcq',
  ASSERTION_REASON: 'assertion_reason',
  MATCH_FOLLOWING: 'match_following',
  DIAGRAM_BASED: 'diagram_based',
  STATEMENT_BASED: 'statement_based',
  NUMERICAL: 'numerical'
};

// Difficulty Levels
const DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

// Subjects
const SUBJECTS = {
  PHYSICS: 'physics',
  CHEMISTRY: 'chemistry',
  BIOLOGY: 'biology',
  BOTANY: 'botany',
  ZOOLOGY: 'zoology'
};

// Test Types
const TEST_TYPES = {
  CHAPTER_TEST: 'chapter_test',
  TOPIC_TEST: 'topic_test',
  SUBJECT_TEST: 'subject_test',
  FULL_MOCK: 'full_mock',
  PYQ_TEST: 'pyq_test',
  DPP_TEST: 'dpp_test',
  CUSTOM_TEST: 'custom_test'
};

// Test Configuration
const TEST_CONFIG = {
  CHAPTER_TEST: { timeLimit: 45, questionCount: 30 },
  TOPIC_TEST: { timeLimit: 30, questionCount: 15 },
  SUBJECT_TEST: { timeLimit: 90, questionCount: 60 },
  FULL_MOCK: { timeLimit: 180, questionCount: 180 },
  PYQ_TEST: { timeLimit: 45, questionCount: 30 },
  DPP_TEST: { timeLimit: 60, questionCount: 40 }
};

// Marking Scheme (NEET Standard)
const MARKING_SCHEME = {
  CORRECT: 4,
  INCORRECT: -1,
  UNANSWERED: 0
};

// Response Status
const RESPONSE_STATUS = {
  ANSWERED: 'answered',
  MARKED_REVIEW: 'marked_review',
  UNANSWERED: 'unanswered',
  NOT_VISITED: 'not_visited'
};

// Test Status
const TEST_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  COMPLETED: 'completed'
};

// Source Types
const SOURCE_TYPES = {
  PYQ: 'pyq',
  MOCK: 'mock',
  DPP: 'dpp',
  NCERT: 'ncert',
  COACHING: 'coaching',
  CUSTOM: 'custom'
};

// Chapters (NEET Standard)
const PHYSICS_CHAPTERS = [
  'Measurement',
  'Motion in a Straight Line',
  'Motion in a Plane',
  'Laws of Motion',
  'Work Energy and Power',
  'System of Particles and Rotational Motion',
  'Gravitation',
  'Mechanical Properties of Solids',
  'Mechanical Properties of Fluids',
  'Thermal Properties of Matter',
  'Thermodynamics',
  'Kinetic Theory',
  'Oscillations',
  'Waves',
  'Electric Charges and Fields',
  'Electrostatic Potential and Capacitance',
  'Current Electricity',
  'Moving Charges and Magnetism',
  'Magnetism and Matter',
  'Electromagnetic Induction',
  'Alternating Current',
  'Electromagnetic Waves',
  'Ray Optics and Optical Instruments',
  'Wave Optics',
  'Dual Nature of Radiation and Matter',
  'Atoms',
  'Nuclei',
  'Semiconductor Electronics'
];

const CHEMISTRY_CHAPTERS = [
  'Some Basic Concepts of Chemistry',
  'Structure of Atom',
  'Classification of Elements and Periodicity in Properties',
  'Chemical Bonding and Molecular Structure',
  'States of Matter',
  'Thermodynamics',
  'Equilibrium',
  'Redox Reactions',
  'Hydrogen',
  'The s-Block Elements',
  'The p-Block Elements',
  'Organic Chemistry - Some Basic Principles and Techniques',
  'Hydrocarbons',
  'Environmental Chemistry',
  'The d- and f-Block Elements',
  'Coordination Compounds',
  'Surface Chemistry',
  'General Principles and Processes of Isolation of Elements',
  'The p-Block Elements (Group 13 & 14)',
  'The p-Block Elements (Group 15, 16, 17, 18)',
  'Alcohols, Phenols and Ethers',
  'Aldehydes, Ketones and Carboxylic Acids',
  'Organic Compounds Containing Nitrogen',
  'Biomolecules',
  'Polymers',
  'Chemistry in Everyday Life'
];

const BIOLOGY_CHAPTERS = [
  'Diversity of Living Organisms',
  'Structural Organisation in Animals and Plants',
  'Cell Structure and Function',
  'Plant Physiology',
  'Human Physiology',
  'Genetics',
  'Molecular Basis of Inheritance',
  'Evolution',
  'Ecology',
  'Biodiversity and its Conservation',
  'Reproduction in Plants',
  'Reproduction in Animals',
  'Reproduction in Humans',
  'Digestion and Absorption',
  'Breathing and Exchange of Gases',
  'Body Fluids and Circulation',
  'Excretory Products and their Elimination',
  'Locomotion and Movement',
  'Neural Control and Coordination',
  'Chemical Coordination and Integration',
  'Immune System',
  'Photosynthesis',
  'Respiration',
  'Growth and Development'
];

module.exports = {
  QUESTION_TYPES,
  DIFFICULTY,
  SUBJECTS,
  TEST_TYPES,
  TEST_CONFIG,
  MARKING_SCHEME,
  RESPONSE_STATUS,
  TEST_STATUS,
  SOURCE_TYPES,
  PHYSICS_CHAPTERS,
  CHEMISTRY_CHAPTERS,
  BIOLOGY_CHAPTERS
};
