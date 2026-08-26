require('dotenv').config();
const connectDB = require('../config/database');
const { Subject, Chapter, Topic, Question } = require('../models/nursing');
const { normalizeText, contentHash } = require('../services/nursing/questionPlatformService');

const banks = {
  BIO: [
    ['Cell Structure and Function', 'Which organelle is the main site of aerobic ATP production in a eukaryotic cell?', 'Mitochondrion', 'Ribosome', 'Golgi apparatus', 'Lysosome'],
    ['Biomolecules', 'Which type of bond joins amino acids in a polypeptide chain?', 'Peptide bond', 'Glycosidic bond', 'Hydrogen bond', 'Phosphodiester bond'],
    ['Cell Cycle and Cell Division', 'During which phase of mitosis do sister chromatids separate?', 'Anaphase', 'Prophase', 'Metaphase', 'Telophase'],
    ['Breathing and Exchange of Gases', 'What is the principal site of gas exchange in human lungs?', 'Alveoli', 'Trachea', 'Bronchi', 'Pleura'],
    ['Body Fluids and Circulation', 'Which chamber pumps oxygenated blood into the systemic circulation?', 'Left ventricle', 'Right ventricle', 'Left atrium', 'Right atrium'],
    ['Excretory Products and Elimination', 'What is the structural and functional unit of the kidney?', 'Nephron', 'Neuron', 'Alveolus', 'Osteon'],
    ['Neural Control and Coordination', 'Which part of the brain is chiefly responsible for balance and posture?', 'Cerebellum', 'Medulla', 'Hypothalamus', 'Thalamus'],
    ['Human Reproduction', 'Where does fertilization most commonly occur in the human female reproductive tract?', 'Ampulla of the oviduct', 'Uterus', 'Cervix', 'Vagina'],
    ['Genetics', 'What phenotypic ratio is expected in a simple Mendelian monohybrid F2 cross with complete dominance?', '3:1', '1:1', '9:3:3:1', '1:2:1'],
    ['Human Health and Disease', 'Which cells differentiate into plasma cells that secrete antibodies?', 'B lymphocytes', 'Red blood cells', 'Platelets', 'Neutrophils']
  ],
  PHY: [
    ['Units and Measurements', 'What is the SI unit of force?', 'newton', 'joule', 'watt', 'pascal'],
    ['Motion', 'What does the slope of a displacement-time graph represent?', 'Velocity', 'Acceleration', 'Force', 'Momentum'],
    ['Laws of Motion', 'Which law explains the recoil of a gun?', "Newton's third law", "Newton's first law", "Newton's second law", 'Law of gravitation'],
    ['Work, Energy and Power', 'What is the SI unit of power?', 'watt', 'joule', 'newton', 'coulomb'],
    ['Gravitation', 'How does gravitational force vary with the distance between two point masses?', 'It is inversely proportional to the square of distance', 'It is directly proportional to distance', 'It is independent of distance', 'It is inversely proportional to distance'],
    ['Thermodynamics', 'Which thermodynamic quantity remains constant in an isothermal process for an ideal gas?', 'Temperature', 'Pressure', 'Volume', 'Internal energy transfer'],
    ['Waves', 'Which relation connects wave speed, frequency, and wavelength?', 'v = fλ', 'v = f/λ', 'v = λ/f', 'v = f + λ'],
    ['Current Electricity', 'According to Ohm’s law, potential difference equals:', 'Current multiplied by resistance', 'Current divided by resistance', 'Resistance divided by current', 'Power multiplied by current'],
    ['Ray Optics', 'Which lens is used to correct myopia?', 'Concave lens', 'Convex lens', 'Cylindrical lens only', 'Plane glass plate'],
    ['Semiconductor Electronics', 'Which charge carriers are the majority carriers in an n-type semiconductor?', 'Electrons', 'Holes', 'Protons', 'Neutrons']
  ],
  CHE: [
    ['Some Basic Concepts of Chemistry', 'How many particles are present in one mole of a substance?', '6.022 × 10²³', '3.011 × 10²³', '9.81 × 10²³', '1.602 × 10⁻¹⁹'],
    ['Structure of Atom', 'Which subatomic particle determines the atomic number of an element?', 'Proton', 'Neutron', 'Electron shell', 'Nucleon pair'],
    ['Classification of Elements', 'Across a period, atomic radius generally:', 'Decreases', 'Increases', 'Remains constant', 'First decreases then always doubles'],
    ['Chemical Bonding', 'Which bond is formed by sharing electron pairs between atoms?', 'Covalent bond', 'Ionic bond', 'Metallic bond only', 'Hydrogen bond'],
    ['Thermodynamics', 'For an exothermic reaction, the enthalpy change is generally:', 'Negative', 'Positive', 'Always zero', 'Undefined'],
    ['Equilibrium', 'A catalyst changes the rate of reaching equilibrium but does not change the:', 'Equilibrium constant at a fixed temperature', 'Activation energy', 'Forward reaction rate', 'Reverse reaction rate'],
    ['Redox Reactions', 'Oxidation is best described as:', 'Loss of electrons', 'Gain of electrons', 'Gain of neutrons', 'Loss of protons only'],
    ['Solutions', 'What is the molarity of a solution containing one mole of solute in one litre of solution?', '1 M', '0.1 M', '10 M', '1 molal'],
    ['Chemical Kinetics', 'The minimum energy required for a reaction to occur is called:', 'Activation energy', 'Ionization energy', 'Lattice energy', 'Bond order'],
    ['Biomolecules', 'Which biomolecule stores hereditary information in most organisms?', 'DNA', 'Starch', 'Triglyceride', 'Cellulose']
  ],
  ENG: [
    ['Parts of Speech', 'In the sentence “The nurse spoke gently,” what part of speech is “gently”?', 'Adverb', 'Adjective', 'Noun', 'Preposition'],
    ['Tenses', 'Choose the correct completion: “She ____ in this hospital since 2024.”', 'has worked', 'worked tomorrow', 'is work', 'have working'],
    ['Articles', 'Choose the correct article: “He is ____ honest person.”', 'an', 'a', 'the only', 'no article'],
    ['Prepositions', 'Choose the correct preposition: “The patient was admitted ____ the hospital.”', 'to', 'at', 'by', 'for'],
    ['Conjunctions', 'Choose the word that best completes: “Wash your hands ____ you examine the patient.”', 'before', 'because', 'although', 'unless never'],
    ['Subject-Verb Agreement', 'Choose the correct verb: “Each of the students ____ a notebook.”', 'has', 'have', 'were having', 'are'],
    ['Active and Passive Voice', 'Choose the passive form of “The nurse recorded the pulse.”', 'The pulse was recorded by the nurse.', 'The pulse recorded the nurse.', 'The nurse was recorded by the pulse.', 'The pulse has record.'],
    ['Direct and Indirect Speech', 'Choose the correct reported form: Ravi said, “I am tired.”', 'Ravi said that he was tired.', 'Ravi said that I am tired.', 'Ravi says he tired.', 'Ravi told that was tired.'],
    ['Synonyms', 'Choose the closest synonym of “rapid.”', 'Swift', 'Distant', 'Silent', 'Fragile'],
    ['Antonyms', 'Choose the antonym of “scarce.”', 'Abundant', 'Rare', 'Limited', 'Insufficient']
  ],
  GK: [
    ['Indian Polity', 'Which part of the Constitution of India contains Fundamental Rights?', 'Part III', 'Part I', 'Part V', 'Part IX'],
    ['Indian Geography', 'Which river is known as the “Sorrow of Bihar”?', 'Kosi', 'Godavari', 'Narmada', 'Sabarmati'],
    ['Indian History', 'Who founded the Mauryan Empire?', 'Chandragupta Maurya', 'Ashoka', 'Harshavardhana', 'Samudragupta'],
    ['General Science', 'Which vitamin is synthesized in human skin in response to sunlight?', 'Vitamin D', 'Vitamin C', 'Vitamin B12', 'Vitamin K only'],
    ['Health Awareness', 'Which measure most directly helps break the chain of infection in routine patient care?', 'Appropriate hand hygiene', 'Increasing room temperature', 'Reducing drinking water', 'Avoiding all patient communication'],
    ['Medical Awareness', 'Which instrument is used to measure blood pressure?', 'Sphygmomanometer', 'Spirometer', 'Thermometer', 'Otoscope'],
    ['Important Days', 'International Nurses Day is observed on:', '12 May', '7 April', '1 December', '5 June'],
    ['Nursing-related Awareness', 'Who is widely regarded as the founder of modern nursing?', 'Florence Nightingale', 'Marie Curie', 'Clara Zetkin', 'Annie Besant'],
    ['Indian Polity', 'What is the minimum voting age for citizens in India?', '18 years', '16 years', '21 years', '25 years'],
    ['General Science', 'Which blood component is primarily responsible for clotting?', 'Platelets', 'Red blood cells', 'Plasma water', 'Lymphocytes only']
  ]
};

async function seed() {
  await connectDB();
  let count = 0;
  for (const [subjectCode, rows] of Object.entries(banks)) {
    const subject = await Subject.findOne({ subjectCode });
    if (!subject) throw new Error(`Run seed:nursing-platform first; subject ${subjectCode} is missing.`);
    for (let index = 0; index < rows.length; index += 1) {
      const [chapterName, questionText, correct, wrongB, wrongC, wrongD] = rows[index];
      const chapter = await Chapter.findOne({ subjectId: subject._id, fullChapterName: chapterName });
      if (!chapter) throw new Error(`Missing chapter: ${subjectCode} / ${chapterName}`);
      const topic = await Topic.findOne({ chapterId: chapter._id }).sort({ displayOrder: 1 });
      await Question.findOneAndUpdate(
        { questionId: `NSG-SAMPLE-${subjectCode}-${String(index + 1).padStart(2, '0')}` },
        {
          questionId: `NSG-SAMPLE-${subjectCode}-${String(index + 1).padStart(2, '0')}`,
          questionText,
          options: { A: { text: correct }, B: { text: wrongB }, C: { text: wrongC }, D: { text: wrongD } },
          correctAnswer: 'A',
          explanation: { text: `${correct} is the correct answer. This development explanation must be reviewed before publication.` },
          subject: subject._id,
          chapter: chapter._id,
          topic: topic?._id,
          type: 'mcq',
          difficulty: index < 4 ? 'easy' : index < 8 ? 'medium' : 'hard',
          source: 'admin_created',
          sourceType: 'admin-created',
          sourceMetadata: { sourceName: 'Development sample set', reusePermission: 'not-required', verificationStatus: 'needs-review' },
          generatedByAI: false,
          isPYQ: false,
          isPublished: false,
          isVerified: false,
          qualityScore: 75,
          confidenceScore: 0,
          concept: chapterName,
          tags: ['development-sample', subjectCode.toLowerCase()],
          language: 'english',
          lifecycleStatus: 'NEEDS_REVIEW',
          reviewStatus: 'pending',
          verificationStatus: 'needs-review',
          normalizedText: normalizeText(questionText),
          contentHash: contentHash(questionText),
          updatedAt: new Date()
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      count += 1;
    }
  }
  console.log(`Seeded ${count} clearly labelled, unpublished nursing development questions (10 per subject).`);
  process.exit(0);
}

seed().catch(error => { console.error('Nursing sample seed failed:', error); process.exit(1); });
