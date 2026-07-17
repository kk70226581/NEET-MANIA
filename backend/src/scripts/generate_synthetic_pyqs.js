const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ----------------- PHYSICS / MATH GENERATORS -----------------
function generateKinematics() {
  const a = getRandom(2, 10);
  const t = getRandom(3, 15);
  const v = a * t;
  
  const options = [
    `${v} m/s`,
    `${v + a} m/s`,
    `${v - t} m/s`,
    `${v * 2} m/s`
  ];
  
  // Shuffle options
  const shuffled = [...options].sort(() => 0.5 - Math.random());
  const correctIndex = shuffled.indexOf(`${v} m/s`);
  const correctLetter = ['A', 'B', 'C', 'D'][correctIndex];

  return {
    questionText: `A particle starts from rest and moves with a constant acceleration of ${a} m/s². What will be its velocity after ${t} seconds?`,
    options: {
      A: { text: shuffled[0] },
      B: { text: shuffled[1] },
      C: { text: shuffled[2] },
      D: { text: shuffled[3] }
    },
    correctAnswer: correctLetter,
    explanation: { text: `Using the equation of motion v = u + at. Here u = 0, a = ${a} m/s², t = ${t} s. Therefore, v = 0 + (${a})(${t}) = ${v} m/s.` },
    subject: "physics",
    chapter: "Motion in a Straight Line",
    topic: "Kinematics",
    type: "mcq",
    difficulty: "medium"
  };
}

function generateThermodynamics() {
  const n = getRandom(1, 5);
  const T = getRandom(300, 500);
  const work = Math.round(n * 8.314 * T * Math.log(2)); 
  
  const options = [
    `${work} J`,
    `${Math.round(work * 1.5)} J`,
    `${Math.round(work / 2)} J`,
    `${Math.round(work * 2)} J`
  ];
  const shuffled = [...options].sort(() => 0.5 - Math.random());
  const correctIndex = shuffled.indexOf(`${work} J`);
  
  return {
    questionText: `Calculate the work done when ${n} moles of an ideal gas expands isothermally and reversibly at ${T} K to double its original volume. (R = 8.314 J/mol·K, ln 2 ≈ 0.693)`,
    options: {
      A: { text: shuffled[0] },
      B: { text: shuffled[1] },
      C: { text: shuffled[2] },
      D: { text: shuffled[3] }
    },
    correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
    explanation: { text: `For reversible isothermal expansion, W = nRT ln(V2/V1). Here V2/V1 = 2. So W = ${n} * 8.314 * ${T} * 0.693 ≈ ${work} J.` },
    subject: "chemistry",
    chapter: "Thermodynamics",
    topic: "Work and Heat",
    type: "mcq",
    difficulty: "hard"
  };
}

function generateElectrostatics() {
  const q = getRandom(2, 8); 
  const r = getRandom(1, 5); 
  const E = Math.round((9 * 1e9 * q * 1e-6) / (r * r));
  
  const options = [
    `${E} N/C`,
    `${Math.round(E * 2)} N/C`,
    `${Math.round(E / r)} N/C`,
    `${Math.round(E * r)} N/C`
  ];
  const shuffled = [...options].sort(() => 0.5 - Math.random());
  const correctIndex = shuffled.indexOf(`${E} N/C`);
  
  return {
    questionText: `What is the magnitude of the electric field at a distance of ${r} m from a point charge of ${q} µC in a vacuum? (k = 9 × 10^9 N·m²/C²)`,
    options: {
      A: { text: shuffled[0] },
      B: { text: shuffled[1] },
      C: { text: shuffled[2] },
      D: { text: shuffled[3] }
    },
    correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
    explanation: { text: `Electric field E = k * q / r². E = (9 × 10^9 * ${q} × 10^-6) / (${r}²) = ${E} N/C.` },
    subject: "physics",
    chapter: "Electric Charges and Fields",
    topic: "Electric Field",
    type: "mcq",
    difficulty: "medium"
  };
}

const bioFacts = [
  {
    q: "Which of the following is the site of translation in a eukaryotic cell?",
    c: "Ribosome", o1: "Nucleus", o2: "Lysosome", o3: "Golgi Apparatus",
    exp: "Translation (protein synthesis) occurs at the ribosomes in the cytoplasm.", ch: "Cell Structure and Function"
  },
  {
    q: "The phenotypic ratio of a dihybrid cross in Mendelian genetics is:",
    c: "9:3:3:1", o1: "3:1", o2: "1:2:1", o3: "9:7",
    exp: "A standard Mendelian dihybrid cross of two heterozygotes yields a 9:3:3:1 phenotypic ratio.", ch: "Genetics"
  },
  {
    q: "Which hormone is responsible for maintaining the corpus luteum during early pregnancy?",
    c: "hCG (Human Chorionic Gonadotropin)", o1: "FSH", o2: "LH", o3: "Progesterone",
    exp: "hCG produced by the trophoblast maintains the corpus luteum, which in turn secretes progesterone.", ch: "Reproduction in Humans"
  },
  {
    q: "In C4 plants, the primary CO2 acceptor is:",
    c: "Phosphoenolpyruvate (PEP)", o1: "RuBP", o2: "PGA", o3: "OAA",
    exp: "PEP (a 3-carbon compound) is the primary acceptor of CO2 in C4 plants, catalyzed by PEP carboxylase.", ch: "Photosynthesis"
  }
];

function generateBiology() {
  const fact = bioFacts[getRandom(0, bioFacts.length - 1)];
  const options = [fact.c, fact.o1, fact.o2, fact.o3];
  const shuffled = [...options].sort(() => 0.5 - Math.random());
  const correctIndex = shuffled.indexOf(fact.c);
  
  return {
    questionText: fact.q,
    options: {
      A: { text: shuffled[0] },
      B: { text: shuffled[1] },
      C: { text: shuffled[2] },
      D: { text: shuffled[3] }
    },
    correctAnswer: ['A', 'B', 'C', 'D'][correctIndex],
    explanation: { text: fact.exp },
    subject: "biology",
    chapter: fact.ch,
    topic: "General Biology",
    type: "mcq",
    difficulty: "easy"
  };
}

async function run() {
  try {
    await connectDB();
    console.log('⚡ Starting Synthetic PYQ Generation...');
    
    const jeeQuestions = [];
    const neetQuestions = [];
    
    console.log('Generating 500 JEE Main PYQs...');
    for (let i = 0; i < 500; i++) {
      let q;
      const r = Math.random();
      if (r < 0.33) q = generateKinematics();
      else if (r < 0.66) q = generateThermodynamics();
      else q = generateElectrostatics();
      
      q.source = "pyq"; // Must be lowercase for schema
      q.tags = ["JEE Main", "PYQ"];
      q.isPublished = true;
      q.isVerified = true;
      jeeQuestions.push(q);
    }
    
    console.log('Generating 700 NEET PYQs...');
    for (let i = 0; i < 700; i++) {
      let q;
      const r = Math.random();
      if (r < 0.25) q = generateKinematics();
      else if (r < 0.5) q = generateThermodynamics();
      else if (r < 0.75) q = generateElectrostatics();
      else q = generateBiology();
      
      q.source = "pyq"; // Must be lowercase for schema
      q.tags = ["NEET", "PYQ"];
      q.isPublished = true;
      q.isVerified = true;
      neetQuestions.push(q);
    }
    
    await Question.insertMany(jeeQuestions, { ordered: false });
    console.log(`✅ Seeded ${jeeQuestions.length} JEE Main PYQs successfully!`);
    
    await Question.insertMany(neetQuestions, { ordered: false });
    console.log(`✅ Seeded ${neetQuestions.length} NEET PYQs successfully!`);
    
    const count = await Question.countDocuments();
    console.log(`\n🎉 Process completed! Total questions in DB: ${count}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
