require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('../models/nursing/Subject');
const Chapter = require('../models/nursing/Chapter');
const Topic = require('../models/nursing/Topic');
const Exam = require('../models/nursing/Exam');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solnut';

const subjectsData = [
  { subjectCode: 'BIO', name: 'Biology', subjectSlug: 'biology', displayOrder: 1 },
  { subjectCode: 'CHEM', name: 'Chemistry', subjectSlug: 'chemistry', displayOrder: 2 },
  { subjectCode: 'PHY', name: 'Physics', subjectSlug: 'physics', displayOrder: 3 },
  { subjectCode: 'ENG', name: 'English', subjectSlug: 'english', displayOrder: 4 },
  { subjectCode: 'NA', name: 'Nursing Aptitude', subjectSlug: 'nursing-aptitude', displayOrder: 5 },
  { subjectCode: 'LR', name: 'Logical Reasoning', subjectSlug: 'logical-reasoning', displayOrder: 6 },
  { subjectCode: 'GK', name: 'General Knowledge', subjectSlug: 'general-knowledge', displayOrder: 7 },
  { subjectCode: 'CA', name: 'Current Affairs', subjectSlug: 'current-affairs', displayOrder: 8 },
  { subjectCode: 'HA', name: 'Health Aptitude', subjectSlug: 'health-aptitude', displayOrder: 9 }
];

const chaptersData = [
  // BIOLOGY CLASS 11
  { subjectSlug: 'biology', unitName: 'Unit 1: Diversity in the Living World', chapters: [
    { name: 'The Living World', classLevel: '11' },
    { name: 'Biological Classification', classLevel: '11' },
    { name: 'Plant Kingdom', classLevel: '11' },
    { name: 'Animal Kingdom', classLevel: '11' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 2: Structural Organisation in Plants and Animals', chapters: [
    { name: 'Morphology of Flowering Plants', classLevel: '11' },
    { name: 'Anatomy of Flowering Plants', classLevel: '11' },
    { name: 'Structural Organisation in Animals', classLevel: '11' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 3: Cell Structure and Function', chapters: [
    { name: 'Cell: The Unit of Life', classLevel: '11' },
    { name: 'Biomolecules', classLevel: '11' },
    { name: 'Cell Cycle and Cell Division', classLevel: '11' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 4: Plant Physiology', chapters: [
    { name: 'Photosynthesis in Higher Plants', classLevel: '11' },
    { name: 'Respiration in Plants', classLevel: '11' },
    { name: 'Plant Growth and Development', classLevel: '11' },
    { name: 'Transport in Plants', classLevel: '11', status: 'inactive' },
    { name: 'Mineral Nutrition', classLevel: '11', status: 'inactive' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 5: Human Physiology', chapters: [
    { name: 'Breathing and Exchange of Gases', classLevel: '11' },
    { name: 'Body Fluids and Circulation', classLevel: '11' },
    { name: 'Excretory Products and Their Elimination', classLevel: '11' },
    { name: 'Locomotion and Movement', classLevel: '11' },
    { name: 'Neural Control and Coordination', classLevel: '11' },
    { name: 'Chemical Coordination and Integration', classLevel: '11' },
    { name: 'Digestion and Absorption', classLevel: '11', status: 'inactive' }
  ]},
  // BIOLOGY CLASS 12
  { subjectSlug: 'biology', unitName: 'Unit 6: Reproduction', chapters: [
    { name: 'Sexual Reproduction in Flowering Plants', classLevel: '12' },
    { name: 'Human Reproduction', classLevel: '12' },
    { name: 'Reproductive Health', classLevel: '12' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 7: Genetics and Evolution', chapters: [
    { name: 'Principles of Inheritance and Variation', classLevel: '12' },
    { name: 'Molecular Basis of Inheritance', classLevel: '12' },
    { name: 'Evolution', classLevel: '12' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 8: Biology and Human Welfare', chapters: [
    { name: 'Human Health and Disease', classLevel: '12' },
    { name: 'Microbes in Human Welfare', classLevel: '12' },
    { name: 'Strategies for Enhancement in Food Production', classLevel: '12', status: 'inactive' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 9: Biotechnology', chapters: [
    { name: 'Biotechnology: Principles and Processes', classLevel: '12' },
    { name: 'Biotechnology and its Applications', classLevel: '12' }
  ]},
  { subjectSlug: 'biology', unitName: 'Unit 10: Ecology and Environment', chapters: [
    { name: 'Organisms and Populations', classLevel: '12' },
    { name: 'Ecosystem', classLevel: '12' },
    { name: 'Biodiversity and Conservation', classLevel: '12' },
    { name: 'Environmental Issues', classLevel: '12', status: 'inactive' }
  ]},

  // CHEMISTRY CLASS 11
  { subjectSlug: 'chemistry', unitName: 'Physical Chemistry', chapters: [
    { name: 'Some Basic Concepts of Chemistry', classLevel: '11' },
    { name: 'Structure of Atom', classLevel: '11' },
    { name: 'Thermodynamics', classLevel: '11' },
    { name: 'Equilibrium', classLevel: '11' },
    { name: 'Redox Reactions', classLevel: '11' },
    { name: 'States of Matter', classLevel: '11', status: 'inactive' }
  ]},
  { subjectSlug: 'chemistry', unitName: 'Inorganic Chemistry', chapters: [
    { name: 'Classification of Elements and Periodicity in Properties', classLevel: '11' },
    { name: 'Chemical Bonding and Molecular Structure', classLevel: '11' },
    { name: 'The s-Block Elements', classLevel: '11' },
    { name: 'Some p-Block Elements', classLevel: '11' },
    { name: 'Hydrogen', classLevel: '11', status: 'inactive' }
  ]},
  { subjectSlug: 'chemistry', unitName: 'Organic Chemistry', chapters: [
    { name: 'Organic Chemistry: Some Basic Principles and Techniques', classLevel: '11' },
    { name: 'Hydrocarbons', classLevel: '11' },
    { name: 'Environmental Chemistry', classLevel: '11', status: 'inactive' }
  ]},
  // CHEMISTRY CLASS 12
  { subjectSlug: 'chemistry', unitName: 'Physical Chemistry (Class 12)', chapters: [
    { name: 'Solutions', classLevel: '12' },
    { name: 'Electrochemistry', classLevel: '12' },
    { name: 'Chemical Kinetics', classLevel: '12' },
    { name: 'Solid State', classLevel: '12', status: 'inactive' },
    { name: 'Surface Chemistry', classLevel: '12', status: 'inactive' }
  ]},
  { subjectSlug: 'chemistry', unitName: 'Inorganic Chemistry (Class 12)', chapters: [
    { name: 'The d- and f-Block Elements', classLevel: '12' },
    { name: 'Coordination Compounds', classLevel: '12' },
    { name: 'The p-Block Elements', classLevel: '12' },
    { name: 'General Principles and Processes of Isolation of Elements', classLevel: '12', status: 'inactive' }
  ]},
  { subjectSlug: 'chemistry', unitName: 'Organic Chemistry (Class 12)', chapters: [
    { name: 'Haloalkanes and Haloarenes', classLevel: '12' },
    { name: 'Alcohols, Phenols and Ethers', classLevel: '12' },
    { name: 'Aldehydes, Ketones and Carboxylic Acids', classLevel: '12' },
    { name: 'Amines', classLevel: '12' },
    { name: 'Biomolecules', classLevel: '12' },
    { name: 'Polymers', classLevel: '12', status: 'inactive' },
    { name: 'Chemistry in Everyday Life', classLevel: '12', status: 'inactive' }
  ]},

  // PHYSICS CLASS 11
  { subjectSlug: 'physics', unitName: 'Unit 1: Introduction and Measurement', chapters: [
    { name: 'Units and Measurements', classLevel: '11' },
    { name: 'Physical World', classLevel: '11', status: 'inactive' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 2: Kinematics', chapters: [
    { name: 'Motion in a Straight Line', classLevel: '11' },
    { name: 'Motion in a Plane', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 3: Laws of Motion', chapters: [
    { name: 'Laws of Motion', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 4: Work, Energy and Power', chapters: [
    { name: 'Work, Energy and Power', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 5: Motion of System of Particles and Rigid Body', chapters: [
    { name: 'System of Particles and Rotational Motion', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 6: Gravitation', chapters: [
    { name: 'Gravitation', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 7: Properties of Bulk Matter', chapters: [
    { name: 'Mechanical Properties of Solids', classLevel: '11' },
    { name: 'Mechanical Properties of Fluids', classLevel: '11' },
    { name: 'Thermal Properties of Matter', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 8: Thermodynamics', chapters: [
    { name: 'Thermodynamics', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 9: Behaviour of Perfect Gases', chapters: [
    { name: 'Kinetic Theory', classLevel: '11' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 10: Oscillations and Waves', chapters: [
    { name: 'Oscillations', classLevel: '11' },
    { name: 'Waves', classLevel: '11' }
  ]},
  
  // PHYSICS CLASS 12
  { subjectSlug: 'physics', unitName: 'Unit 11: Electrostatics', chapters: [
    { name: 'Electric Charges and Fields', classLevel: '12' },
    { name: 'Electrostatic Potential and Capacitance', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 12: Current Electricity', chapters: [
    { name: 'Current Electricity', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 13: Magnetic Effects of Current and Magnetism', chapters: [
    { name: 'Moving Charges and Magnetism', classLevel: '12' },
    { name: 'Magnetism and Matter', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 14: Electromagnetic Induction and Alternating Current', chapters: [
    { name: 'Electromagnetic Induction', classLevel: '12' },
    { name: 'Alternating Current', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 15: Electromagnetic Waves', chapters: [
    { name: 'Electromagnetic Waves', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 16: Optics', chapters: [
    { name: 'Ray Optics and Optical Instruments', classLevel: '12' },
    { name: 'Wave Optics', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 17: Dual Nature of Matter and Radiation', chapters: [
    { name: 'Dual Nature of Radiation and Matter', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 18: Atoms and Nuclei', chapters: [
    { name: 'Atoms', classLevel: '12' },
    { name: 'Nuclei', classLevel: '12' }
  ]},
  { subjectSlug: 'physics', unitName: 'Unit 19: Electronic Devices', chapters: [
    { name: 'Semiconductor Electronics: Materials, Devices and Simple Circuits', classLevel: '12' }
  ]},

  // ENGLISH
  { subjectSlug: 'english', unitName: 'English Grammar & Vocabulary', chapters: [
    { name: 'Parts of Speech', classLevel: 'General' },
    { name: 'Nouns and Pronouns', classLevel: 'General' },
    { name: 'Adjectives and Adverbs', classLevel: 'General' },
    { name: 'Verbs', classLevel: 'General' },
    { name: 'Tenses', classLevel: 'General' },
    { name: 'Subject–Verb Agreement', classLevel: 'General' },
    { name: 'Articles', classLevel: 'General' },
    { name: 'Prepositions', classLevel: 'General' },
    { name: 'Conjunctions', classLevel: 'General' },
    { name: 'Modals', classLevel: 'General' },
    { name: 'Active and Passive Voice', classLevel: 'General' },
    { name: 'Direct and Indirect Speech', classLevel: 'General' },
    { name: 'Sentence Structure', classLevel: 'General' },
    { name: 'Sentence Improvement', classLevel: 'General' },
    { name: 'Error Detection', classLevel: 'General' },
    { name: 'Fill in the Blanks', classLevel: 'General' },
    { name: 'Cloze Test', classLevel: 'General' },
    { name: 'Synonyms', classLevel: 'General' },
    { name: 'Antonyms', classLevel: 'General' },
    { name: 'One-Word Substitution', classLevel: 'General' },
    { name: 'Idioms and Phrases', classLevel: 'General' },
    { name: 'Spelling and Word Usage', classLevel: 'General' },
    { name: 'Vocabulary in Context', classLevel: 'General' },
    { name: 'Sentence Rearrangement', classLevel: 'General' },
    { name: 'Para Jumbles', classLevel: 'General' },
    { name: 'Reading Comprehension', classLevel: 'General' },
    { name: 'Passage-Based Vocabulary', classLevel: 'General' },
    { name: 'Verbal Analogy', classLevel: 'General' },
    { name: 'Commonly Confused Words', classLevel: 'General' },
    { name: 'Medical and Healthcare Vocabulary', classLevel: 'General' }
  ]},

  // NURSING APTITUDE
  { subjectSlug: 'nursing-aptitude', unitName: 'Nursing Aptitude', chapters: [
    { name: 'Introduction to Nursing', classLevel: 'Skill' },
    { name: 'Meaning and Scope of Nursing', classLevel: 'Skill' },
    { name: 'Qualities of a Good Nurse', classLevel: 'Skill' },
    { name: 'Roles and Responsibilities of a Nurse', classLevel: 'Skill' },
    { name: 'Nursing as a Profession', classLevel: 'Skill' },
    { name: 'Professional Ethics in Nursing', classLevel: 'Skill' },
    { name: 'Patient-Centred Care', classLevel: 'Skill' },
    { name: 'Communication with Patients', classLevel: 'Skill' },
    { name: 'Communication with Patient Families', classLevel: 'Skill' },
    { name: 'Therapeutic Communication', classLevel: 'Skill' },
    { name: 'Empathy and Compassion', classLevel: 'Skill' },
    { name: 'Respect, Dignity and Privacy', classLevel: 'Skill' },
    { name: 'Confidentiality in Healthcare', classLevel: 'Skill' },
    { name: 'Informed Consent', classLevel: 'Skill' },
    { name: 'Patient Rights', classLevel: 'Skill' },
    { name: 'Basic Hospital Organisation', classLevel: 'Skill' },
    { name: 'Healthcare Team and Its Members', classLevel: 'Skill' },
    { name: 'Hospital Departments', classLevel: 'Skill' },
    { name: 'Basic Ward Management', classLevel: 'Skill' },
    { name: 'Hygiene and Personal Cleanliness', classLevel: 'Skill' },
    { name: 'Hand Hygiene', classLevel: 'Skill' },
    { name: 'Infection Prevention', classLevel: 'Skill' },
    { name: 'Infection Control', classLevel: 'Skill' },
    { name: 'Biomedical Waste Management', classLevel: 'Skill' },
    { name: 'Basic First Aid', classLevel: 'Skill' },
    { name: 'Emergency Response', classLevel: 'Skill' },
    { name: 'Patient Safety', classLevel: 'Skill' },
    { name: 'Safe Patient Handling', classLevel: 'Skill' },
    { name: 'Measurement of Basic Vital Signs', classLevel: 'Skill' },
    { name: 'Nutrition and Balanced Diet', classLevel: 'Skill' },
    { name: 'Maternal and Child Health Awareness', classLevel: 'Skill' },
    { name: 'Community Health Awareness', classLevel: 'Skill' },
    { name: 'Mental Health Awareness', classLevel: 'Skill' },
    { name: 'Health Education', classLevel: 'Skill' },
    { name: 'Disease Prevention', classLevel: 'Skill' },
    { name: 'Immunisation Awareness', classLevel: 'Skill' },
    { name: 'Common Healthcare Abbreviations', classLevel: 'Skill' },
    { name: 'Ethical Situations in Nursing', classLevel: 'Skill' },
    { name: 'Situational Judgement', classLevel: 'Skill' },
    { name: 'Decision-Making in Patient Care', classLevel: 'Skill' },
    { name: 'Teamwork in Healthcare', classLevel: 'Skill' },
    { name: 'Leadership and Responsibility', classLevel: 'Skill' },
    { name: 'Stress Management', classLevel: 'Skill' },
    { name: 'Time Management', classLevel: 'Skill' },
    { name: 'Basic Nursing Terminology', classLevel: 'Skill' }
  ]},

  // LOGICAL REASONING
  { subjectSlug: 'logical-reasoning', unitName: 'Logical Reasoning', chapters: [
    { name: 'Analogy', classLevel: 'General' },
    { name: 'Classification', classLevel: 'General' },
    { name: 'Number Series', classLevel: 'General' },
    { name: 'Alphabet Series', classLevel: 'General' },
    { name: 'Alphanumeric Series', classLevel: 'General' },
    { name: 'Missing Number', classLevel: 'General' },
    { name: 'Coding and Decoding', classLevel: 'General' },
    { name: 'Blood Relations', classLevel: 'General' },
    { name: 'Direction Sense', classLevel: 'General' },
    { name: 'Ranking and Order', classLevel: 'General' },
    { name: 'Syllogism', classLevel: 'General' },
    { name: 'Statement and Conclusion', classLevel: 'General' },
    { name: 'Statement and Assumption', classLevel: 'General' },
    { name: 'Statement and Argument', classLevel: 'General' },
    { name: 'Cause and Effect', classLevel: 'General' },
    { name: 'Assertion and Reason', classLevel: 'General' },
    { name: 'Logical Sequence', classLevel: 'General' },
    { name: 'Seating Arrangement', classLevel: 'General' },
    { name: 'Puzzle-Based Reasoning', classLevel: 'General' },
    { name: 'Calendar', classLevel: 'General' },
    { name: 'Clock', classLevel: 'General' },
    { name: 'Venn Diagrams', classLevel: 'General' },
    { name: 'Data Sufficiency', classLevel: 'General' },
    { name: 'Mathematical Operations', classLevel: 'General' },
    { name: 'Decision-Making', classLevel: 'General' },
    { name: 'Non-Verbal Reasoning', classLevel: 'General' },
    { name: 'Mirror Images', classLevel: 'General' },
    { name: 'Water Images', classLevel: 'General' },
    { name: 'Paper Folding and Cutting', classLevel: 'General' },
    { name: 'Figure Completion', classLevel: 'General' },
    { name: 'Embedded Figures', classLevel: 'General' },
    { name: 'Pattern Recognition', classLevel: 'General' },
    { name: 'Cube and Dice', classLevel: 'General' },
    { name: 'Healthcare Situational Reasoning', classLevel: 'General' }
  ]},

  // GENERAL KNOWLEDGE
  { subjectSlug: 'general-knowledge', unitName: 'General Knowledge', chapters: [
    { name: 'Indian History', classLevel: 'General' },
    { name: 'Indian Geography', classLevel: 'General' },
    { name: 'Indian Polity and Constitution', classLevel: 'General' },
    { name: 'Indian Economy', classLevel: 'General' },
    { name: 'General Science', classLevel: 'General' },
    { name: 'Environmental Science', classLevel: 'General' },
    { name: 'Important National Institutions', classLevel: 'General' },
    { name: 'International Organisations', classLevel: 'General' },
    { name: 'Important Days and Dates', classLevel: 'General' },
    { name: 'Awards and Honours', classLevel: 'General' },
    { name: 'Books and Authors', classLevel: 'General' },
    { name: 'Sports', classLevel: 'General' },
    { name: 'Government Schemes', classLevel: 'General' },
    { name: 'Public Health Programmes', classLevel: 'General' },
    { name: 'Indian Healthcare System', classLevel: 'General' },
    { name: 'Health Organisations', classLevel: 'General' },
    { name: 'Famous Scientists', classLevel: 'General' },
    { name: 'Scientific Discoveries', classLevel: 'General' },
    { name: 'Medical Discoveries', classLevel: 'General' },
    { name: 'Nursing History', classLevel: 'General' },
    { name: 'Important Healthcare Personalities', classLevel: 'General' },
    { name: 'Basic Computer Awareness', classLevel: 'General' }
  ]},

  // CURRENT AFFAIRS
  { subjectSlug: 'current-affairs', unitName: 'Current Affairs Categories', chapters: [
    { name: 'National Current Affairs', classLevel: 'General' },
    { name: 'International Current Affairs', classLevel: 'General' },
    { name: 'Healthcare Current Affairs', classLevel: 'General' },
    { name: 'Nursing Current Affairs', classLevel: 'General' },
    { name: 'Science and Technology', classLevel: 'General' },
    { name: 'Government Health Schemes', classLevel: 'General' },
    { name: 'Public Health Campaigns', classLevel: 'General' },
    { name: 'Medical Research', classLevel: 'General' },
    { name: 'Important Appointments', classLevel: 'General' },
    { name: 'Awards and Honours', classLevel: 'General' },
    { name: 'Sports', classLevel: 'General' },
    { name: 'Environment', classLevel: 'General' },
    { name: 'Reports and Indexes', classLevel: 'General' },
    { name: 'Important Days', classLevel: 'General' },
    { name: 'Education and Entrance Examination Updates', classLevel: 'General' }
  ]},

  // HEALTH APTITUDE
  { subjectSlug: 'health-aptitude', unitName: 'Health Aptitude', chapters: [
    { name: 'Meaning and Dimensions of Health', classLevel: 'Skill' },
    { name: 'Determinants of Health', classLevel: 'Skill' },
    { name: 'Personal Hygiene', classLevel: 'Skill' },
    { name: 'Environmental Hygiene', classLevel: 'Skill' },
    { name: 'Nutrition and Health', classLevel: 'Skill' },
    { name: 'Balanced Diet', classLevel: 'Skill' },
    { name: 'Deficiency Diseases', classLevel: 'Skill' },
    { name: 'Communicable Diseases', classLevel: 'Skill' },
    { name: 'Non-Communicable Diseases', classLevel: 'Skill' },
    { name: 'Disease Prevention', classLevel: 'Skill' },
    { name: 'Immunisation', classLevel: 'Skill' },
    { name: 'Public Health', classLevel: 'Skill' },
    { name: 'Community Health', classLevel: 'Skill' },
    { name: 'Maternal Health', classLevel: 'Skill' },
    { name: 'Child Health', classLevel: 'Skill' },
    { name: 'Adolescent Health', classLevel: 'Skill' },
    { name: 'Mental Health', classLevel: 'Skill' },
    { name: 'Reproductive Health Awareness', classLevel: 'Skill' },
    { name: 'First Aid', classLevel: 'Skill' },
    { name: 'Emergency Awareness', classLevel: 'Skill' },
    { name: 'Infection Prevention', classLevel: 'Skill' },
    { name: 'Sanitation', classLevel: 'Skill' },
    { name: 'Safe Drinking Water', classLevel: 'Skill' },
    { name: 'Biomedical Waste Awareness', classLevel: 'Skill' },
    { name: 'National Health Programmes', classLevel: 'Skill' },
    { name: 'Government Health Schemes', classLevel: 'Skill' },
    { name: 'World Health Organization', classLevel: 'Skill' },
    { name: 'Indian Healthcare Institutions', classLevel: 'Skill' },
    { name: 'Health Education', classLevel: 'Skill' },
    { name: 'Healthcare Ethics', classLevel: 'Skill' },
    { name: 'Patient Safety', classLevel: 'Skill' },
    { name: 'Basic Medical Terminology', classLevel: 'Skill' },
    { name: 'Healthcare Situational Judgement', classLevel: 'Skill' }
  ]}
];

// Seed the AIIMS B.Sc. Nursing Exam specifically as an example of Exam mapping
const seedAiimsExam = async () => {
  const allSubjects = await Subject.find({});
  const allChapters = await Chapter.find({ status: 'active' });
  
  // AIIMS B.Sc. Nursing (Hons) usually has Physics, Chemistry, Biology, General Knowledge
  // Pattern: Phy(30), Chem(30), Bio(30), GK(10) = 100 questions, 100 marks
  
  const aiimsSubjects = allSubjects.filter(s => 
    ['biology', 'chemistry', 'physics', 'general-knowledge'].includes(s.subjectSlug)
  );

  const aiimsChapters = allChapters.filter(c => 
    ['biology', 'chemistry', 'physics', 'general-knowledge'].includes(
      allSubjects.find(s => s._id.equals(c.subjectId))?.subjectSlug
    )
  );

  await Exam.findOneAndUpdate(
    { examCode: 'AIIMS-BSC-NURSING' },
    {
      examName: 'AIIMS B.Sc. Nursing',
      conductingAuthority: 'All India Institute of Medical Sciences (AIIMS)',
      subjects: aiimsSubjects.map(s => ({
        subjectId: s._id,
        questionCount: s.subjectSlug === 'general-knowledge' ? 10 : 30,
        marksCount: s.subjectSlug === 'general-knowledge' ? 10 : 30
      })),
      applicableChapters: aiimsChapters.map(c => c._id),
      applicableTopics: [], // To be seeded later if needed
      examPattern: {
        mode: 'CBT',
        questionType: 'MCQs',
        hasNegativeMarking: true
      },
      questionCount: 100,
      marks: 100,
      negativeMarking: {
        correctAnswers: 1,
        incorrectAnswers: -0.33,
        unattempted: 0
      },
      duration: 120, // 2 hours
      officialSyllabusSource: 'AIIMS Prospectus',
      lastVerificationDate: new Date(),
      syllabusVersion: '1.0',
      isActive: true
    },
    { upsert: true, new: true }
  );
  console.log('✅ Seeded AIIMS B.Sc. Nursing Exam Mapping');
};

const connectDB = require('../config/database');

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const seed = async () => {
  try {
    await connectDB();

    // Seed Subjects
    for (const sub of subjectsData) {
      await Subject.findOneAndUpdate(
        { subjectCode: sub.subjectCode },
        { ...sub },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Subjects seeded successfully');

    // Fetch Subjects for References
    const subjectsList = await Subject.find({});
    let globalChapterDisplayOrder = 1;

    // Seed Chapters
    for (const unitData of chaptersData) {
      const subject = subjectsList.find(s => s.subjectSlug === unitData.subjectSlug);
      if (!subject) {
        console.error(`Subject not found for slug: ${unitData.subjectSlug}`);
        continue;
      }

      for (const chap of unitData.chapters) {
        const chapterSlug = slugify(`${subject.subjectCode}-${chap.name}`);
        const chapterCode = `CH-${chapterSlug.substring(0, 20).toUpperCase()}-${Math.floor(Math.random()*1000)}`;
        
        await Chapter.findOneAndUpdate(
          { chapterSlug: chapterSlug },
          {
            chapterCode: chapterCode,
            subjectId: subject._id,
            classLevel: chap.classLevel,
            unitName: unitData.unitName,
            fullChapterName: chap.name,
            displayOrder: globalChapterDisplayOrder++,
            status: chap.status || 'active',
            source: 'master_syllabus',
            syllabusVersion: '1.0'
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log('✅ Chapters seeded successfully');

    await seedAiimsExam();

    console.log('🎉 Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding syllabus:', err);
    process.exit(1);
  }
};

seed();
