const NCERT_EDITION = '2026-27';
const NEET_SYLLABUS_VERSION = 'NEET-UG-2026';
const NEET_SYLLABUS_URL = 'https://cdnbbsr.s3waas.gov.in/s37bc1ec1d9c3426357e69acd5bf320061/uploads/2026/01/20260102588210790.pdf';

const bookUrl = (code) => `https://ncert.nic.in/textbook/pdf/${code}.pdf`;
const chapterUrl = (code) => `https://ncert.nic.in/textbook/pdf/${code}.pdf`;

const chapterCodePrefixes = {
  keph1ps: 'keph1',
  keph2ps: 'keph2',
  leph1ps: 'leph1',
  leph2ps: 'leph2',
  kech1ps: 'kech1',
  kech2ps: 'kech2',
  lech1ps: 'lech1',
  lech2ps: 'lech2',
  kebo1ps: 'kebo1',
  lebo1ps: 'lebo1',
};

const chapterCodeCounters = new Map();

const curriculum = [
  // Physics - Class 11
  ['physics', '11', 'Units and Measurements', 'keph1ps'],
  ['physics', '11', 'Motion in a Straight Line', 'keph1ps'],
  ['physics', '11', 'Motion in a Plane', 'keph1ps'],
  ['physics', '11', 'Laws of Motion', 'keph1ps'],
  ['physics', '11', 'Work, Energy and Power', 'keph1ps'],
  ['physics', '11', 'System of Particles and Rotational Motion', 'keph1ps'],
  ['physics', '11', 'Gravitation', 'keph1ps'],
  ['physics', '11', 'Mechanical Properties of Solids', 'keph2ps'],
  ['physics', '11', 'Mechanical Properties of Fluids', 'keph2ps'],
  ['physics', '11', 'Thermal Properties of Matter', 'keph2ps'],
  ['physics', '11', 'Thermodynamics', 'keph2ps'],
  ['physics', '11', 'Kinetic Theory', 'keph2ps'],
  ['physics', '11', 'Oscillations', 'keph2ps'],
  ['physics', '11', 'Waves', 'keph2ps'],
  // Physics - Class 12
  ['physics', '12', 'Electric Charges and Fields', 'leph1ps'],
  ['physics', '12', 'Electrostatic Potential and Capacitance', 'leph1ps'],
  ['physics', '12', 'Current Electricity', 'leph1ps'],
  ['physics', '12', 'Moving Charges and Magnetism', 'leph1ps'],
  ['physics', '12', 'Magnetism and Matter', 'leph1ps'],
  ['physics', '12', 'Electromagnetic Induction', 'leph1ps'],
  ['physics', '12', 'Alternating Current', 'leph1ps'],
  ['physics', '12', 'Electromagnetic Waves', 'leph1ps'],
  ['physics', '12', 'Ray Optics and Optical Instruments', 'leph2ps'],
  ['physics', '12', 'Wave Optics', 'leph2ps'],
  ['physics', '12', 'Dual Nature of Radiation and Matter', 'leph2ps'],
  ['physics', '12', 'Atoms', 'leph2ps'],
  ['physics', '12', 'Nuclei', 'leph2ps'],
  ['physics', '12', 'Semiconductor Electronics: Materials, Devices and Simple Circuits', 'leph2ps'],

  // Chemistry - Class 11
  ['chemistry', '11', 'Some Basic Concepts of Chemistry', 'kech1ps'],
  ['chemistry', '11', 'Structure of Atom', 'kech1ps'],
  ['chemistry', '11', 'Classification of Elements and Periodicity in Properties', 'kech1ps'],
  ['chemistry', '11', 'Chemical Bonding and Molecular Structure', 'kech1ps'],
  ['chemistry', '11', 'Thermodynamics', 'kech1ps'],
  ['chemistry', '11', 'Equilibrium', 'kech1ps'],
  ['chemistry', '11', 'Redox Reactions', 'kech2ps'],
  ['chemistry', '11', 'Organic Chemistry - Some Basic Principles and Techniques', 'kech2ps'],
  ['chemistry', '11', 'Hydrocarbons', 'kech2ps'],
  // Chemistry - Class 12
  ['chemistry', '12', 'Solutions', 'lech1ps'],
  ['chemistry', '12', 'Electrochemistry', 'lech1ps'],
  ['chemistry', '12', 'Chemical Kinetics', 'lech1ps'],
  ['chemistry', '12', 'The d-and f-Block Elements', 'lech1ps'],
  ['chemistry', '12', 'Coordination Compounds', 'lech1ps'],
  ['chemistry', '12', 'Haloalkanes and Haloarenes', 'lech2ps'],
  ['chemistry', '12', 'Alcohols, Phenols and Ethers', 'lech2ps'],
  ['chemistry', '12', 'Aldehydes, Ketones and Carboxylic Acids', 'lech2ps'],
  ['chemistry', '12', 'Amines', 'lech2ps'],
  ['chemistry', '12', 'Biomolecules', 'lech2ps'],

  // Biology - Class 11
  ['biology', '11', 'The Living World', 'kebo1ps'],
  ['biology', '11', 'Biological Classification', 'kebo1ps'],
  ['biology', '11', 'Plant Kingdom', 'kebo1ps'],
  ['biology', '11', 'Animal Kingdom', 'kebo1ps'],
  ['biology', '11', 'Morphology of Flowering Plants', 'kebo1ps'],
  ['biology', '11', 'Anatomy of Flowering Plants', 'kebo1ps'],
  ['biology', '11', 'Structural Organisation in Animals', 'kebo1ps'],
  ['biology', '11', 'Cell: The Unit of Life', 'kebo1ps'],
  ['biology', '11', 'Biomolecules', 'kebo1ps'],
  ['biology', '11', 'Cell Cycle and Cell Division', 'kebo1ps'],
  ['biology', '11', 'Photosynthesis in Higher Plants', 'kebo1ps'],
  ['biology', '11', 'Respiration in Plants', 'kebo1ps'],
  ['biology', '11', 'Plant Growth and Development', 'kebo1ps'],
  ['biology', '11', 'Breathing and Exchange of Gases', 'kebo1ps'],
  ['biology', '11', 'Body Fluids and Circulation', 'kebo1ps'],
  ['biology', '11', 'Excretory Products and their Elimination', 'kebo1ps'],
  ['biology', '11', 'Locomotion and Movement', 'kebo1ps'],
  ['biology', '11', 'Neural Control and Coordination', 'kebo1ps'],
  ['biology', '11', 'Chemical Coordination and Integration', 'kebo1ps'],
  // Biology - Class 12
  ['biology', '12', 'Sexual Reproduction in Flowering Plants', 'lebo1ps'],
  ['biology', '12', 'Human Reproduction', 'lebo1ps'],
  ['biology', '12', 'Reproductive Health', 'lebo1ps'],
  ['biology', '12', 'Principles of Inheritance and Variation', 'lebo1ps'],
  ['biology', '12', 'Molecular Basis of Inheritance', 'lebo1ps'],
  ['biology', '12', 'Evolution', 'lebo1ps'],
  ['biology', '12', 'Human Health and Disease', 'lebo1ps'],
  ['biology', '12', 'Microbes in Human Welfare', 'lebo1ps'],
  ['biology', '12', 'Biotechnology: Principles and Processes', 'lebo1ps'],
  ['biology', '12', 'Biotechnology and its Applications', 'lebo1ps'],
  ['biology', '12', 'Organisms and Populations', 'lebo1ps'],
  ['biology', '12', 'Ecosystem', 'lebo1ps'],
  ['biology', '12', 'Biodiversity and Conservation', 'lebo1ps'],
].map(([subject, classLevel, chapter, bookCode]) => {
  const chapterNumber = (chapterCodeCounters.get(bookCode) || 0) + 1;
  chapterCodeCounters.set(bookCode, chapterNumber);
  const chapterCode = `${chapterCodePrefixes[bookCode]}${String(chapterNumber).padStart(2, '0')}`;

  return {
    subject,
    classLevel,
    chapter,
    bookCode,
    chapterCode,
    bookUrl: bookUrl(bookCode),
    chapterUrl: chapterUrl(chapterCode),
    edition: NCERT_EDITION,
  };
});

const chapterAliases = {
  'Measurement': 'Units and Measurements',
  'Units and Dimensions': 'Units and Measurements',
  'Work Energy and Power': 'Work, Energy and Power',
  'Semiconductor Electronics': 'Semiconductor Electronics: Materials, Devices and Simple Circuits',
  'Organic Compounds Containing Nitrogen': 'Amines',
  'The d- and f-Block Elements': 'The d-and f-Block Elements',
  'The p-Block Elements (Group 13 & 14)': 'The p-Block Elements',
  'The p-Block Elements (Group 15, 16, 17, 18)': 'The p-Block Elements',
  'Photosynthesis': 'Photosynthesis in Higher Plants',
  'Respiration': 'Respiration in Plants',
  'Growth and Development': 'Plant Growth and Development',
  'Genetics': 'Principles of Inheritance and Variation',
  'Reproduction in Plants': 'Sexual Reproduction in Flowering Plants',
  'Reproduction in Humans': 'Human Reproduction',
  'Immune System': 'Human Health and Disease',
  'Biotechnology - Principles and Processes': 'Biotechnology: Principles and Processes',
  'Biodiversity and its Conservation': 'Biodiversity and Conservation',
};

const curriculumKey = (subject, chapter) => `${subject}:${chapter}`.toLowerCase();
const curriculumMap = new Map(curriculum.map((item) => [curriculumKey(item.subject, item.chapter), item]));

function normalizeSubject(subject) {
  const value = String(subject || '').toLowerCase();
  return ['botany', 'zoology'].includes(value) ? 'biology' : value;
}

function normalizeChapter(chapter) {
  const value = String(chapter || '').trim();
  return chapterAliases[value] || value;
}

function findCurriculumEntry(subject, chapter) {
  return curriculumMap.get(curriculumKey(normalizeSubject(subject), normalizeChapter(chapter))) || null;
}

function listCurriculum(subject, classLevel) {
  return curriculum.filter((item) => (!subject || item.subject === normalizeSubject(subject)) && (!classLevel || item.classLevel === String(classLevel)));
}

module.exports = {
  NCERT_EDITION,
  NEET_SYLLABUS_VERSION,
  NEET_SYLLABUS_URL,
  curriculum,
  chapterAliases,
  normalizeSubject,
  normalizeChapter,
  findCurriculumEntry,
  listCurriculum,
};
