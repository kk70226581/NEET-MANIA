require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Question = require('../models/Question');
const User = require('../models/User');

const optionKeys = ['A', 'B', 'C', 'D'];

const rotate = (items, offset) => {
  const position = offset % items.length;
  return [...items.slice(position), ...items.slice(0, position)];
};

const buildOptions = (correct, distractors, seed) => {
  const values = [String(correct), ...distractors.map(String)];
  const uniqueValues = [...new Set(values)];
  while (uniqueValues.length < 4) {
    uniqueValues.push(String(Number(correct) + uniqueValues.length + 1));
  }
  const shuffled = rotate(uniqueValues.slice(0, 4), seed);
  return {
    options: Object.fromEntries(optionKeys.map((key, index) => [key, { text: shuffled[index] }])),
    correctAnswer: optionKeys[shuffled.indexOf(String(correct))]
  };
};

const baseQuestion = ({
  id,
  subject,
  chapter,
  topic,
  text,
  answer,
  distractors,
  index,
  explanation,
  difficulty = 'medium'
}) => ({
  questionId: id,
  questionText: text,
  ...buildOptions(answer, distractors, index),
  explanation: { text: explanation },
  subject,
  chapter,
  topic,
  type: 'mcq',
  difficulty,
  source: 'custom',
  sourceDetails: { testName: 'Solnut demo question bank' },
  qualityScore: 70,
  learningObjective: topic,
  commonMistake: 'Check the concept and units before selecting an option.',
  estimatedTime: 50,
  tags: [subject, chapter, topic, 'demo'],
  isVerified: true,
  isPublished: true,
  verifiedAt: new Date()
});

const numericQuestions = ({
  prefix,
  subject,
  chapter,
  topic,
  count,
  create
}) => Array.from({ length: count }, (_, index) => {
  const generated = create(index);
  return baseQuestion({
    id: `${prefix}-${String(index + 1).padStart(3, '0')}`,
    subject,
    chapter,
    topic,
    index,
    difficulty: ['easy', 'medium', 'hard'][index % 3],
    ...generated
  });
});

const factQuestions = ({ prefix, subject, chapter, topic, facts, count = 30 }) => (
  Array.from({ length: count }, (_, index) => {
    const factIndex = index % facts.length;
    const [answer, description] = facts[factIndex];
    const distractors = [1, 2, 3].map((step) => facts[(factIndex + step) % facts.length][0]);
    const prompts = [
      `Which term is correctly associated with this description: ${description}?`,
      `Identify the structure or concept that best matches: ${description}.`,
      `In NCERT-based biology, ${description} refers to which option?`
    ];
    return baseQuestion({
      id: `${prefix}-${String(index + 1).padStart(3, '0')}`,
      subject,
      chapter,
      topic,
      text: prompts[Math.floor(index / facts.length) % prompts.length],
      answer,
      distractors,
      index,
      explanation: `${answer} is the correct match because it is associated with ${description}.`,
      difficulty: ['easy', 'medium', 'medium'][Math.floor(index / facts.length) % 3]
    });
  })
);

const buildQuestionBank = () => {
  const questions = [];

  questions.push(...numericQuestions({
    prefix: 'DEMO-PHY-CE',
    subject: 'physics',
    chapter: 'Current Electricity',
    topic: "Ohm's Law",
    count: 30,
    create: (index) => {
      const current = (index % 6) + 1;
      const resistance = (index % 9) + 2;
      const voltage = current * resistance;
      return {
        text: `A current of ${current} A flows through a resistor when ${voltage} V is applied. What is its resistance?`,
        answer: `${resistance} Ω`,
        distractors: [`${resistance + 2} Ω`, `${current + resistance} Ω`, `${voltage + current} Ω`],
        explanation: `Using Ohm's law, R = V/I = ${voltage}/${current} = ${resistance} Ω.`
      };
    }
  }));

  questions.push(...numericQuestions({
    prefix: 'DEMO-PHY-NLM',
    subject: 'physics',
    chapter: 'Laws of Motion',
    topic: "Newton's Second Law",
    count: 30,
    create: (index) => {
      const mass = (index % 8) + 2;
      const acceleration = (index % 5) + 1;
      const force = mass * acceleration;
      return {
        text: `A body of mass ${mass} kg accelerates at ${acceleration} m/s². Find the net force acting on it.`,
        answer: `${force} N`,
        distractors: [`${mass + acceleration} N`, `${force + mass} N`, `${Math.max(1, force - acceleration)} N`],
        explanation: `Newton's second law gives F = ma = ${mass} × ${acceleration} = ${force} N.`
      };
    }
  }));

  questions.push(...numericQuestions({
    prefix: 'DEMO-PHY-WEP',
    subject: 'physics',
    chapter: 'Work Energy and Power',
    topic: 'Power',
    count: 30,
    create: (index) => {
      const time = (index % 6) + 2;
      const power = ((index % 8) + 2) * 10;
      const work = power * time;
      return {
        text: `${work} J of work is done uniformly in ${time} s. What is the power developed?`,
        answer: `${power} W`,
        distractors: [`${work + time} W`, `${power + 10} W`, `${Math.max(10, power - 10)} W`],
        explanation: `Power = work/time = ${work}/${time} = ${power} W.`
      };
    }
  }));

  questions.push(...numericQuestions({
    prefix: 'DEMO-CHE-MOL',
    subject: 'chemistry',
    chapter: 'Some Basic Concepts of Chemistry',
    topic: 'Mole Concept',
    count: 30,
    create: (index) => {
      const molarMass = [18, 20, 22, 24, 28, 32][index % 6];
      const moles = (index % 4) + 1;
      const mass = molarMass * moles;
      return {
        text: `A substance has molar mass ${molarMass} g mol⁻¹. How many moles are present in ${mass} g?`,
        answer: `${moles} mol`,
        distractors: [`${moles + 1} mol`, `${molarMass} mol`, `${mass} mol`],
        explanation: `Number of moles = given mass/molar mass = ${mass}/${molarMass} = ${moles} mol.`
      };
    }
  }));

  questions.push(...numericQuestions({
    prefix: 'DEMO-CHE-ATOM',
    subject: 'chemistry',
    chapter: 'Structure of Atom',
    topic: 'Atomic Composition',
    count: 30,
    create: (index) => {
      const atomicNumber = (index % 14) + 3;
      const neutrons = (index % 9) + 4;
      const massNumber = atomicNumber + neutrons;
      return {
        text: `An atom has atomic number ${atomicNumber} and mass number ${massNumber}. How many neutrons does it contain?`,
        answer: `${neutrons}`,
        distractors: [`${atomicNumber}`, `${massNumber}`, `${Math.abs(atomicNumber - neutrons)}`],
        explanation: `Neutrons = mass number − atomic number = ${massNumber} − ${atomicNumber} = ${neutrons}.`
      };
    }
  }));

  questions.push(...numericQuestions({
    prefix: 'DEMO-CHE-THERMO',
    subject: 'chemistry',
    chapter: 'Thermodynamics',
    topic: 'Heat Capacity',
    count: 30,
    create: (index) => {
      const mass = (index % 5) + 1;
      const temperatureRise = (index % 6) + 2;
      const specificHeat = (index % 4) + 2;
      const heat = mass * temperatureRise * specificHeat;
      return {
        text: `${heat} J of heat raises the temperature of a ${mass} g sample by ${temperatureRise} K. Find its specific heat capacity.`,
        answer: `${specificHeat} J g⁻¹ K⁻¹`,
        distractors: [`${specificHeat + 1} J g⁻¹ K⁻¹`, `${mass * temperatureRise} J g⁻¹ K⁻¹`, `${heat} J g⁻¹ K⁻¹`],
        explanation: `c = q/(mΔT) = ${heat}/(${mass} × ${temperatureRise}) = ${specificHeat} J g⁻¹ K⁻¹.`
      };
    }
  }));

  questions.push(...factQuestions({
    prefix: 'DEMO-BIO-CELL',
    subject: 'biology',
    chapter: 'Cell Structure and Function',
    topic: 'Cell Organelles',
    facts: [
      ['Mitochondrion', 'a major site of aerobic ATP production'],
      ['Ribosome', 'the site of protein synthesis'],
      ['Golgi apparatus', 'modification and packaging of secretory products'],
      ['Lysosome', 'intracellular digestion by hydrolytic enzymes'],
      ['Nucleus', 'storage of most cellular genetic material'],
      ['Chloroplast', 'photosynthesis in green plant cells'],
      ['Endoplasmic reticulum', 'an intracellular transport and synthesis network'],
      ['Centriole', 'organisation of spindle fibres in many animal cells'],
      ['Central vacuole', 'maintenance of turgor in a mature plant cell'],
      ['Plasma membrane', 'selective control of substances entering and leaving a cell']
    ]
  }));

  questions.push(...factQuestions({
    prefix: 'DEMO-BIO-GEN',
    subject: 'biology',
    chapter: 'Genetics',
    topic: 'Principles of Inheritance',
    facts: [
      ['Alleles', 'alternative forms of the same gene'],
      ['Homozygous', 'having two identical alleles for a locus'],
      ['Heterozygous', 'having two different alleles for a locus'],
      ['Phenotype', 'the observable expression of a trait'],
      ['Genotype', 'the genetic constitution for a trait'],
      ['Law of segregation', 'separation of paired alleles during gamete formation'],
      ['Independent assortment', 'independent segregation of different gene pairs'],
      ['Test cross', 'a cross with a homozygous recessive individual'],
      ['Codominance', 'simultaneous expression of both alleles in a heterozygote'],
      ['Mutation', 'a heritable change in genetic material']
    ]
  }));

  questions.push(...factQuestions({
    prefix: 'DEMO-BIO-HUM',
    subject: 'biology',
    chapter: 'Human Physiology',
    topic: 'Organ Systems',
    facts: [
      ['Nephron', 'the structural and functional unit of the kidney'],
      ['Alveolus', 'the principal site of gaseous exchange in the lungs'],
      ['Haemoglobin', 'transport of most oxygen in human blood'],
      ['Sinoatrial node', 'the normal pacemaker of the human heart'],
      ['Insulin', 'lowering blood glucose by promoting uptake and storage'],
      ['Pepsin', 'initial digestion of proteins in the stomach'],
      ['Bile salts', 'emulsification of dietary fats'],
      ['Intestinal villi', 'increase of surface area for nutrient absorption'],
      ['ADH', 'increased water reabsorption in kidney collecting ducts'],
      ['Cerebellum', 'coordination of posture and balance']
    ]
  }));

  questions.push(...factQuestions({
    prefix: 'DEMO-BIO-ECO',
    subject: 'biology',
    chapter: 'Ecology',
    topic: 'Ecological Organisation',
    facts: [
      ['Producer', 'an organism that converts inorganic resources into organic food'],
      ['Decomposer', 'an organism that breaks down dead organic matter'],
      ['Population', 'individuals of one species living in a defined area'],
      ['Community', 'interacting populations of different species in an area'],
      ['Ecosystem', 'a community together with its abiotic environment'],
      ['Ecological niche', 'the functional role and resource use of a species'],
      ['Habitat', 'the physical place where an organism lives'],
      ['Mutualism', 'an interaction in which both species benefit'],
      ['Parasitism', 'an interaction benefiting one organism while harming the host'],
      ['Biomagnification', 'increase in concentration of persistent toxins at higher trophic levels']
    ]
  }));

  return questions;
};

const pyqQuestions = [
  {
    questionId: "PYQ-PHY-CE-001",
    questionText: "A resistance wire connected in the left gap of a metre bridge balances a 10 Ω resistance in the right gap at a point which divides the bridge wire in the ratio 3:2. If the length of the resistance wire is 1.5 m, then the length of 1 Ω of the resistance wire is:",
    options: {
      A: { text: "1.0 × 10⁻¹ m" },
      B: { text: "1.5 × 10⁻¹ m" },
      C: { text: "1.5 × 10⁻² m" },
      D: { text: "1.0 × 10⁻² m" }
    },
    correctAnswer: "A",
    explanation: { text: "For a metre bridge, R/S = l₁/l₂. Here S = 10 Ω and l₁/l₂ = 3/2. Thus, R = 10 × (3/2) = 15 Ω. The length of wire is 1.5 m. Resistance per unit length is 15 Ω / 1.5 m = 10 Ω/m. Therefore, length for 1 Ω is 1 / 10 = 0.1 m = 1.0 × 10⁻¹ m." },
    subject: "physics",
    chapter: "Current Electricity",
    topic: "Meter Bridge",
    difficulty: "medium",
    source: "pyq",
    sourceDetails: { year: 2020, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2020" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-PHY-CE-002",
    questionText: "The solids which have the negative temperature coefficient of resistance are:",
    options: {
      A: { text: "metals only" },
      B: { text: "semiconductors only" },
      C: { text: "insulators and semiconductors" },
      D: { text: "metals and insulators" }
    },
    correctAnswer: "C",
    explanation: { text: "Insulators and semiconductors have a negative temperature coefficient of resistance, meaning their resistance decreases as temperature increases." },
    subject: "physics",
    chapter: "Current Electricity",
    topic: "Temperature Dependence of Resistance",
    difficulty: "easy",
    source: "pyq",
    sourceDetails: { year: 2020, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2020" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-PHY-NLM-001",
    questionText: "A body of mass 60 kg is suspended by means of three strings. Two of the strings are inclined at 45° to the vertical and the third string is horizontal. Find the tension in the horizontal string.",
    options: {
      A: { text: "294 N" },
      B: { text: "588 N" },
      C: { text: "150 N" },
      D: { text: "0 N" }
    },
    correctAnswer: "B",
    explanation: { text: "At equilibrium, horizontal forces balance: T₁ sin(45°) = T₃ (horizontal tension). Vertical forces balance: T₁ cos(45°) = mg. Thus T₃ = mg tan(45°) = 60 kg × 9.8 m/s² × 1 = 588 N." },
    subject: "physics",
    chapter: "Laws of Motion",
    topic: "Equilibrium of Forces",
    difficulty: "hard",
    source: "pyq",
    sourceDetails: { year: 2018, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2018" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-CHE-MOL-001",
    questionText: "What is the mass of carbon dioxide produced when 1 mole of carbon is burnt in 16 g of dioxygen gas?",
    options: {
      A: { text: "44 g" },
      B: { text: "22 g" },
      C: { text: "88 g" },
      D: { text: "11 g" }
    },
    correctAnswer: "B",
    explanation: { text: "C + O₂ → CO₂. 1 mole of C reacts with 1 mole (32 g) of O₂. Here, we only have 16 g of O₂ (0.5 mole). O₂ is the limiting reagent. So, 0.5 mole of CO₂ is produced. Mass = 0.5 × 44 g = 22 g." },
    subject: "chemistry",
    chapter: "Some Basic Concepts of Chemistry",
    topic: "Stoichiometry and Stoichiometric Calculations",
    difficulty: "medium",
    source: "pyq",
    sourceDetails: { year: 2021, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2021" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-CHE-MOL-002",
    questionText: "Which of the following has the maximum number of atoms?",
    options: {
      A: { text: "1 g of Ag (s) [Atomic mass = 108]" },
      B: { text: "1 g of Mg (s) [Atomic mass = 24]" },
      C: { text: "1 g of O₂ (g) [Atomic mass = 16]" },
      D: { text: "1 g of Li (s) [Atomic mass = 7]" }
    },
    correctAnswer: "D",
    explanation: { text: "Number of atoms = (Mass / Atomic Mass) × Avogadro's number. Since mass is 1 g for all, the substance with the lowest atomic mass (Li = 7) will have the maximum number of atoms." },
    subject: "chemistry",
    chapter: "Some Basic Concepts of Chemistry",
    topic: "Mole Concept",
    difficulty: "easy",
    source: "pyq",
    sourceDetails: { year: 2020, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2020" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-CHE-ATOM-001",
    questionText: "The number of angular nodes and radial nodes of 4d orbital, respectively, are:",
    options: {
      A: { text: "2 and 1" },
      B: { text: "1 and 2" },
      C: { text: "3 and 0" },
      D: { text: "2 and 2" }
    },
    correctAnswer: "A",
    explanation: { text: "For 4d orbital: n = 4, l = 2. Angular nodes = l = 2. Radial nodes = n - l - 1 = 4 - 2 - 1 = 1." },
    subject: "chemistry",
    chapter: "Structure of Atom",
    topic: "Quantum Numbers and Orbitals",
    difficulty: "medium",
    source: "pyq",
    sourceDetails: { year: 2019, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2019" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-BIO-CELL-001",
    questionText: "Which of the following cell organelles is responsible for extracting energy from carbohydrates to form ATP?",
    options: {
      A: { text: "Ribosome" },
      B: { text: "Mitochondrion" },
      C: { text: "Lysosome" },
      D: { text: "Chloroplast" }
    },
    correctAnswer: "B",
    explanation: { text: "Mitochondria are the sites of aerobic respiration. They produce cellular energy in the form of ATP, hence they are called the powerhouses of the cell." },
    subject: "biology",
    chapter: "Cell Structure and Function",
    topic: "Mitochondria",
    difficulty: "easy",
    source: "pyq",
    sourceDetails: { year: 2017, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2017" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-BIO-CELL-002",
    questionText: "Select the mismatch from the following:",
    options: {
      A: { text: "Gas vacuoles - Green bacteria" },
      B: { text: "Large central vacuoles - Animal cells" },
      C: { text: "Protists - Eukaryotes" },
      D: { text: "Methanogens - Prokaryotes" }
    },
    correctAnswer: "B",
    explanation: { text: "Large central vacuoles are characteristic of mature plant cells, not animal cells. Animal cells generally have small, temporary vacuoles." },
    subject: "biology",
    chapter: "Cell Structure and Function",
    topic: "Vacuoles",
    difficulty: "easy",
    source: "pyq",
    sourceDetails: { year: 2016, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2016" },
    isVerified: true,
    isPublished: true
  },
  {
    questionId: "PYQ-BIO-GEN-001",
    questionText: "Who proposed the chromosomal theory of inheritance?",
    options: {
      A: { text: "Sutton and Boveri" },
      B: { text: "Boveri and Morgan" },
      C: { text: "Morgan and Mendel" },
      D: { text: "Watson and Crick" }
    },
    correctAnswer: "A",
    explanation: { text: "Walter Sutton and Theodor Boveri noted that the behaviour of chromosomes was parallel to the behaviour of genes and used chromosome movement to explain Mendel's laws. They proposed the Chromosomal Theory of Inheritance." },
    subject: "biology",
    chapter: "Genetics",
    topic: "Chromosomal Theory of Inheritance",
    difficulty: "medium",
    source: "pyq",
    sourceDetails: { year: 2020, examType: "neet" },
    pyq: { isPYQ: true, reference: "NEET 2020" },
    isVerified: true,
    isPublished: true
  }
];

const normalizeSubject = (sub) => {
  if (!sub) return 'biology';
  const s = sub.toLowerCase();
  if (s.startsWith('phy')) return 'physics';
  if (s.startsWith('chem')) return 'chemistry';
  if (s.startsWith('bio') || s.startsWith('bot') || s.startsWith('zoo')) return 'biology';
  return 'biology';
};

const normalizeDifficulty = (diff) => {
  if (!diff) return 'medium';
  const d = diff.toLowerCase();
  if (d.startsWith('easy')) return 'easy';
  if (d.startsWith('hard') || d.startsWith('diff')) return 'hard';
  return 'medium';
};

const importAll = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();

    console.log('🧹 Wiping all questions in MongoDB...');
    await Question.deleteMany({});
    console.log('🗑️ Database cleared.');

    const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@solnut.local').toLowerCase();
    let admin = await User.findOne({ email: adminEmail });

    const seenTexts = new Set();
    const questionsToInsert = [];

    // Helper to add unique question
    const addQuestion = (q) => {
      if (!q.questionText) return;
      const textTrim = q.questionText.trim();
      if (!textTrim) return;
      if (seenTexts.has(textTrim)) return; // skip redundancy
      seenTexts.add(textTrim);
      questionsToInsert.push({
        ...q,
        questionText: textTrim,
        isVerified: true,
        isPublished: true,
        ...(admin ? { uploadedBy: admin._id, verifiedBy: admin._id } : {}),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    };

    // 1. Seed our baseline 309 questions
    console.log('🌱 Adding baseline 309 questions...');
    buildQuestionBank().forEach(q => addQuestion(q));
    pyqQuestions.forEach(q => addQuestion(q));

    // 2. Load neet_mock_test(1), (2), (3) from Downloads
    for (let num = 1; num <= 3; num++) {
      const filePath = `C:\\Users\\karan\\Downloads\\neet_mock_test(${num}).html`;
      if (fs.existsSync(filePath)) {
        console.log(`📖 Parsing ${path.basename(filePath)}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        const startMarker = 'const questions = [';
        const startIdx = content.indexOf(startMarker);
        if (startIdx !== -1) {
          const endIdx = content.indexOf('];', startIdx);
          if (endIdx !== -1) {
            const arrayContent = content.slice(startIdx + startMarker.length - 1, endIdx + 2);
            try {
              let questions = [];
              eval('questions = ' + arrayContent);
              questions.forEach((q, idx) => {
                const formattedOpts = {};
                optionKeys.forEach((key, index) => {
                  formattedOpts[key] = { text: q.options[index] || `Option ${key}` };
                });
                const correctAnsKey = optionKeys[q.answer] || 'A';
                addQuestion({
                  questionId: `HTML-MOCK-${num}-${idx + 1}`,
                  questionText: q.question,
                  options: formattedOpts,
                  correctAnswer: correctAnsKey,
                  explanation: { text: 'Refer to standard solutions or concept books.' },
                  subject: normalizeSubject(q.subject),
                  chapter: q.chapter || 'General',
                  topic: q.chapter || 'General',
                  difficulty: 'medium',
                  type: 'mcq',
                  source: 'mock'
                });
              });
              console.log(`  Added ${questions.length} questions.`);
            } catch (err) {
              console.log(`  Failed to parse: ${err.message}`);
            }
          }
        }
      }
    }

    // 3. Load neet_topicwise_test.json from Downloads
    const jsonPath = 'C:\\Users\\karan\\Downloads\\neet_topicwise_test.json';
    if (fs.existsSync(jsonPath)) {
      console.log('📖 Parsing neet_topicwise_test.json...');
      try {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        if (data && Array.isArray(data.questions)) {
          data.questions.forEach((q, idx) => {
            const formattedOpts = {};
            optionKeys.forEach(key => {
              formattedOpts[key] = { text: q.options[key] || q.options[key.toLowerCase()] || `Option ${key}` };
            });
            addQuestion({
              questionId: `JSON-TOPIC-${idx + 1}`,
              questionText: q.questionText,
              options: formattedOpts,
              correctAnswer: q.correctAnswer || 'A',
              explanation: { text: q.explanation || 'Refer to standard solutions or concept books.' },
              subject: normalizeSubject(q.subject),
              chapter: q.chapter || 'General',
              topic: q.topic || q.chapter || 'General',
              difficulty: normalizeDifficulty(q.difficulty),
              type: 'mcq',
              source: 'mock'
            });
          });
          console.log(`  Added ${data.questions.length} questions.`);
        }
      } catch (err) {
        console.log(`  Failed to parse json file: ${err.message}`);
      }
    }

    // 4. Load neet_mock2_full.html
    const mock2Path = 'C:\\Users\\karan\\Downloads\\neet_mock2_full.html';
    if (fs.existsSync(mock2Path)) {
      console.log('📖 Parsing neet_mock2_full.html...');
      const content = fs.readFileSync(mock2Path, 'utf8');
      const startIdx = content.indexOf('const Qs=[');
      if (startIdx !== -1) {
        let braceCount = 1;
        let endIdx = -1;
        for (let i = startIdx + 10; i < content.length; i++) {
          if (content[i] === '[') braceCount++;
          if (content[i] === ']') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }
        }
        if (endIdx !== -1) {
          const arrayContent = content.slice(startIdx + 9, endIdx + 1);
          try {
            let Qs = [];
            eval('Qs = ' + arrayContent);
            Qs.forEach((q, idx) => {
              const formattedOpts = {};
              optionKeys.forEach((key, index) => {
                formattedOpts[key] = { text: q.opts[index] || `Option ${key}` };
              });
              const correctAnsKey = optionKeys[q.ans] || 'A';
              addQuestion({
                questionId: `HTML-MOCK2-${idx + 1}`,
                questionText: q.text,
                options: formattedOpts,
                correctAnswer: correctAnsKey,
                explanation: { text: q.exp || 'Refer to standard solutions or concept books.' },
                subject: normalizeSubject(q.sub === 'P' ? 'physics' : q.sub === 'C' ? 'chemistry' : 'biology'),
                chapter: q.chN || 'General',
                topic: q.chN || 'General',
                difficulty: 'medium',
                type: 'mcq',
                source: 'mock'
              });
            });
            console.log(`  Added ${Qs.length} questions.`);
          } catch (err) {
            console.log(`  Failed to eval: ${err.message}`);
          }
        }
      }
    }

    // 5. Load Project Image/1.html
    const projectImgPath = 'C:\\Users\\karan\\Downloads\\Project Image\\1.html';
    if (fs.existsSync(projectImgPath)) {
      console.log('📖 Parsing Project Image/1.html...');
      const content = fs.readFileSync(projectImgPath, 'utf8');
      const startIdx = content.indexOf('const Qs=[');
      if (startIdx !== -1) {
        let braceCount = 1;
        let endIdx = -1;
        for (let i = startIdx + 10; i < content.length; i++) {
          if (content[i] === '[') braceCount++;
          if (content[i] === ']') {
            braceCount--;
            if (braceCount === 0) {
              endIdx = i;
              break;
            }
          }
        }
        if (endIdx !== -1) {
          const arrayContent = content.slice(startIdx + 9, endIdx + 1);
          try {
            let Qs = [];
            eval('Qs = ' + arrayContent);
            Qs.forEach((q, idx) => {
              const formattedOpts = {};
              optionKeys.forEach((key, index) => {
                formattedOpts[key] = { text: q.opts[index] || `Option ${key}` };
              });
              const correctAnsKey = optionKeys[q.ans] || 'A';
              addQuestion({
                questionId: `HTML-PROJECT-1-${idx + 1}`,
                questionText: q.text,
                options: formattedOpts,
                correctAnswer: correctAnsKey,
                explanation: { text: q.exp || 'Refer to standard solutions or concept books.' },
                subject: normalizeSubject(q.sub === 'P' ? 'physics' : q.sub === 'C' ? 'chemistry' : 'biology'),
                chapter: q.chN || 'General',
                topic: q.chN || 'General',
                difficulty: 'medium',
                type: 'mcq',
                source: 'mock'
              });
            });
            console.log(`  Added ${Qs.length} questions.`);
          } catch (err) {
            console.log(`  Failed to eval: ${err.message}`);
          }
        }
      }
    }

    console.log(`🌱 Writing ${questionsToInsert.length} total unique questions to MongoDB...`);
    await Question.insertMany(questionsToInsert);
    console.log(`🎉 Successfully seeded ${questionsToInsert.length} total unique questions into MongoDB!`);

  } catch (error) {
    console.error('❌ Importing failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
};

importAll();
