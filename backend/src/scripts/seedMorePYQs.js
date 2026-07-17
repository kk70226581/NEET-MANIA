/**
 * Seeder for AIPMT & JEE PYQ Questions
 * Run using: node src/scripts/seedMorePYQs.js
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

const pyqs = [
  // ─── AIPMT BIOLOGY QUESTIONS (1-20) ───
  {
    questionText: "Girdling experiment cannot be performed in sugarcane because:",
    options: {
      A: { text: "Sugarcane plants are monocots with scattered vascular bundles" },
      B: { text: "Sugarcane plants have very narrow phloem channels" },
      C: { text: "Sugarcane stems have a very thick cuticle" },
      D: { text: "Girdling requires large woody secondary growth" }
    },
    correctAnswer: "A",
    explanation: "Girdling (ring barking) requires removing the phloem layer which lies outside the cambium in rings. In monocots (like sugarcane), vascular bundles are scattered throughout the ground tissue, so phloem cannot be selectively removed.",
    subject: "biology", chapter: "Plant Physiology", topic: "Transport in Plants",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "In which of the following, gametophyte is not independent and free-living?",
    options: {
      A: { text: "Pinus" },
      B: { text: "Funaria" },
      C: { text: "Marchantia" },
      D: { text: "Pteris" }
    },
    correctAnswer: "A",
    explanation: "Pinus is a gymnosperm. In gymnosperms and angiosperms, the gametophyte is highly reduced, dependent, and retained within the sporangia on the parent sporophyte.",
    subject: "biology", chapter: "Plant Kingdom", topic: "Gymnosperms",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Keel is the characteristic feature of the flower of:",
    options: {
      A: { text: "Indigofera" },
      B: { text: "Aloe" },
      C: { text: "Tomato" },
      D: { text: "Tulip" }
    },
    correctAnswer: "A",
    explanation: "Keel (carina) is a characteristic of papilionaceous (vexillary) aestivation seen in the family Fabaceae. Indigofera belongs to Fabaceae.",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Flower",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Which of the following are the important floral rewards to the animal pollinators?",
    options: {
      A: { text: "Nectar and pollen grains" },
      B: { text: "Floral fragrance and calcium crystals" },
      C: { text: "Protein pellicle and mucilage" },
      D: { text: "Color and scent of petals" }
    },
    correctAnswer: "A",
    explanation: "Nectar and pollen grains are the primary floral rewards that insect pollinators seek, aiding in cross-pollination.",
    subject: "biology", chapter: "Reproduction in Plants", topic: "Pollination",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Which one of the following is not an inclusion body found in prokaryotes?",
    options: {
      A: { text: "Polysome" },
      B: { text: "Phosphate granule" },
      C: { text: "Cyanophycean granule" },
      D: { text: "Glycogen granule" }
    },
    correctAnswer: "A",
    explanation: "Inclusion bodies in prokaryotes store reserve material and are not membrane-bound (e.g. phosphate, cyanophycean, and glycogen granules). Polysomes are clusters of ribosomes translating mRNA and are not inclusion bodies.",
    subject: "biology", chapter: "Cell Structure and Function", topic: "Prokaryotic Cell",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "A cell organelle containing hydrolytic enzymes highly active at acidic pH is:",
    options: {
      A: { text: "Lysosome" },
      B: { text: "Ribosome" },
      C: { text: "Mitochondrion" },
      D: { text: "Peroxisome" }
    },
    correctAnswer: "A",
    explanation: "Lysosomes are membrane-bound vesicular structures containing hydrolytic enzymes (hydrolases - lipases, proteases, carbohydrases) optimally active at acidic pH (~5.0).",
    subject: "biology", chapter: "Cell Structure and Function", topic: "Cell Organelles",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2016, examType: "neet" }, pyq: { isPYQ: true, reference: "NEET 2016" }
  },
  {
    questionText: "The primary carbon dioxide acceptor in C4 plants is:",
    options: {
      A: { text: "Phosphoenolpyruvate (PEP)" },
      B: { text: "Ribulose-1,5-bisphosphate (RuBP)" },
      C: { text: "Oxaloacetic acid (OAA)" },
      D: { text: "3-phosphoglyceric acid (PGA)" }
    },
    correctAnswer: "A",
    explanation: "In C4 plants, PEP is the primary CO2 acceptor in mesophyll cells, forming Oxaloacetic acid (OAA).",
    subject: "biology", chapter: "Photosynthesis in Higher Plants", topic: "C4 Pathway",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2010, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2010" }
  },
  {
    questionText: "Which of the following is correct regarding the site of glycolysis in eukaryotic cells?",
    options: {
      A: { text: "Cytoplasm" },
      B: { text: "Mitochondrial matrix" },
      C: { text: "Inner mitochondrial membrane" },
      D: { text: "Peroxisomes" }
    },
    correctAnswer: "A",
    explanation: "Glycolysis takes place in the cytosol/cytoplasm of the cell, where glucose is partially oxidized into two molecules of pyruvic acid.",
    subject: "biology", chapter: "Respiration in Plants", topic: "Glycolysis",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2012, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2012" }
  },
  {
    questionText: "Water vapor comes out from the plant leaf through the stomatal opening. Through the same stomatal opening carbon dioxide diffuses into the plant during photosynthesis. Reason out the above statements using the following options:",
    options: {
      A: { text: "Both processes can happen together because the diffusion coefficient of water and CO2 is different" },
      B: { text: "Only one process can occur at a time" },
      C: { text: "Both processes cannot happen simultaneously" },
      D: { text: "The above processes happen only during night" }
    },
    options: {
      A: { text: "Both processes can happen together because the diffusion coefficient of water and CO2 is different" },
      B: { text: "Only one process can occur at a time" },
      C: { text: "Both processes cannot happen simultaneously" },
      D: { text: "The above processes happen only during night" }
    },
    correctAnswer: "A",
    explanation: "Diffusion of water vapor and CO2 occurs independently across the stomata because their diffusion gradients and coefficients are separate.",
    subject: "biology", chapter: "Plant Physiology", topic: "Transpiration",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2016, examType: "neet" }, pyq: { isPYQ: true, reference: "NEET 2016" }
  },
  {
    questionText: "The standard petals of a papilionaceous corolla is also called:",
    options: {
      A: { text: "Vexillum" },
      B: { text: "Corona" },
      C: { text: "Carina" },
      D: { text: "Pappus" }
    },
    correctAnswer: "A",
    explanation: "In vexillary aestivation, the largest outermost petal is the standard or vexillum, two lateral ones are wings (alae), and the two smallest anterior ones are keels (carina).",
    subject: "biology", chapter: "Morphology of Flowering Plants", topic: "Flower",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2016, examType: "neet" }, pyq: { isPYQ: true, reference: "NEET 2016" }
  },
  {
    questionText: "A sagittal section of human brain depicts the connection between the two cerebral hemispheres. This connection is called:",
    options: {
      A: { text: "Corpus callosum" },
      B: { text: "Association tract" },
      C: { text: "Cerebellar cortex" },
      D: { text: "Pons" }
    },
    correctAnswer: "A",
    explanation: "The cerebral hemispheres are connected by a tract of nerve fibers called the corpus callosum.",
    subject: "biology", chapter: "Human Physiology", topic: "Neural Control and Coordination",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "An emphysematous patient is advised oxygen therapy. In emphysema, the structural defect is:",
    options: {
      A: { text: "Damage of alveolar walls leading to decrease in respiratory surface area" },
      B: { text: "Spasm of bronchial smooth muscle" },
      C: { text: "Accumulation of fluid in pleural cavity" },
      D: { text: "Bacterial infection of terminal bronchioles" }
    },
    correctAnswer: "A",
    explanation: "Emphysema is a chronic disorder where alveolar walls are damaged, reducing the surface area available for gas exchange, commonly caused by cigarette smoking.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Match the following columns regarding hormones:\n(a) Glucocorticoids\n(b) Melatonin\n(c) Aldosterone\n(d) Thyroxine\n\n(i) Diurnal rhythm\n(ii) Glucogenesis/Gluconeogenesis\n(iii) Mineral balance\n(iv) Basal Metabolic Rate",
    options: {
      A: { text: "a-(ii), b-(i), c-(iii), d-(iv)" },
      B: { text: "a-(iii), b-(i), c-(ii), d-(iv)" },
      C: { text: "a-(ii), b-(iii), c-(i), d-(iv)" },
      D: { text: "a-(i), b-(ii), c-(iii), d-(iv)" }
    },
    correctAnswer: "A",
    explanation: "Glucocorticoids regulate gluconeogenesis (ii); melatonin controls diurnal rhythm (i); aldosterone maintains mineral balance (iii); thyroxine regulates BMR (iv).",
    subject: "biology", chapter: "Human Physiology", topic: "Chemical Coordination and Integration",
    difficulty: "medium", type: "match_following", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },
  {
    questionText: "An autoimmune disorder affecting neuromuscular junction leading to fatigue, weakening and paralysis of skeletal muscle is called:",
    options: {
      A: { text: "Myasthenia gravis" },
      B: { text: "Muscular dystrophy" },
      C: { text: "Gout" },
      D: { text: "Tetany" }
    },
    correctAnswer: "A",
    explanation: "Myasthenia gravis is an autoimmune disorder that attacks acetylcholine receptors at the neuromuscular junction, causing skeletal muscle weakness.",
    subject: "biology", chapter: "Human Physiology", topic: "Locomotion and Movement",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "The part of nephron impermeable to water but highly permeable to active or passive transport of electrolytes is:",
    options: {
      A: { text: "Ascending limb of Loop of Henle" },
      B: { text: "Descending limb of Loop of Henle" },
      C: { text: "Proximal Convoluted Tubule" },
      D: { text: "Collecting duct" }
    },
    correctAnswer: "A",
    explanation: "The descending limb is permeable to water but impermeable to electrolytes. The ascending limb is impermeable to water but allows transport of NaCl.",
    subject: "biology", chapter: "Human Physiology", topic: "Excretory Products and their Elimination",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },
  {
    questionText: "Which of the following is correct regarding the number of RBCs and erythropoietin production during altitude sickness?",
    options: {
      A: { text: "Erythropoietin increases, leading to an increase in RBC production" },
      B: { text: "Erythropoietin decreases, leading to a decrease in RBCs" },
      C: { text: "Both remain unchanged" },
      D: { text: "Hemoglobin binding affinity increases at high altitude" }
    },
    correctAnswer: "A",
    explanation: "At high altitudes, low oxygen levels trigger the kidneys to secrete erythropoietin, which stimulates the bone marrow to produce more RBCs to compensate for hypoxia.",
    subject: "biology", chapter: "Human Physiology", topic: "Body Fluids and Circulation",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Double fertilization is a unique fusion process in Angiosperms. It involves:",
    options: {
      A: { text: "Syngamy and Triple Fusion" },
      B: { text: "Syngamy and Budding" },
      C: { text: "Double syngamy only" },
      D: { text: "Triple fusion of polar nuclei only" }
    },
    correctAnswer: "A",
    explanation: "Double fertilization involves syngamy (fusion of one male gamete with egg cell) and triple fusion (fusion of second male gamete with diploid secondary nucleus).",
    subject: "biology", chapter: "Reproduction in Plants", topic: "Double Fertilization",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2012, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2012" }
  },
  {
    questionText: "Which of the following is a primary lymphoid organ in humans?",
    options: {
      A: { text: "Bone marrow and Thymus" },
      B: { text: "Spleen and Lymph nodes" },
      C: { text: "Tonsils and Peyer's patches" },
      D: { text: "Appendix" }
    },
    correctAnswer: "A",
    explanation: "Primary lymphoid organs are where lymphocytes mature and differentiate (bone marrow and thymus). Spleen and nodes are secondary lymphoid organs.",
    subject: "biology", chapter: "Immune System", topic: "Lymphoid Organs",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2011, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2011" }
  },
  {
    questionText: "In transcription, the DNA strand with 3'->5' polarity acts as a template, whereas the other strand (5'->3') is called:",
    options: {
      A: { text: "Coding strand" },
      B: { text: "Non-coding strand" },
      C: { text: "Sense strand" },
      D: { text: "Antisense strand" }
    },
    correctAnswer: "A",
    explanation: "The strand with 3'->5' polarity is the template strand. The 5'->3' strand has the same sequence as the RNA transcript (except U instead of T) and is called the coding (or sense) strand.",
    subject: "biology", chapter: "Molecular Basis of Inheritance", topic: "Transcription",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "The species-area relationship curve represented on a logarithmic scale is a straight line. What is its slope (Z) range for most small taxonomic groups in local regions?",
    options: {
      A: { text: "0.1 to 0.2" },
      B: { text: "0.6 to 1.2" },
      C: { text: "1.5 to 2.0" },
      D: { text: "0.01 to 0.05" }
    },
    correctAnswer: "A",
    explanation: "Ecologists have discovered that Z (slope of species-area line) lies in the range of 0.1 to 0.2 regardless of taxonomic group or region (unless analyzing a whole continent where Z is 0.6 to 1.2).",
    subject: "biology", chapter: "Ecology", topic: "Biodiversity",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },

  // ─── AIPMT/JEE PHYSICS QUESTIONS (21-40) ───
  {
    questionText: "A solid sphere of mass M and radius R rolls without slipping down a rough inclined plane of angle θ. The acceleration of the sphere is:",
    options: {
      A: { text: "5/7 g sin θ" },
      B: { text: "2/3 g sin θ" },
      C: { text: "1/2 g sin θ" },
      D: { text: "g sin θ" }
    },
    correctAnswer: "A",
    explanation: "For a rolling solid sphere, acceleration a = g sin θ / (1 + I / MR²). Since I = 2/5 MR² for a solid sphere, a = g sin θ / (1 + 2/5) = 5/7 g sin θ.",
    subject: "physics", chapter: "System of Particles and Rotational Motion", topic: "Rolling Motion",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },
  {
    questionText: "A particle is executing simple harmonic motion (SHM) with amplitude A. At what displacement from the mean position is its kinetic energy equal to its potential energy?",
    options: {
      A: { text: "A / √2" },
      B: { text: "A / 2" },
      C: { text: "A / √3" },
      D: { text: "√3 A / 2" }
    },
    correctAnswer: "A",
    explanation: "KE = PE => 0.5 * k * (A² - x²) = 0.5 * k * x² => A² - x² = x² => 2x² = A² => x = A / √2.",
    subject: "physics", chapter: "Oscillations", topic: "SHM Energy",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "An ideal gas heat engine operates in a Carnot cycle between 227°C and 127°C. It absorbs 6 × 10⁴ cal of heat at higher temperature. The amount of heat converted to work is:",
    options: {
      A: { text: "1.2 × 10⁴ cal" },
      B: { text: "4.8 × 10⁴ cal" },
      C: { text: "2.4 × 10⁴ cal" },
      D: { text: "6.0 × 10³ cal" }
    },
    correctAnswer: "A",
    explanation: "Carnot efficiency η = 1 - T2/T1. T1 = 227 + 273 = 500 K, T2 = 127 + 273 = 400 K. η = 1 - 400/500 = 1/5 = 20%. Work done W = η * Q_absorbed = 0.20 * 6 × 10⁴ = 1.2 × 10⁴ cal.",
    subject: "physics", chapter: "Thermodynamics", topic: "Carnot Engine",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "A parallel plate capacitor with air between the plates has capacitance C. If a dielectric slab of dielectric constant K = 5 is introduced filling the entire space, the new capacitance is:",
    options: {
      A: { text: "5 C" },
      B: { text: "C / 5" },
      C: { text: "25 C" },
      D: { text: "C" }
    },
    correctAnswer: "A",
    explanation: "Capacitance of a parallel plate capacitor is C = ε₀A / d. When a dielectric K fills the gap, C' = K * ε₀A / d = K * C = 5C.",
    subject: "physics", chapter: "Electrostatic Potential and Capacitance", topic: "Dielectric Effect",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2013, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2013" }
  },
  {
    questionText: "A galvanometer of resistance G can be converted into a voltmeter of range 0-V by connecting a resistance R in series. The relation is:",
    options: {
      A: { text: "R = V/Ig - G" },
      B: { text: "R = V/Ig + G" },
      C: { text: "R = Ig/V - G" },
      D: { text: "R = V*G / Ig" }
    },
    correctAnswer: "A",
    explanation: "For a voltmeter, total resistance (R + G) = V / Ig, which gives R = V/Ig - G where Ig is full-scale deflection current.",
    subject: "physics", chapter: "Moving Charges and Magnetism", topic: "Galvanometer Conversion",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "An electromagnetic wave propagates in a medium with velocity v = v i. The magnetic field oscillation is given by B = Bo cos(kx - wt) j. The electric field is:",
    options: {
      A: { text: "E = c Bo cos(kx - wt) k" },
      B: { text: "E = -c Bo cos(kx - wt) k" },
      C: { text: "E = Bo cos(kx - wt) i" },
      D: { text: "E = c Bo cos(kx - wt) j" }
    },
    correctAnswer: "A",
    explanation: "EM waves satisfy E x B = direction of propagation. E x j = i => E must be along k direction. Since E/B = c (or v), E = v * Bo cos(kx - wt) k.",
    subject: "physics", chapter: "Electromagnetic Waves", topic: "Wave Propagation",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2018, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2018" }
  },
  {
    questionText: "The threshold frequency of a metal is vo. When light of frequency 2vo is incident on it, maximum kinetic energy of photoelectrons is K1. When frequency is 5vo, maximum KE is K2. The ratio K1:K2 is:",
    options: {
      A: { text: "1 : 4" },
      B: { text: "1 : 3" },
      C: { text: "1 : 2" },
      D: { text: "2 : 5" }
    },
    correctAnswer: "A",
    explanation: "By Einstein's photoelectric equation, K = h(v - vo). K1 = h(2vo - vo) = hvo. K2 = h(5vo - vo) = 4hvo. Thus, K1/K2 = 1/4.",
    subject: "physics", chapter: "Dual Nature of Radiation and Matter", topic: "Photoelectric Effect",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2018, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2018" }
  },
  {
    questionText: "In a Young's double slit experiment, the slit separation is d and wavelength of light is λ. The angular fringe width is:",
    options: {
      A: { text: "λ / d" },
      B: { text: "d / λ" },
      C: { text: "D * λ / d" },
      D: { text: "λ * d" }
    },
    correctAnswer: "A",
    explanation: "Angular fringe width θ = β / D = (λ D / d) / D = λ / d.",
    subject: "physics", chapter: "Wave Optics", topic: "Interference",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "A radioactive nucleus of mass number A decays by emitting one alpha particle and two beta particles. The mass number of the daughter nucleus is:",
    options: {
      A: { text: "A - 4" },
      B: { text: "A - 2" },
      C: { text: "A" },
      D: { text: "A - 6" }
    },
    correctAnswer: "A",
    explanation: "Alpha emission reduces mass number by 4 and atomic number by 2. Beta emission (e-) increases atomic number by 1 but leaves mass number unchanged. Thus, daughter mass number = A - 4.",
    subject: "physics", chapter: "Nuclei", topic: "Radioactivity",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },
  {
    questionText: "The half-life of a radioactive substance is 20 minutes. The time taken for 75% decay is:",
    options: {
      A: { text: "40 minutes" },
      B: { text: "30 minutes" },
      C: { text: "60 minutes" },
      D: { text: "80 minutes" }
    },
    correctAnswer: "A",
    explanation: "75% decay means 25% remains. 25% is (1/2)^2 of initial concentration, corresponding to 2 half-lives. Time = 2 * 20 min = 40 minutes.",
    subject: "physics", chapter: "Nuclei", topic: "Radioactivity",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "For a common-emitter amplifier, current gain β = 100. If collector resistance is 2 kΩ and input resistance is 1 kΩ, voltage gain is:",
    options: {
      A: { text: "200" },
      B: { text: "100" },
      C: { text: "50" },
      D: { text: "300" }
    },
    correctAnswer: "A",
    explanation: "Voltage gain Av = β * (Rc / Ri) = 100 * (2000 / 1000) = 200.",
    subject: "physics", chapter: "Semiconductor Electronics", topic: "Transistor Amplifier",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "A block of mass 10 kg is moving with speed 5 m/s on a smooth surface. It collides with another block of mass 5 kg initially at rest. If the collision is perfectly inelastic, find the loss of kinetic energy:",
    options: {
      A: { text: "41.7 J" },
      B: { text: "125 J" },
      C: { text: "83.3 J" },
      D: { text: "0 J" }
    },
    correctAnswer: "A",
    explanation: "Common velocity v = (m1*u1 + m2*u2)/(m1+m2) = (10*5)/(15) = 10/3 m/s. Initial KE = 0.5 * 10 * 5² = 125 J. Final KE = 0.5 * 15 * (10/3)² = 7.5 * 100 / 9 = 83.3 J. Loss = 125 - 83.3 = 41.7 J.",
    subject: "physics", chapter: "Work Energy and Power", topic: "Collisions",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2019, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2019" }
  },
  {
    questionText: "Three charges +q, -q and +q are placed at the vertices of an equilateral triangle of side a. The magnitude of dipole moment of this system is:",
    options: {
      A: { text: "q * a" },
      B: { text: "√3 q * a" },
      C: { text: "2 q * a" },
      D: { text: "zero" }
    },
    correctAnswer: "A",
    explanation: "We can think of the charge -q as two charges -q/2 and -q/2. The system forms two dipoles each of moment p = q*a at an angle of 60°. Resultant dipole moment = 2*p*cos(30°) is not correct because the charges are +q, -q, +q. The net charge is +q (monopole). For dipoles, we can decompose -q into -q at the vertex and pair with each +q. Net moment = vector sum of p1 (q*a) and p2 (q*a) at 60°. Resultant = √[p² + p² + 2p² cos 60°] = √3 p = √3 q a.",
    options: {
      A: { text: "q * a" },
      B: { text: "√3 q * a" },
      C: { text: "2 q * a" },
      D: { text: "zero" }
    },
    correctAnswer: "B",
    explanation: "Decompose -q into two parts to form two dipoles pointing from -q vertex to the two +q vertices. The angle between them is 60°. Net moment = √[p² + p² + 2p² cos 60°] = √3 p = √3 q a.",
    subject: "physics", chapter: "Electric Charges and Fields", topic: "Electric Dipole",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2020, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2020" }
  },
  {
    questionText: "The escape velocity from the surface of Earth is ve. If radius of Earth shrinks by 1% keeping mass constant, the new escape velocity will:",
    options: {
      A: { text: "Increase by 0.5%" },
      B: { text: "Decrease by 0.5%" },
      C: { text: "Increase by 1%" },
      D: { text: "Decrease by 1%" }
    },
    correctAnswer: "A",
    explanation: "Escape velocity ve = √(2GM/R). For constant M, ve is proportional to R^(-1/2). Differentiating, d(ve)/ve = -1/2 * dR/R. If R decreases by 1%, ve increases by 0.5%.",
    subject: "physics", chapter: "Gravitation", topic: "Escape Velocity",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2019, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2019" }
  },
  {
    questionText: "A soap bubble of radius r has excess pressure P. If two bubbles of same size coalesce under isothermal conditions in vacuum, the radius of the new bubble is:",
    options: {
      A: { text: "√2 r" },
      B: { text: "2 r" },
      C: { text: "r / √2" },
      D: { text: "r" }
    },
    correctAnswer: "A",
    explanation: "In vacuum, under isothermal conditions, surface area remains conserved during coalescence, i.e., 2 * 4πr² = 4πR² => R = √2 r.",
    subject: "physics", chapter: "Mechanical Properties of Fluids", topic: "Surface Tension",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2021, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2021" }
  },
  {
    questionText: "Assertion (A): For a system of particles, the center of mass always lies within the physical body of the system.\nReason (R): The location of center of mass depends on the distribution of mass within the system.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is false but R is true" },
      D: { text: "A is true but R is false" }
    },
    correctAnswer: "C",
    explanation: "A is false because the center of mass can lie outside the body (e.g. for a ring or hollow sphere). R is true because CM position is a weighted average of coordinates.",
    subject: "physics", chapter: "System of Particles and Rotational Motion", topic: "Center of Mass",
    difficulty: "medium", type: "assertion_reason", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Assertion (A): The work done by a conservative force along a closed path is zero.\nReason (R): Gravitational force is a non-conservative force.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "C",
    explanation: "A is true (definition of conservative force). R is false because gravity is a conservative force.",
    subject: "physics", chapter: "Work Energy and Power", topic: "Forces",
    difficulty: "easy", type: "assertion_reason", source: "pyq",
    sourceDetails: { year: 2013, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2013" }
  },
  {
    questionText: "A wire of resistance R is stretched such that its radius becomes R/2. The new resistance of the wire is:",
    options: {
      A: { text: "16 R" },
      B: { text: "4 R" },
      C: { text: "8 R" },
      D: { text: "2 R" }
    },
    correctAnswer: "A",
    explanation: "Volume remains constant: L1 * A1 = L2 * A2. Since r2 = r1/2, A2 = A1/4. Thus L2 = 4*L1. Resistance R = ρ * L/A. New resistance R' = ρ * (4*L1)/(A1/4) = 16 * R.",
    subject: "physics", chapter: "Current Electricity", topic: "Resistance",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2010, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2010" }
  },
  {
    questionText: "An iron rod of susceptibility 599 is subjected to a magnetizing field of 1200 A/m. The permeability of the material of the rod is (take uo = 4pi * 10^-7 T m/A):",
    options: {
      A: { text: "2.4pi * 10^-4 T m/A" },
      B: { text: "8.0pi * 10^-5 T m/A" },
      C: { text: "2.4pi * 10^-5 T m/A" },
      D: { text: "2.4 * 10^-7 T m/A" }
    },
    correctAnswer: "A",
    explanation: "Relative permeability ur = susceptibility + 1 = 599 + 1 = 600. Permeability u = ur * uo = 600 * 4pi * 10^-7 = 2.4pi * 10^-4 T m/A.",
    subject: "physics", chapter: "Magnetism and Matter", topic: "Magnetic Properties",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2020, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2020" }
  },
  {
    questionText: "In a series LCR circuit, resonance occurs when:",
    options: {
      A: { text: "Inductive reactance equals capacitive reactance" },
      B: { text: "Impedance of the circuit is maximum" },
      C: { text: "Current in the circuit is minimum" },
      D: { text: "Phase angle between voltage and current is 90°" }
    },
    correctAnswer: "A",
    explanation: "Resonance in LCR occurs when XL = XC, which minimizes impedance Z = R, and maximizes current.",
    subject: "physics", chapter: "Alternating Current", topic: "Resonance",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2012, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2012" }
  },

  // ─── AIPMT/JEE CHEMISTRY QUESTIONS (41-60) ───
  {
    questionText: "The oxidation state of Cr in CrO5 (chromium pentoxide) is:",
    options: {
      A: { text: "+6" },
      B: { text: "+10" },
      C: { text: "+5" },
      D: { text: "+3" }
    },
    correctAnswer: "A",
    explanation: "CrO5 has a butterfly structure containing two peroxide linkages (-O-O-) and one oxo (=O) oxygen. Cr + 4(-1) + 1(-2) = 0 => Cr = +6.",
    subject: "chemistry", chapter: "Redox Reactions", topic: "Oxidation State",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },
  {
    questionText: "Which of the following molecules has a linear geometry?",
    options: {
      A: { text: "CO2" },
      B: { text: "SO2" },
      C: { text: "H2O" },
      D: { text: "NO2" }
    },
    correctAnswer: "A",
    explanation: "CO2 is sp-hybridized with zero lone pairs on carbon, forming a linear geometry. SO2, H2O, and NO2 are bent.",
    subject: "chemistry", chapter: "Chemical Bonding and Molecular Structure", topic: "Molecular Geometry",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2011, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2011" }
  },
  {
    questionText: "The correct order of increasing acidic strength of methyl-substituted benzoic acids is:",
    options: {
      A: { text: "p-methylbenzoic acid < benzoic acid < o-methylbenzoic acid" },
      B: { text: "o-methylbenzoic acid < benzoic acid < p-methylbenzoic acid" },
      C: { text: "benzoic acid < p-methylbenzoic acid < o-methylbenzoic acid" },
      D: { text: "p-methylbenzoic acid < o-methylbenzoic acid < benzoic acid" }
    },
    correctAnswer: "A",
    explanation: "Methyl group is electron-donating (+I and +H effect), which decreases acidity at para position. However, ortho-substituted benzoic acids are stronger than benzoic acid due to the ortho effect.",
    subject: "chemistry", chapter: "Organic Chemistry - Some Basic Principles and Techniques", topic: "Acid Strength",
    difficulty: "hard", type: "mcq", source: "pyq",
    sourceDetails: { year: 2019, examType: "jee_main" }, pyq: { isPYQ: true, reference: "JEE Main 2019" }
  },
  {
    questionText: "Identify the hybridization and number of lone pairs in XeF4 (xenon tetrafluoride):",
    options: {
      A: { text: "sp3d2, 2 lone pairs" },
      B: { text: "sp3d, 1 lone pair" },
      C: { text: "sp3d2, 1 lone pair" },
      D: { text: "dsp2, 0 lone pairs" }
    },
    correctAnswer: "A",
    explanation: "Xe has 8 valence electrons. 4 are shared with fluorines, leaving 4 electrons (2 lone pairs). Steric number = 4 + 2 = 6, corresponding to sp3d2 (square planar shape).",
    subject: "chemistry", chapter: "Chemical Bonding and Molecular Structure", topic: "VSEPR",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "The half-life of a first-order reaction is 69.3 seconds. Find its rate constant:",
    options: {
      A: { text: "10^-2 s^-1" },
      B: { text: "10^-3 s^-1" },
      C: { text: "10^-1 s^-1" },
      D: { text: "6.93 s^-1" }
    },
    correctAnswer: "A",
    explanation: "For first-order reaction, t0.5 = 0.693 / k. Thus k = 0.693 / 69.3 = 0.01 = 10^-2 s^-1.",
    subject: "chemistry", chapter: "Chemical Kinetics", topic: "Rate Constants",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "The IUPAC name of the complex [Co(NH3)5(CO3)]Cl is:",
    options: {
      A: { text: "Pentaamminecarbonatocobalt(III) chloride" },
      B: { text: "Carbonatopentamminecobalt(III) chloride" },
      C: { text: "Pentaamminecarbonatocobalt(II) chloride" },
      D: { text: "Pentaamminecobalt(III) carbonate chloride" }
    },
    correctAnswer: "A",
    explanation: "Ammiene ligand is named first alphabetically. Carbonato is anionic ligand. Cobalt oxidation state: Co - 2 - 1 = 0 => Co = +3. Hence, Pentaamminecarbonatocobalt(III) chloride.",
    subject: "chemistry", chapter: "Coordination Compounds", topic: "Nomenclature",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Which of the following coordinates will show maximum crystal field splitting energy (CFSE) Δo?",
    options: {
      A: { text: "[Co(CN)6]3-" },
      B: { text: "[Co(H2O)6]3+" },
      C: { text: "[Co(NH3)6]3+" },
      D: { text: "[Co(Cl)6]3-" }
    },
    correctAnswer: "A",
    explanation: "CN- is a strong field ligand in the spectrochemical series, which causes the maximum splitting of d-orbitals and thus has the highest CFSE value.",
    subject: "chemistry", chapter: "Coordination Compounds", topic: "CFSE",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2016, examType: "neet" }, pyq: { isPYQ: true, reference: "NEET 2016" }
  },
  {
    questionText: "The correct structure of monomer of Nylon-6 is:",
    options: {
      A: { text: "Caprolactam" },
      B: { text: "Adipic acid" },
      C: { text: "Hexamethylene diamine" },
      D: { text: "Tetrafluoroethylene" }
    },
    correctAnswer: "A",
    explanation: "Nylon-6 is obtained by heating caprolactam with water at high temperature.",
    subject: "chemistry", chapter: "Polymers", topic: "Monomers",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2012, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2012" }
  },
  {
    questionText: "An organic compound contains 40% Carbon, 6.7% Hydrogen and remaining Oxygen. Find its empirical formula:",
    options: {
      A: { text: "CH2O" },
      B: { text: "CHO" },
      C: { text: "CHO2" },
      D: { text: "C2H4O" }
    },
    correctAnswer: "A",
    explanation: "Ratio of atoms: C = 40/12 = 3.33; H = 6.7/1 = 6.7; O = 53.3/16 = 3.33. Dividing by smallest value 3.33: C = 1, H = 2, O = 1. Formula is CH2O.",
    subject: "chemistry", chapter: "Some Basic Concepts of Chemistry", topic: "Empirical Formula",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },
  {
    questionText: "Which of the following elements has the highest negative electron gain enthalpy?",
    options: {
      A: { text: "Chlorine" },
      B: { text: "Fluorine" },
      C: { text: "Bromine" },
      D: { text: "Oxygen" }
    },
    correctAnswer: "A",
    explanation: "Although fluorine is more electronegative, chlorine has a higher negative electron gain enthalpy than fluorine because fluorine's small size leads to inter-electronic repulsions.",
    subject: "chemistry", chapter: "Classification of Elements and Periodicity in Properties", topic: "Periodic Trends",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "According to molecular orbital theory, which of the following is paramagnetic?",
    options: {
      A: { text: "O2" },
      B: { text: "N2" },
      C: { text: "C2" },
      D: { text: "F2" }
    },
    correctAnswer: "A",
    explanation: "O2 has 16 electrons. Its MO configuration contains two unpaired electrons in the anti-bonding pi*2px and pi*2py orbitals, making it paramagnetic.",
    subject: "chemistry", chapter: "Chemical Bonding and Molecular Structure", topic: "Molecular Orbitals",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2013, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2013" }
  },
  {
    questionText: "The standard reduction potentials of three metals A, B and C are +0.5 V, -3.0 V and -1.2 V respectively. The reducing power order is:",
    options: {
      A: { text: "B > C > A" },
      B: { text: "A > C > B" },
      C: { text: "C > B > A" },
      D: { text: "B > A > C" }
    },
    correctAnswer: "A",
    explanation: "Lower (more negative) reduction potential indicates stronger reducing power. Order: -3.0 V (B) > -1.2 V (C) > +0.5 V (A).",
    subject: "chemistry", chapter: "Redox Reactions", topic: "Electrochemical Series",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2011, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2011" }
  },
  {
    questionText: "What is the coordinate number and oxidation state of cobalt in [Co(ox)3]3- (where ox represents oxalate)?",
    options: {
      A: { text: "6, +3" },
      B: { text: "3, +3" },
      C: { text: "6, +6" },
      D: { text: "3, +6" }
    },
    correctAnswer: "A",
    explanation: "Oxalate is a bidentate ligand. 3 oxalate ligands provide 6 coordinate bonds. Co + 3(-2) = -3 => Co = +3.",
    subject: "chemistry", chapter: "Coordination Compounds", topic: "Oxidation State",
    difficulty: "medium", type: "mcq", source: "pyq",
    sourceDetails: { year: 2012, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2012" }
  },
  {
    questionText: "The major product of reaction of propene with HBr in the presence of peroxides is:",
    options: {
      A: { text: "1-bromopropane" },
      B: { text: "2-bromopropane" },
      C: { text: "1,2-dibromopropane" },
      D: { text: "Propyl alcohol" }
    },
    correctAnswer: "A",
    explanation: "HBr addition to unsymmetrical alkenes in the presence of peroxides follows Anti-Markovnikov's rule (Kharasch effect), yielding 1-bromopropane.",
    subject: "chemistry", chapter: "Hydrocarbons", topic: "Alkene Reactions",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Which of the following organic compounds will react fastest via SN1 mechanism?",
    options: {
      A: { text: "tert-Butyl chloride" },
      B: { text: "Isopropyl chloride" },
      C: { text: "Ethyl chloride" },
      D: { text: "Methyl chloride" }
    },
    correctAnswer: "A",
    explanation: "SN1 rate depends on the stability of carbocation. Tertiary carbocation is most stable (+I and hyperconjugation), so tert-butyl chloride reacts fastest.",
    subject: "chemistry", chapter: "Alcohols, Phenols and Ethers", topic: "SN1 Reaction",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Which of the following carbohydrates is a non-reducing sugar?",
    options: {
      A: { text: "Sucrose" },
      B: { text: "Maltose" },
      C: { text: "Lactose" },
      D: { text: "Glucose" }
    },
    correctAnswer: "A",
    explanation: "In sucrose, the reducing groups of glucose and fructose are involved in glycosidic linkage, making it a non-reducing sugar.",
    subject: "chemistry", chapter: "Biomolecules", topic: "Carbohydrates",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2014, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2014" }
  },
  {
    questionText: "Assertion (A): Nitrogen is less reactive than phosphorus.\nReason (R): Nitrogen molecule has a strong triple bond (N≡N) which has very high bond dissociation enthalpy.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "A",
    explanation: "Both statements are true and R explains A. The triple bond of N2 is highly stable and requires significant energy to break, making it inert at room temperature.",
    subject: "chemistry", chapter: "The p-Block Elements", topic: "Nitrogen Chemistry",
    difficulty: "medium", type: "assertion_reason", source: "pyq",
    sourceDetails: { year: 2015, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2015" }
  },
  {
    questionText: "Assertion (A): Graphite is a good conductor of electricity whereas diamond is an insulator.\nReason (R): Graphite has free electrons due to sp2 hybridization of carbon, whereas diamond has all electrons bound in sp3 covalent bonds.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "A",
    explanation: "Graphite has sp2 carbons with one unhybridized p-orbital forming delocalized pi systems (free electrons). Diamond carbons are sp3 hybridized with no free electrons.",
    subject: "chemistry", chapter: "Chemical Bonding and Molecular Structure", topic: "Allotropes",
    difficulty: "easy", type: "assertion_reason", source: "pyq",
    sourceDetails: { year: 2012, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2012" }
  },
  {
    questionText: "The work done during expansion of an ideal gas against vacuum (free expansion) is:",
    options: {
      A: { text: "Zero" },
      B: { text: "-P*dV" },
      C: { text: "nRT ln(V2/V1)" },
      D: { text: "q" }
    },
    correctAnswer: "A",
    explanation: "Free expansion occurs against an external pressure P_ext = 0. Work W = -P_ext * dV = 0.",
    subject: "chemistry", chapter: "Thermodynamics", topic: "Free Expansion",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2011, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2011" }
  },
  {
    questionText: "The structure of coordination compound K4[Fe(CN)6] shows that iron has an oxidation state of:",
    options: {
      A: { text: "+2" },
      B: { text: "+3" },
      C: { text: "+6" },
      D: { text: "0" }
    },
    correctAnswer: "A",
    explanation: "In K4[Fe(CN)6], potassium is +1, CN is -1. 4(+1) + Fe + 6(-1) = 0 => Fe = +2.",
    subject: "chemistry", chapter: "Coordination Compounds", topic: "Oxidation State",
    difficulty: "easy", type: "mcq", source: "pyq",
    sourceDetails: { year: 2010, examType: "aipmt" }, pyq: { isPYQ: true, reference: "AIPMT 2010" }
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB');

    const formatted = pyqs.map((q, index) => {
      // Create unique identifiers
      const subCode = q.subject.substring(0, 3).toUpperCase();
      const yr = q.sourceDetails?.year || 2015;
      const exType = q.sourceDetails?.examType || 'aipmt';
      const qId = `ADD-PYQ-${subCode}-${exType.toUpperCase()}-${yr}-${index + 1}`;
      
      return {
        ...q,
        questionId: qId,
        inSyllabus: true,
        isPublished: true,
        isVerified: true,
        qualityScore: 92,
        estimatedTime: 50,
        marks: 4,
        negativeMarks: -1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    console.log(`📦 Seeding ${formatted.length} additional AIPMT & JEE questions...`);

    const result = await Question.insertMany(formatted, { ordered: false });
    console.log(`✅ Successfully seeded ${result.length} questions!`);

    const total = await Question.countDocuments();
    console.log(`📈 Grand total questions in DB now: ${total}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    if (error.writeErrors) {
      console.log(`⚠️ Bulk insert completed with duplicates. Seeded ${error.result?.nInserted || 0} questions.`);
    } else {
      console.error('❌ Error seeding database:', error.message);
    }
    process.exit(1);
  }
}

seed();
