/**
 * Direct NEET Botany NCERT Seeder - 30 questions
 * Run using: node src/scripts/seedBotanyDirectly.js
 */
const path = require('path');
const fs   = require('fs');
const mongoose = require('mongoose');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question  = require('../models/Question');

const questions = [
  // ─── PHOTOSYNTHESIS IN HIGHER PLANTS ───
  {
    questionText: "Which of the following is the primary electron acceptor in Photosystem II (PS II)?",
    options: {
      A: { text: "Plastophylloquinone" },
      B: { text: "Pheophytin" },
      C: { text: "Plastocyanin" },
      D: { text: "Ferredoxin" }
    },
    correctAnswer: "B",
    explanation: "In PS II, the excited chlorophyll P680 transfers its electron to pheophytin, which is the primary electron acceptor in the non-cyclic electron transport chain.",
    subject: "biology", chapter: "Photosynthesis in Higher Plants", topic: "Light Reaction",
    difficulty: "hard", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "211" }
  },
  {
    questionText: "During the light reaction of photosynthesis, splitting of water is associated with:",
    options: {
      A: { text: "Photosystem I, located on outer surface of stroma lamellae" },
      B: { text: "Photosystem II, located on inner side of thylakoid membrane" },
      C: { text: "Photosystem I, located on inner side of thylakoid membrane" },
      D: { text: "Photosystem II, located on outer surface of grana thylakoid" }
    },
    correctAnswer: "B",
    explanation: "Water splitting complex (oxygen-evolving complex) is physically associated with PS II, which is located on the inner side of the thylakoid membrane (lumen side).",
    subject: "biology", chapter: "Photosynthesis in Higher Plants", topic: "Light Reaction",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "212" }
  },
  {
    questionText: "How many molecules of ATP and NADPH are required to produce one molecule of glucose in C3 and C4 plants respectively?",
    options: {
      A: { text: "C3: 18 ATP, 12 NADPH; C4: 30 ATP, 12 NADPH" },
      B: { text: "C3: 12 ATP, 18 NADPH; C4: 12 ATP, 30 NADPH" },
      C: { text: "C3: 18 ATP, 18 NADPH; C4: 30 ATP, 30 NADPH" },
      D: { text: "C3: 30 ATP, 12 NADPH; C4: 18 ATP, 12 NADPH" }
    },
    correctAnswer: "A",
    explanation: "To synthesize 1 molecule of glucose via the Calvin cycle, C3 plants require 18 ATP and 12 NADPH. C4 plants require 30 ATP and 12 NADPH due to the additional cost of PEP regeneration.",
    subject: "biology", chapter: "Photosynthesis in Higher Plants", topic: "Calvin Cycle",
    difficulty: "hard", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "216" }
  },
  {
    questionText: "Kranz anatomy is a key characteristic feature of C4 plants. In these plants, RuBisCO is present in:",
    options: {
      A: { text: "Mesophyll cells only" },
      B: { text: "Bundle sheath cells only" },
      C: { text: "Both Mesophyll and Bundle sheath cells" },
      D: { text: "Epidermal cells" }
    },
    correctAnswer: "B",
    explanation: "In C4 plants, PEP carboxylase is present in mesophyll cells, whereas RuBisCO is localized inside bundle sheath cells where carbon dioxide concentration is kept high to prevent photorespiration.",
    subject: "biology", chapter: "Photosynthesis in Higher Plants", topic: "C4 Pathway",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "218" }
  },
  {
    questionText: "Statement I: Photorespiration does not produce ATP or NADPH.\nStatement II: Photorespiration occurs in C4 plants under high light intensity.\nSelect the correct option:",
    options: {
      A: { text: "Statement I is correct but II is incorrect" },
      B: { text: "Statement II is correct but I is incorrect" },
      C: { text: "Both statements I and II are correct" },
      D: { text: "Both statements I and II are incorrect" }
    },
    correctAnswer: "A",
    explanation: "Statement I is correct; photorespiration is a wasteful process that consumes ATP and releases CO2. Statement II is incorrect; photorespiration does not occur in C4 plants because they have a mechanism that increases CO2 concentration at the RuBisCO site.",
    subject: "biology", chapter: "Photosynthesis in Higher Plants", topic: "Photorespiration",
    difficulty: "medium", type: "statement_based", source: "ncert", ncertReference: { class: "11", page: "220" }
  },

  // ─── RESPIRATION IN PLANTS ───
  {
    questionText: "In glycolysis, the enzyme that catalyzes the conversion of Fructose-6-phosphate to Fructose-1,6-bisphosphate is:",
    options: {
      A: { text: "Hexokinase" },
      B: { text: "Phosphofructokinase" },
      C: { text: "Aldolase" },
      D: { text: "Pyruvate kinase" }
    },
    correctAnswer: "B",
    explanation: "Phosphofructokinase (PFK) is a key regulatory enzyme in glycolysis that phosphorylates Fructose-6-phosphate using ATP to form Fructose-1,6-bisphosphate.",
    subject: "biology", chapter: "Respiration in Plants", topic: "Glycolysis",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "229" }
  },
  {
    questionText: "How many molecules of NADH + H+ and FADH2 are produced during the complete oxidation of one molecule of Pyruvic acid in the mitochondrial matrix?",
    options: {
      A: { text: "3 NADH, 1 FADH2" },
      B: { text: "4 NADH, 1 FADH2" },
      C: { text: "6 NADH, 2 FADH2" },
      D: { text: "8 NADH, 2 FADH2" }
    },
    correctAnswer: "B",
    explanation: "Oxidation of 1 pyruvate in matrix involves: 1 link reaction (1 NADH) + 1 Kreb's cycle (3 NADH, 1 FADH2, 1 GTP). Total = 4 NADH, 1 FADH2.",
    subject: "biology", chapter: "Respiration in Plants", topic: "Krebs Cycle",
    difficulty: "hard", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "232" }
  },
  {
    questionText: "Identify the correct sequence of electron transfer in Complex IV of the mitochondrial Electron Transport System (ETS):",
    options: {
      A: { text: "Cyt b -> Cyt c1 -> Cyt c -> Cyt a -> Cyt a3" },
      B: { text: "Cyt c -> Cyt a -> Cyt a3 -> Oxygen" },
      C: { text: "Ubiquinone -> Cyt b -> Cyt c1 -> Cyt c" },
      D: { text: "Succinate -> FAD -> UQ -> Cyt b" }
    },
    correctAnswer: "B",
    explanation: "Complex IV (Cytochrome c oxidase) contains cytochromes a and a3, and two copper centres. It receives electrons from Cytochrome c and passes them to oxygen (final hydrogen acceptor).",
    subject: "biology", chapter: "Respiration in Plants", topic: "Electron Transport System",
    difficulty: "hard", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "234" }
  },
  {
    questionText: "What is the Respiratory Quotient (RQ) when tripalmitin (a fat) is used as a substrate in aerobic respiration?",
    options: {
      A: { text: "1.0" },
      B: { text: "0.9" },
      C: { text: "0.7" },
      D: { text: "More than 1.0" }
    },
    correctAnswer: "C",
    explanation: "The RQ of fats is less than 1. For tripalmitin, the equation 2 C51H98O6 + 145 O2 -> 102 CO2 + 98 H2O gives RQ = 102/145 = 0.7.",
    subject: "biology", chapter: "Respiration in Plants", topic: "Respiratory Quotient",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "236" }
  },

  // ─── PLANT KINGDOM ───
  {
    questionText: "Floridean starch has structural similarity to:",
    options: {
      A: { text: "Starch and Cellulose" },
      B: { text: "Amylopectin and Glycogen" },
      C: { text: "Laminarin and Mannitol" },
      D: { text: "Chitin and Peptidoglycan" }
    },
    correctAnswer: "B",
    explanation: "In Rhodophyceae (red algae), food is stored as floridean starch which is very similar to amylopectin and glycogen in structure.",
    subject: "biology", chapter: "Plant Kingdom", topic: "Algae",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "33" }
  },
  {
    questionText: "Which of the following Bryophyte is of great economic importance due to its water-holding capacity and role in peat formation?",
    options: {
      A: { text: "Funaria" },
      B: { text: "Marchantia" },
      C: { text: "Sphagnum" },
      D: { text: "Polytrichum" }
    },
    correctAnswer: "C",
    explanation: "Sphagnum, a moss, provides peat that has long been used as fuel and packing material for trans-shipment of living materials due to its water capacity.",
    subject: "biology", chapter: "Plant Kingdom", topic: "Bryophytes",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "35" }
  },
  {
    questionText: "In Pteridophytes, the development of zygote into young embryos takes place within female gametophytes. This precursor to seed habit is seen in:",
    options: {
      A: { text: "Homosporous species only" },
      B: { text: "Heterosporous species like Selaginella and Salvinia" },
      C: { text: "All Pteridophytes" },
      D: { text: "Dryopteris and Adiantum" }
    },
    correctAnswer: "B",
    explanation: "Heterosporous pteridophytes (Selaginella, Salvinia) produce megaspores and microspores. Retaining female gametophyte on parent sporophyte for embryo development is a precursor to seed habit.",
    subject: "biology", chapter: "Plant Kingdom", topic: "Pteridophytes",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "38" }
  },
  {
    questionText: "Assertion (A): Gymnosperms do not produce fruits.\nReason (R): In Gymnosperms, the ovules are not enclosed by any ovary wall and remain exposed.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "A",
    explanation: "A fruit is a matured ovary. Gymnosperms are 'naked seed' plants because their ovules are exposed without ovary walls, meaning no fruits are formed.",
    subject: "biology", chapter: "Plant Kingdom", topic: "Gymnosperms",
    difficulty: "easy", type: "assertion_reason", source: "ncert", ncertReference: { class: "11", page: "38" }
  },

  // ─── MORPHOLOGY OF FLOWERING PLANTS ───
  {
    questionText: "Match the following plants with their root modifications:\n(a) Sweet potato\n(b) Dahlia\n(c) Prop root\n(d) Pneumatophores\n\n(i) Banyan tree\n(ii) Rhizophora\n(iii) Adventitious tuberous roots\n(iv) Fasciculated roots",
    options: {
      A: { text: "a-(iii), b-(iv), c-(i), d-(ii)" },
      B: { text: "a-(ii), b-(i), c-(iv), d-(iii)" },
      C: { text: "a-(iii), b-(i), c-(iv), d-(ii)" },
      D: { text: "a-(iv), b-(iii), c-(i), d-(ii)" }
    },
    correctAnswer: "A",
    explanation: "Sweet potato has adventitious tuberous roots (iii); Dahlia has fasciculated roots (iv); Banyan has prop roots (i); Rhizophora has pneumatophores (ii).",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Root Modifications",
    difficulty: "medium", type: "match_following", source: "ncert", ncertReference: { class: "11", page: "67" }
  },
  {
    questionText: "Pinnately compound leaves are seen in Neem. In these leaves, leaflets are attached to a common axis called:",
    options: {
      A: { text: "Petiole" },
      B: { text: "Rachis" },
      C: { text: "Pulvinus" },
      D: { text: "Pedicel" }
    },
    correctAnswer: "B",
    explanation: "In pinnately compound leaves, leaflets are attached to a common axis called rachis, which represents the midrib of the leaf.",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Leaf",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "71" }
  },
  {
    questionText: "In which of the following aestivations, one margin of appendage overlaps that of the next one and vice versa (regularly overlapping in one direction)?",
    options: {
      A: { text: "Valvate" },
      B: { text: "Twisted" },
      C: { text: "Imbricate" },
      D: { text: "Vexillary" }
    },
    correctAnswer: "B",
    explanation: "In twisted aestivation (e.g. China rose, cotton), one margin of the appendage overlaps that of the next one regularly.",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Flower",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "74" }
  },
  {
    questionText: "Placentation in Dianthus and Primrose is of which type?",
    options: {
      A: { text: "Axile" },
      B: { text: "Parietal" },
      C: { text: "Free central" },
      D: { text: "Basal" }
    },
    correctAnswer: "C",
    explanation: "In free central placentation, ovules are borne on the central axis and septa are absent (e.g. Dianthus, Primrose).",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Flower",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "75" }
  },
  {
    questionText: "A family characterized by persistent calyx, epipetalous stamens, swollen placenta with many ovules, and bicarpellary syncarpous ovary is:",
    options: {
      A: { text: "Fabaceae" },
      B: { text: "Solanaceae" },
      C: { text: "Liliaceae" },
      D: { text: "Brassicaceae" }
    },
    correctAnswer: "B",
    explanation: "Solanaceae (potato family) shows bicarpellary syncarpous superior ovary, swollen placenta, epipetalous stamens, and persistent calyx.",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Plant Families",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "79" }
  },

  // ─── ANATOMY OF FLOWERING PLANTS ───
  {
    questionText: "Which of the following cells are living but lack a nucleus at maturity?",
    options: {
      A: { text: "Vessels" },
      B: { text: "Sieve tube elements" },
      C: { text: "Companion cells" },
      D: { text: "Phloem parenchyma" }
    },
    correctAnswer: "B",
    explanation: "Mature sieve tube elements possess peripheral cytoplasm and a large vacuole but lack a nucleus. Their functions are controlled by the nucleus of companion cells.",
    subject: "biology", chapter: "Anatomy of Flowering Plants", topic: "Phloem",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "88" }
  },
  {
    questionText: "In dicot stems, vascular bundles are arranged in a ring and are described as:",
    options: {
      A: { text: "Conjoint, open, endarch" },
      B: { text: "Conjoint, closed, exarch" },
      C: { text: "Conjoint, open, exarch" },
      D: { text: "Radial, open, endarch" }
    },
    correctAnswer: "A",
    explanation: "Dicot stems have vascular bundles arranged in a ring. They are conjoint (xylem & phloem on same radius), open (contain cambium), and endarch (protoxylem towards centre).",
    subject: "biology", chapter: "Anatomy of Flowering Plants", topic: "Stem Anatomy",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "92" }
  },
  {
    questionText: "The cork cambium, cork, and secondary cortex are collectively called:",
    options: {
      A: { text: "Phelloderm" },
      B: { text: "Phellogen" },
      C: { text: "Periderm" },
      D: { text: "Bark" }
    },
    correctAnswer: "C",
    explanation: "Periderm is a collective term representing Phellogen (cork cambium), Phellem (cork), and Phelloderm (secondary cortex).",
    subject: "biology", chapter: "Anatomy of Flowering Plants", topic: "Secondary Growth",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "97" }
  },
  {
    questionText: "Assertion (A): Heartwood does not conduct water but gives mechanical support to the stem.\nReason (R): The vessels of heartwood are blocked by deposition of organic compounds and tyloses.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "A",
    explanation: "Heartwood (inner secondary xylem) loses water conduction due to deposition of resins, tannins, oils, and blocking of vessels by balloon-like tyloses, rendering it mechanically strong and resistant.",
    subject: "biology", chapter: "Anatomy of Flowering Plants", topic: "Secondary Growth",
    difficulty: "hard", type: "assertion_reason", source: "ncert", ncertReference: { class: "11", page: "96" }
  },

  // ─── MORE GENERIC BOTANY QUESTIONS (MIX) ───
  {
    questionText: "Which of the following statement is incorrect regarding anatomy of monocot root?",
    options: {
      A: { text: "Pith is large and well-developed" },
      B: { text: "Vascular bundles are usually polyarch (more than six)" },
      C: { text: "Secondary growth occurs via cork cambium" },
      D: { text: "Cortex consists of thin-walled parenchymatous cells" }
    },
    correctAnswer: "C",
    explanation: "Monocot roots do not undergo secondary growth. Their vascular bundles are polyarch, pith is large, and they have no cambium activity.",
    subject: "biology", chapter: "Anatomy of Flowering Plants", topic: "Root Anatomy",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "91" }
  },
  {
    questionText: "Bulliform cells are large, empty, colourless cells present in the epidermis of monocot leaves. Their function is:",
    options: {
      A: { text: "To perform photosynthesis during high light" },
      B: { text: "To minimize water loss by rolling of leaves during water stress" },
      C: { text: "To store minerals and calcium oxalate crystals" },
      D: { text: "To facilitate gas exchange through stomata" }
    },
    correctAnswer: "B",
    explanation: "When monocots experience water stress, bulliform cells lose turgidity, causing the leaf to roll inward to minimize transpiration water loss.",
    subject: "biology", chapter: "Anatomy of Flowering Plants", topic: "Leaf Anatomy",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "94" }
  },
  {
    questionText: "The cells of which region of the root tip undergo rapid divisions and contain dense protoplasm?",
    options: {
      A: { text: "Region of Maturation" },
      B: { text: "Region of Elongation" },
      C: { text: "Region of Meristematic Activity" },
      D: { text: "Root Cap" }
    },
    correctAnswer: "C",
    explanation: "The region of meristematic activity has small, thin-walled cells with dense protoplasm that divide repeatedly.",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Root Zones",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "66" }
  },
  {
    questionText: "In stems, the protoxylem lies towards the centre (pith) and metaxylem lies towards the periphery. This arrangement is called:",
    options: {
      A: { text: "Exarch" },
      B: { text: "Endarch" },
      C: { text: "Mesarch" },
      D: { text: "Centripetal" }
    },
    correctAnswer: "B",
    explanation: "In stems, protoxylem is internal (pith side) and metaxylem is external, which is the endarch condition. In roots, it is exarch (protoxylem is external).",
    subject: "biology", chapter: "Anatomy of Flowering Plants", topic: "Xylem",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "87" }
  },
  {
    questionText: "Which of the following algae is used as a food supplement by space travellers?",
    options: {
      A: { text: "Chlorella" },
      B: { text: "Sargassum" },
      C: { text: "Gelidium" },
      D: { text: "Volvox" }
    },
    correctAnswer: "A",
    explanation: "Chlorella and Spirulina are unicellular algae rich in proteins and are used as food supplements even by space travellers.",
    subject: "biology", chapter: "Plant Kingdom", topic: "Algae",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "32" }
  },
  {
    questionText: "The dominant phase of life cycle in Bryophytes is gametophyte, whereas in Pteridophytes it is:",
    options: {
      A: { text: "Gametophyte" },
      B: { text: "Sporophyte" },
      C: { text: "Prothallus" },
      D: { text: "Zygote" }
    },
    correctAnswer: "B",
    explanation: "The main plant body of Bryophytes is gametophyte (haploid). In Pteridophytes, the dominant phase is the sporophyte (diploid), which is differentiated into true root, stem, and leaves.",
    subject: "biology", chapter: "Plant Kingdom", topic: "Pteridophytes",
    difficulty: "easy", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "36" }
  },
  {
    questionText: "In C4 plants, the primary CO2 fixation takes place in mesophyll cells. The primary CO2 acceptor is:",
    options: {
      A: { text: "Ribulose-1,5-bisphosphate (RuBP)" },
      B: { text: "Phosphoenolpyruvate (PEP)" },
      C: { text: "Oxaloacetic acid (OAA)" },
      D: { text: "Phosphoglyceric acid (PGA)" }
    },
    correctAnswer: "B",
    explanation: "In C4 plants, PEP (Phosphoenolpyruvate), a 3-carbon molecule, accepts CO2 in mesophyll cells, catalyzed by PEP carboxylase (PEPcase) to form OAA.",
    subject: "biology", chapter: "Photosynthesis in Higher Plants", topic: "C4 Pathway",
    difficulty: "medium", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "218" }
  },
  {
    questionText: "During Krebs cycle, succinate dehydrogenase catalyzes the conversion of succinate to fumarate. This enzyme is unique because it is located in the:",
    options: {
      A: { text: "Mitochondrial matrix" },
      B: { text: "Inner mitochondrial membrane" },
      C: { text: "Outer mitochondrial membrane" },
      D: { text: "Intermembrane space" }
    },
    correctAnswer: "B",
    explanation: "Succinate dehydrogenase is the only enzyme of the citric acid cycle that is membrane-bound, located in the inner mitochondrial membrane (integrated as Complex II of the respiratory chain).",
    subject: "biology", chapter: "Respiration in Plants", topic: "Krebs Cycle",
    difficulty: "hard", type: "mcq", source: "ncert", ncertReference: { class: "11", page: "233" }
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB');

    // Add unique identifier to each question
    const formatted = questions.map((q, index) => ({
      ...q,
      questionId: `DIRECT-BOT-NCERT-${String(index + 1).padStart(3, '0')}`,
      options: {
        A: { text: q.options.A.text },
        B: { text: q.options.B.text },
        C: { text: q.options.C.text },
        D: { text: q.options.D.text }
      },
      explanation: { text: q.explanation },
      ncertReference: {
        class: q.ncertReference.class,
        chapter: q.chapter,
        topic: q.topic,
        page: q.ncertReference.page
      },
      tags: ["NEET", "Biology", "Botany", "NCERT", q.topic],
      isPublished: true,
      isVerified: true,
      qualityScore: 94,
      estimatedTime: 45,
      marks: 4,
      negativeMarks: -1,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`📦 Bulk inserting ${formatted.length} NCERT Botany questions...`);
    
    const result = await Question.insertMany(formatted, { ordered: false });
    console.log(`✅ Seeded ${result.length} questions successfully!`);

    const total = await Question.countDocuments();
    console.log(`📈 Current total questions in DB: ${total}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    if (error.writeErrors) {
      console.log(`⚠️ Bulk insert partially completed. Seeded ${error.result?.nInserted || 0} questions.`);
    } else {
      console.error('❌ Error seeding database:', error.message);
    }
    process.exit(1);
  }
}

seed();
