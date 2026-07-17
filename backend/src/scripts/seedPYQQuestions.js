/**
 * NEET PYQ Seed Script - 2018, 2019, 2023, 2024
 * Run from backend folder: node src/scripts/seedPYQQuestions.js
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

/* ─────────────── helpers ─────────────── */
const pyq = (yr, ref) => ({ isPYQ: true, reference: ref });
const src = (yr) => ({ year: yr, examType: 'neet' });
const base = (yr, ref) => ({
  type: 'mcq', source: 'pyq',
  sourceDetails: src(yr), pyq: pyq(yr, ref),
  inSyllabus: true, isPublished: true, isVerified: true,
  qualityScore: 90, trendingFrequency: 'high',
});

const physics2024 = [
  {
    questionText: 'A tightly wound circular coil of radius R has N turns and carries a current I. The magnetic field at the centre of the coil is:',
    options: {
      A: { text: 'μ₀NI / (2R)' },
      B: { text: 'μ₀NI / R' },
      C: { text: 'μ₀I / (2RN)' },
      D: { text: 'μ₀I / (2R)' }
    },
    correctAnswer: 'A', subject: 'physics', chapter: 'Moving Charges and Magnetism',
    topic: 'Magnetic field at centre of circular coil', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q1' }
  },
  {
    questionText: 'Match List-I (Material) with List-II (Susceptibility). Diamagnetic→?, Ferromagnetic→?, Paramagnetic→?, Non-magnetic→?',
    options: { A: { text: 'A-III, B-II, C-I, D-IV' }, B: { text: 'A-IV, B-III, C-II, D-I' }, C: { text: 'A-II, B-III, C-IV, D-I' }, D: { text: 'C-II, B-I, C-III, D-IV' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Magnetism and Matter',
    topic: 'Magnetic susceptibility classification', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q2' }
  },
  {
    questionText: 'A thermodynamic system is taken through the cycle abcda (P-V diagram with pressures 100 kPa and 300 kPa, volumes 100 cc and 400 cc). The work done by the gas along the path bc is:',
    options: { A: { text: '–90 J' }, B: { text: '–60 J' }, C: { text: 'zero' }, D: { text: '30 J' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Thermodynamics',
    topic: 'Work done in thermodynamic cycle', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q3' }
  },
  {
    questionText: 'An unpolarised light beam strikes a glass surface at Brewster\'s angle. Then:',
    options: { A: { text: 'Both reflected and refracted light will be completely polarised' }, B: { text: 'The reflected light will be completely polarised but refracted light will be partially polarised' }, C: { text: 'The reflected light will be partially polarised' }, D: { text: 'The refracted light will be completely polarised' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Wave Optics',
    topic: "Brewster's angle and polarisation", difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q4' }
  },
  {
    questionText: 'In an ideal transformer, the turns ratio is Np/Ns = 1/2. The ratio Vs:Vp is equal to:',
    options: { A: { text: '1 : 1' }, B: { text: '1 : 4' }, C: { text: '1 : 2' }, D: { text: '2 : 1' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Alternating Current',
    topic: 'Transformer turns ratio', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q5' }
  },
  {
    questionText: 'In a vernier calipers, (N+1) divisions of vernier scale coincide with N divisions of main scale. If 1 MSD represents 0.1 mm, the vernier constant (in cm) is:',
    options: { A: { text: '100N' }, B: { text: '10(N+1)' }, C: { text: '1/(10N)' }, D: { text: '1/(100(N+1))' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Measurement',
    topic: 'Vernier caliper least count', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q7' }
  },
  {
    questionText: 'The maximum elongation of a steel wire of 1 m length if the elastic limit of steel is 8×10⁸ N m⁻² and Young\'s modulus is 2×10¹¹ N m⁻², is:',
    options: { A: { text: '40 mm' }, B: { text: '8 mm' }, C: { text: '4 mm' }, D: { text: '0.4 mm' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Mechanical Properties of Solids',
    topic: 'Maximum elongation and elastic limit', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q8' }
  },
  {
    questionText: 'A horizontal force 10 N is applied to block A (mass 2 kg). Block B (mass 3 kg) rests beside A. The blocks slide over a frictionless surface. The force exerted by block A on block B is:',
    options: { A: { text: '6 N' }, B: { text: '10 N' }, C: { text: 'zero' }, D: { text: '4 N' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Laws of Motion',
    topic: "Newton's third law and contact force", difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q9' }
  },
  {
    questionText: 'If the monochromatic source in Young\'s double slit experiment is replaced by white light, then:',
    options: { A: { text: 'There will be a central bright white fringe surrounded by a few coloured fringes' }, B: { text: 'All bright fringes will be of equal width' }, C: { text: 'Interference pattern will disappear' }, D: { text: 'There will be a central dear fringe surrounded by a few coloured fringes' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Wave Optics',
    topic: "Young's double slit with white light", difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q10' }
  },
  {
    questionText: 'In the following circuit, the equivalent capacitance between terminal A and terminal B is (circuit with four 2F capacitors in a bridge arrangement):',
    options: { A: { text: '0.5 F' }, B: { text: '4 F' }, C: { text: '2 F' }, D: { text: '1 F' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Electrostatic Potential and Capacitance',
    topic: 'Equivalent capacitance in network', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q12' }
  },
  {
    questionText: 'The moment of inertia of a thin rod about an axis passing through its mid-point and perpendicular to the rod is 2400 g cm². The length of the 400 g rod is nearly:',
    options: { A: { text: '20.7 cm' }, B: { text: '72.0 cm' }, C: { text: '8.5 cm' }, D: { text: '17.5 cm' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'System of Particles and Rotational Motion',
    topic: 'Moment of inertia of rod', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q17' }
  },
  {
    questionText: 'The terminal voltage of a battery (emf 10 V, internal resistance 1 Ω) connected through an external resistance of 4 Ω is:',
    options: { A: { text: '8 V' }, B: { text: '10 V' }, C: { text: '4 V' }, D: { text: '6 V' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Current Electricity',
    topic: 'Terminal voltage and internal resistance', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q18' }
  },
  {
    questionText: 'Two bodies A and B of same mass undergo completely inelastic one-dimensional collision. Body A moves with velocity v₁ while body B is at rest. The velocity of the system after collision is v₂. The ratio v₁:v₂ is:',
    options: { A: { text: '4:1' }, B: { text: '1:4' }, C: { text: '1:2' }, D: { text: '2:1' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Work Energy and Power',
    topic: 'Perfectly inelastic collision', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q30' }
  },
  {
    questionText: 'A bob is whirled in a horizontal plane with initial speed ω rpm. Tension is T. If speed becomes 2ω keeping the same radius, the tension becomes:',
    options: { A: { text: 'T/4' }, B: { text: '√2T' }, C: { text: 'T' }, D: { text: '4T' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Motion in a Plane',
    topic: 'Circular motion and centripetal tension', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q34' }
  },
  {
    questionText: 'A wire of length l and resistance 100 Ω is divided into 10 equal parts. The first 5 parts are connected in series and the next 5 in parallel. The two combinations are again connected in series. The resistance of this final combination is:',
    options: { A: { text: '55 Ω' }, B: { text: '60 Ω' }, C: { text: '26 Ω' }, D: { text: '52 Ω' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Current Electricity',
    topic: 'Series-parallel combination of resistors', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q35' }
  },
];

// ─────────────────────────────────────────────
// NEET 2024 CHEMISTRY
// ─────────────────────────────────────────────
const chemistry2024 = [
  {
    questionText: 'Which reaction is NOT a redox reaction? (1) H₂+Cl₂→2HCl (2) BaCl₂+Na₂SO₄→BaSO₄+2NaCl (3) Zn+CuSO₄→ZnSO₄+Cu (4) 2KClO₃+I₂→2KIO₃+Cl₂',
    options: { A: { text: 'H₂+Cl₂→2HCl' }, B: { text: 'BaCl₂+Na₂SO₄→BaSO₄+2NaCl' }, C: { text: 'Zn+CuSO₄→ZnSO₄+Cu' }, D: { text: '2KClO₃+I₂→2KIO₃+Cl₂' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Redox Reactions',
    topic: 'Identification of non-redox reactions', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q52' }
  },
  {
    questionText: 'Fehling\'s solution A is: (1) alkaline solution of sodium potassium tartrate (2) aqueous sodium citrate (3) aqueous copper sulphate (4) alkaline copper sulphate',
    options: { A: { text: 'Alkaline solution of sodium potassium tartrate (Rochelle\'s salt)' }, B: { text: 'Aqueous sodium citrate' }, C: { text: 'Aqueous copper sulphate' }, D: { text: 'Alkaline copper sulphate' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Aldehydes, Ketones and Carboxylic Acids',
    topic: "Fehling's test reagents", difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q54' }
  },
  {
    questionText: '1 gram of NaOH was treated with 25 mL of 0.75 M HCl solution. The mass of NaOH left unreacted is equal to:',
    options: { A: { text: 'Zero mg' }, B: { text: '200 mg' }, C: { text: '750 mg' }, D: { text: '250 mg' } },
    correctAnswer: 'D', subject: 'chemistry', chapter: 'Some Basic Concepts of Chemistry',
    topic: 'Stoichiometry and limiting reagent', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q55' }
  },
  {
    questionText: 'Match List-I (Compound) with List-II (Shape): NH₃→Trigonal Pyramidal, BrF₅→Square Pyramidal, XeF₄→Square Planar, SF₆→Octahedral. Correct answer:',
    options: { A: { text: 'A-III, B-IV, C-I, D-II' }, B: { text: 'A-II, B-III, C-IV, D-I' }, C: { text: 'A-I, B-IV, C-II, D-III' }, D: { text: 'A-II, B-IV, C-III, D-I' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Chemical Bonding and Molecular Structure',
    topic: 'VSEPR and molecular geometry', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q56' }
  },
  {
    questionText: 'The E° value for the Mn³⁺/Mn²⁺ couple is more positive than that of Cr³⁺/Cr²⁺ or Fe³⁺/Fe²⁺ due to change of:',
    options: { A: { text: 'd⁴ to d⁵ configuration' }, B: { text: 'd³ to d⁵ configuration' }, C: { text: 'd⁵ to d⁴ configuration' }, D: { text: 'd⁵ to d² configuration' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'The d- and f-Block Elements',
    topic: 'Stability of d-block configurations', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q57' }
  },
  {
    questionText: 'Match thermodynamic processes: Isothermal→constant temperature, Isochoric→constant volume, Isobaric→constant pressure, Adiabatic→no heat exchange. Correct match:',
    options: { A: { text: 'A-I, B-II, C-III, D-IV' }, B: { text: 'A-II, B-III, C-IV, D-I' }, C: { text: 'A-IV, B-III, C-II, D-I' }, D: { text: 'A-IV, B-II, C-III, D-I' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Thermodynamics',
    topic: 'Thermodynamic process definitions', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q58' }
  },
  {
    questionText: 'Activation energy of any chemical reaction can be calculated if one knows the value of:',
    options: { A: { text: 'Orientation of reactant molecules during collision' }, B: { text: 'Rate constant at two different temperatures' }, C: { text: 'Rate constant at standard temperature' }, D: { text: 'Probability of collision' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Equilibrium',
    topic: 'Arrhenius equation and activation energy', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q59' }
  },
  {
    questionText: 'A compound with molecular formula C₆H₁₄ has two tertiary carbons. Its IUPAC name is:',
    options: { A: { text: '2,3-dimethylbutane' }, B: { text: '2,2-dimethylbutane' }, C: { text: 'n-hexane' }, D: { text: '2-methylpentane' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'Organic Chemistry - Some Basic Principles and Techniques',
    topic: 'IUPAC nomenclature of alkanes', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q60' }
  },
  {
    questionText: 'Arrange the following elements in increasing order of electronegativity: N, O, F, C, Si',
    options: { A: { text: 'O < F < N < C < Si' }, B: { text: 'F < O < N < C < Si' }, C: { text: 'Si < C < N < O < F' }, D: { text: 'Si < C < O < N < F' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Classification of Elements and Periodicity in Properties',
    topic: 'Electronegativity trends', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q62' }
  },
  {
    questionText: 'Which one of the following alcohols reacts instantaneously with Lucas reagent? (Tertiary alcohol reacts fastest)',
    options: { A: { text: 'CH₃–CH(CH₃)–CH₂OH (2-methylpropan-1-ol)' }, B: { text: '(CH₃)₃COH (2-methylpropan-2-ol, tertiary)' }, C: { text: 'CH₃CH₂CH₂CH₂OH (butan-1-ol)' }, D: { text: 'CH₃CH₂CH(CH₃)OH (butan-2-ol)' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Alcohols, Phenols and Ethers',
    topic: 'Lucas test and alcohol reactivity', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q63' }
  },
  {
    questionText: 'Both [Co(NH₃)₆]³⁺ and [CoF₆]³⁻ are octahedral but differ in magnetic behaviour. [Co(NH₃)₆]³⁺ is diamagnetic whereas [CoF₆]³⁻ is paramagnetic. Choose:',
    options: { A: { text: 'Statement I is true but Statement II is false' }, B: { text: 'Statement I is false but Statement II is true' }, C: { text: 'Both statements are true' }, D: { text: 'Both statements are false' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Coordination Compounds',
    topic: 'Crystal field theory and magnetic behaviour', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q64' }
  },
  {
    questionText: 'Statement I: Boiling point of Group 16 hydrides: H₂O > H₂Te > H₂Se > H₂S. Statement II: Due to extensive H-bonding in H₂O it has higher boiling point despite lower molecular mass.',
    options: { A: { text: 'Statement I is true but Statement II is false' }, B: { text: 'Statement I is false but Statement II is true' }, C: { text: 'Both statements are true' }, D: { text: 'Both statements are false' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'The p-Block Elements',
    topic: 'Hydrogen bonding and boiling points of hydrides', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q65' }
  },
  {
    questionText: 'For the reaction 2A ⇌ B + C, Kc = 4×10⁻³. At a given time, [A]=[B]=[C]=2×10⁻³ M. Then:',
    options: { A: { text: 'Reaction has tendency to go backward' }, B: { text: 'Reaction has gone to completion in forward direction' }, C: { text: 'Reaction is at equilibrium' }, D: { text: 'Reaction has tendency to go forward' } },
    correctAnswer: 'D', subject: 'chemistry', chapter: 'Equilibrium',
    topic: 'Reaction quotient vs equilibrium constant', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q72' }
  },
  {
    questionText: 'The Henry\'s law constant (KH) values of three gases (A, B, C) in water are 145, 2×10⁻⁵ and 35 kbar respectively. The solubility order of these gases in water follows:',
    options: { A: { text: 'A > C > B' }, B: { text: 'A > B > C' }, C: { text: 'B > A > C' }, D: { text: 'B > C > A' } },
    correctAnswer: 'D', subject: 'chemistry', chapter: 'Equilibrium',
    topic: "Henry's law and gas solubility", difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q85' }
  },
];

// ─────────────────────────────────────────────
// NEET 2024 BIOLOGY (BOTANY + ZOOLOGY)
// ─────────────────────────────────────────────
const biology2024 = [
  {
    questionText: 'Inhibition of Succinic dehydrogenase enzyme by malonate is a classical example of:',
    options: { A: { text: 'Competitive inhibition' }, B: { text: 'Enzyme activation' }, C: { text: 'Cofactor inhibition' }, D: { text: 'Feedback inhibition' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Cell Structure and Function',
    topic: 'Enzyme inhibition types', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q103' }
  },
  {
    questionText: 'Bulliform cells are responsible for:',
    options: { A: { text: 'Increased photosynthesis in monocots' }, B: { text: 'Providing large spaces for storage of sugars' }, C: { text: 'Inward curling of leaves in monocots' }, D: { text: 'Protecting the plant from salt stress' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Bulliform cells function', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q105' }
  },
  {
    questionText: 'Which of the following are required for the dark reaction of photosynthesis?',
    options: { A: { text: 'C, D and E only (CO₂, ATP, NADPH)' }, B: { text: 'D and E only (ATP, NADPH)' }, C: { text: 'A, B and C only (Light, Chlorophyll, CO₂)' }, D: { text: 'B, C and D only (Chlorophyll, CO₂, ATP)' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Plant Physiology',
    topic: 'Dark reactions of photosynthesis - Calvin cycle inputs', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q106' }
  },
  {
    questionText: 'Formation of interfascicular cambium from fully developed parenchyma cells is an example for:',
    options: { A: { text: 'Dedifferentiation' }, B: { text: 'Maturation' }, C: { text: 'Differentiation' }, D: { text: 'Redifferentiation' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Dedifferentiation and secondary growth', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q107' }
  },
  {
    questionText: 'HindII always cuts DNA molecules at a particular point called recognition sequence and it consists of:',
    options: { A: { text: '4 bp' }, B: { text: '10 bp' }, C: { text: '8 bp' }, D: { text: '6 bp' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Restriction endonucleases and recognition sequences', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q108' }
  },
  {
    questionText: 'Tropical regions show greatest level of species richness because: (A) Tropical latitudes remained undisturbed for millions of years (B) Tropical environments are more seasonal (C) More solar energy available (D) Constant environments promote niche specialization (E) Tropical environments are constant and predictable.',
    options: { A: { text: 'A, B and E only' }, B: { text: 'A, B and D only' }, C: { text: 'A, C, D and E only' }, D: { text: 'A and B only' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Ecology',
    topic: 'Latitudinal diversity gradient', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q109' }
  },
  {
    questionText: 'The capacity to generate a whole plant from any cell of the plant is called:',
    options: { A: { text: 'Differentiation' }, B: { text: 'Somatic hybridization' }, C: { text: 'Totipotency' }, D: { text: 'Micropropagation' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Plant Physiology',
    topic: 'Totipotency and tissue culture', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q113' }
  },
  {
    questionText: 'In the Verhulst-Pearl logistic growth equation dN/dt = rN[(K-N)/K], K indicates:',
    options: { A: { text: 'Carrying capacity' }, B: { text: 'Population density' }, C: { text: 'Intrinsic rate of natural increase' }, D: { text: 'Biotic potential' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Ecology',
    topic: 'Logistic growth equation parameters', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q114' }
  },
  {
    questionText: 'Spindle fibres attach to kinetochores of chromosomes during:',
    options: { A: { text: 'Anaphase' }, B: { text: 'Telophase' }, C: { text: 'Prophase' }, D: { text: 'Metaphase' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Cell Structure and Function',
    topic: 'Kinetochore attachment during cell division', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q115' }
  },
  {
    questionText: 'In a plant, black seed color (BB/Bb) is dominant over white seed color (bb). To find out the genotype of the black seed plant, you should cross it with:',
    options: { A: { text: 'Bb' }, B: { text: 'BB/Bb' }, C: { text: 'BB' }, D: { text: 'bb' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Genetics',
    topic: 'Test cross and genotype determination', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q118' }
  },
  {
    questionText: 'A pink flowered Snapdragon plant was crossed with a red flowered Snapdragon plant. What type of phenotype(s) is/are expected in the progeny?',
    options: { A: { text: 'Only pink flowered plants' }, B: { text: 'Red, Pink as well as white flowered plants' }, C: { text: 'Only red flowered plants' }, D: { text: 'Red flowered as well as pink flowered plants' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Genetics',
    topic: 'Incomplete dominance in Snapdragon', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q119' }
  },
  {
    questionText: 'Statement I: Bt toxins are insect group specific and coded by a gene cryIAc. Statement II: Bt toxin exists as inactive protoxin in B. thuringiensis which gets converted into active form due to acidic pH of the insect gut.',
    options: { A: { text: 'Statement I is true but Statement II is false' }, B: { text: 'Statement I is false but Statement II is true' }, C: { text: 'Both statements are true' }, D: { text: 'Both statements are false' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Bt toxin mechanism - biotechnology', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q131' }
  },
  // Zoology 2024
  {
    questionText: 'Match: Typhoid→Bacteria, Leishmaniasis→Protozoa, Ringworm→Fungus, Filariasis→Nematode. Correct answer:',
    options: { A: { text: 'A-III, B-I, C-IV, D-II' }, B: { text: 'A-II, B-IV, C-III, D-I' }, C: { text: 'A-I, B-III, C-II, D-IV' }, D: { text: 'A-IV, B-III, C-I, D-II' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Causative agents of diseases', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q151' }
  },
  {
    questionText: 'Which of the following is not a steroid hormone?',
    options: { A: { text: 'Progesterone' }, B: { text: 'Glucagon' }, C: { text: 'Cortisol' }, D: { text: 'Testosterone' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Classification of hormones', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q156' }
  },
  {
    questionText: 'The flippers of Penguins and Dolphins are an example of:',
    options: { A: { text: 'Convergent evolution' }, B: { text: 'Divergent evolution' }, C: { text: 'Adaptive radiation' }, D: { text: 'Natural selection' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Evolution',
    topic: 'Analogous organs and convergent evolution', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q162' }
  },
  {
    questionText: 'Which of the following factors are favourable for the formation of oxyhaemoglobin in alveoli?',
    options: { A: { text: 'Low pCO₂ and High H⁺ concentration' }, B: { text: 'Low pCO₂ and High temperature' }, C: { text: 'High pO₂ and High pCO₂' }, D: { text: 'High pO₂ and Lesser H⁺ concentration' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Oxyhaemoglobin formation conditions', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q167' }
  },
  {
    questionText: 'Breast-feeding during initial period of infant growth is recommended because colostrum contains several antibodies absolutely essential to develop resistance for the new born baby.',
    options: { A: { text: 'A is correct but R is not correct' }, B: { text: 'A is not correct but R is correct' }, C: { text: 'Both A and R are correct but R is NOT the correct explanation of A' }, D: { text: 'Both A and R are correct and R is the correct explanation of A' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Reproduction in Humans',
    topic: 'Colostrum and passive immunity', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q181' }
  },
  {
    questionText: 'The "Ti plasmid" of Agrobacterium tumefaciens stands for:',
    options: { A: { text: 'Tumor inducing plasmid' }, B: { text: 'Temperature independent plasmid' }, C: { text: 'Tumour inhibiting plasmid' }, D: { text: 'Tumor independent plasmid' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Agrobacterium Ti plasmid in biotechnology', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q183' }
  },
  {
    questionText: 'Which of the following is not a component of Fallopian tube?',
    options: { A: { text: 'Infundibulum' }, B: { text: 'Ampulla' }, C: { text: 'Uterine fundus' }, D: { text: 'Isthmus' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Reproduction in Humans',
    topic: 'Parts of Fallopian tube', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2024, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2024 Q184' }
  },
];

// ─────────────────────────────────────────────
// NEET 2023 PHYSICS
// ─────────────────────────────────────────────
const physics2023 = [
  {
    questionText: 'A vehicle travels half the distance with speed v and the remaining distance with speed 2v. Its average speed is:',
    options: { A: { text: '3v/4' }, B: { text: 'v/3' }, C: { text: '2v/3' }, D: { text: '4v/3' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Motion in a Straight Line',
    topic: 'Average speed for unequal distances', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q3' }
  },
  {
    questionText: 'A football player moving southward suddenly turns eastward with the same speed. The force that acts on the player while turning is:',
    options: { A: { text: 'Along south-west' }, B: { text: 'Along eastward' }, C: { text: 'Along northward' }, D: { text: 'Along north-east' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Motion in a Plane',
    topic: 'Change in momentum and force direction', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q4' }
  },
  {
    questionText: 'A bullet is fired from a gun at 280 m/s in the direction 30° above horizontal. The maximum height attained by the bullet is (g = 9.8 ms⁻², sin30° = 0.5):',
    options: { A: { text: '3000 m' }, B: { text: '2800 m' }, C: { text: '2000 m' }, D: { text: '1000 m' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Motion in a Plane',
    topic: 'Projectile motion - maximum height', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q5' }
  },
  {
    questionText: 'The potential energy of a long spring when stretched by 2 cm is U. If the spring is stretched by 8 cm, potential energy stored in it will be:',
    options: { A: { text: '16U' }, B: { text: '2U' }, C: { text: '4U' }, D: { text: '8U' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Work Energy and Power',
    topic: 'Spring potential energy and compression', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q6' }
  },
  {
    questionText: 'Two bodies of mass m and 9m are placed at a distance R. The gravitational potential on the line joining the bodies where the gravitational field equals zero will be (G = gravitational constant):',
    options: { A: { text: '-20Gm/R' }, B: { text: '-8Gm/R' }, C: { text: '-12Gm/R' }, D: { text: '-16Gm/R' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Gravitation',
    topic: 'Gravitational potential at null-field point', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q9' }
  },
  {
    questionText: 'A Carnot engine has an efficiency of 50% when its source is at 327°C. The temperature of the sink is:',
    options: { A: { text: '200°C' }, B: { text: '27°C' }, C: { text: '15°C' }, D: { text: '100°C' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Thermodynamics',
    topic: 'Carnot engine efficiency', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q13' }
  },
  {
    questionText: 'The ratio of frequencies of fundamental harmonic produced by an open pipe to that of a closed pipe having the same length is:',
    options: { A: { text: '3:1' }, B: { text: '1:2' }, C: { text: '2:1' }, D: { text: '1:3' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Waves',
    topic: 'Fundamental frequency of open vs closed pipes', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q15' }
  },
  {
    questionText: 'In a series LCR circuit, L=10 mH, C=1 μF, R=100 Ω. The frequency at which resonance occurs is:',
    options: { A: { text: '1.59 kHz' }, B: { text: '15.9 rad/s' }, C: { text: '15.9 kHz' }, D: { text: '1.59 rad/s' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Alternating Current',
    topic: 'LCR resonance frequency', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q24' }
  },
  {
    questionText: 'In hydrogen spectrum, the shortest wavelength in the Balmer series is λ. The shortest wavelength in the Brackett series is:',
    options: { A: { text: '16λ' }, B: { text: '2λ' }, C: { text: '4λ' }, D: { text: '9λ' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Atoms',
    topic: 'Hydrogen spectral series wavelengths', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q32' }
  },
  {
    questionText: 'The half life of a radioactive substance is 20 minutes. In how much time does the activity drop to 1/16th of its initial value?',
    options: { A: { text: '80 minutes' }, B: { text: '20 minutes' }, C: { text: '40 minutes' }, D: { text: '60 minutes' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Nuclei',
    topic: 'Radioactive decay and half-life', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Q33' }
  },
];

// ─────────────────────────────────────────────
// NEET 2023 CHEMISTRY
// ─────────────────────────────────────────────
const chemistry2023 = [
  {
    questionText: 'The right option for the mass of CO₂ produced by heating 20 g of 20% pure limestone is: (Atomic mass of Ca = 40, CaCO₃ → CaO + CO₂)',
    options: { A: { text: '1.32 g' }, B: { text: '1.12 g' }, C: { text: '1.76 g' }, D: { text: '2.64 g' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Some Basic Concepts of Chemistry',
    topic: 'Stoichiometry and mole calculations', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q1' }
  },
  {
    questionText: 'Amongst the following, the total number of species NOT having eight electrons around the central atom in its outermost shell is: NH₃, AlCl₃, BeCl₂, CCl₄, PCl₅',
    options: { A: { text: '1' }, B: { text: '3' }, C: { text: '2' }, D: { text: '4' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Chemical Bonding and Molecular Structure',
    topic: 'Exceptions to octet rule', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q5' }
  },
  {
    questionText: 'For an ideal solution, the correct option is:',
    options: { A: { text: 'ΔmixS = 0 at constant T and P' }, B: { text: 'ΔmixV ≠ 0 at constant T and P' }, C: { text: 'ΔmixH = 0 at constant T and P' }, D: { text: 'ΔmixG = 0 at constant T and P' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Equilibrium',
    topic: 'Ideal solution properties', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q14' }
  },
  {
    questionText: 'Taking stability as the factor, which represents the correct relationship? (Group 13 inert pair effect)',
    options: { A: { text: 'TlI > TlI₃' }, B: { text: 'TlCl₃ > TlCl' }, C: { text: 'InI₃ > InI' }, D: { text: 'AlCl > AlCl₃' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'The p-Block Elements',
    topic: 'Inert pair effect in Group 13', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q12' }
  },
  {
    questionText: 'The conductivity of centimolar solution of KCl at 25°C is 0.0210 ohm⁻¹cm⁻¹ and resistance of the cell is 60 ohm. The value of cell constant is:',
    options: { A: { text: '3.34 cm⁻¹' }, B: { text: '1.34 cm⁻¹' }, C: { text: '3.28 cm⁻¹' }, D: { text: '1.26 cm⁻¹' } },
    correctAnswer: 'D', subject: 'chemistry', chapter: 'Redox Reactions',
    topic: 'Conductance cell constant calculation', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q19' }
  },
  {
    questionText: 'For a certain reaction, the rate = k[A]²[B]. When the initial concentration of A is tripled keeping B constant, the initial rate would:',
    options: { A: { text: 'Increase by a factor of three' }, B: { text: 'Decrease by a factor of nine' }, C: { text: 'Increase by a factor of six' }, D: { text: 'Increase by a factor of nine' } },
    correctAnswer: 'D', subject: 'chemistry', chapter: 'Equilibrium',
    topic: 'Rate law and reaction order', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q21' }
  },
  {
    questionText: 'Homoleptic complex from the following is:',
    options: { A: { text: 'Triamminetriaquachromium(III) chloride' }, B: { text: 'Potassium trioxalatoaluminate(III)' }, C: { text: 'Diamminechloridonitrito-N-platinum(II)' }, D: { text: 'Pentaamminecarbonatocobalt(III) chloride' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Coordination Compounds',
    topic: 'Homoleptic vs heteroleptic complexes', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q26' }
  },
  {
    questionText: 'Which of the following reactions will NOT give primary amine as the product?',
    options: { A: { text: 'CH₃CONH₂ with LiAlH₄ then H₂O' }, B: { text: 'CH₃CONH₂ with Br₂/KOH' }, C: { text: 'CH₃CN with LiAlH₄ then H₂O' }, D: { text: 'CH₃NC with LiAlH₄ then H₂O' } },
    correctAnswer: 'D', subject: 'chemistry', chapter: 'Organic Compounds Containing Nitrogen',
    topic: 'Amine synthesis reactions', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Chem Q31' }
  },
];

// ─────────────────────────────────────────────
// NEET 2023 BIOLOGY
// ─────────────────────────────────────────────
const biology2023 = [
  {
    questionText: 'The phenomenon of pleiotropism refers to:',
    options: { A: { text: 'More than two genes affecting a single character' }, B: { text: 'Presence of several alleles of a single gene controlling a single crossover' }, C: { text: 'Presence of two alleles, each of the two genes controlling a single trait' }, D: { text: 'A single gene affecting multiple phenotypic expression' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Genetics',
    topic: 'Pleiotropism - one gene multiple effects', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Bio Q23' }
  },
  {
    questionText: 'Frequency of recombination between gene pairs on same chromosome as a measure of the distance between genes to map their position, was used for the first time by:',
    options: { A: { text: 'Henking' }, B: { text: 'Thomas Hunt Morgan' }, C: { text: 'Sutton and Boveri' }, D: { text: 'Alfred Sturtevant' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Genetics',
    topic: 'Genetic mapping and recombination frequency', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Bio Q24' }
  },
  {
    questionText: 'What is the role of RNA polymerase III in the process of transcription in Eukaryotes?',
    options: { A: { text: 'Transcription of only snRNAs' }, B: { text: 'Transcription of rRNAs (28S, 18S and 5.8S)' }, C: { text: 'Transcription of tRNA, 5srRNA and snRNA' }, D: { text: 'Transcription of precursor of mRNA' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'RNA polymerases in eukaryotes', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Bio Q25' }
  },
  {
    questionText: 'Expressed Sequence Tags (ESTs) refers to:',
    options: { A: { text: 'Certain important expressed genes' }, B: { text: 'All genes that are expressed as RNA' }, C: { text: 'All genes that are expressed as proteins' }, D: { text: 'All genes whether expressed or unexpressed' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'ESTs and human genome project', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Bio Q26' }
  },
  {
    questionText: 'Unequivocal proof that DNA is the genetic material was first proposed by:',
    options: { A: { text: 'Wilkins and Franklin' }, B: { text: 'Frederick Griffith' }, C: { text: 'Alfred Hershey and Martha Chase' }, D: { text: 'Avery, Macleod and McCarthy' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Hershey-Chase experiment - DNA as genetic material', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Bio Q27' }
  },
  {
    questionText: 'The historic Convention on Biological Diversity "The Earth Summit" was held in Rio de Janeiro in the year:',
    options: { A: { text: '2002' }, B: { text: '1992' }, C: { text: '1985' }, D: { text: '1986' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'Convention on Biological Diversity (CBD)', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Bio Q33' }
  },
  {
    questionText: 'Among "The Evil Quartet", which one is considered the most important cause driving extinction of species?',
    options: { A: { text: 'Co-extinctions' }, B: { text: 'Habitat loss and fragmentation' }, C: { text: 'Over exploitation for economic gain' }, D: { text: 'Alien species invasions' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'Major causes of biodiversity loss', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Bio Q34' }
  },
  {
    questionText: 'Radial symmetry is NOT found in adults of phylum:',
    options: { A: { text: 'Echinodermata' }, B: { text: 'Ctenophora' }, C: { text: 'Hemichordata' }, D: { text: 'Coelenterata' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Body symmetry in animal kingdom', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Zoo Q51' }
  },
  {
    questionText: 'Given below are two statements: Statement I: Low temperature preserves enzyme in temporarily inactive state whereas high temperature destroys enzymatic activity. Statement II: When inhibitor closely resembles the substrate, it is known as competitive inhibitor.',
    options: { A: { text: 'Statement I false but II true' }, B: { text: 'Both I and II are true' }, C: { text: 'Both I and II are false' }, D: { text: 'Statement I true but II false' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Cell Structure and Function',
    topic: 'Enzyme inhibition and temperature effects', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Zoo Q56' }
  },
  {
    questionText: 'Vital capacity of lung is:',
    options: { A: { text: 'IRV + ERV + TV' }, B: { text: 'IRV + ERV' }, C: { text: 'IRV + ERV + TV + RV' }, D: { text: 'IRV + ERV + TV – RV' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Lung volumes and capacities', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Zoo Q60' }
  },
  {
    questionText: 'Which one of the following common sexually transmitted diseases is completely curable when detected early and treated properly?',
    options: { A: { text: 'HIV Infection' }, B: { text: 'Genital herpes' }, C: { text: 'Gonorrhoea' }, D: { text: 'Hepatitis-B' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Reproduction in Humans',
    topic: 'Sexually transmitted diseases - curability', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Zoo Q69' }
  },
  {
    questionText: 'Broad palm with single palm crease is visible in a person suffering from:',
    options: { A: { text: 'Thalassemia' }, B: { text: "Down's syndrome" }, C: { text: "Turner's syndrome" }, D: { text: "Klinefelter's syndrome" } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Genetics',
    topic: "Down's syndrome features", difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Zoo Q73' }
  },
  {
    questionText: 'In which blood corpuscles does HIV undergo replication and produce progeny viruses?',
    options: { A: { text: 'Eosinophils' }, B: { text: 'TH cells' }, C: { text: 'B-lymphocytes' }, D: { text: 'Basophils' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Human Physiology',
    topic: 'HIV replication in T-helper cells', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2023, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2023 Zoo Q80' }
  },
];

// ─────────────────────────────────────────────
// NEET 2019 CHEMISTRY
// ─────────────────────────────────────────────
const chemistry2019 = [
  {
    questionText: 'Under isothermal condition, a gas at 300 K expands from 0.1 L to 0.25 L against a constant external pressure of 2 bar. The work done by the gas is (Given 1 L bar = 100 J):',
    options: { A: { text: '-30 J' }, B: { text: '5 kJ' }, C: { text: '25 J' }, D: { text: '30 J' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'Thermodynamics',
    topic: 'Work done in isothermal irreversible expansion', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q1' }
  },
  {
    questionText: 'A compound is formed by cation C and anion A. The anions form hexagonal close packed (hcp) lattice and the cations occupy 75% of octahedral voids. The formula of the compound is:',
    options: { A: { text: 'C₂A₃' }, B: { text: 'C₃A₂' }, C: { text: 'C₃A₄' }, D: { text: 'C₄A₃' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Some Basic Concepts of Chemistry',
    topic: 'Close packing and formula of ionic solids', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q2' }
  },
  {
    questionText: 'pH of a saturated solution of Ca(OH)₂ is 9. The solubility product (Ksp) of Ca(OH)₂ is:',
    options: { A: { text: '0.5 × 10⁻¹⁵' }, B: { text: '0.25 × 10⁻¹⁰' }, C: { text: '0.125 × 10⁻¹⁵' }, D: { text: '0.5 × 10⁻¹⁰' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'Equilibrium',
    topic: 'Ksp from pH calculation', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q3' }
  },
  {
    questionText: 'The number of moles of hydrogen molecules required to produce 20 moles of ammonia through Haber\'s process is:',
    options: { A: { text: '10' }, B: { text: '20' }, C: { text: '30' }, D: { text: '40' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Some Basic Concepts of Chemistry',
    topic: 'Stoichiometry - Haber process', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q4' }
  },
  {
    questionText: 'Among the following, the narrow spectrum antibiotic is:',
    options: { A: { text: 'Penicillin G' }, B: { text: 'Ampicillin' }, C: { text: 'Amoxycillin' }, D: { text: 'Chloramphenicol' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'Chemistry in Everyday Life',
    topic: 'Antibiotics - spectrum of activity', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q11' }
  },
  {
    questionText: 'The correct order of the basic strength of methyl substituted amines in aqueous solution is:',
    options: { A: { text: '(CH₃)₂NH > CH₃NH₂ > (CH₃)₃N' }, B: { text: '(CH₃)₃N > CH₃NH₂ > (CH₃)₂NH' }, C: { text: '(CH₃)₃N > (CH₃)₂NH > CH₃NH₂' }, D: { text: 'CH₃NH₂ > (CH₃)₂NH > (CH₃)₃N' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'Organic Compounds Containing Nitrogen',
    topic: 'Basicity of amines in aqueous solution', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q12' }
  },
  {
    questionText: 'If the rate constant for a first order reaction is k, the time (t) required for the completion of 99% of the reaction is given by:',
    options: { A: { text: 't = 0.693/k' }, B: { text: 't = 6.909/k' }, C: { text: 't = 4.606/k' }, D: { text: 't = 2.303/k' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'Equilibrium',
    topic: 'First order reaction - time for 99% completion', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q23' }
  },
  {
    questionText: '4d, 5p, 5f and 6p orbitals are arranged in the order of decreasing energy. The correct option is:',
    options: { A: { text: '5f > 6p > 5p > 4d' }, B: { text: '6p > 5f > 5p > 4d' }, C: { text: '6p > 5f > 4d > 5p' }, D: { text: '5f > 6p > 4d > 5p' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'Structure of Atom',
    topic: 'Energy ordering of orbitals', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q25' }
  },
  {
    questionText: 'The biodegradable polymer is:',
    options: { A: { text: 'Nylon-6,6' }, B: { text: 'Nylon 2-nylon 6' }, C: { text: 'Nylon-6' }, D: { text: 'Buna-S' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Polymers',
    topic: 'Biodegradable polymers', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q26' }
  },
  {
    questionText: 'Which is the correct thermal stability order for H₂E (E = O, S, Se, Te and Po)?',
    options: { A: { text: 'H₂S < H₂O < H₂Se < H₂Te < H₂Po' }, B: { text: 'H₂O < H₂S < H₂Se < H₂Te < H₂Po' }, C: { text: 'H₂Po < H₂Te < H₂Se < H₂S < H₂O' }, D: { text: 'H₂Se < H₂Te < H₂Po < H₂O < H₂S' } },
    correctAnswer: 'C', subject: 'chemistry', chapter: 'The p-Block Elements',
    topic: 'Thermal stability of Group 16 hydrides', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q28' }
  },
  {
    questionText: 'The mixture that forms maximum boiling azeotrope is:',
    options: { A: { text: 'Water + Nitric acid' }, B: { text: 'Ethanol + Water' }, C: { text: 'Acetone + Carbon disulphide' }, D: { text: 'Heptane + Octane' } },
    correctAnswer: 'A', subject: 'chemistry', chapter: 'Equilibrium',
    topic: 'Azeotropes - maximum boiling', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q34' }
  },
  {
    questionText: 'In which case is the change in entropy negative? (1) Evaporation of water (2) Expansion of a gas at constant T (3) Sublimation of solid to gas (4) 2H(g) → H₂(g)',
    options: { A: { text: 'Evaporation of water' }, B: { text: 'Expansion of gas at constant T' }, C: { text: 'Sublimation of solid to gas' }, D: { text: '2H(g) → H₂(g)' } },
    correctAnswer: 'D', subject: 'chemistry', chapter: 'Thermodynamics',
    topic: 'Entropy changes in physical and chemical processes', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q36' }
  },
  {
    questionText: 'What is the correct electronic configuration of the central atom in K₄[Fe(CN)₆] based on crystal field theory?',
    options: { A: { text: 't²₂ g e²g' }, B: { text: 't⁶₂g e⁰g' }, C: { text: 'e³t³₂' }, D: { text: 'e⁴t²₂' } },
    correctAnswer: 'B', subject: 'chemistry', chapter: 'Coordination Compounds',
    topic: 'Crystal field splitting - d-orbital configuration', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Chem Q44' }
  },
];

// ─────────────────────────────────────────────
// NEET 2019 BIOLOGY
// ─────────────────────────────────────────────
const biology2019 = [
  {
    questionText: 'Which of the following statements is incorrect? (1) Viroids lack a protein coat (2) Viruses are obligate parasites (3) Infective constituent in viruses is the protein coat (4) Prions consist of abnormally folded proteins',
    options: { A: { text: 'Viroids lack a protein coat' }, B: { text: 'Viruses are obligate parasites' }, C: { text: 'Infective constituent in viruses is the protein coat' }, D: { text: 'Prions consist of abnormally folded proteins' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Viruses, viroids and prions', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q91' }
  },
  {
    questionText: 'Purines found both in DNA and RNA are:',
    options: { A: { text: 'Adenine and thymine' }, B: { text: 'Adenine and guanine' }, C: { text: 'Guanine and cytosine' }, D: { text: 'Cytosine and thymine' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Nitrogenous bases - purines and pyrimidines', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q92' }
  },
  {
    questionText: 'Which of the following glucose transporters is insulin-dependent?',
    options: { A: { text: 'GLUT I' }, B: { text: 'GLUT II' }, C: { text: 'GLUT III' }, D: { text: 'GLUT IV' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Insulin and glucose transport (GLUT4)', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q93' }
  },
  {
    questionText: 'Which one of the following equipments is essentially required for growing microbes on a large scale for industrial production of enzymes?',
    options: { A: { text: 'BOD incubator' }, B: { text: 'Sludge digester' }, C: { text: 'Industrial oven' }, D: { text: 'Bioreactor' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Bioreactors in industrial biotechnology', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q95' }
  },
  {
    questionText: 'Which one of the following is not a method of in situ conservation of biodiversity?',
    options: { A: { text: 'Biosphere Reserve' }, B: { text: 'Wildlife Sanctuary' }, C: { text: 'Botanical Garden' }, D: { text: 'Sacred Grove' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'In situ vs ex situ conservation', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q97' }
  },
  {
    questionText: 'Which one of the following is not a method of in situ conservation of biodiversity? Botanical garden is ex situ. Which of the following features of genetic code allows bacteria to produce human insulin by recombinant DNA technology?',
    options: { A: { text: 'Genetic code is not ambiguous' }, B: { text: 'Genetic code is redundant' }, C: { text: 'Genetic code is nearly universal' }, D: { text: 'Genetic code is specific' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Universal genetic code and recombinant DNA', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q122' }
  },
  {
    questionText: 'Which part of the brain is responsible for thermoregulation?',
    options: { A: { text: 'Cerebrum' }, B: { text: 'Hypothalamus' }, C: { text: 'Corpus callosum' }, D: { text: 'Medulla oblongata' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Hypothalamus and thermoregulation', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q112' }
  },
  {
    questionText: 'Xylem translocates:',
    options: { A: { text: 'Water only' }, B: { text: 'Water and mineral salts only' }, C: { text: 'Water, mineral salts and some organic nitrogen only' }, D: { text: 'Water, mineral salts, some organic nitrogen and hormones' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Plant Physiology',
    topic: 'Xylem transport - composition of sap', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q115' }
  },
  {
    questionText: 'Which of the following is responsible for rejection of kidney graft?',
    options: { A: { text: 'Auto-immune response' }, B: { text: 'Humoral immune response' }, C: { text: 'Inflammatory immune response' }, D: { text: 'Cell-mediated immune response' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Cell-mediated immunity and graft rejection', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q120' }
  },
  {
    questionText: 'Which of the following is the most important cause for animals and plants being driven to extinction?',
    options: { A: { text: 'Habitat loss and fragmentation' }, B: { text: 'Drought and floods' }, C: { text: 'Economic exploitation' }, D: { text: 'Alien species invasion' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'Causes of biodiversity loss', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Bio Q133' }
  },
];

// ─────────────────────────────────────────────
// NEET 2019 PHYSICS
// ─────────────────────────────────────────────
const physics2019 = [
  {
    questionText: 'Body A of mass 4m moving with speed u collides with body B of mass 2m at rest. The collision is head-on and elastic. After the collision the fraction of energy lost by the colliding body A is:',
    options: { A: { text: '1/9' }, B: { text: '8/9' }, C: { text: '4/9' }, D: { text: '5/9' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Work Energy and Power',
    topic: 'Elastic collision energy transfer', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q51' }
  },
  {
    questionText: 'A mass m is attached to a thin wire and whirled in a vertical circle. The wire is most likely to break when:',
    options: { A: { text: 'The mass is at the highest point' }, B: { text: 'The wire is horizontal' }, C: { text: 'The mass is at the lowest point' }, D: { text: 'Inclined at angle 60° from vertical' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Motion in a Plane',
    topic: 'Vertical circular motion - tension maximum', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q53' }
  },
  {
    questionText: 'A 800-turn coil of effective area 0.05 m² is kept perpendicular to a magnetic field 5×10⁻⁵ T. When the plane of the coil is rotated by 90° in 0.1 s, the emf induced in the coil will be:',
    options: { A: { text: '2 V' }, B: { text: '0.2 V' }, C: { text: '2×10⁻³ V' }, D: { text: '0.02 V' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Electromagnetic Induction',
    topic: 'EMF induced by rotating coil', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q55' }
  },
  {
    questionText: 'A hollow metal sphere of radius R is uniformly charged. The electric field due to the sphere at a distance r from the centre:',
    options: { A: { text: 'Increases as r increases for r < R and for r > R' }, B: { text: 'Zero for r < R, decreases as r increases for r > R' }, C: { text: 'Zero for r < R, increases as r increases for r > R' }, D: { text: 'Decreases as r increases for r < R and for r > R' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Electric Charges and Fields',
    topic: 'Electric field of a uniformly charged hollow sphere', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q67' }
  },
  {
    questionText: 'A body weighs 200 N on the surface of the earth. How much will it weigh halfway down to the centre of the earth?',
    options: { A: { text: '150 N' }, B: { text: '200 N' }, C: { text: '250 N' }, D: { text: '100 N' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Gravitation',
    topic: 'Variation of g with depth', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q63' }
  },
  {
    questionText: 'The work done to raise a mass m from the surface of the earth to a height h, which is equal to the radius of the earth, is:',
    options: { A: { text: 'mgR' }, B: { text: '2mgR' }, C: { text: '½mgR' }, D: { text: '3/2 mgR' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Gravitation',
    topic: 'Work done against gravity to height R', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q89' }
  },
  {
    questionText: 'Two point charges A (+Q) and B (-Q) are placed at a certain distance apart. If 25% charge of A is transferred to B, the force between the charges becomes:',
    options: { A: { text: 'F' }, B: { text: '9F/16' }, C: { text: '16F/9' }, D: { text: '4F/3' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Electric Charges and Fields',
    topic: 'Coulomb\'s law with charge redistribution', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q86' }
  },
  {
    questionText: 'In a double slit experiment with light of wavelength 400 nm, angular width of first minima is 0.2°. What will be the angular width of first minima if apparatus is immersed in water (μ_water = 4/3)?',
    options: { A: { text: '0.266°' }, B: { text: '0.15°' }, C: { text: '0.05°' }, D: { text: '0.1°' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Wave Optics',
    topic: 'Double slit experiment in medium', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2019, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2019 Phy Q90' }
  },
];

// ─────────────────────────────────────────────
// NEET 2018 PHYSICS (Code AA)
// ─────────────────────────────────────────────
const physics2018 = [
  {
    questionText: 'The fundamental frequency in an open organ pipe is equal to the third harmonic of a closed organ pipe. If the length of the closed organ pipe is 20 cm, the length of the open organ pipe is:',
    options: { A: { text: '12.5 cm' }, B: { text: '8 cm' }, C: { text: '13.2 cm' }, D: { text: '16 cm' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Waves',
    topic: 'Open vs closed organ pipe harmonics', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q2' }
  },
  {
    questionText: 'At what temperature will the rms speed of oxygen molecules become just sufficient for escaping from the Earth\'s atmosphere? (m = 2.76×10⁻²⁶ kg, k_B = 1.38×10⁻²³ J K⁻¹)',
    options: { A: { text: '5.016×10⁴ K' }, B: { text: '8.360×10⁴ K' }, C: { text: '2.508×10⁴ K' }, D: { text: '1.254×10⁴ K' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Kinetic Theory',
    topic: 'RMS speed and escape velocity', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q3' }
  },
  {
    questionText: 'The efficiency of an ideal heat engine working between the freezing point and boiling point of water is:',
    options: { A: { text: '6.25%' }, B: { text: '20%' }, C: { text: '26.8%' }, D: { text: '12.5%' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Thermodynamics',
    topic: 'Carnot efficiency between 0°C and 100°C', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q4' }
  },
  {
    questionText: 'A set of n equal resistors of value R each are connected in series to battery of emf E and internal resistance R. Current drawn is I. Now n resistors are connected in parallel to the same battery. Then current drawn becomes 10I. The value of n is:',
    options: { A: { text: '20' }, B: { text: '11' }, C: { text: '10' }, D: { text: '9' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'Current Electricity',
    topic: 'Series vs parallel resistor network current', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q6' }
  },
  {
    questionText: 'A pendulum is hung from the roof and moves freely like a SHO. The acceleration of the bob is 20 m/s² at a distance of 5 m from the mean position. The time period of oscillation is:',
    options: { A: { text: '2 s' }, B: { text: 'π s' }, C: { text: '2π s' }, D: { text: '1 s' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Oscillations',
    topic: 'SHM - time period from acceleration and displacement', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q25' }
  },
  {
    questionText: 'A metallic rod of mass per unit length 0.5 kg m⁻¹ is lying on a smooth inclined plane (30°). The rod is not allowed to slide down when a magnetic field of 0.25 T acts vertically. The current flowing in the rod to keep it stationary is:',
    options: { A: { text: '14.76 A' }, B: { text: '5.98 A' }, C: { text: '7.14 A' }, D: { text: '11.32 A' } },
    correctAnswer: 'D', subject: 'physics', chapter: 'Moving Charges and Magnetism',
    topic: 'Current-carrying conductor in magnetic field on incline', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q26' }
  },
  {
    questionText: 'Three objects: A (solid sphere), B (thin circular disk), C (circular ring), each have same mass M and radius R and spin with same angular speed ω about symmetry axes. Work required to bring them to rest satisfies:',
    options: { A: { text: 'W_B > W_A > W_C' }, B: { text: 'W_A > W_B > W_C' }, C: { text: 'W_C > W_B > W_A' }, D: { text: 'W_A > W_C > W_B' } },
    correctAnswer: 'C', subject: 'physics', chapter: 'System of Particles and Rotational Motion',
    topic: 'Moment of inertia and rotational kinetic energy', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q31' }
  },
  {
    questionText: 'A moving block of mass m collides with stationary block of mass 4m. The lighter block comes to rest after collision. Initial velocity of lighter block is v. The coefficient of restitution e is:',
    options: { A: { text: '0.8' }, B: { text: '0.25' }, C: { text: '0.5' }, D: { text: '0.4' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Work Energy and Power',
    topic: 'Coefficient of restitution in collision', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q32' }
  },
  {
    questionText: 'A toy car with charge q moves on frictionless surface under uniform electric field E. Velocity increases from 0 to 6 m/s in 1 second. Field is then reversed. Car moves 2 more seconds. Average velocity and average speed from 0 to 3 s are respectively:',
    options: { A: { text: '1 m/s, 3.5 m/s' }, B: { text: '1 m/s, 3 m/s' }, C: { text: '2 m/s, 4 m/s' }, D: { text: '1.5 m/s, 3 m/s' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Motion in a Straight Line',
    topic: 'Average velocity vs average speed with reversal', difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q34' }
  },
  {
    questionText: 'The kinetic energies of a planet in elliptical orbit about Sun at positions A, B and C are K_A, K_B and K_C respectively. AC is the major axis and SB is perpendicular to AC at position of Sun S. Then:',
    options: { A: { text: 'K_B < K_A < K_C' }, B: { text: 'K_A > K_B > K_C' }, C: { text: 'K_A < K_B < K_C' }, D: { text: 'K_B > K_A > K_C' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'Gravitation',
    topic: "Kepler's second law and orbital kinetic energy", difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q39' }
  },
  {
    questionText: 'A solid sphere is in rolling motion. The ratio K_t : (K_t + K_r) for the sphere is:',
    options: { A: { text: '10:7' }, B: { text: '5:7' }, C: { text: '7:10' }, D: { text: '2:5' } },
    correctAnswer: 'B', subject: 'physics', chapter: 'System of Particles and Rotational Motion',
    topic: 'Rolling motion - translational to total KE ratio', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q41' }
  },
  {
    questionText: 'The power radiated by a black body is P and it radiates maximum energy at wavelength λ₀. If temperature changes so it radiates at wavelength 3λ₀/4, the power becomes nP. The value of n is:',
    options: { A: { text: '256/81' }, B: { text: '3/4' }, C: { text: '4/3' }, D: { text: '81/256' } },
    correctAnswer: 'A', subject: 'physics', chapter: 'Thermal Properties of Matter',
    topic: "Wien's law and Stefan-Boltzmann law", difficulty: 'hard',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q43' }
  },
];

// ─────────────────────────────────────────────
// NEET 2018 BIOLOGY (Code AA)
// ─────────────────────────────────────────────
const biology2018 = [
  {
    questionText: 'Oxygen is not produced during photosynthesis by:',
    options: { A: { text: 'Cycas' }, B: { text: 'Nostoc' }, C: { text: 'Green sulphur bacteria' }, D: { text: 'Chara' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Plant Physiology',
    topic: 'Oxygenic vs anoxygenic photosynthesis', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q91' }
  },
  {
    questionText: 'Double fertilization is:',
    options: { A: { text: 'Fusion of two male gametes with one egg' }, B: { text: 'Fusion of one male gamete with two polar nuclei' }, C: { text: 'Fusion of two male gametes of a pollen tube with two different eggs' }, D: { text: 'Syngamy and triple fusion' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Reproduction in Plants',
    topic: 'Double fertilization in angiosperms', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q92' }
  },
  {
    questionText: 'Which one of the following plants shows a very close relationship with a species of moth, where none of the two can complete its life cycle without the other?',
    options: { A: { text: 'Banana' }, B: { text: 'Yucca' }, C: { text: 'Hydrilla' }, D: { text: 'Viola' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Ecology',
    topic: 'Mutualism - obligate coevolution', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q93' }
  },
  {
    questionText: 'Pollen grains can be stored for several years in liquid nitrogen having a temperature of:',
    options: { A: { text: '-196°C' }, B: { text: '-80°C' }, C: { text: '-120°C' }, D: { text: '-160°C' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Reproduction in Plants',
    topic: 'Pollen storage in liquid nitrogen (cryopreservation)', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q94' }
  },
  {
    questionText: 'Which of the following is commonly used as a vector for introducing a DNA fragment in human lymphocytes?',
    options: { A: { text: 'λ phage' }, B: { text: 'Ti plasmid' }, C: { text: 'Retrovirus' }, D: { text: 'pBR322' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Gene therapy vectors - retrovirus', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q98' }
  },
  {
    questionText: 'Use of bioresources by multinational companies and organisations without authorisation from the concerned country and its people is called:',
    options: { A: { text: 'Biodegradation' }, B: { text: 'Biopiracy' }, C: { text: 'Bio-infringement' }, D: { text: 'Bioexploitation' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'Biopiracy and IPR in biodiversity', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q99' }
  },
  {
    questionText: 'The correct order of steps in Polymerase Chain Reaction (PCR) is:',
    options: { A: { text: 'Denaturation, Extension, Annealing' }, B: { text: 'Annealing, Extension, Denaturation' }, C: { text: 'Extension, Denaturation, Annealing' }, D: { text: 'Denaturation, Annealing, Extension' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'PCR steps and cycle', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q101' }
  },
  {
    questionText: 'The experimental proof for semiconservative replication of DNA was first shown in a:',
    options: { A: { text: 'Plant' }, B: { text: 'Bacterium' }, C: { text: 'Fungus' }, D: { text: 'Virus' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Meselson-Stahl experiment - DNA replication', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q106' }
  },
  {
    questionText: 'Casparian strips occur in:',
    options: { A: { text: 'Cortex' }, B: { text: 'Pericycle' }, C: { text: 'Epidermis' }, D: { text: 'Endodermis' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Casparian strips in root anatomy', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q127' }
  },
  {
    questionText: 'Which of the following statements is correct? (1) Horsetails are gymnosperms. (2) Selaginella is heterosporous while Salvinia is homosporous. (3) Ovules are not enclosed by ovary wall in gymnosperms. (4) Stems usually unbranched in both Cycas and Cedrus.',
    options: { A: { text: 'Horsetails are gymnosperms' }, B: { text: 'Selaginella is heterosporous, while Salvinia is homosporous' }, C: { text: 'Ovules are not enclosed by ovary wall in gymnosperms' }, D: { text: 'Stems are usually unbranched in both Cycas and Cedrus' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Gymnosperms - naked seeds', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q130' }
  },
  {
    questionText: 'Which of the following correctly represents the lung conditions in asthma and emphysema, respectively?',
    options: { A: { text: 'Increased respiratory surface; Inflammation of bronchioles' }, B: { text: 'Increased number of bronchioles; Increased respiratory surface' }, C: { text: 'Inflammation of bronchioles; Decreased respiratory surface' }, D: { text: 'Decreased respiratory surface; Inflammation of bronchioles' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Respiratory disorders - asthma and emphysema', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q136' }
  },
  {
    questionText: 'Which of the following is an amino acid derived hormone?',
    options: { A: { text: 'Estradiol' }, B: { text: 'Ecdysone' }, C: { text: 'Epinephrine' }, D: { text: 'Estriol' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Classification of hormones by chemical nature', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q140' }
  },
  {
    questionText: 'Nissl bodies are mainly composed of:',
    options: { A: { text: 'Nucleic acids and SER' }, B: { text: 'DNA and RNA' }, C: { text: 'Proteins and lipids' }, D: { text: 'Free ribosomes and RER' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Neuron structure - Nissl bodies', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q169' }
  },
  {
    questionText: 'Which of the following characteristics represent Inheritance of blood groups in humans? a.Dominance b.Co-dominance c.Multiple allele d.Incomplete dominance e.Polygenic inheritance',
    options: { A: { text: 'b, d and e' }, B: { text: 'a, b and c' }, C: { text: 'b, c and e' }, D: { text: 'a, c and e' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Genetics',
    topic: 'ABO blood group inheritance - co-dominance and multiple alleles', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q180' }
  },
];


 {
    questionText: 'Pollen grains can be stored for several years in liquid nitrogen having a temperature of:',
    options: { A: { text: '-196°C' }, B: { text: '-80°C' }, C: { text: '-120°C' }, D: { text: '-160°C' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Reproduction in Plants',
    topic: 'Pollen storage in liquid nitrogen (cryopreservation)', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q94' }
  },
  {
    questionText: 'Which of the following is commonly used as a vector for introducing a DNA fragment in human lymphocytes?',
    options: { A: { text: 'λ phage' }, B: { text: 'Ti plasmid' }, C: { text: 'Retrovirus' }, D: { text: 'pBR322' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Gene therapy vectors - retrovirus', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q98' }
  },
  {
    questionText: 'Use of bioresources by multinational companies and organisations without authorisation from the concerned country and its people is called:',
    options: { A: { text: 'Biodegradation' }, B: { text: 'Biopiracy' }, C: { text: 'Bio-infringement' }, D: { text: 'Bioexploitation' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'Biopiracy and IPR in biodiversity', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q99' }
  },
  {
    questionText: 'The correct order of steps in Polymerase Chain Reaction (PCR) is:',
    options: { A: { text: 'Denaturation, Extension, Annealing' }, B: { text: 'Annealing, Extension, Denaturation' }, C: { text: 'Extension, Denaturation, Annealing' }, D: { text: 'Denaturation, Annealing, Extension' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'PCR steps and cycle', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q101' }
  },
  {
    questionText: 'The experimental proof for semiconservative replication of DNA was first shown in a:',
    options: { A: { text: 'Plant' }, B: { text: 'Bacterium' }, C: { text: 'Fungus' }, D: { text: 'Virus' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Meselson-Stahl experiment - DNA replication', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q106' }
  },
  {
    questionText: 'Casparian strips occur in:',
    options: { A: { text: 'Cortex' }, B: { text: 'Pericycle' }, C: { text: 'Epidermis' }, D: { text: 'Endodermis' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Casparian strips in root anatomy', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q127' }
  },
  {
    questionText: 'Which of the following statements is correct? (1) Horsetails are gymnosperms. (2) Selaginella is heterosporous while Salvinia is homosporous. (3) Ovules are not enclosed by ovary wall in gymnosperms. (4) Stems usually unbranched in both Cycas and Cedrus.',
    options: { A: { text: 'Horsetails are gymnosperms' }, B: { text: 'Selaginella is heterosporous, while Salvinia is homosporous' }, C: { text: 'Ovules are not enclosed by ovary wall in gymnosperms' }, D: { text: 'Stems are usually unbranched in both Cycas and Cedrus' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Gymnosperms - naked seeds', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q130' }
  },
  {
    questionText: 'Which of the following correctly represents the lung conditions in asthma and emphysema, respectively?',
    options: { A: { text: 'Increased respiratory surface; Inflammation of bronchioles' }, B: { text: 'Increased number of bronchioles; Increased respiratory surface' }, C: { text: 'Inflammation of bronchioles; Decreased respiratory surface' }, D: { text: 'Decreased respiratory surface; Inflammation of bronchioles' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Respiratory disorders - asthma and emphysema', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q136' }
  },
  {
    questionText: 'Which of the following is an amino acid derived hormone?',
    options: { A: { text: 'Estradiol' }, B: { text: 'Ecdysone' }, C: { text: 'Epinephrine' }, D: { text: 'Estriol' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Classification of hormones by chemical nature', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q140' }
  },
  {
    questionText: 'Nissl bodies are mainly composed of:',
    options: { A: { text: 'Nucleic acids and SER' }, B: { text: 'DNA and RNA' }, C: { text: 'Proteins and lipids' }, D: { text: 'Free ribosomes and RER' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Neuron structure - Nissl bodies', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q169' }
  },
  {
    questionText: 'Which of the following characteristics represent Inheritance of blood groups in humans? a.Dominance b.Co-dominance c.Multiple allele d.Incomplete dominance e.Polygenic inheritance',
    options: { A: { text: 'b, d and e' }, B: { text: 'a, b and c' }, C: { text: 'b, c and e' }, D: { text: 'a, c and e' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Genetics',
    topic: 'ABO blood group inheritance - co-dominance and multiple alleles', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q180' }
  },
];


 {
    questionText: 'Pollen grains can be stored for several years in liquid nitrogen having a temperature of:',
    options: { A: { text: '-196°C' }, B: { text: '-80°C' }, C: { text: '-120°C' }, D: { text: '-160°C' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Reproduction in Plants',
    topic: 'Pollen storage in liquid nitrogen (cryopreservation)', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q94' }
  },
  {
    questionText: 'Which of the following is commonly used as a vector for introducing a DNA fragment in human lymphocytes?',
    options: { A: { text: 'λ phage' }, B: { text: 'Ti plasmid' }, C: { text: 'Retrovirus' }, D: { text: 'pBR322' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Gene therapy vectors - retrovirus', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q98' }
  },
  {
    questionText: 'Use of bioresources by multinational companies and organisations without authorisation from the concerned country and its people is called:',
    options: { A: { text: 'Biodegradation' }, B: { text: 'Biopiracy' }, C: { text: 'Bio-infringement' }, D: { text: 'Bioexploitation' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'Biopiracy and IPR in biodiversity', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q99' }
  },
  {
    questionText: 'The correct order of steps in Polymerase Chain Reaction (PCR) is:',
    options: { A: { text: 'Denaturation, Extension, Annealing' }, B: { text: 'Annealing, Extension, Denaturation' }, C: { text: 'Extension, Denaturation, Annealing' }, D: { text: 'Denaturation, Annealing, Extension' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'PCR steps and cycle', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q101' }
  },
  {
    questionText: 'The experimental proof for semiconservative replication of DNA was first shown in a:',
    options: { A: { text: 'Plant' }, B: { text: 'Bacterium' }, C: { text: 'Fungus' }, D: { text: 'Virus' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Meselson-Stahl experiment - DNA replication', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q106' }
  },
  {
    questionText: 'Casparian strips occur in:',
    options: { A: { text: 'Cortex' }, B: { text: 'Pericycle' }, C: { text: 'Epidermis' }, D: { text: 'Endodermis' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Casparian strips in root anatomy', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q127' }
  },
  {
    questionText: 'Which of the following statements is correct? (1) Horsetails are gymnosperms. (2) Selaginella is heterosporous while Salvinia is homosporous. (3) Ovules are not enclosed by ovary wall in gymnosperms. (4) Stems usually unbranched in both Cycas and Cedrus.',
    options: { A: { text: 'Horsetails are gymnosperms' }, B: { text: 'Selaginella is heterosporous, while Salvinia is homosporous' }, C: { text: 'Ovules are not enclosed by ovary wall in gymnosperms' }, D: { text: 'Stems are usually unbranched in both Cycas and Cedrus' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Gymnosperms - naked seeds', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q130' }
  },
  {
    questionText: 'Which of the following correctly represents the lung conditions in asthma and emphysema, respectively?',
    options: { A: { text: 'Increased respiratory surface; Inflammation of bronchioles' }, B: { text: 'Increased number of bronchioles; Increased respiratory surface' }, C: { text: 'Inflammation of bronchioles; Decreased respiratory surface' }, D: { text: 'Decreased respiratory surface; Inflammation of bronchioles' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Respiratory disorders - asthma and emphysema', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q136' }
  },
  {
    questionText: 'Which of the following is an amino acid derived hormone?',
    options: { A: { text: 'Estradiol' }, B: { text: 'Ecdysone' }, C: { text: 'Epinephrine' }, D: { text: 'Estriol' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Classification of hormones by chemical nature', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q140' }
  },
  {
    questionText: 'Nissl bodies are mainly composed of:',
    options: { A: { text: 'Nucleic acids and SER' }, B: { text: 'DNA and RNA' }, C: { text: 'Proteins and lipids' }, D: { text: 'Free ribosomes and RER' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Neuron structure - Nissl bodies', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q169' }
  },
  {
    questionText: 'Which of the following characteristics represent Inheritance of blood groups in humans? a.Dominance b.Co-dominance c.Multiple allele d.Incomplete dominance e.Polygenic inheritance',
    options: { A: { text: 'b, d and e' }, B: { text: 'a, b and c' }, C: { text: 'b, c and e' }, D: { text: 'a, c and e' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Genetics',
    topic: 'ABO blood group inheritance - co-dominance and multiple alleles', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q180' }
  },
];

 {
    questionText: 'Pollen grains can be stored for several years in liquid nitrogen having a temperature of:',
    options: { A: { text: '-196°C' }, B: { text: '-80°C' }, C: { text: '-120°C' }, D: { text: '-160°C' } },
    correctAnswer: 'A', subject: 'biology', chapter: 'Reproduction in Plants',
    topic: 'Pollen storage in liquid nitrogen (cryopreservation)', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q94' }
  },
  {
    questionText: 'Which of the following is commonly used as a vector for introducing a DNA fragment in human lymphocytes?',
    options: { A: { text: 'λ phage' }, B: { text: 'Ti plasmid' }, C: { text: 'Retrovirus' }, D: { text: 'pBR322' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Gene therapy vectors - retrovirus', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q98' }
  },
  {
    questionText: 'Use of bioresources by multinational companies and organisations without authorisation from the concerned country and its people is called:',
    options: { A: { text: 'Biodegradation' }, B: { text: 'Biopiracy' }, C: { text: 'Bio-infringement' }, D: { text: 'Bioexploitation' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Biodiversity and its Conservation',
    topic: 'Biopiracy and IPR in biodiversity', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q99' }
  },
  {
    questionText: 'The correct order of steps in Polymerase Chain Reaction (PCR) is:',
    options: { A: { text: 'Denaturation, Extension, Annealing' }, B: { text: 'Annealing, Extension, Denaturation' }, C: { text: 'Extension, Denaturation, Annealing' }, D: { text: 'Denaturation, Annealing, Extension' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'PCR steps and cycle', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q101' }
  },
  {
    questionText: 'The experimental proof for semiconservative replication of DNA was first shown in a:',
    options: { A: { text: 'Plant' }, B: { text: 'Bacterium' }, C: { text: 'Fungus' }, D: { text: 'Virus' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Molecular Basis of Inheritance',
    topic: 'Meselson-Stahl experiment - DNA replication', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q106' }
  },
  {
    questionText: 'Casparian strips occur in:',
    options: { A: { text: 'Cortex' }, B: { text: 'Pericycle' }, C: { text: 'Epidermis' }, D: { text: 'Endodermis' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Casparian strips in root anatomy', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q127' }
  },
  {
    questionText: 'Which of the following statements is correct? (1) Horsetails are gymnosperms. (2) Selaginella is heterosporous while Salvinia is homosporous. (3) Ovules are not enclosed by ovary wall in gymnosperms. (4) Stems usually unbranched in both Cycas and Cedrus.',
    options: { A: { text: 'Horsetails are gymnosperms' }, B: { text: 'Selaginella is heterosporous, while Salvinia is homosporous' }, C: { text: 'Ovules are not enclosed by ovary wall in gymnosperms' }, D: { text: 'Stems are usually unbranched in both Cycas and Cedrus' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Structural Organisation in Animals and Plants',
    topic: 'Gymnosperms - naked seeds', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q130' }
  },
  {
    questionText: 'Which of the following correctly represents the lung conditions in asthma and emphysema, respectively?',
    options: { A: { text: 'Increased respiratory surface; Inflammation of bronchioles' }, B: { text: 'Increased number of bronchioles; Increased respiratory surface' }, C: { text: 'Inflammation of bronchioles; Decreased respiratory surface' }, D: { text: 'Decreased respiratory surface; Inflammation of bronchioles' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Respiratory disorders - asthma and emphysema', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q136' }
  },
  {
    questionText: 'Which of the following is an amino acid derived hormone?',
    options: { A: { text: 'Estradiol' }, B: { text: 'Ecdysone' }, C: { text: 'Epinephrine' }, D: { text: 'Estriol' } },
    correctAnswer: 'C', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Classification of hormones by chemical nature', difficulty: 'easy',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q140' }
  },
  {
    questionText: 'Nissl bodies are mainly composed of:',
    options: { A: { text: 'Nucleic acids and SER' }, B: { text: 'DNA and RNA' }, C: { text: 'Proteins and lipids' }, D: { text: 'Free ribosomes and RER' } },
    correctAnswer: 'D', subject: 'biology', chapter: 'Human Physiology',
    topic: 'Neuron structure - Nissl bodies', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q169' }
  },
  {
    questionText: 'Which of the following characteristics represent Inheritance of blood groups in humans? a.Dominance b.Co-dominance c.Multiple allele d.Incomplete dominance e.Polygenic inheritance',
    options: { A: { text: 'b, d and e' }, B: { text: 'a, b and c' }, C: { text: 'b, c and e' }, D: { text: 'a, c and e' } },
    correctAnswer: 'B', subject: 'biology', chapter: 'Genetics',
    topic: 'ABO blood group inheritance - co-dominance and multiple alleles', difficulty: 'medium',
    source: 'pyq', sourceDetails: { year: 2018, examType: 'neet' }, pyq: { isPYQ: true, reference: 'NEET 2018 Q180' }
  },
];
[
  {
    "questionText": "Match the following columns and select the correct option.\nColumn-I\n(A) 6-15 pairs of gill slits\n(B) Heterocercal caudal fin\n(C) Air Bladder\n(D) Poison sting\nColumn-II\n(i) Trygon\n(ii) Cyclostomes\n(iii) Chondrichthyes\n(iv) Osteichthyes",
    "options": {
      "A": { "text": "(A)-(iii), (B)-(iv), (C)-(ii), (D)-(i)" },
      "B": { "text": "(A)-(iv), (B)-(i), (C)-(iii), (D)-(ii)" },
      "C": { "text": "(A)-(ii), (B)-(iii), (C)-(iv), (D)-(i)" },
      "D": { "text": "(A)-(i), (B)-(iii), (C)-(iv), (D)-(ii)" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Cyclostomata, Chondrichythes, Osteichythes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Which of the following statements are true for the phylum-Chordata?\n(i) In Urochordata notochord extends from head to tail and it is present throughout their life.\n(ii) In Vertebrata notochord is present during the embryonic period only.\n(iii) Central nervous system is dorsal and hollow.\n(iv) Chordata is divided into 3 subphyla: Hemichordata, Tunicata and Cephalochordata.",
    "options": {
      "A": { "text": "(iii) and (i)" },
      "B": { "text": "(i) and (ii)" },
      "C": { "text": "(ii) and (iii)" },
      "D": { "text": "(i) and (iii)" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Match the following genera with their respective phylum:\nColumn-I\n(A) Ophiura\n(B) Physalia\n(C) Pinctada\n(D) Planaria\nColumn-II\n(i) Mollusca\n(ii) Platyhelminthes\n(iii) Echinodermata\n(iv) Coelenterata",
    "options": {
      "A": { "text": "(A)-(iii), (B)-(iv), (C)-(i), (D)-(ii)" },
      "B": { "text": "(A)-(iv), (B)-(ii), (C)-(iii), (D)-(i)" },
      "C": { "text": "(A)-(i), (B)-(iv), (C)-(iii), (D)-(ii)" },
      "D": { "text": "(A)-(ii), (B)-(iii), (C)-(iv), (D)-(i)" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Porifera, Coelenterata, Ctenophora, Platyhelminthes, Aschelminthes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2019, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET Odisha 2019" }
  },
  {
    "questionText": "Match the following organisms with their respective characteristics:\nColumn-I\n(A) Pila\n(B) Bombyx\n(C) Pleurobrachia\n(D) Taenia\nColumn-II\n(i) Flame cells\n(ii) Comb plates\n(iii) Radula\n(iv) Malpighian tubules",
    "options": {
      "A": { "text": "(A)-(iii), (B)-(ii), (C)-(i), (D)-(iv)" },
      "B": { "text": "(A)-(iii), (B)-(iv), (C)-(ii), (D)-(i)" },
      "C": { "text": "(A)-(ii), (B)-(i), (C)-(iii), (D)-(iv)" },
      "D": { "text": "(A)-(i), (B)-(iii), (C)-(ii), (D)-(iv)" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Porifera, Coelenterata, Ctenophora, Platyhelminthes, Aschelminthes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2019, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2019" }
  },
  {
    "questionText": "Which of the following animals does not undergo metamorphosis?",
    "options": {
      "A": { "text": "Earthworm" },
      "B": { "text": "Tunicate" },
      "C": { "text": "Starfish" },
      "D": { "text": "Moth" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "An important characteristic that Hemichordates share with Chordates is:",
    "options": {
      "A": { "text": "Ventral tubular nerve cord" },
      "B": { "text": "Pharynx with gill slits" },
      "C": { "text": "Pharynx without gill slits" },
      "D": { "text": "Absence of notochord" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Which of the following features is not present in the Phylum Arthropoda?",
    "options": {
      "A": { "text": "Chitinous exoskeleton" },
      "B": { "text": "Metameric segmentation" },
      "C": { "text": "Parapodia" },
      "D": { "text": "Jointed appendages" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Which group of animals belong to the same phylum?",
    "options": {
      "A": { "text": "Earthworm, Pinworm, Tapeworm" },
      "B": { "text": "Prawn, Scorpion, Locusta" },
      "C": { "text": "Sponge, Sea anemone, Starfish" },
      "D": { "text": "Malarial parasite, Amoeba, Mosquito" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "One of the representatives of phylum Arthropoda is:",
    "options": {
      "A": { "text": "Silverfish" },
      "B": { "text": "Pufferfish" },
      "C": { "text": "Flying fish" },
      "D": { "text": "Cuttlefish" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Which one of the following is NOT a characteristic of phylum Annelida?",
    "options": {
      "A": { "text": "Closed circulatory system" },
      "B": { "text": "Segmentation" },
      "C": { "text": "Pseudocoelom" },
      "D": { "text": "Ventral nerve cord" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2008, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2008" }
  },
  {
    "questionText": "Which one of the following phyla is correctly matched with its two general characteristics?",
    "options": {
      "A": { "text": "Arthropoda - Body divided into head, thorax and abdomen and respiration by tracheae" },
      "B": { "text": "Chordata - Notochord at some stage and separate anal and urinary openings to the outside" },
      "C": { "text": "Echinodermata - Pentamerous radial symmetry and mostly internal fertilization" },
      "D": { "text": "Mollusca - Normally oviparous and development through a trochophore or veliger larva" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Animal Kingdom",
    "topic": "Annelida, Arthropoda, Mollusca, Echinodermata, Hemichordata, Chordata",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2008, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2008" }
  },
  {
    "questionText": "Which one of the following pairs is of unicellular algae?",
    "options": {
      "A": { "text": "Gelidium and Gracilaria" },
      "B": { "text": "Anabaena and Volvox" },
      "C": { "text": "Chlorella and Spirulina" },
      "D": { "text": "Laminaria and Sargassum" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Floridean starch has structure similar to",
    "options": {
      "A": { "text": "Amylopectin and glycogen" },
      "B": { "text": "Mannitol and algin" },
      "C": { "text": "Laminarin and cellulose" },
      "D": { "text": "Starch and cellulose" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Which one is wrongly matched?",
    "options": {
      "A": { "text": "Uniflagellate gametes - Polysiphonia" },
      "B": { "text": "Biflagellate zoospores - Brown algae" },
      "C": { "text": "Unicellular organism - Chlorella" },
      "D": { "text": "Gemma cups - Marchantia" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "After karyogamy followed by meiosis, spores are produced exogenously in",
    "options": {
      "A": { "text": "Neurospora" },
      "B": { "text": "Alternaria" },
      "C": { "text": "Saccharomyces" },
      "D": { "text": "Agaricus" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "An example of colonial alga is:",
    "options": {
      "A": { "text": "Volvox" },
      "B": { "text": "Ulothrix" },
      "C": { "text": "Spirogyra" },
      "D": { "text": "Chlorella" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Male gametes are flagellated in:",
    "options": {
      "A": { "text": "Anabaena" },
      "B": { "text": "Ectocarpus" },
      "C": { "text": "Spirogyra" },
      "D": { "text": "Polysiphonia" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Which one of the following statements is wrong?",
    "options": {
      "A": { "text": "Agar-agar is obtained from Gelidium and Gracilaria" },
      "B": { "text": "Chlorella and Spirulina are used as space food" },
      "C": { "text": "Mannitol is stored food in Rhodophyceae" },
      "D": { "text": "Algin and carragen are products of algae" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Which one of the following shows isogamy with non-flagellated gametes?",
    "options": {
      "A": { "text": "Sargassum" },
      "B": { "text": "Ectocarpus" },
      "C": { "text": "Ulothrix" },
      "D": { "text": "Spirogyra" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Which one of the following is wrong about Chara?",
    "options": {
      "A": { "text": "Upper oogonium and lower round antheridium." },
      "B": { "text": "Globule and nucule present on the same plant." },
      "C": { "text": "Upper antheridium and lower oogonium." },
      "D": { "text": "Globule is male reproductive structure." }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "An alga which can be employed as food for human being is:",
    "options": {
      "A": { "text": "Ulothrix" },
      "B": { "text": "Chlorella" },
      "C": { "text": "Spirogyra" },
      "D": { "text": "Polysiphonia" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Isogamous condition with non-flagellated gametes is found in:",
    "options": {
      "A": { "text": "Spirogyra" },
      "B": { "text": "Volvox" },
      "C": { "text": "Fucus" },
      "D": { "text": "Chlamydomonas" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Which of the following is not correctly matched for the organism and its cell wall degrading enzyme?",
    "options": {
      "A": { "text": "Plant cells-Cellulase" },
      "B": { "text": "Algae-Methylase" },
      "C": { "text": "Fungi-Chitinase" },
      "D": { "text": "Bacteria-Lysozyme" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Which one of the following is wrongly matched?",
    "options": {
      "A": { "text": "Nostoc-Water blooms" },
      "B": { "text": "Spirogyra-Motile gametes" },
      "C": { "text": "Sargassum-Chlorophyll c" },
      "D": { "text": "Basidiomycetes-Puffballs" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Algae have cell wall made up of:",
    "options": {
      "A": { "text": "cellulose, galactans and mannans" },
      "B": { "text": "hemicellulose, pectins and proteins" },
      "C": { "text": "pectins, cellulose and proteins" },
      "D": { "text": "cellulose, hemicellulose and pectins" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  }
]

Here is the next batch of extracted questions, picking up exactly where we left off in **Chapter 3: Plant Kingdom (Algae and Bryophytes)**. I have skipped one question from this section (Q40) because it relied entirely on a visual diagram, which cannot be adequately extracted into text options.

Whenever you are ready to continue, simply reply **"next"**!

```json
[
  {
    "questionText": "Mannitol is the stored food in:",
    "options": {
      "A": { "text": "Porphyra" },
      "B": { "text": "Fucus" },
      "C": { "text": "Gracillaria" },
      "D": { "text": "Chara" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "If you are asked to classify the various algae into distinct groups, which of the following characters you should choose?",
    "options": {
      "A": { "text": "nature of stored food materials in the cell" },
      "B": { "text": "structural organization of thallus" },
      "C": { "text": "chemical composition of the cell wall" },
      "D": { "text": "types of pigments present in the cell." }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2007, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2007" }
  },
  {
    "questionText": "Floridean starch is found in",
    "options": {
      "A": { "text": "Chlorophyceae" },
      "B": { "text": "Rhodophyceae" },
      "C": { "text": "Myxophyceae" },
      "D": { "text": "Cyanophyceae" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2000, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2000" }
  },
  {
    "questionText": "A research student collected certain algae both as and found that its cells contained both chlorophyll a and chlorophyll b as well as phycoerythrin. The alga belongs to",
    "options": {
      "A": { "text": "Rhodophyceae" },
      "B": { "text": "Bacillariophyceae" },
      "C": { "text": "Chlorophyceae" },
      "D": { "text": "Phaeophyceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2000, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2000" }
  },
  {
    "questionText": "Columella is a specialised structure found in the sporangium of",
    "options": {
      "A": { "text": "Ulothrix" },
      "B": { "text": "Rhizopus" },
      "C": { "text": "Spirogyra" },
      "D": { "text": "None of these" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1999, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1999" }
  },
  {
    "questionText": "Ulothrix can be described as a",
    "options": {
      "A": { "text": "non-motile colonial alga lacking zoospores" },
      "B": { "text": "filamentous alga lacking flagellated reproductive stages" },
      "C": { "text": "membranous alga producing zoospores" },
      "D": { "text": "filamentous alga with flagellated reproductive stages" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1998, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1998" }
  },
  {
    "questionText": "An alga very rich in protein is",
    "options": {
      "A": { "text": "Spirogyra" },
      "B": { "text": "Ulothrix" },
      "C": { "text": "Oscillatoria" },
      "D": { "text": "Chlorella" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1997, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1997" }
  },
  {
    "questionText": "Ulothrix filaments produce",
    "options": {
      "A": { "text": "isogametes" },
      "B": { "text": "anisogametes" },
      "C": { "text": "heterogametes" },
      "D": { "text": "basidiospores" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1997, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1997" }
  },
  {
    "questionText": "Brown algae is characterised by the presence of",
    "options": {
      "A": { "text": "phycocyanin" },
      "B": { "text": "phycoerythrin" },
      "C": { "text": "fucoxanthin" },
      "D": { "text": "haematochrome" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1997, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1997" }
  },
  {
    "questionText": "Blue-green algae belong to",
    "options": {
      "A": { "text": "Eukaryotes" },
      "B": { "text": "Prokaryotes" },
      "C": { "text": "Rhodophyceae" },
      "D": { "text": "Chlorophyceae" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1996, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1996" }
  },
  {
    "questionText": "The absence of chlorophyll, in the lowermost cell of Ulothrix, shows",
    "options": {
      "A": { "text": "functional fission" },
      "B": { "text": "tissue formation" },
      "C": { "text": "cell characteristic" },
      "D": { "text": "beginning of labour division" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1995, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1995" }
  },
  {
    "questionText": "Agar is commercially obtained from",
    "options": {
      "A": { "text": "red algae" },
      "B": { "text": "green algae" },
      "C": { "text": "brown algae" },
      "D": { "text": "blue-green algae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1995, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1995" }
  },
  {
    "questionText": "In Chlorophyceae, sexual reproduction occurs by",
    "options": {
      "A": { "text": "Isogamy and anisogamy" },
      "B": { "text": "Isogamy, anisogamy and oogamy" },
      "C": { "text": "Oogamy only" },
      "D": { "text": "Anisogamy and oogamy" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1994, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1994" }
  },
  {
    "questionText": "Which of the following cannot fix nitrogen?",
    "options": {
      "A": { "text": "Nostoc" },
      "B": { "text": "Azotobacter" },
      "C": { "text": "Spirogyra" },
      "D": { "text": "Anabaena" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1994, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1994" }
  },
  {
    "questionText": "In Ulothrix/Spirogyra, reduction division (meiosis) occurs at the time of",
    "options": {
      "A": { "text": "gamete formation" },
      "B": { "text": "zoospore formation" },
      "C": { "text": "zygospore germination" },
      "D": { "text": "vegetative reproduction" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1993, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1993" }
  },
  {
    "questionText": "Chloroplast of Chlamydomonas is",
    "options": {
      "A": { "text": "stellate" },
      "B": { "text": "cup-shaped" },
      "C": { "text": "collar-shaped" },
      "D": { "text": "spiral" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1993, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1993" }
  },
  {
    "questionText": "Pyrenoids are the centres for formation of",
    "options": {
      "A": { "text": "porphyra" },
      "B": { "text": "enzymes" },
      "C": { "text": "fat" },
      "D": { "text": "starch" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1993, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1993" }
  },
  {
    "questionText": "The product of conjugation in Spirogyra or fertilization of Chlamydomonas is",
    "options": {
      "A": { "text": "zygospore" },
      "B": { "text": "zoospore" },
      "C": { "text": "oospore" },
      "D": { "text": "carpospore" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1991, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1991" }
  },
  {
    "questionText": "The common mode of sexual reproduction in Chlamydomonas is",
    "options": {
      "A": { "text": "isogamous" },
      "B": { "text": "anisogamous" },
      "C": { "text": "oogamous" },
      "D": { "text": "hologamous" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1991, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1991" }
  },
  {
    "questionText": "Sexual reproduction involving fusion of two cells in Chlamydomonas is",
    "options": {
      "A": { "text": "isogamy" },
      "B": { "text": "homogamy" },
      "C": { "text": "somatogamy" },
      "D": { "text": "hologamy" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1988, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1988" }
  },
  {
    "questionText": "Zygotic meiosis is characteristic of:",
    "options": {
      "A": { "text": "Fucus" },
      "B": { "text": "Funaria" },
      "C": { "text": "Chlamydomonas" },
      "D": { "text": "Marchantia" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Life cycle of Ectocarpus and Fucus respectively are:",
    "options": {
      "A": { "text": "Diplontic, Haplodiplontic" },
      "B": { "text": "Haplodiplontic, Diplontic" },
      "C": { "text": "Haplodiplontic, Haplontic" },
      "D": { "text": "Haplontic, Diplontic" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Which one is wrong statement?",
    "options": {
      "A": { "text": "Mucor has biflagellate zoospores" },
      "B": { "text": "Haploid endosperm is typical feature of gymnosperms" },
      "C": { "text": "Brown algae have chlorophyll a and c and fucoxanthin" },
      "D": { "text": "Archegonia are found in Bryophyta, Pteridophyta and Gymnosperms." }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Which of the following is responsible for peat formation?",
    "options": {
      "A": { "text": "Marchantia" },
      "B": { "text": "Riccia" },
      "C": { "text": "Funaria" },
      "D": { "text": "Sphagnum" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Which one of the following is common to multicellular fungi, filamentous algae and protonema of mosses",
    "options": {
      "A": { "text": "Diplontic life cycle" },
      "B": { "text": "Members of kingdom plantae" },
      "C": { "text": "Mode of Nutrition" },
      "D": { "text": "Multiplication by fragmentation" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Archegoniophore is present in:",
    "options": {
      "A": { "text": "Marchantia" },
      "B": { "text": "Chara" },
      "C": { "text": "Adiantum" },
      "D": { "text": "Funaria" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2011, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2011" }
  },
  {
    "questionText": "Some hyperthermophilic organisms that grow in highly acidic habitats belong to the two groups:",
    "options": {
      "A": { "text": "Eubacteria and archaea" },
      "B": { "text": "Cyanobacteria and diatoms" },
      "C": { "text": "Protists and mosses" },
      "D": { "text": "Liverworts and yeasts" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  },
  {
    "questionText": "Spore dissemination in some liverworts is aided by",
    "options": {
      "A": { "text": "indusium" },
      "B": { "text": "calyptra" },
      "C": { "text": "peristome teeth" },
      "D": { "text": "elaters" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2007, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2007" }
  }
]

```[
  {
    "questionText": "In a moss the sporophyte",
    "options": {
      "A": { "text": "produces gametes that give rise to the gametophyte" },
      "B": { "text": "arises from a spore produced from the gametophyte" },
      "C": { "text": "manufactures food for itself as well as for the gametophyte" },
      "D": { "text": "is partially parasitic on the gametophyte" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2006, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2006" }
  },
  {
    "questionText": "Peat Moss is used as a packing material for sending flowers and live plants to distant places because",
    "options": {
      "A": { "text": "it is hygroscopic" },
      "B": { "text": "it reduces transpiration" },
      "C": { "text": "it serves as a disinfectant" },
      "D": { "text": "it is easily available" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2006, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2006" }
  },
  {
    "questionText": "Which of the following propagates through leaf-tip?",
    "options": {
      "A": { "text": "Walking fern" },
      "B": { "text": "Sproux-leaf plant" },
      "C": { "text": "Marchantia" },
      "D": { "text": "Moss" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2004, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2004" }
  },
  {
    "questionText": "Sexual reproduction in Spirogyra is an advanced feature because it shows",
    "options": {
      "A": { "text": "physiologically differentiated sex organs" },
      "B": { "text": "different sizes of motile sex organs" },
      "C": { "text": "same size of motile sex organs" },
      "D": { "text": "morphologically different sex organs" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Algae",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2003, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2003" }
  },
  {
    "questionText": "The antherozoids of Funaria are",
    "options": {
      "A": { "text": "aciliated" },
      "B": { "text": "flagellated" },
      "C": { "text": "multiciliated" },
      "D": { "text": "monociliated" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1999, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1999" }
  },
  {
    "questionText": "Bryophytes comprise",
    "options": {
      "A": { "text": "sporophyte of longer duration" },
      "B": { "text": "dominant phase of sporophyte which is parasitic" },
      "C": { "text": "dominant phase of gametophyte which produces spores" },
      "D": { "text": "small sporophyte phase and generally parasitic on gametophyte" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1999, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1999" }
  },
  {
    "questionText": "Which of the following is true about bryophytes?",
    "options": {
      "A": { "text": "They possess archegonia" },
      "B": { "text": "They contain chloroplast" },
      "C": { "text": "They are thalloid" },
      "D": { "text": "All of these" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1999, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1999" }
  },
  {
    "questionText": "Bryophytes are dependent on water because",
    "options": {
      "A": { "text": "water is essential for fertilization for their homosporous nature" },
      "B": { "text": "water is essential for their vegetative propagation" },
      "C": { "text": "the sperms can easily reach upto egg in the archegonium" },
      "D": { "text": "archegonium has to remain filled with water for fertilization" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1998, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1998" }
  },
  {
    "questionText": "Bryophytes can be separated from algae because they",
    "options": {
      "A": { "text": "are thalloid forms" },
      "B": { "text": "have no conducting tissue" },
      "C": { "text": "possess archegonia with outer layer of sterile cells" },
      "D": { "text": "contain chloroplasts in their cells" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1997, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1997" }
  },
  {
    "questionText": "In which one of these the elaters are present along with mature spores in the capsule (to help in spore dispersal)?",
    "options": {
      "A": { "text": "Riccia" },
      "B": { "text": "Marchantia" },
      "C": { "text": "Funaria" },
      "D": { "text": "Sphagnum" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1996, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1996" }
  },
  {
    "questionText": "The plant body of moss (Funaria) is",
    "options": {
      "A": { "text": "completely sporophyte" },
      "B": { "text": "completely gametophyte" },
      "C": { "text": "predominantly sporophyte with gametophyte" },
      "D": { "text": "predominantly gametophyte with sporophyte" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1995, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1995" }
  },
  {
    "questionText": "Unique features of Bryophytes is that they",
    "options": {
      "A": { "text": "produce spores" },
      "B": { "text": "have sporophyte attached to gametophyte" },
      "C": { "text": "lack roots" },
      "D": { "text": "lack vascular tissues" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1994, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1994" }
  },
  {
    "questionText": "Protonema occurs in the life cycle of",
    "options": {
      "A": { "text": "Riccia" },
      "B": { "text": "Funaria" },
      "C": { "text": "Somatogamy" },
      "D": { "text": "Spirogyra" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1993, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1993" }
  },
  {
    "questionText": "Bryophytes are amphibians because",
    "options": {
      "A": { "text": "they require a layer of water for carrying out sexual reproduction" },
      "B": { "text": "they occur in damp places" },
      "C": { "text": "they are mostly aquatic" },
      "D": { "text": "all the above" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1991, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1991" }
  },
  {
    "questionText": "Apophysis in the capsule of Funaria is",
    "options": {
      "A": { "text": "lower part" },
      "B": { "text": "upper part" },
      "C": { "text": "middle part" },
      "D": { "text": "fertile part" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1990, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1990" }
  },
  {
    "questionText": "Moss peristome takes part in",
    "options": {
      "A": { "text": "spore dispersal" },
      "B": { "text": "photosynthesis" },
      "C": { "text": "protection" },
      "D": { "text": "absorption" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1990, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1990" }
  },
  {
    "questionText": "Sperms of both Funaria and Pteris were released together near the archegonia of Pteris. Only its sperms enter the archegonia as",
    "options": {
      "A": { "text": "Pteris archegonia repel Funaria sperms" },
      "B": { "text": "Funaria sperms get killed by Pteris sperms" },
      "C": { "text": "Funaria sperms are less mobile" },
      "D": { "text": "Pteris archegonia release chemical to attract its sperms" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1989, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1989" }
  },
  {
    "questionText": "In bryophytes and pteridophytes, transport of male gametes requires",
    "options": {
      "A": { "text": "Wind" },
      "B": { "text": "Insects" },
      "C": { "text": "Birds" },
      "D": { "text": "Water" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "The plant body is thalloid in",
    "options": {
      "A": { "text": "Funaria" },
      "B": { "text": "Sphagnum" },
      "C": { "text": "Salvinia" },
      "D": { "text": "Marchantia" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Selaginella and Salvinia are considered to represent a significant step towards evolution of seed habit because:",
    "options": {
      "A": { "text": "female gametophyte is free and gets dispersed like seeds" },
      "B": { "text": "female gametophyte lacks archaegonia" },
      "C": { "text": "megaspores possess endosperm and embryo surrounded by seed coat" },
      "D": { "text": "embryo develops in female gametophyte which is retained on parent sporophyte." }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2011, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2011" }
  },
  {
    "questionText": "In which one of the following, male and female gametophytes do not have free living independent existence?",
    "options": {
      "A": { "text": "Pteris" },
      "B": { "text": "Funaria" },
      "C": { "text": "Polytrichum" },
      "D": { "text": "Cedrus" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2008, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2008" }
  },
  {
    "questionText": "Which one of the following is heterosporous?",
    "options": {
      "A": { "text": "Dryopteris" },
      "B": { "text": "Salvinia" },
      "C": { "text": "Adiantum" },
      "D": { "text": "Equisetum" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2008, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2008" }
  },
  {
    "questionText": "In the prothallus of a vascular cryptogam, the antherozoids and eggs mature a different times. As a result",
    "options": {
      "A": { "text": "there is high degree of sterility" },
      "B": { "text": "one can conclude that the plant is apomictic" },
      "C": { "text": "self-fertilization is prevented" },
      "D": { "text": "there is no change in success rate of fertilization" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2007, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2007" }
  },
  {
    "questionText": "In Ferns meiosis occurs when",
    "options": {
      "A": { "text": "spore germinates" },
      "B": { "text": "gametes are formed" },
      "C": { "text": "spores are formed" },
      "D": { "text": "antheridia and archegonia are formed" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2000, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2000" }
  },
  {
    "questionText": "Dichotomous branching is found in",
    "options": {
      "A": { "text": "Fern" },
      "B": { "text": "Funaria" },
      "C": { "text": "Liverworts" },
      "D": { "text": "Marchantia" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Bryophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1999, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1999" }
  }
]

[
  {
    "questionText": "Which of the following statements is correct?",
    "options": {
      "A": { "text": "Horsetails are gymnosperms." },
      "B": { "text": "Selaginella is heterosporous, while Salvinia is homosporous." },
      "C": { "text": "Ovules are not enclosed by ovary wall in gymnosperms." },
      "D": { "text": "Stems are usually unbranched in both Cycas and Cedrus." }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Select the mismatch:",
    "options": {
      "A": { "text": "Cycas - Dioecious" },
      "B": { "text": "Salvinia - Heterosporous" },
      "C": { "text": "Equisetum - Homosporous" },
      "D": { "text": "Pinus - Dioecious" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Conifers are adapted to tolerate extreme environmental conditions because of:",
    "options": {
      "A": { "text": "broad hardy leaves" },
      "B": { "text": "superficial stomata" },
      "C": { "text": "thick cuticle" },
      "D": { "text": "presence of vessels" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Read the following five statements (A-E) and answer as asked next to them. (A) In Equisetum, the female gametophyte is retained on the parent sporophyte. (B) In Ginkgo, male gametophyte is not independent. (C) The sporophyte in Riccia is more developed than that in Polytrichum. (D) Sexual reproduction in Volvox is isogamous. (E) The spores of slime moulds lack cell walls. How many of the above statements are correct?",
    "options": {
      "A": { "text": "Two" },
      "B": { "text": "Three" },
      "C": { "text": "Four" },
      "D": { "text": "One" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "hard",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Cycas and Adiantum resemble each other in having:",
    "options": {
      "A": { "text": "Seeds" },
      "B": { "text": "Motile Sperms" },
      "C": { "text": "Cambium" },
      "D": { "text": "Vessels" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Gymnosperms are also called soft wood spermatophytes because they lack:",
    "options": {
      "A": { "text": "Cambium" },
      "B": { "text": "Phloem fibres" },
      "C": { "text": "Thick-walled tracheids" },
      "D": { "text": "Xylem fibres" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Which one of the following is a vascular cryptogam?",
    "options": {
      "A": { "text": "Ginkgo" },
      "B": { "text": "Marchantia" },
      "C": { "text": "Cedrus" },
      "D": { "text": "Equisetum" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "Which one of the following plants is monoecious?",
    "options": {
      "A": { "text": "Pinus" },
      "B": { "text": "Cycas" },
      "C": { "text": "Papaya" },
      "D": { "text": "Marchantia" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "Flagellated male gametes are present in all the three of which one of the following sets?",
    "options": {
      "A": { "text": "Zygnema, Saprolegnia and Hydrilla" },
      "B": { "text": "Fucus, Marsilea and Calotropis" },
      "C": { "text": "Riccia, Dryopteris and Cycas" },
      "D": { "text": "Anthoceros, Funaria and Spirogyra" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "hard",
    "source": "pyq",
    "sourceDetails": { "year": 2007, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2007" }
  },
  {
    "questionText": "In gymnosperms, the pollen chamber represents:",
    "options": {
      "A": { "text": "a cavity in the ovule in which pollen grains are stored after pollination" },
      "B": { "text": "an opening in the megagametophyte through which the pollen tube approaches the egg" },
      "C": { "text": "the microsporangium in which pollen grains develop" },
      "D": { "text": "a cell in the pollen grain in which the sperms are formed" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2007, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2007" }
  },
  {
    "questionText": "Double fertilization is exhibited by:",
    "options": {
      "A": { "text": "Algae" },
      "B": { "text": "Fungi" },
      "C": { "text": "Angiosperms" },
      "D": { "text": "Gymnosperms" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Male gametophyte in angiosperms produces:",
    "options": {
      "A": { "text": "Single sperm and a vegetative cell" },
      "B": { "text": "Single sperm and two vegetative cells" },
      "C": { "text": "Three sperms" },
      "D": { "text": "Two sperms and a vegetative cell" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "In angiosperms, microsporogenesis and megasporogenesis:",
    "options": {
      "A": { "text": "involve meiosis" },
      "B": { "text": "occur in ovule" },
      "C": { "text": "occur in anther" },
      "D": { "text": "form gametes without further divisions" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Male and female gametophytes do not have an independent free-living existence in:",
    "options": {
      "A": { "text": "Pteridophytes" },
      "B": { "text": "Algae" },
      "C": { "text": "Angiosperms" },
      "D": { "text": "Bryophytes" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Strobili cones are found in:",
    "options": {
      "A": { "text": "Salvinia" },
      "B": { "text": "Pteris" },
      "C": { "text": "Marchantia" },
      "D": { "text": "Equisetum" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Roots play insignificant role in absorption of water in:",
    "options": {
      "A": { "text": "Pea" },
      "B": { "text": "Wheat" },
      "C": { "text": "Sunflower" },
      "D": { "text": "Pistia" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Root",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Pneumatophores are found in:",
    "options": {
      "A": { "text": "The vegetation which is found in marshy and saline lake" },
      "B": { "text": "The vegetation which found in acidic soil" },
      "C": { "text": "Xerophytes" },
      "D": { "text": "Epiphytes" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Root",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Sweet potato is a modified:",
    "options": {
      "A": { "text": "Stem" },
      "B": { "text": "Adventitious root" },
      "C": { "text": "Tap root" },
      "D": { "text": "Rhizome" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Root",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Stems modified into flat green organs performing the functions of leaves are known as:",
    "options": {
      "A": { "text": "Phylloclades" },
      "B": { "text": "Scales" },
      "C": { "text": "Cladodes" },
      "D": { "text": "Phyllodes" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Stem",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Leaves become modified into spines in:",
    "options": {
      "A": { "text": "Onion" },
      "B": { "text": "Silk Cotton" },
      "C": { "text": "Opuntia" },
      "D": { "text": "Pea" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Leaf",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Keel is the characteristic feature of flower of:",
    "options": {
      "A": { "text": "Aloe" },
      "B": { "text": "Tomato" },
      "C": { "text": "Tulip" },
      "D": { "text": "Indigofera" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Aestivation)",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Perigynous flowers are found in:",
    "options": {
      "A": { "text": "China rose" },
      "B": { "text": "Rose" },
      "C": { "text": "Guava" },
      "D": { "text": "Cucumber" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Placentation in tomato and lemon is:",
    "options": {
      "A": { "text": "Parietal" },
      "B": { "text": "Free central" },
      "C": { "text": "Marginal" },
      "D": { "text": "Axile" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Placentation)",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Vexillary aestivation is characteristic of the family:",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Asteraceae" },
      "C": { "text": "Solanaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Aestivation)",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Free central placentation is found in:",
    "options": {
      "A": { "text": "Dianthus" },
      "B": { "text": "Argemone" },
      "C": { "text": "Brassica" },
      "D": { "text": "Citrus" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Placentation)",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  }
]
[
  {
    "questionText": "Which of the following statements is correct?",
    "options": {
      "A": { "text": "Horsetails are gymnosperms." },
      "B": { "text": "Selaginella is heterosporous, while Salvinia is homosporous." },
      "C": { "text": "Ovules are not enclosed by ovary wall in gymnosperms." },
      "D": { "text": "Stems are usually unbranched in both Cycas and Cedrus." }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Select the mismatch:",
    "options": {
      "A": { "text": "Cycas - Dioecious" },
      "B": { "text": "Salvinia - Heterosporous" },
      "C": { "text": "Equisetum - Homosporous" },
      "D": { "text": "Pinus - Dioecious" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Conifers are adapted to tolerate extreme environmental conditions because of:",
    "options": {
      "A": { "text": "broad hardy leaves" },
      "B": { "text": "superficial stomata" },
      "C": { "text": "thick cuticle" },
      "D": { "text": "presence of vessels" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Read the following five statements (A-E) and answer as asked next to them. (A) In Equisetum, the female gametophyte is retained on the parent sporophyte. (B) In Ginkgo, male gametophyte is not independent. (C) The sporophyte in Riccia is more developed than that in Polytrichum. (D) Sexual reproduction in Volvox is isogamous. (E) The spores of slime moulds lack cell walls. How many of the above statements are correct?",
    "options": {
      "A": { "text": "Two" },
      "B": { "text": "Three" },
      "C": { "text": "Four" },
      "D": { "text": "One" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "hard",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Cycas and Adiantum resemble each other in having:",
    "options": {
      "A": { "text": "Seeds" },
      "B": { "text": "Motile Sperms" },
      "C": { "text": "Cambium" },
      "D": { "text": "Vessels" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Gymnosperms are also called soft wood spermatophytes because they lack:",
    "options": {
      "A": { "text": "Cambium" },
      "B": { "text": "Phloem fibres" },
      "C": { "text": "Thick-walled tracheids" },
      "D": { "text": "Xylem fibres" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Which one of the following is a vascular cryptogam?",
    "options": {
      "A": { "text": "Ginkgo" },
      "B": { "text": "Marchantia" },
      "C": { "text": "Cedrus" },
      "D": { "text": "Equisetum" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "Which one of the following plants is monoecious?",
    "options": {
      "A": { "text": "Pinus" },
      "B": { "text": "Cycas" },
      "C": { "text": "Papaya" },
      "D": { "text": "Marchantia" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "Flagellated male gametes are present in all the three of which one of the following sets?",
    "options": {
      "A": { "text": "Zygnema, Saprolegnia and Hydrilla" },
      "B": { "text": "Fucus, Marsilea and Calotropis" },
      "C": { "text": "Riccia, Dryopteris and Cycas" },
      "D": { "text": "Anthoceros, Funaria and Spirogyra" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "hard",
    "source": "pyq",
    "sourceDetails": { "year": 2007, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2007" }
  },
  {
    "questionText": "In gymnosperms, the pollen chamber represents:",
    "options": {
      "A": { "text": "a cavity in the ovule in which pollen grains are stored after pollination" },
      "B": { "text": "an opening in the megagametophyte through which the pollen tube approaches the egg" },
      "C": { "text": "the microsporangium in which pollen grains develop" },
      "D": { "text": "a cell in the pollen grain in which the sperms are formed" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Gymnosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2007, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2007" }
  },
  {
    "questionText": "Double fertilization is exhibited by:",
    "options": {
      "A": { "text": "Algae" },
      "B": { "text": "Fungi" },
      "C": { "text": "Angiosperms" },
      "D": { "text": "Gymnosperms" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Male gametophyte in angiosperms produces:",
    "options": {
      "A": { "text": "Single sperm and a vegetative cell" },
      "B": { "text": "Single sperm and two vegetative cells" },
      "C": { "text": "Three sperms" },
      "D": { "text": "Two sperms and a vegetative cell" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "In angiosperms, microsporogenesis and megasporogenesis:",
    "options": {
      "A": { "text": "involve meiosis" },
      "B": { "text": "occur in ovule" },
      "C": { "text": "occur in anther" },
      "D": { "text": "form gametes without further divisions" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Male and female gametophytes do not have an independent free-living existence in:",
    "options": {
      "A": { "text": "Pteridophytes" },
      "B": { "text": "Algae" },
      "C": { "text": "Angiosperms" },
      "D": { "text": "Bryophytes" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Angiosperms",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Strobili cones are found in:",
    "options": {
      "A": { "text": "Salvinia" },
      "B": { "text": "Pteris" },
      "C": { "text": "Marchantia" },
      "D": { "text": "Equisetum" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Plant Kingdom",
    "topic": "Pteridophytes",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Roots play insignificant role in absorption of water in:",
    "options": {
      "A": { "text": "Pea" },
      "B": { "text": "Wheat" },
      "C": { "text": "Sunflower" },
      "D": { "text": "Pistia" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Root",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Pneumatophores are found in:",
    "options": {
      "A": { "text": "The vegetation which is found in marshy and saline lake" },
      "B": { "text": "The vegetation which found in acidic soil" },
      "C": { "text": "Xerophytes" },
      "D": { "text": "Epiphytes" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Root",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Sweet potato is a modified:",
    "options": {
      "A": { "text": "Stem" },
      "B": { "text": "Adventitious root" },
      "C": { "text": "Tap root" },
      "D": { "text": "Rhizome" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Root",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Stems modified into flat green organs performing the functions of leaves are known as:",
    "options": {
      "A": { "text": "Phylloclades" },
      "B": { "text": "Scales" },
      "C": { "text": "Cladodes" },
      "D": { "text": "Phyllodes" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Stem",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Leaves become modified into spines in:",
    "options": {
      "A": { "text": "Onion" },
      "B": { "text": "Silk Cotton" },
      "C": { "text": "Opuntia" },
      "D": { "text": "Pea" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Leaf",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Keel is the characteristic feature of flower of:",
    "options": {
      "A": { "text": "Aloe" },
      "B": { "text": "Tomato" },
      "C": { "text": "Tulip" },
      "D": { "text": "Indigofera" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Aestivation)",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Perigynous flowers are found in:",
    "options": {
      "A": { "text": "China rose" },
      "B": { "text": "Rose" },
      "C": { "text": "Guava" },
      "D": { "text": "Cucumber" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Placentation in tomato and lemon is:",
    "options": {
      "A": { "text": "Parietal" },
      "B": { "text": "Free central" },
      "C": { "text": "Marginal" },
      "D": { "text": "Axile" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Placentation)",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Vexillary aestivation is characteristic of the family:",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Asteraceae" },
      "C": { "text": "Solanaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Aestivation)",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Free central placentation is found in:",
    "options": {
      "A": { "text": "Dianthus" },
      "B": { "text": "Argemone" },
      "C": { "text": "Brassica" },
      "D": { "text": "Citrus" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "The Flower (Placentation)",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  }
]
[
  {
    "questionText": "Geocarpic fruit is produced by:",
    "options": {
      "A": { "text": "Potato" },
      "B": { "text": "Peanut" },
      "C": { "text": "Onion" },
      "D": { "text": "Garlic" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Fruit and Seed",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1994, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1994" }
  },
  {
    "questionText": "The edible part of mango is:",
    "options": {
      "A": { "text": "Endocarp" },
      "B": { "text": "Mesocarp" },
      "C": { "text": "Epicarp" },
      "D": { "text": "Pericarp" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Fruit and Seed",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1989, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1989" }
  },
  {
    "questionText": "In which of the following family, the stamens are attached to petals (epipetalous condition)?",
    "options": {
      "A": { "text": "Solanaceae" },
      "B": { "text": "Fabaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Bicarpellary ovary with oblique septum and swollen placenta is characteristic of family:",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2019, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2019" }
  },
  {
    "questionText": "Tricarpellary, syncarpous gynoecium with superior, trilocular ovary and axile placentation is found in:",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Poaceae" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "The correct floral formula of Chilli is:",
    "options": {
      "A": { "text": "⊕ ⚥ K(5) C(5) A5 G(2)" },
      "B": { "text": "⊕ ⚥ K(5) C(5) A(5) G(2)" },
      "C": { "text": "% ⚥ K(5) C1+2+(2) A(9)+1 G1" },
      "D": { "text": "⊕ ⚥ K5 C5 A5 G(2)" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2011, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2011" }
  },
  {
    "questionText": "Pulses belong to the family:",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Asteraceae" },
      "C": { "text": "Solanaceae" },
      "D": { "text": "Poaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  },
  {
    "questionText": "Vexillary aestivation and diadelphous stamens are the features of family:",
    "options": {
      "A": { "text": "Solanaceae" },
      "B": { "text": "Fabaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Anther is usually dithecous and tetrasporangiate in:",
    "options": {
      "A": { "text": "Solanaceae" },
      "B": { "text": "Malvaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Fabaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Colchicine is an alkaline drug obtained from a member of family:",
    "options": {
      "A": { "text": "Solanaceae" },
      "B": { "text": "Fabaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2011, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2011" }
  },
  {
    "questionText": "Which of the following belongs to family Liliaceae?",
    "options": {
      "A": { "text": "Aloe" },
      "B": { "text": "Tomato" },
      "C": { "text": "Indigofera" },
      "D": { "text": "Chilli" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Perianth is present in the members of:",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Monothecous anther is a characteristic feature of which family?",
    "options": {
      "A": { "text": "Malvaceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Fabaceae" },
      "D": { "text": "Liliaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1993, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1993" }
  },
  {
    "questionText": "Persistent calyx is found in the fruit of:",
    "options": {
      "A": { "text": "Brinjal" },
      "B": { "text": "Banana" },
      "C": { "text": "Mango" },
      "D": { "text": "Apple" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2003, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2003" }
  },
  {
    "questionText": "Tetradynamous stamens condition is found in the family:",
    "options": {
      "A": { "text": "Cruciferae (Brassicaceae)" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Fabaceae" },
      "D": { "text": "Liliaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2001, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2001" }
  },
  {
    "questionText": "Epipetalous and syngenesious stamens occur in:",
    "options": {
      "A": { "text": "Asteraceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Fabaceae" },
      "D": { "text": "Liliaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "hard",
    "source": "pyq",
    "sourceDetails": { "year": 1991, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1991" }
  },
  {
    "questionText": "Caryopsis fruit is characteristic of which family?",
    "options": {
      "A": { "text": "Gramineae (Poaceae)" },
      "B": { "text": "Fabaceae" },
      "C": { "text": "Solanaceae" },
      "D": { "text": "Liliaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 1995, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1995" }
  },
  {
    "questionText": "The family containing matching conditions of standard, wings, and keel petals is:",
    "options": {
      "A": { "text": "Papilionaceae (Fabaceae)" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2004, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2004" }
  },
  {
    "questionText": "Sunn hemp is obtained from which plant family?",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Malvaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "Floral formula ⊕ ⚥ P(3+3) A3+3 G(3) belongs to family:",
    "options": {
      "A": { "text": "Liliaceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Fabaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "Which of the following is a medicine plant of Solanaceae family?",
    "options": {
      "A": { "text": "Atropa belladonna" },
      "B": { "text": "Aloe vera" },
      "C": { "text": "Asparagus" },
      "D": { "text": "Indigofera" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  },
  {
    "questionText": "In the floral formula of Fabaceae, the symbol % indicates:",
    "options": {
      "A": { "text": "Zygomorphic symmetry" },
      "B": { "text": "Actinomorphic symmetry" },
      "C": { "text": "Asymmetric flower" },
      "D": { "text": "Epipetalous condition" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 1994, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 1994" }
  },
  {
    "questionText": "Gynoecium is superior and monocarpellary in family:",
    "options": {
      "A": { "text": "Fabaceae" },
      "B": { "text": "Solanaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Asteraceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2008, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2008" }
  },
  {
    "questionText": "Aestivation of petals in Fabaceae family is described as:",
    "options": {
      "A": { "text": "Vexillary" },
      "B": { "text": "Imbricate" },
      "C": { "text": "Twisted" },
      "D": { "text": "Valvate" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Petunia genus belongs to which of the following families?",
    "options": {
      "A": { "text": "Solanaceae" },
      "B": { "text": "Fabaceae" },
      "C": { "text": "Liliaceae" },
      "D": { "text": "Brassicaceae" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Morphology of Flowering Plants",
    "topic": "Families",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  }
]
[
  {
    "questionText": "The transverse section of a plant shows following anatomical features : (a) Large number of scattered vascular bundles surrounded by bundle sheath. (b) Large conspicuous parenchymatous ground tissue. (c) Vascular bundles conjoint and closed. (d) Phloem parenchyma absent. Identify the category of plant and its part:",
    "options": {
      "A": { "text": "Monocotyledonous stem" },
      "B": { "text": "Monocotyledonous root" },
      "C": { "text": "Dicotyledonous stem" },
      "D": { "text": "Dicotyledonous root" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Grass leaves curl inwards during very dry weather. Select the most appropriate reason from the following:",
    "options": {
      "A": { "text": "Flaccidity of bulliform cells" },
      "B": { "text": "Shrinkage of air spaces in spongy mesophyll" },
      "C": { "text": "Tyloses in vessels" },
      "D": { "text": "Closure of stomata" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2019, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2019" }
  },
  {
    "questionText": "Phloem in gymnosperms lacks:",
    "options": {
      "A": { "text": "Albuminous cells and sieve cells" },
      "B": { "text": "Sieve tubes and companion cells" },
      "C": { "text": "Albuminous cells and companion cells" },
      "D": { "text": "Sieve cells and companion cells" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2019, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2019" }
  },
  {
    "questionText": "Casparian strips occur in:",
    "options": {
      "A": { "text": "Epidermis" },
      "B": { "text": "Pericycle" },
      "C": { "text": "Cortex" },
      "D": { "text": "Endodermis" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Plants having little or no secondary growth are:",
    "options": {
      "A": { "text": "Gyrnosperms" },
      "B": { "text": "Deciduous angiosperms" },
      "C": { "text": "Grass" },
      "D": { "text": "Cycads" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Identify the wrong statement in context of heartwood:",
    "options": {
      "A": { "text": "Organic compounds are deposited in it" },
      "B": { "text": "it is highly durable" },
      "C": { "text": "It conducts water and minerals efficiently" },
      "D": { "text": "It comprises dead elements with highly lignified walls" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "The vascular cambium normally gives rise to:",
    "options": {
      "A": { "text": "Primary phloem" },
      "B": { "text": "Secondary xylem" },
      "C": { "text": "Periderm" },
      "D": { "text": "Phelloderm" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Root hair develop from the region of:",
    "options": {
      "A": { "text": "Elongation" },
      "B": { "text": "root cap" },
      "C": { "text": "Meristematic activity" },
      "D": { "text": "Maturation" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Cortex is the region found between:",
    "options": {
      "A": { "text": "Epidermis and stele" },
      "B": { "text": "Pericycle and endodermis" },
      "C": { "text": "Endodermis and pith" },
      "D": { "text": "Endodermis and vascular bundle" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "The balloon-shaped structures called tyloses:",
    "options": {
      "A": { "text": "Are linked to the ascent of sap through xylem vessels" },
      "B": { "text": "Originate in the lumen of vessels" },
      "C": { "text": "Characterize the sapwood" },
      "D": { "text": "Are extensions of xylem parenchyma cells into vessels" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Specialized epidermal cells surrounding the guard cells are called:",
    "options": {
      "A": { "text": "Complementary cells" },
      "B": { "text": "Subsidiary cells" },
      "C": { "text": "Bulliform cells" },
      "D": { "text": "Lenticels" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Read the different components from (a) to (d) in the list given below:\n(a) Bulliform cells (b) Subsidiary cells (c) Guard cells (d) Epidermal cells\nWhat is the correct correct order of these components from outer to inner side in stomatal apparatus?",
    "options": {
      "A": { "text": "(d) -> (b) -> (c)" },
      "B": { "text": "(a) -> (d) -> (b) -> (c)" },
      "C": { "text": "(c) -> (b) -> (d)" },
      "D": { "text": "(b) -> (c) -> (d)" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "A vascular bundle in which the protoxylem is pointing towards the periphery and metaxylem towards the centre is called:",
    "options": {
      "A": { "text": "Endarch" },
      "B": { "text": "Exarch" },
      "C": { "text": "Centrach" },
      "D": { "text": "Mesarch" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Tracheids differ from other tracheary elements in:",
    "options": {
      "A": { "text": "having casparian strips" },
      "B": { "text": "being imperforate" },
      "C": { "text": "lacking nucleus" },
      "D": { "text": "being lignified" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "You are given a fairly old piece of dicot stem and a dicot root. Which of the following anatomical structures will you use to distinguish between the two?",
    "options": {
      "A": { "text": "Secondary phloem" },
      "B": { "text": "Secondary xylem" },
      "C": { "text": "Protoxylem" },
      "D": { "text": "Cortical cells" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Age of a tree can be estimated by:",
    "options": {
      "A": { "text": "number of annual rings" },
      "B": { "text": "diameter of its heartwood" },
      "C": { "text": "its height and girth" },
      "D": { "text": "biomass" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Interfascicular cambium develops from the cells of:",
    "options": {
      "A": { "text": "Medullary rays" },
      "B": { "text": "Xylem parenchyma" },
      "C": { "text": "Endodermis" },
      "D": { "text": "Pericycle" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Lenticels are involved in:",
    "options": {
      "A": { "text": "Guttation" },
      "B": { "text": "Transpiration" },
      "C": { "text": "Gaseous exchange" },
      "D": { "text": "Photosynthesis" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Companion cells are closely associated with:",
    "options": {
      "A": { "text": "Sieve elements" },
      "B": { "text": "Vessel elements" },
      "C": { "text": "Trichomes" },
      "D": { "text": "Guard cells" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Closed vascular bundles lack:",
    "options": {
      "A": { "text": "Ground tissue" },
      "B": { "text": "conjunctive tissue" },
      "C": { "text": "Cambium" },
      "D": { "text": "Pith" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "The chief water conducting elements of xylem in gymnosperms are:",
    "options": {
      "A": { "text": "Vessels" },
      "B": { "text": "Fibres" },
      "C": { "text": "Transfusion tissue" },
      "D": { "text": "Tracheids" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  },
  {
    "questionText": "Which of the following statement is correct for a leaf anatomy?",
    "options": {
      "A": { "text": "The cells of spongy mesophyll are compactly arranged" },
      "B": { "text": "The palisade mesophyll is positioned on the abaxial side" },
      "C": { "text": "The stomata are usually more numerous on the abaxial epidermis in dicot leaves" },
      "D": { "text": "Vascular bundles are surrounded by sclerenchymatous bundle sheath in dicot leaves" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2011, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2011" }
  },
  {
    "questionText": "Heartwood differs from sapwood in:",
    "options": {
      "A": { "text": "presence of rays and fibers" },
      "B": { "text": "absence of vessels and parenchyma" },
      "C": { "text": "having dead and non-conducting elements" },
      "D": { "text": "being susceptible to pests" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  },
  {
    "questionText": "Anatomically fairly old dicotyledonous root is distinguished from a dicotyledonous stem by:",
    "options": {
      "A": { "text": "Absence of secondary phloem" },
      "B": { "text": "Presence of cortex" },
      "C": { "text": "Position of protoxylem" },
      "D": { "text": "Absence of secondary xylem" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "The common bottle cork is a product of:",
    "options": {
      "A": { "text": "Dermatogen" },
      "B": { "text": "Phellogen" },
      "C": { "text": "Xylem" },
      "D": { "text": "Vascular cambium" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  }
]

[
  {
    "questionText": "The transverse section of a plant shows following anatomical features : (a) Large number of scattered vascular bundles surrounded by bundle sheath. (b) Large conspicuous parenchymatous ground tissue. (c) Vascular bundles conjoint and closed. (d) Phloem parenchyma absent. Identify the category of plant and its part:",
    "options": {
      "A": { "text": "Monocotyledonous stem" },
      "B": { "text": "Monocotyledonous root" },
      "C": { "text": "Dicotyledonous stem" },
      "D": { "text": "Dicotyledonous root" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2020, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2020" }
  },
  {
    "questionText": "Grass leaves curl inwards during very dry weather. Select the most appropriate reason from the following:",
    "options": {
      "A": { "text": "Flaccidity of bulliform cells" },
      "B": { "text": "Shrinkage of air spaces in spongy mesophyll" },
      "C": { "text": "Tyloses in vessels" },
      "D": { "text": "Closure of stomata" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2019, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2019" }
  },
  {
    "questionText": "Phloem in gymnosperms lacks:",
    "options": {
      "A": { "text": "Albuminous cells and sieve cells" },
      "B": { "text": "Sieve tubes and companion cells" },
      "C": { "text": "Albuminous cells and companion cells" },
      "D": { "text": "Sieve cells and companion cells" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2019, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2019" }
  },
  {
    "questionText": "Casparian strips occur in:",
    "options": {
      "A": { "text": "Epidermis" },
      "B": { "text": "Pericycle" },
      "C": { "text": "Cortex" },
      "D": { "text": "Endodermis" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Plants having little or no secondary growth are:",
    "options": {
      "A": { "text": "Gyrnosperms" },
      "B": { "text": "Deciduous angiosperms" },
      "C": { "text": "Grass" },
      "D": { "text": "Cycads" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2018, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2018" }
  },
  {
    "questionText": "Identify the wrong statement in context of heartwood:",
    "options": {
      "A": { "text": "Organic compounds are deposited in it" },
      "B": { "text": "it is highly durable" },
      "C": { "text": "It conducts water and minerals efficiently" },
      "D": { "text": "It comprises dead elements with highly lignified walls" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "The vascular cambium normally gives rise to:",
    "options": {
      "A": { "text": "Primary phloem" },
      "B": { "text": "Secondary xylem" },
      "C": { "text": "Periderm" },
      "D": { "text": "Phelloderm" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Root hair develop from the region of:",
    "options": {
      "A": { "text": "Elongation" },
      "B": { "text": "root cap" },
      "C": { "text": "Meristematic activity" },
      "D": { "text": "Maturation" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2017, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2017" }
  },
  {
    "questionText": "Cortex is the region found between:",
    "options": {
      "A": { "text": "Epidermis and stele" },
      "B": { "text": "Pericycle and endodermis" },
      "C": { "text": "Endodermis and pith" },
      "D": { "text": "Endodermis and vascular bundle" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "The balloon-shaped structures called tyloses:",
    "options": {
      "A": { "text": "Are linked to the ascent of sap through xylem vessels" },
      "B": { "text": "Originate in the lumen of vessels" },
      "C": { "text": "Characterize the sapwood" },
      "D": { "text": "Are extensions of xylem parenchyma cells into vessels" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Specialized epidermal cells surrounding the guard cells are called:",
    "options": {
      "A": { "text": "Complementary cells" },
      "B": { "text": "Subsidiary cells" },
      "C": { "text": "Bulliform cells" },
      "D": { "text": "Lenticels" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2016, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2016" }
  },
  {
    "questionText": "Read the different components from (a) to (d) in the list given below:\n(a) Bulliform cells (b) Subsidiary cells (c) Guard cells (d) Epidermal cells\nWhat is the correct correct order of these components from outer to inner side in stomatal apparatus?",
    "options": {
      "A": { "text": "(d) -> (b) -> (c)" },
      "B": { "text": "(a) -> (d) -> (b) -> (c)" },
      "C": { "text": "(c) -> (b) -> (d)" },
      "D": { "text": "(b) -> (c) -> (d)" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2015, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2015" }
  },
  {
    "questionText": "A vascular bundle in which the protoxylem is pointing towards the periphery and metaxylem towards the centre is called:",
    "options": {
      "A": { "text": "Endarch" },
      "B": { "text": "Exarch" },
      "C": { "text": "Centrach" },
      "D": { "text": "Mesarch" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Tracheids differ from other tracheary elements in:",
    "options": {
      "A": { "text": "having casparian strips" },
      "B": { "text": "being imperforate" },
      "C": { "text": "lacking nucleus" },
      "D": { "text": "being lignified" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "You are given a fairly old piece of dicot stem and a dicot root. Which of the following anatomical structures will you use to distinguish between the two?",
    "options": {
      "A": { "text": "Secondary phloem" },
      "B": { "text": "Secondary xylem" },
      "C": { "text": "Protoxylem" },
      "D": { "text": "Cortical cells" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2014, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2014" }
  },
  {
    "questionText": "Age of a tree can be estimated by:",
    "options": {
      "A": { "text": "number of annual rings" },
      "B": { "text": "diameter of its heartwood" },
      "C": { "text": "its height and girth" },
      "D": { "text": "biomass" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Interfascicular cambium develops from the cells of:",
    "options": {
      "A": { "text": "Medullary rays" },
      "B": { "text": "Xylem parenchyma" },
      "C": { "text": "Endodermis" },
      "D": { "text": "Pericycle" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Lenticels are involved in:",
    "options": {
      "A": { "text": "Guttation" },
      "B": { "text": "Transpiration" },
      "C": { "text": "Gaseous exchange" },
      "D": { "text": "Photosynthesis" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2013, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2013" }
  },
  {
    "questionText": "Companion cells are closely associated with:",
    "options": {
      "A": { "text": "Sieve elements" },
      "B": { "text": "Vessel elements" },
      "C": { "text": "Trichomes" },
      "D": { "text": "Guard cells" }
    },
    "correctAnswer": "A",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "Closed vascular bundles lack:",
    "options": {
      "A": { "text": "Ground tissue" },
      "B": { "text": "conjunctive tissue" },
      "C": { "text": "Cambium" },
      "D": { "text": "Pith" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  },
  {
    "questionText": "The chief water conducting elements of xylem in gymnosperms are:",
    "options": {
      "A": { "text": "Vessels" },
      "B": { "text": "Fibres" },
      "C": { "text": "Transfusion tissue" },
      "D": { "text": "Tracheids" }
    },
    "correctAnswer": "D",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  },
  {
    "questionText": "Which of the following statement is correct for a leaf anatomy?",
    "options": {
      "A": { "text": "The cells of spongy mesophyll are compactly arranged" },
      "B": { "text": "The palisade mesophyll is positioned on the abaxial side" },
      "C": { "text": "The stomata are usually more numerous on the abaxial epidermis in dicot leaves" },
      "D": { "text": "Vascular bundles are surrounded by sclerenchymatous bundle sheath in dicot leaves" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Tissues and Tissue System",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2011, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2011" }
  },
  {
    "questionText": "Heartwood differs from sapwood in:",
    "options": {
      "A": { "text": "presence of rays and fibers" },
      "B": { "text": "absence of vessels and parenchyma" },
      "C": { "text": "having dead and non-conducting elements" },
      "D": { "text": "being susceptible to pests" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2010, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2010" }
  },
  {
    "questionText": "Anatomically fairly old dicotyledonous root is distinguished from a dicotyledonous stem by:",
    "options": {
      "A": { "text": "Absence of secondary phloem" },
      "B": { "text": "Presence of cortex" },
      "C": { "text": "Position of protoxylem" },
      "D": { "text": "Absence of secondary xylem" }
    },
    "correctAnswer": "C",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Complex Permanent Tissues",
    "difficulty": "medium",
    "source": "pyq",
    "sourceDetails": { "year": 2009, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2009" }
  },
  {
    "questionText": "The common bottle cork is a product of:",
    "options": {
      "A": { "text": "Dermatogen" },
      "B": { "text": "Phellogen" },
      "C": { "text": "Xylem" },
      "D": { "text": "Vascular cambium" }
    },
    "correctAnswer": "B",
    "subject": "biology",
    "chapter": "Anatomy of Flowering Plants",
    "topic": "Secondary Growth",
    "difficulty": "easy",
    "source": "pyq",
    "sourceDetails": { "year": 2012, "examType": "neet" },
    "pyq": { "isPYQ": true, "reference": "NEET 2012" }
  }
]

[
{"questionText":"The dimensional formula of force is:","options":{"A":{"text":"[MLT^-1]"},"B":{"text":"[MLT^-2]"},"C":{"text":"[ML^2T^-2]"},"D":{"text":"[ML^-1T^-2]"}},"correctAnswer":"B","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of work is:","options":{"A":{"text":"[MLT^-2]"},"B":{"text":"[ML^2T^-1]"},"C":{"text":"[ML^2T^-2]"},"D":{"text":"[ML^2T^-3]"}},"correctAnswer":"C","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of power is:","options":{"A":{"text":"[ML^2T^-2]"},"B":{"text":"[ML^2T^-3]"},"C":{"text":"[MLT^-3]"},"D":{"text":"[ML^-1T^-3]"}},"correctAnswer":"B","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of pressure is:","options":{"A":{"text":"[ML^-1T^-2]"},"B":{"text":"[MLT^-2]"},"C":{"text":"[ML^-2T^-2]"},"D":{"text":"[ML^2T^-2]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of momentum is:","options":{"A":{"text":"[MLT^-2]"},"B":{"text":"[MLT^-1]"},"C":{"text":"[ML^2T^-1]"},"D":{"text":"[ML^-1T^-1]"}},"correctAnswer":"B","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of angular momentum is:","options":{"A":{"text":"[ML^2T^-2]"},"B":{"text":"[MLT^-1]"},"C":{"text":"[ML^2T^-1]"},"D":{"text":"[ML^2T^-3]"}},"correctAnswer":"C","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of torque is:","options":{"A":{"text":"[ML^2T^-2]"},"B":{"text":"[MLT^-2]"},"C":{"text":"[ML^-1T^-2]"},"D":{"text":"[ML^2T^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of surface tension is:","options":{"A":{"text":"[MT^-2]"},"B":{"text":"[ML^-1T^-2]"},"C":{"text":"[ML T^-2]"},"D":{"text":"[MLT^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of coefficient of viscosity is:","options":{"A":{"text":"[ML^-1T^-1]"},"B":{"text":"[MLT^-1]"},"C":{"text":"[ML^-1T^-2]"},"D":{"text":"[ML^2T^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of universal gravitational constant G is:","options":{"A":{"text":"[M^-1L^3T^-2]"},"B":{"text":"[ML^3T^-2]"},"C":{"text":"[M^-1L^2T^-2]"},"D":{"text":"[M^-1L^3T^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of Planck's constant is same as that of:","options":{"A":{"text":"Energy"},"B":{"text":"Angular momentum"},"C":{"text":"Momentum"},"D":{"text":"Power"}},"correctAnswer":"B","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of impulse is same as that of:","options":{"A":{"text":"Force"},"B":{"text":"Momentum"},"C":{"text":"Energy"},"D":{"text":"Power"}},"correctAnswer":"B","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of frequency is:","options":{"A":{"text":"[T^-1]"},"B":{"text":"[T]"},"C":{"text":"[T^-2]"},"D":{"text":"[M^0L^0T^0]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of electric charge is:","options":{"A":{"text":"[AT]"},"B":{"text":"[A T^-1]"},"C":{"text":"[MLT^-1A]"},"D":{"text":"[A^2T]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of electric potential (voltage) is:","options":{"A":{"text":"[ML^2T^-3A^-1]"},"B":{"text":"[ML^2T^-2A^-1]"},"C":{"text":"[MLT^-3A^-1]"},"D":{"text":"[ML^2T^-3A^-2]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"hard","source":"practice"},
{"questionText":"The dimensional formula of resistance is:","options":{"A":{"text":"[ML^2T^-3A^-2]"},"B":{"text":"[ML^2T^-2A^-2]"},"C":{"text":"[MLT^-3A^-2]"},"D":{"text":"[ML^2T^-3A^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"hard","source":"practice"},
{"questionText":"The dimensional formula of capacitance is:","options":{"A":{"text":"[M^-1L^-2T^4A^2]"},"B":{"text":"[ML^2T^-4A^2]"},"C":{"text":"[M^-1L^-2T^2A^2]"},"D":{"text":"[M^-1L^2T^4A^2]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"hard","source":"practice"},
{"questionText":"The dimensional formula of magnetic field (B) is:","options":{"A":{"text":"[MT^-2A^-1]"},"B":{"text":"[MLT^-2A^-1]"},"C":{"text":"[ML^2T^-2A^-1]"},"D":{"text":"[MT^-1A^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"hard","source":"practice"},
{"questionText":"The dimensional formula of coefficient of thermal conductivity is:","options":{"A":{"text":"[MLT^-3K^-1]"},"B":{"text":"[ML^2T^-3K^-1]"},"C":{"text":"[ML T^-2K^-1]"},"D":{"text":"[MLT^-3K^-2]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"hard","source":"practice"},
{"questionText":"The dimensional formula of specific heat capacity is:","options":{"A":{"text":"[L^2T^-2K^-1]"},"B":{"text":"[ML^2T^-2K^-1]"},"C":{"text":"[MLT^-2K^-1]"},"D":{"text":"[L^2T^-1K^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of latent heat is:","options":{"A":{"text":"[L^2T^-2]"},"B":{"text":"[ML^2T^-2]"},"C":{"text":"[MLT^-2]"},"D":{"text":"[L^2T^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of Boltzmann constant is:","options":{"A":{"text":"[ML^2T^-2K^-1]"},"B":{"text":"[MLT^-2K^-1]"},"C":{"text":"[ML^2T^-1K^-1]"},"D":{"text":"[M^0L^2T^-2K^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"hard","source":"practice"},
{"questionText":"The dimensional formula of Stefan's constant (σ in E = σT^4) is:","options":{"A":{"text":"[ML^0T^-3K^-4]"},"B":{"text":"[MLT^-3K^-4]"},"C":{"text":"[ML^2T^-3K^-4]"},"D":{"text":"[ML^-1T^-3K^-4]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"hard","source":"practice"},
{"questionText":"The dimensional formula of strain is:","options":{"A":{"text":"[M^0L^0T^0]"},"B":{"text":"[MLT^0]"},"C":{"text":"[M^0LT^0]"},"D":{"text":"[M^0L^0T^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of Young's modulus is same as that of:","options":{"A":{"text":"Pressure"},"B":{"text":"Force"},"C":{"text":"Energy"},"D":{"text":"Power"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following pairs has the same dimensions?","options":{"A":{"text":"Work and torque"},"B":{"text":"Force and pressure"},"C":{"text":"Power and momentum"},"D":{"text":"Impulse and power"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following quantities is dimensionless?","options":{"A":{"text":"Refractive index"},"B":{"text":"Angular velocity"},"C":{"text":"Density"},"D":{"text":"Pressure"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is a dimensionless quantity?","options":{"A":{"text":"Relative density"},"B":{"text":"Density"},"C":{"text":"Specific gravity of gas in kg/m^3"},"D":{"text":"Molar mass"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"The dimensional formula of Poisson's ratio is:","options":{"A":{"text":"[M^0L^0T^0]"},"B":{"text":"[MLT^0]"},"C":{"text":"[M^0LT^-1]"},"D":{"text":"[ML^0T^0]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"medium","source":"practice"},
{"questionText":"The dimensional formula of the coefficient of friction is:","options":{"A":{"text":"[M^0L^0T^0]"},"B":{"text":"[MLT^-2]"},"C":{"text":"[M^0LT^0]"},"D":{"text":"[ML^0T^-1]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Formulas","difficulty":"easy","source":"practice"},
{"questionText":"According to the principle of homogeneity of dimensions, which of the following operations is permissible?","options":{"A":{"text":"Adding two quantities with the same dimensions"},"B":{"text":"Adding two quantities with different dimensions"},"C":{"text":"Equating quantities with different dimensions"},"D":{"text":"Subtracting a dimensionless number from a dimensional quantity"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Principle of Homogeneity","difficulty":"easy","source":"practice"},
{"questionText":"In the equation y = a sin(ωt − kx), using dimensional homogeneity, the dimensional formula of ω/k is same as that of:","options":{"A":{"text":"Velocity"},"B":{"text":"Acceleration"},"C":{"text":"Frequency"},"D":{"text":"Wavelength"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Principle of Homogeneity","difficulty":"medium","source":"practice"},
{"questionText":"If the dimensions of a physical quantity are given by [M^aL^bT^c], then the physical quantity will be:","options":{"A":{"text":"Force, if a=0, b=-1, c=-2"},"B":{"text":"Pressure, if a=1, b=-1, c=-2"},"C":{"text":"Velocity, if a=1, b=0, c=-1"},"D":{"text":"Acceleration, if a=1, b=1, c=-2"}},"correctAnswer":"B","subject":"physics","chapter":"Units and Dimensions","topic":"Principle of Homogeneity","difficulty":"hard","source":"practice"},
{"questionText":"The velocity v of a particle depends on time t as v = at + b/(t+c). The dimensions of a, b and c are respectively:","options":{"A":{"text":"[LT^-2], [L], [T]"},"B":{"text":"[LT^-2], [LT], [T]"},"C":{"text":"[L], [LT], [T^2]"},"D":{"text":"[LT^-2], [LT^-1], [T]"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Principle of Homogeneity","difficulty":"hard","source":"practice"},
{"questionText":"A dimensionally consistent relation for the time period T of a simple pendulum of length l in a region with acceleration due to gravity g is:","options":{"A":{"text":"T = 2π√(l/g)"},"B":{"text":"T = 2π√(g/l)"},"C":{"text":"T = 2π(l/g)"},"D":{"text":"T = 2π(lg)"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Analysis Applications","difficulty":"easy","source":"practice"},
{"questionText":"Using dimensional analysis, the frequency n of a stretched string depends on its length L, tension T and mass per unit length m as:","options":{"A":{"text":"n ∝ (1/L)√(T/m)"},"B":{"text":"n ∝ L√(T/m)"},"C":{"text":"n ∝ (1/L)√(m/T)"},"D":{"text":"n ∝ (1/L^2)√(T/m)"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Analysis Applications","difficulty":"medium","source":"practice"},
{"questionText":"By dimensional analysis, the escape velocity of a body from a planet of mass M and radius R can be shown to be proportional to:","options":{"A":{"text":"√(M/R)"},"B":{"text":"√(GM/R)"},"C":{"text":"GM/R"},"D":{"text":"√(GM/R^2)"}},"correctAnswer":"B","subject":"physics","chapter":"Units and Dimensions","topic":"Dimensional Analysis Applications","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following cannot be derived using dimensional analysis?","options":{"A":{"text":"The exact numerical (dimensionless) constant in a formula"},"B":{"text":"The dependence of a quantity on the powers of other quantities"},"C":{"text":"Whether an equation is dimensionally consistent"},"D":{"text":"Conversion of units from one system to another"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Limitations of Dimensional Analysis","difficulty":"medium","source":"practice"},
{"questionText":"Dimensional analysis fails to derive a relation when the quantity depends on:","options":{"A":{"text":"More than three independent physical quantities"},"B":{"text":"Exactly two physical quantities"},"C":{"text":"Only fundamental quantities"},"D":{"text":"A single physical quantity"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Limitations of Dimensional Analysis","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following cannot be a valid application of dimensional analysis?","options":{"A":{"text":"Checking correctness of a given physical equation"},"B":{"text":"Deriving a relation among physical quantities"},"C":{"text":"Distinguishing between sin θ and cos θ terms in an equation"},"D":{"text":"Converting units from SI to CGS system"}},"correctAnswer":"C","subject":"physics","chapter":"Units and Dimensions","topic":"Limitations of Dimensional Analysis","difficulty":"medium","source":"practice"},
{"questionText":"The number of significant figures in 0.00450 is:","options":{"A":{"text":"3"},"B":{"text":"2"},"C":{"text":"5"},"D":{"text":"6"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Significant Figures","difficulty":"easy","source":"practice"},
{"questionText":"The number of significant figures in 6.020 × 10^23 is:","options":{"A":{"text":"4"},"B":{"text":"2"},"C":{"text":"23"},"D":{"text":"3"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Significant Figures","difficulty":"easy","source":"practice"},
{"questionText":"The number of significant figures in 100200 is:","options":{"A":{"text":"6"},"B":{"text":"4"},"C":{"text":"3"},"D":{"text":"Ambiguous without a decimal point or scientific notation"}},"correctAnswer":"D","subject":"physics","chapter":"Units and Dimensions","topic":"Significant Figures","difficulty":"medium","source":"practice"},
{"questionText":"The result of the sum 4.237 + 2.1 (values in cm) should be reported, to the correct number of significant figures, as:","options":{"A":{"text":"6.3 cm"},"B":{"text":"6.337 cm"},"C":{"text":"6.34 cm"},"D":{"text":"6.3370 cm"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Significant Figures","difficulty":"medium","source":"practice"},
{"questionText":"The product 3.24 × 5.2 should be expressed, to the correct number of significant figures, as:","options":{"A":{"text":"17"},"B":{"text":"16.848"},"C":{"text":"16.85"},"D":{"text":"16.8"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Significant Figures","difficulty":"medium","source":"practice"},
{"questionText":"If the length and breadth of a rectangle are measured as (5.7 ± 0.1) cm and (3.4 ± 0.1) cm, the percentage error in the area is closest to:","options":{"A":{"text":"5%"},"B":{"text":"1%"},"C":{"text":"10%"},"D":{"text":"0.5%"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Errors in Measurement","difficulty":"hard","source":"practice"},
{"questionText":"If a quantity Z is calculated as Z = A^2B^3/C, the maximum percentage error in Z in terms of the percentage errors in A, B and C is:","options":{"A":{"text":"2(ΔA/A) + 3(ΔB/B) + (ΔC/C), all in percentage"},"B":{"text":"(ΔA/A) + (ΔB/B) + (ΔC/C)"},"C":{"text":"2(ΔA/A) + 3(ΔB/B) − (ΔC/C)"},"D":{"text":"(ΔA/A)^2 + (ΔB/B)^3 − (ΔC/C)"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Errors in Measurement","difficulty":"hard","source":"practice"},
{"questionText":"The random error in a series of repeated measurements is best minimised by:","options":{"A":{"text":"Taking the arithmetic mean of a large number of readings"},"B":{"text":"Using an instrument with a coarser least count"},"C":{"text":"Taking only a single reading with maximum care"},"D":{"text":"Rounding off every reading to the nearest whole number"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Errors in Measurement","difficulty":"easy","source":"practice"},
{"questionText":"A systematic error in an experiment, unlike a random error, is one that:","options":{"A":{"text":"Occurs consistently in the same direction due to a flaw in the instrument or method"},"B":{"text":"Occurs due to unpredictable fluctuations and can be reduced by repeating the experiment"},"C":{"text":"Cannot ever be identified or removed"},"D":{"text":"Always increases with the number of observations"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Errors in Measurement","difficulty":"medium","source":"practice"},
{"questionText":"Least count of a measuring instrument refers to:","options":{"A":{"text":"The smallest value that can be measured accurately by the instrument"},"B":{"text":"The largest value the instrument can measure"},"C":{"text":"The average of all readings taken"},"D":{"text":"The zero error of the instrument"}},"correctAnswer":"A","subject":"physics","chapter":"Units and Dimensions","topic":"Errors in Measurement","difficulty":"easy","source":"practice"}
]
[
{"questionText":"Matter is classified at the macroscopic level into:","options":{"A":{"text":"Mixtures and pure substances"},"B":{"text":"Solids and liquids only"},"C":{"text":"Elements and atoms"},"D":{"text":"Molecules and ions only"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Classification of Matter","difficulty":"easy","source":"practice"},
{"questionText":"A mixture in which the composition is uniform throughout is called:","options":{"A":{"text":"A homogeneous mixture"},"B":{"text":"A heterogeneous mixture"},"C":{"text":"A compound"},"D":{"text":"An element"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Classification of Matter","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is a pure substance?","options":{"A":{"text":"Distilled water"},"B":{"text":"Air"},"C":{"text":"Sea water"},"D":{"text":"Soil"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Classification of Matter","difficulty":"easy","source":"practice"},
{"questionText":"A compound differs from a mixture in that a compound:","options":{"A":{"text":"Has a fixed composition and its constituents cannot be separated by physical methods"},"B":{"text":"Always has a variable composition"},"C":{"text":"Can be separated into its constituents by simple physical methods"},"D":{"text":"Is always made of only one element"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Classification of Matter","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is an intensive property (does not depend on the amount of matter present)?","options":{"A":{"text":"Density"},"B":{"text":"Mass"},"C":{"text":"Volume"},"D":{"text":"Length"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Properties of Matter","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is an extensive property?","options":{"A":{"text":"Mass"},"B":{"text":"Temperature"},"C":{"text":"Density"},"D":{"text":"Refractive index"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Properties of Matter","difficulty":"easy","source":"practice"},
{"questionText":"A physical change is one that:","options":{"A":{"text":"Does not change the chemical composition of the substance"},"B":{"text":"Always produces a new substance with different chemical properties"},"C":{"text":"Involves breaking and forming of chemical bonds"},"D":{"text":"Is always irreversible"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Properties of Matter","difficulty":"easy","source":"practice"},
{"questionText":"Rusting of iron is an example of:","options":{"A":{"text":"A chemical change"},"B":{"text":"A physical change"},"C":{"text":"Sublimation"},"D":{"text":"A reversible physical process"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Properties of Matter","difficulty":"easy","source":"practice"},
{"questionText":"The SI unit of temperature is:","options":{"A":{"text":"Kelvin"},"B":{"text":"Celsius"},"C":{"text":"Fahrenheit"},"D":{"text":"Rankine"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"SI Units in Chemistry","difficulty":"easy","source":"practice"},
{"questionText":"The relationship between Kelvin and Celsius temperature scales is:","options":{"A":{"text":"K = °C + 273.15"},"B":{"text":"K = °C − 273.15"},"C":{"text":"K = °C × 273.15"},"D":{"text":"K = 273.15 / °C"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"SI Units in Chemistry","difficulty":"easy","source":"practice"},
{"questionText":"STP (Standard Temperature and Pressure) as per IUPAC (post-1982) convention corresponds to:","options":{"A":{"text":"0°C (273.15 K) and 1 bar pressure"},"B":{"text":"25°C and 1 atm pressure"},"C":{"text":"0°C and 1 atm pressure"},"D":{"text":"25°C and 1 bar pressure"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"SI Units in Chemistry","difficulty":"medium","source":"practice"},
{"questionText":"The SI unit of pressure is:","options":{"A":{"text":"Pascal"},"B":{"text":"Atmosphere"},"C":{"text":"Torr"},"D":{"text":"Bar"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"SI Units in Chemistry","difficulty":"easy","source":"practice"},
{"questionText":"1 atmosphere pressure is equal to:","options":{"A":{"text":"101325 Pa"},"B":{"text":"1000 Pa"},"C":{"text":"760 Pa"},"D":{"text":"100 Pa"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"SI Units in Chemistry","difficulty":"medium","source":"practice"},
{"questionText":"Precision in a measurement refers to:","options":{"A":{"text":"How close a set of repeated measurements are to one another"},"B":{"text":"How close a measurement is to the true value"},"C":{"text":"The number of significant figures reported"},"D":{"text":"The instrument used for measurement"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"medium","source":"practice"},
{"questionText":"Accuracy in a measurement refers to:","options":{"A":{"text":"How close a measured value is to the true or accepted value"},"B":{"text":"How reproducible the measurements are"},"C":{"text":"The precision of the instrument only"},"D":{"text":"The least count of the instrument"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following sets of repeated measurements shows high precision but low accuracy, if the true value is 25.0?","options":{"A":{"text":"22.1, 22.2, 22.0, 22.1"},"B":{"text":"25.0, 24.9, 25.1, 25.0"},"C":{"text":"20.0, 30.0, 24.0, 26.0"},"D":{"text":"25.1, 24.8, 25.0, 25.0"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"hard","source":"practice"},
{"questionText":"In scientific notation, the number 0.00016 is expressed as:","options":{"A":{"text":"1.6 × 10^-4"},"B":{"text":"1.6 × 10^4"},"C":{"text":"16 × 10^-5"},"D":{"text":"0.16 × 10^-3"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following digits in a measured value are considered significant?","options":{"A":{"text":"All certain digits plus one uncertain (estimated) digit"},"B":{"text":"Only the certain digits"},"C":{"text":"Only the first digit"},"D":{"text":"All digits including trailing zeros in every case"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"medium","source":"practice"},
{"questionText":"Dimensional analysis (unit factor method) is used in chemistry chiefly to:","options":{"A":{"text":"Convert a quantity from one system of units to another"},"B":{"text":"Balance chemical equations"},"C":{"text":"Determine the oxidation state of an element"},"D":{"text":"Predict the products of a reaction"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Dimensional Analysis","difficulty":"easy","source":"practice"},
{"questionText":"To convert a speed given in km/h to m/s, the correct unit factor to multiply by is:","options":{"A":{"text":"1000/3600"},"B":{"text":"3600/1000"},"C":{"text":"1000 × 3600"},"D":{"text":"1/1000"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Dimensional Analysis","difficulty":"easy","source":"practice"},
{"questionText":"5.6 g of a metal reacts completely with acid to liberate 0.2 mol of hydrogen gas. The number of gram equivalents of the metal that reacted is:","options":{"A":{"text":"0.4"},"B":{"text":"0.2"},"C":{"text":"0.1"},"D":{"text":"0.8"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"hard","source":"practice"},
{"questionText":"For the reaction N2 + 3H2 → 2NH3, if 1 mole of N2 reacts completely with excess H2, the number of moles of NH3 formed is:","options":{"A":{"text":"2"},"B":{"text":"1"},"C":{"text":"3"},"D":{"text":"0.5"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"easy","source":"practice"},
{"questionText":"For the reaction N2 + 3H2 → 2NH3, the number of moles of H2 required to react completely with 2 moles of N2 is:","options":{"A":{"text":"6"},"B":{"text":"3"},"C":{"text":"2"},"D":{"text":"4"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"easy","source":"practice"},
{"questionText":"If 3 mol of N2 and 6 mol of H2 are mixed and allowed to react as N2 + 3H2 → 2NH3, the limiting reagent is:","options":{"A":{"text":"H2, since only 2 mol N2 can react with the available 6 mol H2"},"B":{"text":"N2, since it is present in a smaller molar amount"},"C":{"text":"Neither, since they are in the exact stoichiometric ratio"},"D":{"text":"Both react completely with nothing left over"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Limiting Reagent","difficulty":"hard","source":"practice"},
{"questionText":"The mass of one molecule of water (molar mass 18 g/mol) is approximately:","options":{"A":{"text":"2.99 × 10^-23 g"},"B":{"text":"18 g"},"C":{"text":"6.022 × 10^23 g"},"D":{"text":"1.66 × 10^-24 g"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"medium","source":"practice"},
{"questionText":"The number of moles present in 54 g of aluminium (atomic mass 27 g/mol) is:","options":{"A":{"text":"2 mol"},"B":{"text":"1 mol"},"C":{"text":"4 mol"},"D":{"text":"0.5 mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"easy","source":"practice"},
{"questionText":"The number of atoms present in 1 mole of a monoatomic element is:","options":{"A":{"text":"6.022 × 10^23"},"B":{"text":"1"},"C":{"text":"6.022 × 10^22"},"D":{"text":"Depends on the element's atomic mass"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"easy","source":"practice"},
{"questionText":"18 g of glucose (C6H12O6, molar mass 180 g/mol) dissolved in 1000 g of water has a molality of:","options":{"A":{"text":"0.1 m"},"B":{"text":"1 m"},"C":{"text":"0.01 m"},"D":{"text":"10 m"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"medium","source":"practice"},
{"questionText":"A 1 molar solution of NaCl means that 1 litre of the solution contains:","options":{"A":{"text":"1 mole (58.5 g) of NaCl"},"B":{"text":"1 gram of NaCl"},"C":{"text":"1 gram equivalent of NaCl per kg of water"},"D":{"text":"58.5 g of NaCl per kg of solvent"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following concentration terms is temperature-independent?","options":{"A":{"text":"Mole fraction"},"B":{"text":"Molarity"},"C":{"text":"Normality"},"D":{"text":"Formality"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"medium","source":"practice"},
{"questionText":"On dilution of a solution with water, which of the following remains unchanged?","options":{"A":{"text":"Number of moles of solute present"},"B":{"text":"Molarity of the solution"},"C":{"text":"Concentration in g/L"},"D":{"text":"Molality of the solution"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"medium","source":"practice"},
{"questionText":"The relation used to calculate the molarity of a diluted solution from the molarity and volume of the original solution is:","options":{"A":{"text":"M1V1 = M2V2"},"B":{"text":"M1/V1 = M2/V2"},"C":{"text":"M1 + V1 = M2 + V2"},"D":{"text":"M1V2 = M2V1 is never valid"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"easy","source":"practice"},
{"questionText":"The percentage composition of an element in a compound is calculated using the formula:","options":{"A":{"text":"(Mass of element in one mole of compound / Molar mass of compound) × 100"},"B":{"text":"(Number of atoms of element / Total atoms) alone"},"C":{"text":"(Molar mass of compound / Mass of element) × 100"},"D":{"text":"(Atomic number of element / Molar mass) × 100"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Percentage Composition","difficulty":"easy","source":"practice"},
{"questionText":"The percentage of hydrogen in water (H2O, molar mass 18 g/mol) is approximately:","options":{"A":{"text":"11.1%"},"B":{"text":"88.9%"},"C":{"text":"50%"},"D":{"text":"5.5%"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Percentage Composition","difficulty":"medium","source":"practice"},
{"questionText":"A balanced chemical equation must have the same number of atoms of each element on both sides in accordance with the law of:","options":{"A":{"text":"Conservation of mass"},"B":{"text":"Multiple proportions"},"C":{"text":"Definite proportions"},"D":{"text":"Reciprocal proportions"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"easy","source":"practice"},
{"questionText":"Stoichiometry is the branch of chemistry concerned with:","options":{"A":{"text":"The quantitative relationships between reactants and products in a chemical reaction"},"B":{"text":"The structure of molecules"},"C":{"text":"The rate at which a reaction proceeds"},"D":{"text":"The energy changes accompanying a reaction"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"easy","source":"practice"},
{"questionText":"When 8 g of methane (CH4, molar mass 16 g/mol) is burnt completely in oxygen, the number of moles of CO2 produced is:","options":{"A":{"text":"0.5 mol"},"B":{"text":"1 mol"},"C":{"text":"2 mol"},"D":{"text":"0.25 mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"medium","source":"practice"},
{"questionText":"The gram equivalent mass of an acid is calculated as:","options":{"A":{"text":"Molar mass divided by its basicity (number of replaceable H+ ions)"},"B":{"text":"Molar mass multiplied by its basicity"},"C":{"text":"Molar mass divided by the number of oxygen atoms"},"D":{"text":"Molar mass added to its basicity"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Equivalent Concept","difficulty":"medium","source":"practice"},
{"questionText":"The gram equivalent mass of a base is calculated as:","options":{"A":{"text":"Molar mass divided by its acidity (number of replaceable OH− ions)"},"B":{"text":"Molar mass multiplied by its acidity"},"C":{"text":"Molar mass divided by the number of metal atoms"},"D":{"text":"Molar mass minus its acidity"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Equivalent Concept","difficulty":"medium","source":"practice"}
][
{"questionText":"The gram equivalent mass of a salt in a redox reaction is calculated using its molar mass divided by:","options":{"A":{"text":"The total change in oxidation number (number of electrons transferred per formula unit)"},"B":{"text":"Its molecular formula weight only"},"C":{"text":"The number of atoms in the formula"},"D":{"text":"Its boiling point"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Equivalent Concept","difficulty":"hard","source":"practice"},
{"questionText":"1.4 g of nitrogen gas (molar mass 28 g/mol) contains how many moles of N atoms?","options":{"A":{"text":"0.1 mol"},"B":{"text":"0.05 mol"},"C":{"text":"0.2 mol"},"D":{"text":"1 mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following contains the greatest number of atoms?","options":{"A":{"text":"1 g of hydrogen gas (H2, molar mass 2 g/mol)"},"B":{"text":"1 g of oxygen gas (O2, molar mass 32 g/mol)"},"C":{"text":"1 g of carbon dioxide (molar mass 44 g/mol)"},"D":{"text":"1 g of nitrogen gas (molar mass 28 g/mol)"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"hard","source":"practice"},
{"questionText":"The number of significant figures in the measured value 0.0230 is:","options":{"A":{"text":"3"},"B":{"text":"2"},"C":{"text":"5"},"D":{"text":"4"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"medium","source":"practice"},
{"questionText":"In addition and subtraction of measured quantities, the result should be reported with the number of decimal places equal to:","options":{"A":{"text":"The least number of decimal places among the quantities being added or subtracted"},"B":{"text":"The greatest number of decimal places among the quantities"},"C":{"text":"The sum of decimal places of all the quantities"},"D":{"text":"Always two decimal places"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"medium","source":"practice"},
{"questionText":"In multiplication and division of measured quantities, the result should be reported with the number of significant figures equal to:","options":{"A":{"text":"The least number of significant figures among the quantities involved"},"B":{"text":"The greatest number of significant figures among the quantities"},"C":{"text":"The average number of significant figures"},"D":{"text":"The sum of significant figures of all quantities"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Uncertainty in Measurement","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following is an example of a heterogeneous mixture?","options":{"A":{"text":"A mixture of sand and salt"},"B":{"text":"A solution of sugar in water"},"C":{"text":"Air"},"D":{"text":"Brass (an alloy)"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Classification of Matter","difficulty":"easy","source":"practice"},
{"questionText":"An element is defined as a substance that:","options":{"A":{"text":"Cannot be broken down into simpler substances by ordinary chemical means"},"B":{"text":"Is always made of two or more different atoms"},"C":{"text":"Can always be split into a compound by heating"},"D":{"text":"Has a variable composition"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Classification of Matter","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following pairs correctly matches a compound with its correct empirical formula?","options":{"A":{"text":"Glucose (C6H12O6) — CH2O"},"B":{"text":"Benzene (C6H6) — C2H2"},"C":{"text":"Acetic acid (C2H4O2) — C2H2O"},"D":{"text":"Ethane (C2H6) — CH3"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Empirical and Molecular Formula","difficulty":"medium","source":"practice"},
{"questionText":"If the empirical formula mass equals the molecular mass of a compound, the value of n (molecular formula = n × empirical formula) is:","options":{"A":{"text":"1"},"B":{"text":"2"},"C":{"text":"0"},"D":{"text":"Cannot be determined"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Empirical and Molecular Formula","difficulty":"medium","source":"practice"},
{"questionText":"2 g of a gas occupies 1.12 L at STP. The molar mass of the gas is:","options":{"A":{"text":"40 g/mol"},"B":{"text":"20 g/mol"},"C":{"text":"44.8 g/mol"},"D":{"text":"22.4 g/mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"hard","source":"practice"},
{"questionText":"6.022 × 10^22 molecules of a substance correspond to how many moles?","options":{"A":{"text":"0.1 mol"},"B":{"text":"1 mol"},"C":{"text":"10 mol"},"D":{"text":"0.01 mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"easy","source":"practice"},
{"questionText":"The mole fraction of solute in a solution containing 2 mol of solute and 8 mol of solvent is:","options":{"A":{"text":"0.2"},"B":{"text":"0.8"},"C":{"text":"2"},"D":{"text":"0.25"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following statements about the law of conservation of mass is correct in the context of nuclear reactions?","options":{"A":{"text":"It does not strictly hold, since a measurable amount of mass converts to energy"},"B":{"text":"It holds exactly, as in ordinary chemical reactions"},"C":{"text":"It applies only to reactions involving gases"},"D":{"text":"It was disproved by Lavoisier's experiments"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Laws of Chemical Combination","difficulty":"hard","source":"practice"},
{"questionText":"Antoine Lavoisier's quantitative experiments on combustion were significant chiefly because they established:","options":{"A":{"text":"The law of conservation of mass through careful weighing of reactants and products"},"B":{"text":"The existence of atoms"},"C":{"text":"Avogadro's number"},"D":{"text":"The concept of molar mass"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Laws of Chemical Combination","difficulty":"medium","source":"practice"},
{"questionText":"A solution is said to be dilute when it contains:","options":{"A":{"text":"A relatively small amount of solute compared to the solvent"},"B":{"text":"A relatively large amount of solute compared to the solvent"},"C":{"text":"Equal amounts of solute and solvent"},"D":{"text":"No solvent at all"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is the correct unit for molar concentration (molarity)?","options":{"A":{"text":"mol/L (or mol dm^-3)"},"B":{"text":"mol/kg"},"C":{"text":"g/L"},"D":{"text":"mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Concentration Terms","difficulty":"easy","source":"practice"},
{"questionText":"For the balanced equation 2H2 + O2 → 2H2O, the number of moles of O2 needed to completely react with 5 moles of H2 is:","options":{"A":{"text":"2.5 mol"},"B":{"text":"5 mol"},"C":{"text":"10 mol"},"D":{"text":"1.25 mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"medium","source":"practice"},
{"questionText":"For the balanced equation 2H2 + O2 → 2H2O, the mass of water produced from 4 g of H2 (molar mass 2 g/mol) reacting with excess oxygen is:","options":{"A":{"text":"36 g"},"B":{"text":"18 g"},"C":{"text":"72 g"},"D":{"text":"9 g"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"medium","source":"practice"},
{"questionText":"When the actual yield of a reaction is less than the theoretical yield, the most likely reason is:","options":{"A":{"text":"Side reactions, incomplete reactions, or loss of product during handling"},"B":{"text":"The limiting reagent was in excess"},"C":{"text":"The law of conservation of mass was violated"},"D":{"text":"Too much catalyst was used"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Stoichiometry","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following best describes the relationship between an atom and a molecule?","options":{"A":{"text":"A molecule is formed by the combination of two or more atoms held together by chemical bonds"},"B":{"text":"An atom is always larger than a molecule"},"C":{"text":"A molecule can never contain atoms of the same element"},"D":{"text":"An atom is a combination of two or more molecules"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Dalton's Atomic Theory","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is the correct SI base unit for mass?","options":{"A":{"text":"Kilogram"},"B":{"text":"Gram"},"C":{"text":"Pound"},"D":{"text":"Tonne"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"SI Units in Chemistry","difficulty":"easy","source":"practice"},
{"questionText":"The number of moles of ions produced when 1 mole of Na2SO4 dissolves completely in water is:","options":{"A":{"text":"3 mol (2 mol Na+ and 1 mol SO4^2-)"},"B":{"text":"2 mol"},"C":{"text":"1 mol"},"D":{"text":"4 mol"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Mole Concept","difficulty":"medium","source":"practice"},
{"questionText":"A compound contains 40% carbon, 6.7% hydrogen and 53.3% oxygen by mass. Its empirical formula is:","options":{"A":{"text":"CH2O"},"B":{"text":"C2H4O2"},"C":{"text":"CHO"},"D":{"text":"C2H6O"}},"correctAnswer":"A","subject":"chemistry","chapter":"Some Basic Concepts of Chemistry","topic":"Empirical and Molecular Formula","difficulty":"hard","source":"practice"}
]
[
{"questionText":"Mendel's Law of Dominance states that in a heterozygote, the allele that expresses itself is called:","options":{"A":{"text":"Dominant, while the one that does not express is called recessive"},"B":{"text":"Codominant"},"C":{"text":"Epistatic only"},"D":{"text":"Recessive"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"The Law of Segregation states that the two alleles of a gene:","options":{"A":{"text":"Do not blend and separate from each other during gamete formation"},"B":{"text":"Always blend to form an intermediate phenotype"},"C":{"text":"Assort independently of other gene pairs during gamete formation"},"D":{"text":"Are always dominant"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"The Law of Independent Assortment applies to:","options":{"A":{"text":"Two or more pairs of genes located on different chromosomes (or far apart on the same chromosome)"},"B":{"text":"A single pair of alleles"},"C":{"text":"Genes that are tightly linked on the same chromosome"},"D":{"text":"Only sex-linked genes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"In a monohybrid cross between a homozygous tall (TT) and a homozygous dwarf (tt) pea plant, the phenotypic ratio in the F2 generation is:","options":{"A":{"text":"3 Tall : 1 Dwarf"},"B":{"text":"1 Tall : 1 Dwarf"},"C":{"text":"1 Tall : 2 Tall : 1 Dwarf"},"D":{"text":"9 Tall : 3 Dwarf : 4 other"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"In a monohybrid cross, the genotypic ratio observed in the F2 generation is:","options":{"A":{"text":"1 : 2 : 1"},"B":{"text":"3 : 1"},"C":{"text":"9 : 3 : 3 : 1"},"D":{"text":"1 : 1"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"A dihybrid cross between two heterozygous individuals (e.g. YyRr × YyRr) produces an F2 phenotypic ratio of:","options":{"A":{"text":"9:3:3:1"},"B":{"text":"1:1:1:1"},"C":{"text":"3:1"},"D":{"text":"1:2:1"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"A test cross is performed by crossing an individual of unknown genotype with:","options":{"A":{"text":"A homozygous recessive individual"},"B":{"text":"A homozygous dominant individual"},"C":{"text":"Another individual of unknown genotype"},"D":{"text":"An F1 hybrid"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"The purpose of a test cross is to determine:","options":{"A":{"text":"Whether an individual showing a dominant phenotype is homozygous or heterozygous"},"B":{"text":"The exact chromosome number of an organism"},"C":{"text":"The sex of the offspring"},"D":{"text":"The mutation rate of a gene"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"A back cross is a cross between an F1 hybrid and:","options":{"A":{"text":"Either of its parents"},"B":{"text":"An unrelated individual"},"C":{"text":"Its own sibling only"},"D":{"text":"A homozygous recessive individual exclusively"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"Mendel chose the garden pea (Pisum sativum) for his experiments primarily because it:","options":{"A":{"text":"Had several easily distinguishable contrasting traits and could be easily cross-pollinated or self-pollinated"},"B":{"text":"Had a very short life cycle of a few days"},"C":{"text":"Produced only asexual offspring"},"D":{"text":"Had a haploid chromosome number of 1"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Incomplete dominance is best illustrated by flower colour inheritance in:","options":{"A":{"text":"Mirabilis jalapa (four o'clock plant), where red × white gives pink"},"B":{"text":"Pisum sativum, where tall × dwarf gives tall"},"C":{"text":"Drosophila eye colour"},"D":{"text":"Human ABO blood grouping"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"easy","source":"practice"},
{"questionText":"In incomplete dominance, the F1 heterozygote shows:","options":{"A":{"text":"An intermediate phenotype between the two parents"},"B":{"text":"The phenotype of one parent completely"},"C":{"text":"Both parental phenotypes simultaneously"},"D":{"text":"A phenotype unrelated to either parent"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"easy","source":"practice"},
{"questionText":"Codominance differs from incomplete dominance in that in codominance:","options":{"A":{"text":"Both alleles are fully and simultaneously expressed in the heterozygote's phenotype"},"B":{"text":"The heterozygote shows a blended intermediate phenotype"},"C":{"text":"Only one allele is ever expressed"},"D":{"text":"The alleles are located on different chromosomes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"The classic example of codominance in humans is:","options":{"A":{"text":"The AB blood group, where both A and B antigens are expressed"},"B":{"text":"Sickle cell anaemia"},"C":{"text":"Colour blindness"},"D":{"text":"Haemophilia"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"easy","source":"practice"},
{"questionText":"The ABO blood group system in humans is controlled by a single gene with how many alleles?","options":{"A":{"text":"Three (IA, IB, i), an example of multiple allelism"},"B":{"text":"Two"},"C":{"text":"Four"},"D":{"text":"One"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"In the ABO blood group system, the alleles IA and IB are both dominant over allele i, and this relationship between IA and IB is best described as:","options":{"A":{"text":"Codominant to each other"},"B":{"text":"Incompletely dominant to each other"},"C":{"text":"Both fully recessive"},"D":{"text":"Epistatic to i"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"A person with blood group O has the genotype:","options":{"A":{"text":"ii"},"B":{"text":"IAIA"},"C":{"text":"IAi"},"D":{"text":"IAIB"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"easy","source":"practice"},
{"questionText":"Pleiotropy refers to a phenomenon where:","options":{"A":{"text":"A single gene influences multiple, apparently unrelated phenotypic traits"},"B":{"text":"Multiple genes influence a single trait"},"C":{"text":"Two alleles of a gene blend to give an intermediate phenotype"},"D":{"text":"A gene is expressed only in one sex"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"Phenylketonuria in humans is often cited as an example of pleiotropy because the single defective gene affects:","options":{"A":{"text":"Both phenylalanine metabolism and, if untreated, mental development"},"B":{"text":"Only hair colour"},"C":{"text":"Only blood clotting"},"D":{"text":"Only eye colour"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"Polygenic inheritance, such as that of human skin colour, is characterised by:","options":{"A":{"text":"Cumulative contribution of multiple genes producing a continuous range of phenotypes"},"B":{"text":"A single gene with two clear-cut phenotypes"},"C":{"text":"Complete dominance of one allele over all others"},"D":{"text":"Expression restricted to one sex only"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"The chromosomal theory of inheritance was proposed by:","options":{"A":{"text":"Sutton and Boveri"},"B":{"text":"Mendel"},"C":{"text":"Morgan and Bridges alone"},"D":{"text":"Watson and Crick"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Theory of Inheritance","difficulty":"medium","source":"practice"},
{"questionText":"The chromosomal theory of inheritance states that:","options":{"A":{"text":"Genes are located on chromosomes, whose behaviour during meiosis parallels the behaviour of Mendelian factors"},"B":{"text":"Genes are located in the cytoplasm outside chromosomes"},"C":{"text":"Chromosome number is unrelated to inheritance patterns"},"D":{"text":"Only sex chromosomes carry genes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Theory of Inheritance","difficulty":"medium","source":"practice"},
{"questionText":"Thomas Hunt Morgan's experiments that provided the first strong evidence for the chromosomal theory of inheritance were conducted on:","options":{"A":{"text":"Drosophila melanogaster (fruit fly)"},"B":{"text":"Pisum sativum (garden pea)"},"C":{"text":"Escherichia coli"},"D":{"text":"Homo sapiens"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Theory of Inheritance","difficulty":"easy","source":"practice"},
{"questionText":"Linkage refers to the phenomenon where:","options":{"A":{"text":"Genes located close together on the same chromosome tend to be inherited together"},"B":{"text":"Genes on different chromosomes assort independently"},"C":{"text":"Two alleles of a gene blend during inheritance"},"D":{"text":"A gene mutates at a high frequency"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Linkage and Recombination","difficulty":"medium","source":"practice"},
{"questionText":"Recombination frequency between two linked genes is used to:","options":{"A":{"text":"Estimate the relative distance between the genes on a chromosome"},"B":{"text":"Determine the exact molecular sequence of a gene"},"C":{"text":"Predict the dominant allele directly"},"D":{"text":"Measure the mutation rate of the organism"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Linkage and Recombination","difficulty":"medium","source":"practice"},
{"questionText":"Genes that are very close together on a chromosome show:","options":{"A":{"text":"Lower recombination frequency and are said to be tightly linked"},"B":{"text":"Higher recombination frequency"},"C":{"text":"Independent assortment"},"D":{"text":"No inheritance pattern at all"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Linkage and Recombination","difficulty":"medium","source":"practice"},
{"questionText":"In Morgan's experiments with Drosophila, the genes for body colour and wing size, when present together on the X chromosome, showed:","options":{"A":{"text":"Linkage, since parental combinations were inherited together more often than recombinants"},"B":{"text":"Complete independent assortment"},"C":{"text":"Codominance"},"D":{"text":"Multiple allelism"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Linkage and Recombination","difficulty":"hard","source":"practice"},
{"questionText":"In humans, the sex chromosome pattern for males and females respectively is:","options":{"A":{"text":"XY and XX"},"B":{"text":"XX and XY"},"C":{"text":"XO and XX"},"D":{"text":"ZW and ZZ"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Sex Determination","difficulty":"easy","source":"practice"},
{"questionText":"In birds, the sex chromosome pattern is such that the female is:","options":{"A":{"text":"ZW (heterogametic), while the male is ZZ"},"B":{"text":"XX, while the male is XY"},"C":{"text":"XO, while the male is XX"},"D":{"text":"ZZ, while the male is ZW"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Sex Determination","difficulty":"medium","source":"practice"},
{"questionText":"In grasshoppers, sex determination follows the XO type, in which males have:","options":{"A":{"text":"A single X chromosome and no second sex chromosome"},"B":{"text":"Two X chromosomes"},"C":{"text":"One X and one Y chromosome"},"D":{"text":"Two Y chromosomes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Sex Determination","difficulty":"medium","source":"practice"},
{"questionText":"In honeybees, sex determination is based on:","options":{"A":{"text":"Ploidy — fertilized (diploid) eggs develop into females and unfertilized (haploid) eggs into males (haplodiploidy)"},"B":{"text":"Presence of a Y chromosome"},"C":{"text":"Presence of a W chromosome"},"D":{"text":"Temperature of egg incubation"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Sex Determination","difficulty":"hard","source":"practice"},
{"questionText":"In humans, the sex of the offspring is determined by the sex chromosome contributed by:","options":{"A":{"text":"The father, since the mother always contributes an X chromosome"},"B":{"text":"The mother alone"},"C":{"text":"Both parents equally in every case"},"D":{"text":"Neither parent; it is determined randomly after fertilisation"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Sex Determination","difficulty":"easy","source":"practice"},
{"questionText":"A mutation is defined as:","options":{"A":{"text":"A sudden heritable change in the sequence of DNA (genetic material)"},"B":{"text":"A temporary, non-heritable change in phenotype"},"C":{"text":"A change in the number of offspring produced"},"D":{"text":"The blending of two alleles"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mutation","difficulty":"easy","source":"practice"},
{"questionText":"Sickle cell anaemia is caused by:","options":{"A":{"text":"A point mutation causing substitution of glutamic acid by valine in the beta-globin chain"},"B":{"text":"A deletion of an entire chromosome"},"C":{"text":"Non-disjunction of chromosome 21"},"D":{"text":"A frameshift mutation adding extra base pairs"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Sickle cell anaemia is inherited as:","options":{"A":{"text":"An autosomal recessive trait"},"B":{"text":"An autosomal dominant trait"},"C":{"text":"An X-linked recessive trait"},"D":{"text":"A Y-linked trait"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"A point mutation involves a change in:","options":{"A":{"text":"A single base pair in the DNA sequence"},"B":{"text":"An entire chromosome"},"C":{"text":"The total number of chromosomes"},"D":{"text":"The centromere position only"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mutation","difficulty":"easy","source":"practice"}
][
{"questionText":"Haemophilia is inherited as a:","options":{"A":{"text":"Sex-linked (X-linked) recessive trait"},"B":{"text":"Autosomal dominant trait"},"C":{"text":"Autosomal recessive trait"},"D":{"text":"Y-linked trait"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"easy","source":"practice"},
{"questionText":"Haemophilia is commonly called 'bleeder's disease' because affected individuals show:","options":{"A":{"text":"Delayed or absent blood clotting after an injury"},"B":{"text":"Excessive red blood cell production"},"C":{"text":"Abnormal haemoglobin shape"},"D":{"text":"Reduced white blood cell count"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"easy","source":"practice"},
{"questionText":"A carrier female for haemophilia (XHXh) marries a normal male (XHY). The probability that a son will be haemophilic is:","options":{"A":{"text":"1/2 (50%)"},"B":{"text":"1/4 (25%)"},"C":{"text":"1 (100%)"},"D":{"text":"0"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Haemophilia was historically prevalent in European royal families and is often traced back to:","options":{"A":{"text":"Queen Victoria, who was a carrier"},"B":{"text":"Queen Elizabeth I"},"C":{"text":"King Henry VIII"},"D":{"text":"Tsar Nicholas I"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Colour blindness (red-green) in humans is inherited as a:","options":{"A":{"text":"Sex-linked (X-linked) recessive trait"},"B":{"text":"Autosomal dominant trait"},"C":{"text":"Autosomal recessive trait"},"D":{"text":"Y-linked trait"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"easy","source":"practice"},
{"questionText":"Colour blindness is more common in men than in women mainly because:","options":{"A":{"text":"Men have only one X chromosome, so a single recessive allele is enough to show the trait"},"B":{"text":"The gene is located on the Y chromosome"},"C":{"text":"Women are naturally immune to the condition"},"D":{"text":"The trait is autosomal dominant in men only"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Thalassemia is caused by:","options":{"A":{"text":"Reduced or absent synthesis of one of the globin chains of haemoglobin"},"B":{"text":"A single amino acid substitution changing haemoglobin shape"},"C":{"text":"Non-disjunction of an autosome"},"D":{"text":"A viral infection affecting red blood cells"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Thalassemia is inherited as an:","options":{"A":{"text":"Autosomal recessive quantitative disorder"},"B":{"text":"X-linked recessive disorder"},"C":{"text":"Autosomal dominant disorder"},"D":{"text":"Y-linked disorder"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Alpha thalassemia is controlled by defects in genes located on chromosome:","options":{"A":{"text":"16"},"B":{"text":"11"},"C":{"text":"21"},"D":{"text":"1"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"hard","source":"practice"},
{"questionText":"Beta thalassemia is controlled by a single gene located on chromosome:","options":{"A":{"text":"11"},"B":{"text":"16"},"C":{"text":"21"},"D":{"text":"9"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"hard","source":"practice"},
{"questionText":"Phenylketonuria is a metabolic genetic disorder caused by deficiency of the enzyme:","options":{"A":{"text":"Phenylalanine hydroxylase"},"B":{"text":"Tyrosinase"},"C":{"text":"Amylase"},"D":{"text":"Hexosaminidase A"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"In phenylketonuria, the deficiency of the relevant enzyme leads to accumulation of phenylalanine and its derivatives, which can cause:","options":{"A":{"text":"Mental retardation, if the condition is left untreated"},"B":{"text":"Excessive blood clotting"},"C":{"text":"Abnormal haemoglobin structure"},"D":{"text":"Colour blindness"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Down syndrome is caused by:","options":{"A":{"text":"Trisomy of chromosome 21 (an extra copy of chromosome 21)"},"B":{"text":"Monosomy of chromosome 21"},"C":{"text":"An extra X chromosome in males"},"D":{"text":"Loss of one X chromosome in females"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"easy","source":"practice"},
{"questionText":"Down syndrome typically arises due to:","options":{"A":{"text":"Non-disjunction of chromosome 21 during gamete formation"},"B":{"text":"A point mutation in a single gene"},"C":{"text":"Loss of the Y chromosome"},"D":{"text":"Deletion of chromosome 5"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Klinefelter's syndrome in humans is characterised by the karyotype:","options":{"A":{"text":"47, XXY"},"B":{"text":"45, XO"},"C":{"text":"47, XYY"},"D":{"text":"46, XY"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Individuals with Klinefelter's syndrome are typically:","options":{"A":{"text":"Phenotypically male but with feminised features such as gynaecomastia, due to an extra X chromosome"},"B":{"text":"Phenotypically female with short stature"},"C":{"text":"Sterile females with a webbed neck"},"D":{"text":"Unaffected in appearance and fertility"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Turner's syndrome in humans is characterised by the karyotype:","options":{"A":{"text":"45, XO"},"B":{"text":"47, XXY"},"C":{"text":"47, XXX"},"D":{"text":"46, XY"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Individuals with Turner's syndrome typically show:","options":{"A":{"text":"A single X chromosome, short stature, webbed neck, and underdeveloped ovaries, leading to sterility"},"B":{"text":"An extra Y chromosome and increased height"},"C":{"text":"Trisomy of chromosome 21"},"D":{"text":"Normal fertility with 46 chromosomes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Non-disjunction refers to the failure of:","options":{"A":{"text":"Homologous chromosomes or sister chromatids to separate properly during cell division"},"B":{"text":"DNA replication to occur"},"C":{"text":"Crossing over during prophase I"},"D":{"text":"Fertilisation between gametes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Down syndrome individuals typically have a chromosome count of:","options":{"A":{"text":"47"},"B":{"text":"46"},"C":{"text":"45"},"D":{"text":"48"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"easy","source":"practice"},
{"questionText":"A pedigree chart is a tool used to:","options":{"A":{"text":"Trace the inheritance of a specific trait through several generations of a family"},"B":{"text":"Determine the exact DNA sequence of a gene"},"C":{"text":"Measure the mutation rate in a population"},"D":{"text":"Count the number of chromosomes in a cell"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Pedigree Analysis","difficulty":"easy","source":"practice"},
{"questionText":"In a standard pedigree chart, a filled (shaded) symbol usually represents:","options":{"A":{"text":"An individual affected by the trait being studied"},"B":{"text":"An unaffected individual"},"C":{"text":"A deceased individual regardless of trait status"},"D":{"text":"A carrier who always shows the trait"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Pedigree Analysis","difficulty":"easy","source":"practice"},
{"questionText":"In pedigree analysis, a trait that appears only in males across generations and is passed from an affected father to all daughters (who are carriers) but not sons, is most likely:","options":{"A":{"text":"X-linked recessive"},"B":{"text":"Y-linked"},"C":{"text":"Autosomal dominant"},"D":{"text":"Mitochondrial"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Pedigree Analysis","difficulty":"hard","source":"practice"},
{"questionText":"An autosomal dominant trait in a pedigree is typically recognised because it:","options":{"A":{"text":"Appears in every generation and affected individuals usually have at least one affected parent"},"B":{"text":"Skips generations and appears only in offspring of unaffected carrier parents"},"C":{"text":"Is seen only in males"},"D":{"text":"Is always lethal before reproductive age"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Pedigree Analysis","difficulty":"medium","source":"practice"},
{"questionText":"An autosomal recessive trait in a pedigree is typically recognised because it:","options":{"A":{"text":"Can appear in offspring of two unaffected carrier parents, often skipping generations"},"B":{"text":"Appears in every generation without skipping"},"C":{"text":"Is transmitted only from father to son"},"D":{"text":"Affects only females"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Pedigree Analysis","difficulty":"medium","source":"practice"},
{"questionText":"In a dihybrid cross YyRr × YyRr (yellow round dominant), the phenotypic class 'yellow wrinkled' appears in the F2 generation in what proportion?","options":{"A":{"text":"3/16"},"B":{"text":"9/16"},"C":{"text":"1/16"},"D":{"text":"6/16"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"If a heterozygous tall pea plant (Tt) is crossed with a homozygous dwarf plant (tt), the expected phenotypic ratio of offspring is:","options":{"A":{"text":"1 Tall : 1 Dwarf"},"B":{"text":"3 Tall : 1 Dwarf"},"C":{"text":"All tall"},"D":{"text":"All dwarf"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Mendel's factors, later called genes, are now known to be located on:","options":{"A":{"text":"Chromosomes, at specific loci"},"B":{"text":"The cell membrane"},"C":{"text":"Ribosomes exclusively"},"D":{"text":"Mitochondria only"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Theory of Inheritance","difficulty":"easy","source":"practice"},
{"questionText":"Alleles are defined as:","options":{"A":{"text":"Alternative forms of the same gene occupying the same locus on homologous chromosomes"},"B":{"text":"Different genes on different chromosomes"},"C":{"text":"The physical location of a gene on a chromosome"},"D":{"text":"Segments of RNA that regulate gene expression"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"A homozygous individual for a given gene has:","options":{"A":{"text":"Two identical alleles of that gene"},"B":{"text":"Two different alleles of that gene"},"C":{"text":"Only one allele present in the cell"},"D":{"text":"Three or more alleles of that gene"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Genotype refers to:","options":{"A":{"text":"The genetic constitution of an organism"},"B":{"text":"The observable physical appearance of an organism"},"C":{"text":"The environment in which an organism lives"},"D":{"text":"The behaviour pattern of an organism"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Phenotype refers to:","options":{"A":{"text":"The observable physical or biochemical characteristics of an organism, resulting from genotype and environment"},"B":{"text":"Only the genetic makeup of an organism"},"C":{"text":"The number of chromosomes an organism has"},"D":{"text":"The sequence of DNA bases only"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Epistasis refers to a phenomenon in which:","options":{"A":{"text":"A gene at one locus masks or suppresses the expression of a gene at another locus"},"B":{"text":"Two alleles of the same gene are both expressed"},"C":{"text":"A single gene affects only one trait"},"D":{"text":"Genes assort independently"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"hard","source":"practice"}
][
{"questionText":"A chromosomal aberration in which a segment of a chromosome is lost is called:","options":{"A":{"text":"Deletion"},"B":{"text":"Duplication"},"C":{"text":"Inversion"},"D":{"text":"Translocation"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mutation","difficulty":"medium","source":"practice"},
{"questionText":"A chromosomal aberration in which a segment of a chromosome is repeated is called:","options":{"A":{"text":"Duplication"},"B":{"text":"Deletion"},"C":{"text":"Inversion"},"D":{"text":"Non-disjunction"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mutation","difficulty":"medium","source":"practice"},
{"questionText":"A chromosomal aberration in which a segment breaks off and reattaches in the reverse orientation is called:","options":{"A":{"text":"Inversion"},"B":{"text":"Duplication"},"C":{"text":"Translocation"},"D":{"text":"Deletion"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mutation","difficulty":"medium","source":"practice"},
{"questionText":"A chromosomal aberration in which a segment of one chromosome gets attached to a non-homologous chromosome is called:","options":{"A":{"text":"Translocation"},"B":{"text":"Inversion"},"C":{"text":"Duplication"},"D":{"text":"Deletion"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mutation","difficulty":"medium","source":"practice"},
{"questionText":"Aneuploidy refers to a change in chromosome number involving:","options":{"A":{"text":"Gain or loss of one or a few individual chromosomes"},"B":{"text":"An entire extra set of chromosomes"},"C":{"text":"Only the sex chromosomes"},"D":{"text":"A single base pair substitution"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"Polyploidy refers to a condition in which an organism has:","options":{"A":{"text":"More than two complete sets of chromosomes"},"B":{"text":"One chromosome missing from a homologous pair"},"C":{"text":"An extra single chromosome"},"D":{"text":"Exactly two sets of chromosomes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Chromosomal Disorders","difficulty":"medium","source":"practice"},
{"questionText":"A cross between two heterozygous tall pea plants (Tt × Tt) gives rise to how many tall plants (phenotypically) out of every 4 offspring, on average?","options":{"A":{"text":"3"},"B":{"text":"2"},"C":{"text":"1"},"D":{"text":"4"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Mendel's principles were rediscovered independently in 1900 by:","options":{"A":{"text":"Hugo de Vries, Carl Correns and Erich von Tschermak"},"B":{"text":"Watson and Crick"},"C":{"text":"Sutton and Boveri"},"D":{"text":"Morgan and Sturtevant"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"In a dihybrid test cross (YyRr × yyrr), the expected phenotypic ratio of offspring is:","options":{"A":{"text":"1:1:1:1"},"B":{"text":"9:3:3:1"},"C":{"text":"3:1"},"D":{"text":"1:2:1"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"If both parents are carriers (heterozygous) for an autosomal recessive disorder, the probability that a child will be affected is:","options":{"A":{"text":"25%"},"B":{"text":"50%"},"C":{"text":"75%"},"D":{"text":"100%"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Pedigree Analysis","difficulty":"medium","source":"practice"},
{"questionText":"If one parent is affected (homozygous) with an autosomal dominant disorder and the other is unaffected, the probability that a child will be affected is typically:","options":{"A":{"text":"100%, since the affected parent passes on the dominant allele to every offspring"},"B":{"text":"50%"},"C":{"text":"25%"},"D":{"text":"0%"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Pedigree Analysis","difficulty":"medium","source":"practice"},
{"questionText":"Which of the following is an example of an autosomal dominant disorder in humans?","options":{"A":{"text":"Myotonic dystrophy"},"B":{"text":"Haemophilia"},"C":{"text":"Colour blindness"},"D":{"text":"Sickle cell anaemia"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Disorders","difficulty":"hard","source":"practice"},
{"questionText":"Multiple alleles refers to a situation where a single gene locus has:","options":{"A":{"text":"More than two allelic forms within a population, though an individual carries only two"},"B":{"text":"Only two allelic forms"},"C":{"text":"No allelic variation at all"},"D":{"text":"Alleles located on different chromosomes"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"In Mirabilis jalapa, a cross between a red-flowered (RR) and white-flowered (rr) plant gives F1 plants that are:","options":{"A":{"text":"Pink, due to incomplete dominance"},"B":{"text":"All red"},"C":{"text":"All white"},"D":{"text":"Red and white in a 1:1 ratio"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"easy","source":"practice"},
{"questionText":"Selfing the F1 pink flowers of Mirabilis jalapa produces an F2 phenotypic ratio of:","options":{"A":{"text":"1 Red : 2 Pink : 1 White"},"B":{"text":"3 Red : 1 White"},"C":{"text":"All pink"},"D":{"text":"1 Red : 1 White"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"Which scientist first coined the terms 'genetics', 'gene', and related terminology used in modern inheritance studies?","options":{"A":{"text":"William Bateson coined 'genetics'; Wilhelm Johannsen coined 'gene', 'genotype' and 'phenotype'"},"B":{"text":"Gregor Mendel coined all modern genetic terminology"},"C":{"text":"Thomas Morgan coined 'gene' and 'genetics'"},"D":{"text":"Watson and Crick coined these terms"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"hard","source":"practice"},
{"questionText":"A cross between a plant heterozygous for two genes (YyRr) and a plant homozygous recessive for both genes (yyrr) is called a:","options":{"A":{"text":"Dihybrid test cross"},"B":{"text":"Monohybrid cross"},"C":{"text":"Reciprocal cross"},"D":{"text":"Back cross to the dominant parent"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"A reciprocal cross is one in which:","options":{"A":{"text":"The sex of the parents carrying a particular trait is reversed compared to the original cross"},"B":{"text":"An F1 hybrid is crossed back to a parent"},"C":{"text":"Two unrelated species are crossed"},"D":{"text":"Only self-pollination is carried out"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"A trihybrid cross between two triple heterozygotes (AaBbCc × AaBbCc) produces a total of how many phenotypic classes, assuming complete dominance at each locus?","options":{"A":{"text":"8"},"B":{"text":"4"},"C":{"text":"16"},"D":{"text":"64"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"hard","source":"practice"},
{"questionText":"In a cross between AaBb × AaBb (independent assortment, complete dominance), the fraction of offspring expected to be homozygous recessive for both traits (aabb) is:","options":{"A":{"text":"1/16"},"B":{"text":"1/4"},"C":{"text":"3/16"},"D":{"text":"9/16"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"A woman with blood group O marries a man with blood group AB. Which blood groups are possible in their children?","options":{"A":{"text":"A or B only"},"B":{"text":"AB or O only"},"C":{"text":"Only O"},"D":{"text":"A, B, AB or O all possible"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"hard","source":"practice"},
{"questionText":"Rh factor incompatibility between an Rh-negative mother and an Rh-positive fetus can lead to a condition in subsequent pregnancies called:","options":{"A":{"text":"Erythroblastosis fetalis (haemolytic disease of the newborn)"},"B":{"text":"Down syndrome"},"C":{"text":"Klinefelter's syndrome"},"D":{"text":"Sickle cell anaemia"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"medium","source":"practice"},
{"questionText":"A person who is Rh negative lacks which antigen on the surface of red blood cells?","options":{"A":{"text":"The Rh (D) antigen"},"B":{"text":"The A antigen"},"C":{"text":"The B antigen"},"D":{"text":"The O antigen"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Deviations from Mendelism","difficulty":"easy","source":"practice"},
{"questionText":"The term 'variation' in the context of genetics refers to:","options":{"A":{"text":"Differences in traits among individuals of the same species"},"B":{"text":"The complete uniformity of traits within a species"},"C":{"text":"Only differences caused by mutation"},"D":{"text":"Only differences caused by environment"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is a major source of heritable variation in sexually reproducing organisms?","options":{"A":{"text":"Crossing over and independent assortment during meiosis"},"B":{"text":"Mitosis in somatic cells"},"C":{"text":"DNA replication with perfect fidelity"},"D":{"text":"Binary fission"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"medium","source":"practice"},
{"questionText":"Crossing over occurs during which stage of meiosis?","options":{"A":{"text":"Pachytene of prophase I"},"B":{"text":"Metaphase II"},"C":{"text":"Anaphase I"},"D":{"text":"Telophase II"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Linkage and Recombination","difficulty":"medium","source":"practice"},
{"questionText":"The structure at which crossing over takes place between homologous chromosomes is called a:","options":{"A":{"text":"Chiasma"},"B":{"text":"Centromere"},"C":{"text":"Telomere"},"D":{"text":"Nucleosome"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Linkage and Recombination","difficulty":"medium","source":"practice"},
{"questionText":"Sex-linked genes are located on:","options":{"A":{"text":"The X or Y chromosome"},"B":{"text":"Autosomes only"},"C":{"text":"Mitochondrial DNA only"},"D":{"text":"Ribosomal RNA"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Sex Determination","difficulty":"easy","source":"practice"}
][
{"questionText":"A dominant allele is one that:","options":{"A":{"text":"Expresses its phenotypic effect even in the heterozygous condition"},"B":{"text":"Expresses its effect only in the homozygous condition"},"C":{"text":"Never expresses in the phenotype"},"D":{"text":"Is always lethal"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"A recessive allele expresses its phenotypic effect only when:","options":{"A":{"text":"Present in the homozygous condition (two copies)"},"B":{"text":"Present in the heterozygous condition"},"C":{"text":"Present on the Y chromosome"},"D":{"text":"Paired with a dominant allele"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Mendel's F1 generation, obtained by crossing two true-breeding (homozygous) parents differing in one trait, is:","options":{"A":{"text":"Always heterozygous and uniform in phenotype"},"B":{"text":"Always homozygous"},"C":{"text":"Highly variable in phenotype"},"D":{"text":"Identical to the F2 generation"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"A Punnett square is a tool used to:","options":{"A":{"text":"Predict the possible genotypic and phenotypic combinations of offspring from a given cross"},"B":{"text":"Sequence a gene"},"C":{"text":"Measure recombination frequency directly"},"D":{"text":"Determine the exact number of chromosomes in a species"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"},
{"questionText":"Wilhelm Johannsen, in 1909, introduced which set of terms still used in genetics today?","options":{"A":{"text":"Gene, genotype, and phenotype"},"B":{"text":"Dominant and recessive"},"C":{"text":"Chromosome and centromere"},"D":{"text":"Allele and locus"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"hard","source":"practice"},
{"questionText":"The term 'locus' in genetics refers to:","options":{"A":{"text":"The specific physical location of a gene on a chromosome"},"B":{"text":"An alternative form of a gene"},"C":{"text":"The complete set of genes in an organism"},"D":{"text":"A type of chromosomal mutation"}},"correctAnswer":"A","subject":"biology","chapter":"Principles of Inheritance and Variation","topic":"Mendelian Genetics","difficulty":"easy","source":"practice"}
][
{"questionText":"The experiment that first demonstrated DNA (and not protein) as the genetic material in bacteriophages was performed by:","options":{"A":{"text":"Hershey and Chase"},"B":{"text":"Griffith"},"C":{"text":"Avery, MacLeod and McCarty"},"D":{"text":"Watson and Crick"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Search for Genetic Material","difficulty":"easy","source":"practice"},
{"questionText":"In the Hershey-Chase experiment, radioactive sulphur (35S) and phosphorus (32P) were used to label:","options":{"A":{"text":"Protein coat and DNA of the bacteriophage respectively"},"B":{"text":"DNA and RNA of the bacteriophage respectively"},"C":{"text":"The bacterial cell wall and cytoplasm respectively"},"D":{"text":"Only the DNA of the bacteriophage"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Search for Genetic Material","difficulty":"medium","source":"practice"},
{"questionText":"Griffith's transformation experiment with Streptococcus pneumoniae strains demonstrated that:","options":{"A":{"text":"A 'transforming principle' from heat-killed virulent bacteria could convert non-virulent bacteria into virulent ones"},"B":{"text":"DNA is composed of four types of nucleotides"},"C":{"text":"Protein is the genetic material"},"D":{"text":"RNA can act as an enzyme"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Search for Genetic Material","difficulty":"medium","source":"practice"},
{"questionText":"Avery, MacLeod and McCarty extended Griffith's work by showing that the 'transforming principle' was destroyed by DNase but not by protease or RNase, thereby proving:","options":{"A":{"text":"DNA is the genetic material"},"B":{"text":"RNA is the genetic material"},"C":{"text":"Protein is the genetic material"},"D":{"text":"Lipids carry genetic information"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Search for Genetic Material","difficulty":"medium","source":"practice"},
{"questionText":"A nucleotide is composed of:","options":{"A":{"text":"A nitrogenous base, a pentose sugar and a phosphate group"},"B":{"text":"Only a nitrogenous base and a sugar"},"C":{"text":"Only a phosphate group and a sugar"},"D":{"text":"Two nitrogenous bases joined together"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"easy","source":"practice"},
{"questionText":"The purine bases found in DNA are:","options":{"A":{"text":"Adenine and Guanine"},"B":{"text":"Cytosine and Thymine"},"C":{"text":"Adenine and Cytosine"},"D":{"text":"Guanine and Uracil"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"easy","source":"practice"},
{"questionText":"The pyrimidine bases found in DNA are:","options":{"A":{"text":"Cytosine and Thymine"},"B":{"text":"Adenine and Guanine"},"C":{"text":"Adenine and Thymine"},"D":{"text":"Guanine and Cytosine only"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"easy","source":"practice"},
{"questionText":"According to Chargaff's rule, in double-stranded DNA:","options":{"A":{"text":"The amount of adenine equals the amount of thymine, and the amount of guanine equals the amount of cytosine"},"B":{"text":"The amount of adenine equals the amount of guanine"},"C":{"text":"All four bases are present in exactly equal amounts"},"D":{"text":"Purines are always more abundant than pyrimidines"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"medium","source":"practice"},
{"questionText":"In the DNA double helix, adenine pairs with thymine via:","options":{"A":{"text":"Two hydrogen bonds"},"B":{"text":"Three hydrogen bonds"},"C":{"text":"One hydrogen bond"},"D":{"text":"No hydrogen bonds; they are covalently linked"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"medium","source":"practice"},
{"questionText":"In the DNA double helix, guanine pairs with cytosine via:","options":{"A":{"text":"Three hydrogen bonds"},"B":{"text":"Two hydrogen bonds"},"C":{"text":"Four hydrogen bonds"},"D":{"text":"One hydrogen bond"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"medium","source":"practice"},
{"questionText":"The double helix model of DNA structure was proposed by:","options":{"A":{"text":"James Watson and Francis Crick"},"B":{"text":"Rosalind Franklin and Maurice Wilkins"},"C":{"text":"Erwin Chargaff and Linus Pauling"},"D":{"text":"Hershey and Chase"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"easy","source":"practice"},
{"questionText":"The X-ray diffraction data crucial to determining the helical structure of DNA was obtained primarily by:","options":{"A":{"text":"Rosalind Franklin and Maurice Wilkins"},"B":{"text":"Watson and Crick"},"C":{"text":"Erwin Chargaff"},"D":{"text":"Meselson and Stahl"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"medium","source":"practice"},
{"questionText":"The two strands of the DNA double helix run in:","options":{"A":{"text":"Antiparallel directions"},"B":{"text":"The same (parallel) direction"},"C":{"text":"Perpendicular directions"},"D":{"text":"Random, unfixed orientations"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"easy","source":"practice"},
{"questionText":"The backbone of each DNA strand is formed by alternating:","options":{"A":{"text":"Sugar and phosphate groups linked by phosphodiester bonds"},"B":{"text":"Only nitrogenous bases"},"C":{"text":"Only phosphate groups"},"D":{"text":"Amino acids linked by peptide bonds"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"easy","source":"practice"},
{"questionText":"The sugar present in DNA is:","options":{"A":{"text":"Deoxyribose (a pentose sugar lacking an -OH at the 2' carbon)"},"B":{"text":"Ribose"},"C":{"text":"Glucose"},"D":{"text":"Fructose"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Structure","difficulty":"easy","source":"practice"},
{"questionText":"RNA differs from DNA in that RNA contains the sugar ribose and the base:","options":{"A":{"text":"Uracil instead of thymine"},"B":{"text":"Thymine instead of uracil"},"C":{"text":"Xanthine instead of guanine"},"D":{"text":"Hypoxanthine instead of adenine"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"easy","source":"practice"},
{"questionText":"Which of the following is generally a single-stranded molecule?","options":{"A":{"text":"RNA"},"B":{"text":"DNA (in its typical B-form)"},"C":{"text":"Chromatin"},"D":{"text":"A nucleosome"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"easy","source":"practice"},
{"questionText":"The three main types of RNA involved in protein synthesis are:","options":{"A":{"text":"mRNA, tRNA and rRNA"},"B":{"text":"mRNA, DNA and rRNA"},"C":{"text":"tRNA, snRNA and miRNA only"},"D":{"text":"rRNA, DNA polymerase and RNA polymerase"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"easy","source":"practice"},
{"questionText":"The function of messenger RNA (mRNA) is to:","options":{"A":{"text":"Carry the genetic code from DNA to the ribosome for protein synthesis"},"B":{"text":"Carry amino acids to the ribosome"},"C":{"text":"Form the structural and catalytic component of the ribosome"},"D":{"text":"Store genetic information permanently"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"easy","source":"practice"},
{"questionText":"The function of transfer RNA (tRNA) is to:","options":{"A":{"text":"Carry specific amino acids to the ribosome during translation"},"B":{"text":"Carry the genetic code from DNA to the ribosome"},"C":{"text":"Form the major structural component of chromosomes"},"D":{"text":"Catalyse DNA replication"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"easy","source":"practice"},
{"questionText":"The tRNA molecule has a characteristic secondary structure often described as:","options":{"A":{"text":"Cloverleaf structure"},"B":{"text":"Double helix"},"C":{"text":"Beta-pleated sheet"},"D":{"text":"Triple helix"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"medium","source":"practice"},
{"questionText":"The three-base sequence on tRNA that pairs with the codon on mRNA is called the:","options":{"A":{"text":"Anticodon"},"B":{"text":"Codon"},"C":{"text":"Operator"},"D":{"text":"Promoter"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"medium","source":"practice"},
{"questionText":"Ribosomal RNA (rRNA), together with ribosomal proteins, forms the:","options":{"A":{"text":"Structural and catalytic core of the ribosome"},"B":{"text":"Genetic material of the cell"},"C":{"text":"Nuclear envelope"},"D":{"text":"Cell wall"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"RNA","difficulty":"medium","source":"practice"},
{"questionText":"DNA is packaged into chromatin with the help of positively charged proteins called:","options":{"A":{"text":"Histones"},"B":{"text":"Tubulins"},"C":{"text":"Actins"},"D":{"text":"Keratins"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Packaging of DNA Helix","difficulty":"medium","source":"practice"},
{"questionText":"Histones are rich in which type of amino acids, allowing them to bind the negatively charged DNA?","options":{"A":{"text":"Basic amino acids such as lysine and arginine"},"B":{"text":"Acidic amino acids"},"C":{"text":"Sulphur-containing amino acids only"},"D":{"text":"Aromatic amino acids only"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Packaging of DNA Helix","difficulty":"medium","source":"practice"},
{"questionText":"A nucleosome consists of DNA wrapped around a core of:","options":{"A":{"text":"Eight histone molecules (a histone octamer)"},"B":{"text":"A single histone molecule"},"C":{"text":"Four ribosomal subunits"},"D":{"text":"Two DNA polymerase molecules"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Packaging of DNA Helix","difficulty":"medium","source":"practice"},
{"questionText":"Densely packed, transcriptionally inactive chromatin is called:","options":{"A":{"text":"Heterochromatin"},"B":{"text":"Euchromatin"},"C":{"text":"Nucleoplasm"},"D":{"text":"Nucleolus"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Packaging of DNA Helix","difficulty":"medium","source":"practice"},
{"questionText":"Loosely packed, transcriptionally active chromatin is called:","options":{"A":{"text":"Euchromatin"},"B":{"text":"Heterochromatin"},"C":{"text":"Nucleolus"},"D":{"text":"Satellite DNA"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"Packaging of DNA Helix","difficulty":"medium","source":"practice"},
{"questionText":"DNA replication is described as semiconservative because:","options":{"A":{"text":"Each daughter DNA molecule retains one parental strand and one newly synthesised strand"},"B":{"text":"Both daughter molecules are made entirely of new DNA"},"C":{"text":"Both daughter molecules retain both parental strands"},"D":{"text":"Only RNA is conserved during replication"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"easy","source":"practice"},
{"questionText":"The semiconservative nature of DNA replication was experimentally confirmed by:","options":{"A":{"text":"Meselson and Stahl, using isotope-labelled nitrogen in E. coli"},"B":{"text":"Watson and Crick"},"C":{"text":"Hershey and Chase"},"D":{"text":"Griffith"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"medium","source":"practice"},
{"questionText":"The enzyme primarily responsible for synthesising a new DNA strand during replication is:","options":{"A":{"text":"DNA polymerase"},"B":{"text":"RNA polymerase"},"C":{"text":"DNA ligase"},"D":{"text":"Helicase"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"easy","source":"practice"},
{"questionText":"The enzyme that unwinds the DNA double helix at the replication fork is:","options":{"A":{"text":"Helicase"},"B":{"text":"DNA polymerase"},"C":{"text":"DNA ligase"},"D":{"text":"Primase"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"medium","source":"practice"},
{"questionText":"DNA polymerase synthesises new DNA strands in the direction:","options":{"A":{"text":"5' to 3' only"},"B":{"text":"3' to 5' only"},"C":{"text":"Both 5' to 3' and 3' to 5' simultaneously on the same strand"},"D":{"text":"Direction is random"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"medium","source":"practice"},
{"questionText":"During DNA replication, the strand synthesised continuously is called the:","options":{"A":{"text":"Leading strand"},"B":{"text":"Lagging strand"},"C":{"text":"Template strand"},"D":{"text":"Coding strand"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"medium","source":"practice"},
{"questionText":"During DNA replication, the strand synthesised discontinuously in short fragments is called the:","options":{"A":{"text":"Lagging strand"},"B":{"text":"Leading strand"},"C":{"text":"Sense strand"},"D":{"text":"Anticoding strand"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"medium","source":"practice"},
{"questionText":"The short DNA fragments synthesised discontinuously on the lagging strand are called:","options":{"A":{"text":"Okazaki fragments"},"B":{"text":"Chargaff fragments"},"C":{"text":"Meselson fragments"},"D":{"text":"Sanger fragments"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"medium","source":"practice"},
{"questionText":"The enzyme that joins Okazaki fragments together by sealing the nicks in the sugar-phosphate backbone is:","options":{"A":{"text":"DNA ligase"},"B":{"text":"Helicase"},"C":{"text":"Primase"},"D":{"text":"Topoisomerase"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"medium","source":"practice"},
{"questionText":"DNA replication in eukaryotic cells occurs during which phase of the cell cycle?","options":{"A":{"text":"S phase (Synthesis phase)"},"B":{"text":"G1 phase"},"C":{"text":"G2 phase"},"D":{"text":"M phase"}},"correctAnswer":"A","subject":"biology","chapter":"Molecular Basis of Inheritance","topic":"DNA Replication","difficulty":"easy","source":"practice"}
]
[
  {
    "questionText": "The experiment that proved DNA (and not protein) is the genetic material using bacteriophages was performed by:",
    "options": {
      "A": {
        "text": "Griffith"
      },
      "B": {
        "text": "Avery, MacLeod and McCarty"
      },
      "C": {
        "text": "Hershey and Chase"
      },
      "D": {
        "text": "Meselson and Stahl"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA as genetic material"
  },
  {
    "questionText": "In Griffith's transformation experiment, the mice died when injected with:",
    "options": {
      "A": {
        "text": "Live R strain alone"
      },
      "B": {
        "text": "Heat-killed S strain alone"
      },
      "C": {
        "text": "Live R strain + heat-killed S strain"
      },
      "D": {
        "text": "Live S strain boiled and cooled"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA as genetic material"
  },
  {
    "questionText": "Avery, MacLeod and McCarty concluded that DNA is the transforming principle by treating the extract with:",
    "options": {
      "A": {
        "text": "Protease and RNase only"
      },
      "B": {
        "text": "DNase, which abolished transformation"
      },
      "C": {
        "text": "Lipase only"
      },
      "D": {
        "text": "Heat alone"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA as genetic material"
  },
  {
    "questionText": "In the Hershey-Chase experiment, radioactive sulfur (35S) was used to label:",
    "options": {
      "A": {
        "text": "DNA"
      },
      "B": {
        "text": "Protein coat"
      },
      "C": {
        "text": "RNA"
      },
      "D": {
        "text": "Ribosomes"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA as genetic material"
  },
  {
    "questionText": "Chargaff's rule states that in double-stranded DNA:",
    "options": {
      "A": {
        "text": "A = G and C = T"
      },
      "B": {
        "text": "A + T = G + C always"
      },
      "C": {
        "text": "A = T and G = C"
      },
      "D": {
        "text": "Purines exceed pyrimidines"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "The Watson-Crick double helix model of DNA was proposed in the year:",
    "options": {
      "A": {
        "text": "1928"
      },
      "B": {
        "text": "1944"
      },
      "C": {
        "text": "1953"
      },
      "D": {
        "text": "1972"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "The two strands of DNA are held together by:",
    "options": {
      "A": {
        "text": "Phosphodiester bonds"
      },
      "B": {
        "text": "Hydrogen bonds between complementary bases"
      },
      "C": {
        "text": "Peptide bonds"
      },
      "D": {
        "text": "Glycosidic bonds"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "Adenine forms how many hydrogen bonds with thymine?",
    "options": {
      "A": {
        "text": "1"
      },
      "B": {
        "text": "2"
      },
      "C": {
        "text": "3"
      },
      "D": {
        "text": "4"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "Guanine forms how many hydrogen bonds with cytosine?",
    "options": {
      "A": {
        "text": "1"
      },
      "B": {
        "text": "2"
      },
      "C": {
        "text": "3"
      },
      "D": {
        "text": "4"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "The two polynucleotide chains of DNA are:",
    "options": {
      "A": {
        "text": "Parallel"
      },
      "B": {
        "text": "Antiparallel"
      },
      "C": {
        "text": "Perpendicular"
      },
      "D": {
        "text": "Randomly oriented"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "The distance between two consecutive base pairs in DNA is approximately:",
    "options": {
      "A": {
        "text": "0.34 nm"
      },
      "B": {
        "text": "3.4 nm"
      },
      "C": {
        "text": "2.0 nm"
      },
      "D": {
        "text": "34 nm"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "One complete turn of the DNA helix contains approximately how many base pairs?",
    "options": {
      "A": {
        "text": "5"
      },
      "B": {
        "text": "10"
      },
      "C": {
        "text": "20"
      },
      "D": {
        "text": "34"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "The sugar present in DNA is:",
    "options": {
      "A": {
        "text": "Ribose"
      },
      "B": {
        "text": "Deoxyribose"
      },
      "C": {
        "text": "Glucose"
      },
      "D": {
        "text": "Fructose"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "Which of the following is a pyrimidine base?",
    "options": {
      "A": {
        "text": "Adenine"
      },
      "B": {
        "text": "Guanine"
      },
      "C": {
        "text": "Cytosine"
      },
      "D": {
        "text": "Both A and B"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "A nucleotide differs from a nucleoside in having an additional:",
    "options": {
      "A": {
        "text": "Nitrogenous base"
      },
      "B": {
        "text": "Phosphate group"
      },
      "C": {
        "text": "Sugar molecule"
      },
      "D": {
        "text": "Hydroxyl group"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "The linkage between a nitrogenous base and pentose sugar is called:",
    "options": {
      "A": {
        "text": "Phosphodiester bond"
      },
      "B": {
        "text": "N-glycosidic bond"
      },
      "C": {
        "text": "Hydrogen bond"
      },
      "D": {
        "text": "Ester bond"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "Phosphodiester bonds in DNA link:",
    "options": {
      "A": {
        "text": "5' phosphate of one nucleotide to 3'-OH of the next"
      },
      "B": {
        "text": "Base to base directly"
      },
      "C": {
        "text": "Two phosphate groups"
      },
      "D": {
        "text": "Sugar to sugar directly"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "A single turn of the DNA helix measures approximately:",
    "options": {
      "A": {
        "text": "0.34 nm"
      },
      "B": {
        "text": "2.0 nm"
      },
      "C": {
        "text": "3.4 nm"
      },
      "D": {
        "text": "34 nm"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "In eukaryotic chromatin, the nucleosome core is made up of a histone octamer around which DNA is wrapped. This octamer consists of two molecules each of histones:",
    "options": {
      "A": {
        "text": "H1, H2A, H2B, H3"
      },
      "B": {
        "text": "H2A, H2B, H3, H4"
      },
      "C": {
        "text": "H1, H2A, H3, H4"
      },
      "D": {
        "text": "H1, H2B, H3, H4"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "Approximately how many base pairs of DNA are wrapped around a nucleosome core?",
    "options": {
      "A": {
        "text": "80 bp"
      },
      "B": {
        "text": "146 bp"
      },
      "C": {
        "text": "200 bp"
      },
      "D": {
        "text": "500 bp"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "Histone H1 in chromatin functions to:",
    "options": {
      "A": {
        "text": "Form the nucleosome core"
      },
      "B": {
        "text": "Bind to linker DNA between nucleosomes"
      },
      "C": {
        "text": "Act as an enzyme in replication"
      },
      "D": {
        "text": "Bind only to RNA"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "The 'beads-on-string' structure seen under electron microscope refers to:",
    "options": {
      "A": {
        "text": "Nucleosomes strung along DNA"
      },
      "B": {
        "text": "Ribosomes on mRNA"
      },
      "C": {
        "text": "Chromatids at metaphase"
      },
      "D": {
        "text": "Operon structure"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "Histones are rich in which type of amino acids, allowing them to bind negatively charged DNA?",
    "options": {
      "A": {
        "text": "Acidic"
      },
      "B": {
        "text": "Basic"
      },
      "C": {
        "text": "Neutral"
      },
      "D": {
        "text": "Sulphur-containing"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "Non-histone chromosomal (NHC) proteins are found in association with DNA in:",
    "options": {
      "A": {
        "text": "Prokaryotes only"
      },
      "B": {
        "text": "Eukaryotes only"
      },
      "C": {
        "text": "Both prokaryotes and eukaryotes"
      },
      "D": {
        "text": "Viruses only"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "The densely packed, transcriptionally inactive form of chromatin is called:",
    "options": {
      "A": {
        "text": "Euchromatin"
      },
      "B": {
        "text": "Heterochromatin"
      },
      "C": {
        "text": "Nucleolus"
      },
      "D": {
        "text": "Nucleoplasm"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "Loosely packed, transcriptionally active chromatin is called:",
    "options": {
      "A": {
        "text": "Heterochromatin"
      },
      "B": {
        "text": "Euchromatin"
      },
      "C": {
        "text": "Satellite DNA"
      },
      "D": {
        "text": "Chromomere"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "In E. coli, the DNA is packaged with the help of proteins that are functionally similar to eukaryotic histones, forming a structure called:",
    "options": {
      "A": {
        "text": "Chromatin fibre"
      },
      "B": {
        "text": "Nucleoid"
      },
      "C": {
        "text": "Plasmid"
      },
      "D": {
        "text": "Episome"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "DNA in a bacterium, if unpacked, is about 1300 times longer than the cell size. This is achieved by:",
    "options": {
      "A": {
        "text": "Negative supercoiling with the help of proteins"
      },
      "B": {
        "text": "Histone wrapping identical to eukaryotes"
      },
      "C": {
        "text": "Formation of extra chromosomes"
      },
      "D": {
        "text": "Loss of extra DNA"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "Which scientist(s) proposed that DNA exists as a double helix based on X-ray diffraction data of Rosalind Franklin?",
    "options": {
      "A": {
        "text": "Watson and Crick"
      },
      "B": {
        "text": "Meselson and Stahl"
      },
      "C": {
        "text": "Nirenberg and Khorana"
      },
      "D": {
        "text": "Jacob and Monod"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "The repeating unit that forms a nucleosome, along with linker DNA, is called a:",
    "options": {
      "A": {
        "text": "Chromomere"
      },
      "B": {
        "text": "Solenoid"
      },
      "C": {
        "text": "Nucleosome"
      },
      "D": {
        "text": "Centromere"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "If a DNA segment has 20% adenine, what percentage of guanine will it contain?",
    "options": {
      "A": {
        "text": "20%"
      },
      "B": {
        "text": "30%"
      },
      "C": {
        "text": "40%"
      },
      "D": {
        "text": "60%"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA structure"
  },
  {
    "questionText": "Which base is unique to RNA and not found in DNA?",
    "options": {
      "A": {
        "text": "Adenine"
      },
      "B": {
        "text": "Thymine"
      },
      "C": {
        "text": "Uracil"
      },
      "D": {
        "text": "Guanine"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "RNA"
  },
  {
    "questionText": "RNA differs from DNA in its sugar component because RNA contains:",
    "options": {
      "A": {
        "text": "Deoxyribose"
      },
      "B": {
        "text": "Ribose"
      },
      "C": {
        "text": "Glucose"
      },
      "D": {
        "text": "Galactose"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "RNA"
  },
  {
    "questionText": "Which of the following is generally a single-stranded molecule in most organisms?",
    "options": {
      "A": {
        "text": "DNA"
      },
      "B": {
        "text": "RNA"
      },
      "C": {
        "text": "Both equally"
      },
      "D": {
        "text": "Neither"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "RNA"
  },
  {
    "questionText": "DNA replication is described as semiconservative because each daughter DNA molecule has:",
    "options": {
      "A": {
        "text": "Two newly synthesized strands"
      },
      "B": {
        "text": "One parental and one newly synthesized strand"
      },
      "C": {
        "text": "Two parental strands"
      },
      "D": {
        "text": "A mix of RNA and DNA strands"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The semiconservative mode of DNA replication was experimentally demonstrated by:",
    "options": {
      "A": {
        "text": "Watson and Crick"
      },
      "B": {
        "text": "Meselson and Stahl"
      },
      "C": {
        "text": "Hershey and Chase"
      },
      "D": {
        "text": "Griffith"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "In the Meselson-Stahl experiment, E. coli were grown in a medium containing which isotope of nitrogen initially?",
    "options": {
      "A": {
        "text": "14N"
      },
      "B": {
        "text": "15N"
      },
      "C": {
        "text": "13N"
      },
      "D": {
        "text": "16N"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "In the Meselson-Stahl experiment, after one generation of growth in 14N medium, the DNA showed a density that was:",
    "options": {
      "A": {
        "text": "Purely heavy (15N/15N)"
      },
      "B": {
        "text": "Purely light (14N/14N)"
      },
      "C": {
        "text": "Hybrid (15N/14N)"
      },
      "D": {
        "text": "Could not be detected"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The enzyme primarily responsible for catalyzing DNA polymerization during replication in E. coli is:",
    "options": {
      "A": {
        "text": "DNA polymerase III"
      },
      "B": {
        "text": "RNA polymerase"
      },
      "C": {
        "text": "DNA ligase"
      },
      "D": {
        "text": "Helicase"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "DNA polymerase can add nucleotides only in which direction?",
    "options": {
      "A": {
        "text": "3' to 5'"
      },
      "B": {
        "text": "5' to 3'"
      },
      "C": {
        "text": "Either direction"
      },
      "D": {
        "text": "Random direction"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The strand synthesized continuously during DNA replication is called the:",
    "options": {
      "A": {
        "text": "Lagging strand"
      },
      "B": {
        "text": "Leading strand"
      },
      "C": {
        "text": "Template strand"
      },
      "D": {
        "text": "Okazaki strand"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "Short fragments synthesized discontinuously on the lagging strand during replication are called:",
    "options": {
      "A": {
        "text": "Okazaki fragments"
      },
      "B": {
        "text": "Primers"
      },
      "C": {
        "text": "Nucleosomes"
      },
      "D": {
        "text": "Exons"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "Okazaki fragments are joined together by the enzyme:",
    "options": {
      "A": {
        "text": "DNA polymerase"
      },
      "B": {
        "text": "DNA ligase"
      },
      "C": {
        "text": "Helicase"
      },
      "D": {
        "text": "Topoisomerase"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The enzyme that unwinds the DNA double helix at the replication fork by breaking hydrogen bonds is:",
    "options": {
      "A": {
        "text": "Helicase"
      },
      "B": {
        "text": "Ligase"
      },
      "C": {
        "text": "Primase"
      },
      "D": {
        "text": "Topoisomerase"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "DNA replication requires a short RNA primer because DNA polymerase can only:",
    "options": {
      "A": {
        "text": "Initiate synthesis de novo"
      },
      "B": {
        "text": "Extend a pre-existing 3'-OH end"
      },
      "C": {
        "text": "Synthesize RNA"
      },
      "D": {
        "text": "Work on single-stranded RNA templates only"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The enzyme that synthesizes the short RNA primer needed for replication is:",
    "options": {
      "A": {
        "text": "Primase"
      },
      "B": {
        "text": "Ligase"
      },
      "C": {
        "text": "Helicase"
      },
      "D": {
        "text": "Gyrase"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The point where DNA unwinding begins for replication is called the:",
    "options": {
      "A": {
        "text": "Origin of replication"
      },
      "B": {
        "text": "Terminator"
      },
      "C": {
        "text": "Promoter"
      },
      "D": {
        "text": "Operator"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "DNA replication in eukaryotic cells occurs during which phase of the cell cycle?",
    "options": {
      "A": {
        "text": "G1 phase"
      },
      "B": {
        "text": "S phase"
      },
      "C": {
        "text": "G2 phase"
      },
      "D": {
        "text": "M phase"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "Topoisomerase functions during DNA replication to:",
    "options": {
      "A": {
        "text": "Relieve supercoiling ahead of the replication fork"
      },
      "B": {
        "text": "Synthesize new DNA strands"
      },
      "C": {
        "text": "Join Okazaki fragments"
      },
      "D": {
        "text": "Remove RNA primers"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "Single-strand binding proteins (SSB) during replication function to:",
    "options": {
      "A": {
        "text": "Prevent the separated strands from reannealing"
      },
      "B": {
        "text": "Synthesize RNA primers"
      },
      "C": {
        "text": "Cleave phosphodiester bonds"
      },
      "D": {
        "text": "Add nucleotides to the growing strand"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "DNA polymerase III also possesses proofreading (3'-5' exonuclease) activity, which:",
    "options": {
      "A": {
        "text": "Removes RNA primers"
      },
      "B": {
        "text": "Corrects errors of incorporation during replication"
      },
      "C": {
        "text": "Unwinds DNA"
      },
      "D": {
        "text": "Adds telomeres"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "A replication fork is:",
    "options": {
      "A": {
        "text": "A Y-shaped structure formed by the opening up of the double helix"
      },
      "B": {
        "text": "A closed circular DNA in bacteria"
      },
      "C": {
        "text": "The termination point of replication"
      },
      "D": {
        "text": "A structure unique to RNA synthesis"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The high concentration of DNA and histones inside a eukaryotic nucleus would tend to precipitate DNA-histone complexes at physiological pH. This precipitation is prevented in a living cell by:",
    "options": {
      "A": {
        "text": "Continuous ATP hydrolysis"
      },
      "B": {
        "text": "Other proteins (acidic proteins) that neutralize the basicity"
      },
      "C": {
        "text": "Nucleolar RNA"
      },
      "D": {
        "text": "Constant unwinding by helicase"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Packaging of DNA"
  },
  {
    "questionText": "PCR (Polymerase Chain Reaction) technique for amplifying DNA in vitro exploits the enzyme:",
    "options": {
      "A": {
        "text": "Taq polymerase, a thermostable DNA polymerase"
      },
      "B": {
        "text": "T4 DNA ligase"
      },
      "C": {
        "text": "EcoRI restriction enzyme"
      },
      "D": {
        "text": "Reverse transcriptase"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "If replication were conservative rather than semiconservative, after one round of replication in 15N medium followed by growth in 14N medium, the DNA bands on CsCl density gradient would show:",
    "options": {
      "A": {
        "text": "A single hybrid band"
      },
      "B": {
        "text": "Two bands: one heavy, one light, in equal amounts"
      },
      "C": {
        "text": "A single light band only"
      },
      "D": {
        "text": "Three bands"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "The overall direction of DNA replication at the replication fork, considering both strands, is described as:",
    "options": {
      "A": {
        "text": "Bidirectional"
      },
      "B": {
        "text": "Unidirectional only"
      },
      "C": {
        "text": "Random"
      },
      "D": {
        "text": "Non-continuous on both strands"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA replication"
  },
  {
    "questionText": "Transcription is the process of synthesis of:",
    "options": {
      "A": {
        "text": "DNA from DNA"
      },
      "B": {
        "text": "RNA from a DNA template"
      },
      "C": {
        "text": "Protein from RNA"
      },
      "D": {
        "text": "DNA from RNA"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "In a transcription unit, the region of DNA that acts as a template is called the:",
    "options": {
      "A": {
        "text": "Coding strand"
      },
      "B": {
        "text": "Sense strand"
      },
      "C": {
        "text": "Template strand"
      },
      "D": {
        "text": "Anticoding strand"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "The strand of DNA that has the same sequence as the RNA transcript (except T replaced by U) is called the:",
    "options": {
      "A": {
        "text": "Template strand"
      },
      "B": {
        "text": "Coding/sense strand"
      },
      "C": {
        "text": "Antisense strand"
      },
      "D": {
        "text": "Lagging strand"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "A transcription unit in DNA is defined mainly by three regions: a promoter, the structural gene, and a:",
    "options": {
      "A": {
        "text": "Terminator"
      },
      "B": {
        "text": "Operator"
      },
      "C": {
        "text": "Enhancer"
      },
      "D": {
        "text": "Repressor"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "In E. coli, a single enzyme, RNA polymerase, catalyzes the transcription of:",
    "options": {
      "A": {
        "text": "All types of RNA (mRNA, tRNA, rRNA)"
      },
      "B": {
        "text": "Only mRNA"
      },
      "C": {
        "text": "Only tRNA"
      },
      "D": {
        "text": "Only rRNA"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "In eukaryotes, RNA polymerase II is responsible for transcribing:",
    "options": {
      "A": {
        "text": "hnRNA (precursor of mRNA)"
      },
      "B": {
        "text": "tRNA"
      },
      "C": {
        "text": "rRNA (major species)"
      },
      "D": {
        "text": "5S rRNA only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "In eukaryotes, RNA polymerase III transcribes:",
    "options": {
      "A": {
        "text": "hnRNA"
      },
      "B": {
        "text": "tRNA, 5S rRNA and other small RNAs"
      },
      "C": {
        "text": "Major rRNA species"
      },
      "D": {
        "text": "Only mRNA"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "In eukaryotes, RNA polymerase I is responsible for transcribing:",
    "options": {
      "A": {
        "text": "tRNA"
      },
      "B": {
        "text": "hnRNA"
      },
      "C": {
        "text": "Major ribosomal RNA (rRNA)"
      },
      "D": {
        "text": "snRNA"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "The DNA-dependent RNA polymerase binds to the promoter and initiates transcription. This defines the:",
    "options": {
      "A": {
        "text": "Coding strand"
      },
      "B": {
        "text": "Sense of transcription"
      },
      "C": {
        "text": "Terminator"
      },
      "D": {
        "text": "Operator region"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "hnRNA (heterogeneous nuclear RNA) undergoes processing before becoming functional mRNA. This processing includes:",
    "options": {
      "A": {
        "text": "Splicing, capping, and tailing"
      },
      "B": {
        "text": "Only replication"
      },
      "C": {
        "text": "Only translation"
      },
      "D": {
        "text": "Denaturation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "The process of removing introns and joining exons in hnRNA is called:",
    "options": {
      "A": {
        "text": "Capping"
      },
      "B": {
        "text": "Splicing"
      },
      "C": {
        "text": "Tailing"
      },
      "D": {
        "text": "Translation"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "The non-coding sequences in a eukaryotic gene that are removed during RNA processing are called:",
    "options": {
      "A": {
        "text": "Exons"
      },
      "B": {
        "text": "Introns"
      },
      "C": {
        "text": "Cistrons"
      },
      "D": {
        "text": "Codons"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "Capping of hnRNA involves addition of an unusual nucleotide at the 5' end, which is:",
    "options": {
      "A": {
        "text": "Methyl guanosine triphosphate"
      },
      "B": {
        "text": "Poly-A tail"
      },
      "C": {
        "text": "A ribosomal subunit"
      },
      "D": {
        "text": "A tRNA molecule"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "Tailing of hnRNA at its 3' end involves addition of:",
    "options": {
      "A": {
        "text": "A methyl guanosine cap"
      },
      "B": {
        "text": "200-300 adenylate residues (poly-A tail)"
      },
      "C": {
        "text": "A ribosome-binding site"
      },
      "D": {
        "text": "An anticodon loop"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Transcription"
  },
  {
    "questionText": "The genetic code is described as degenerate because:",
    "options": {
      "A": {
        "text": "Some amino acids are coded by more than one codon"
      },
      "B": {
        "text": "Some codons do not code for any amino acid"
      },
      "C": {
        "text": "The code overlaps"
      },
      "D": {
        "text": "It differs between organisms"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The total number of possible codons that can be formed from four nitrogenous bases taken three at a time is:",
    "options": {
      "A": {
        "text": "20"
      },
      "B": {
        "text": "61"
      },
      "C": {
        "text": "64"
      },
      "D": {
        "text": "16"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "Of the 64 codons, how many code for amino acids (sense codons)?",
    "options": {
      "A": {
        "text": "61"
      },
      "B": {
        "text": "64"
      },
      "C": {
        "text": "60"
      },
      "D": {
        "text": "20"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "How many codons act as stop (nonsense/termination) codons?",
    "options": {
      "A": {
        "text": "1"
      },
      "B": {
        "text": "2"
      },
      "C": {
        "text": "3"
      },
      "D": {
        "text": "4"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The start codon AUG codes for the amino acid:",
    "options": {
      "A": {
        "text": "Glycine"
      },
      "B": {
        "text": "Methionine"
      },
      "C": {
        "text": "Valine"
      },
      "D": {
        "text": "Leucine"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The stop codons in the genetic code are:",
    "options": {
      "A": {
        "text": "UAA, UAG, UGA"
      },
      "B": {
        "text": "AUG, UAA, UAG"
      },
      "C": {
        "text": "UUU, UUC, UUA"
      },
      "D": {
        "text": "AUG, UGA, UGG"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The genetic code is described as 'nearly universal' because:",
    "options": {
      "A": {
        "text": "The same codon specifies the same amino acid from bacteria to humans, with rare exceptions"
      },
      "B": {
        "text": "It applies only to prokaryotes"
      },
      "C": {
        "text": "It applies only to eukaryotes"
      },
      "D": {
        "text": "Each organism has a distinct code"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The genetic code is unambiguous because:",
    "options": {
      "A": {
        "text": "A codon codes for only one amino acid"
      },
      "B": {
        "text": "An amino acid can be coded by only one codon"
      },
      "C": {
        "text": "There is overlap between codons"
      },
      "D": {
        "text": "Codons vary between species"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The genetic code is read in a contiguous, non-overlapping fashion; this property is called:",
    "options": {
      "A": {
        "text": "Degeneracy"
      },
      "B": {
        "text": "Commaless and non-overlapping code"
      },
      "C": {
        "text": "Wobble"
      },
      "D": {
        "text": "Universality"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The genetic code was largely deciphered by the work of:",
    "options": {
      "A": {
        "text": "Har Gobind Khorana and Marshall Nirenberg"
      },
      "B": {
        "text": "Watson and Crick"
      },
      "C": {
        "text": "Meselson and Stahl"
      },
      "D": {
        "text": "Jacob and Monod"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The amino acid tryptophan is coded by how many codon(s), making it, along with methionine, an exception to code degeneracy?",
    "options": {
      "A": {
        "text": "1"
      },
      "B": {
        "text": "2"
      },
      "C": {
        "text": "3"
      },
      "D": {
        "text": "4"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "Which amino acid is coded for by the maximum number of codons (six)?",
    "options": {
      "A": {
        "text": "Serine and Leucine"
      },
      "B": {
        "text": "Methionine and Tryptophan"
      },
      "C": {
        "text": "Valine and Alanine"
      },
      "D": {
        "text": "Glycine and Proline"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The concept that flexibility in base pairing occurs at the third codon position, allowing a single tRNA to recognize multiple codons, is called:",
    "options": {
      "A": {
        "text": "Wobble hypothesis"
      },
      "B": {
        "text": "Central dogma"
      },
      "C": {
        "text": "Operon concept"
      },
      "D": {
        "text": "Semi-conservative replication"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Genetic code"
  },
  {
    "questionText": "The Central Dogma of molecular biology, as proposed by Crick, states that genetic information normally flows as:",
    "options": {
      "A": {
        "text": "DNA to RNA to Protein"
      },
      "B": {
        "text": "Protein to RNA to DNA"
      },
      "C": {
        "text": "RNA to Protein to DNA"
      },
      "D": {
        "text": "DNA to Protein directly"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Central dogma"
  },
  {
    "questionText": "Reverse transcription, in which RNA acts as a template for DNA synthesis, is seen in:",
    "options": {
      "A": {
        "text": "Retroviruses"
      },
      "B": {
        "text": "Bacteriophages only"
      },
      "C": {
        "text": "All prokaryotes"
      },
      "D": {
        "text": "Plant viruses only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Central dogma"
  },
  {
    "questionText": "Translation refers to the process of:",
    "options": {
      "A": {
        "text": "Polymerization of amino acids to form a polypeptide"
      },
      "B": {
        "text": "Synthesis of RNA from DNA"
      },
      "C": {
        "text": "Synthesis of DNA from RNA"
      },
      "D": {
        "text": "Replication of DNA"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "The amino acids are activated in the presence of ATP and linked to their specific tRNA in a process called:",
    "options": {
      "A": {
        "text": "Aminoacylation (charging of tRNA)"
      },
      "B": {
        "text": "Capping"
      },
      "C": {
        "text": "Splicing"
      },
      "D": {
        "text": "Termination"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "The site on the ribosome where a new charged tRNA binds, adjacent to the peptidyl site, is the:",
    "options": {
      "A": {
        "text": "A-site (aminoacyl site)"
      },
      "B": {
        "text": "P-site"
      },
      "C": {
        "text": "E-site"
      },
      "D": {
        "text": "T-site"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "The ribosome acts catalytically to form peptide bonds during translation; this catalytic activity resides in:",
    "options": {
      "A": {
        "text": "The larger rRNA of the large subunit (a ribozyme)"
      },
      "B": {
        "text": "The smaller subunit protein"
      },
      "C": {
        "text": "mRNA itself"
      },
      "D": {
        "text": "The initiator tRNA"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "The prokaryotic ribosome has a sedimentation coefficient of:",
    "options": {
      "A": {
        "text": "70S"
      },
      "B": {
        "text": "80S"
      },
      "C": {
        "text": "60S"
      },
      "D": {
        "text": "40S"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "The 70S ribosome dissociates into two subunits of sizes:",
    "options": {
      "A": {
        "text": "50S and 30S"
      },
      "B": {
        "text": "60S and 40S"
      },
      "C": {
        "text": "40S and 30S"
      },
      "D": {
        "text": "80S and 50S"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "Translation begins when the small ribosomal subunit binds to mRNA at the:",
    "options": {
      "A": {
        "text": "Start codon (AUG)"
      },
      "B": {
        "text": "Stop codon"
      },
      "C": {
        "text": "Poly-A tail"
      },
      "D": {
        "text": "Promoter"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "Translation terminates when a ribosome encounters a stop codon, aided by:",
    "options": {
      "A": {
        "text": "Release factors"
      },
      "B": {
        "text": "Initiation factors"
      },
      "C": {
        "text": "Sigma factor"
      },
      "D": {
        "text": "Primase"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Translation"
  },
  {
    "questionText": "The lac operon in E. coli is an example of:",
    "options": {
      "A": {
        "text": "An inducible operon"
      },
      "B": {
        "text": "A constitutive operon"
      },
      "C": {
        "text": "A repressible operon only"
      },
      "D": {
        "text": "A eukaryotic operon"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "The lac operon was proposed by:",
    "options": {
      "A": {
        "text": "Jacob and Monod"
      },
      "B": {
        "text": "Watson and Crick"
      },
      "C": {
        "text": "Beadle and Tatum"
      },
      "D": {
        "text": "Nirenberg and Khorana"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "The lac operon consists of one regulatory gene (i) and how many structural genes?",
    "options": {
      "A": {
        "text": "One (z)"
      },
      "B": {
        "text": "Two (z and y)"
      },
      "C": {
        "text": "Three (z, y and a)"
      },
      "D": {
        "text": "Four"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "In the lac operon, the structural gene z codes for the enzyme:",
    "options": {
      "A": {
        "text": "Beta-galactosidase"
      },
      "B": {
        "text": "Permease"
      },
      "C": {
        "text": "Transacetylase"
      },
      "D": {
        "text": "DNA ligase"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "In the lac operon, gene y codes for permease, which functions to:",
    "options": {
      "A": {
        "text": "Increase permeability of the cell to lactose"
      },
      "B": {
        "text": "Hydrolyze lactose into glucose and galactose"
      },
      "C": {
        "text": "Transfer acetyl groups to beta-galactosides"
      },
      "D": {
        "text": "Repress transcription"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "In the lac operon, the repressor protein coded by the i gene binds to the:",
    "options": {
      "A": {
        "text": "Operator region"
      },
      "B": {
        "text": "Promoter region"
      },
      "C": {
        "text": "Structural gene z"
      },
      "D": {
        "text": "Ribosome"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "In the presence of lactose (the inducer), the lac operon is switched ON because lactose (as allolactose) binds to:",
    "options": {
      "A": {
        "text": "The repressor, inactivating it and preventing it from binding to the operator"
      },
      "B": {
        "text": "RNA polymerase directly"
      },
      "C": {
        "text": "The promoter, blocking transcription"
      },
      "D": {
        "text": "The structural genes"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "In the absence of lactose, the lac operon remains switched off because the active repressor:",
    "options": {
      "A": {
        "text": "Binds the operator and blocks RNA polymerase from transcribing"
      },
      "B": {
        "text": "Degrades the structural genes"
      },
      "C": {
        "text": "Binds to lactose directly"
      },
      "D": {
        "text": "Activates the promoter"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Gene expression regulation"
  },
  {
    "questionText": "The Human Genome Project was completed and the results declared essentially complete in the year:",
    "options": {
      "A": {
        "text": "1990"
      },
      "B": {
        "text": "2001"
      },
      "C": {
        "text": "2003"
      },
      "D": {
        "text": "2010"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "The Human Genome Project is often referred to as a 'mega project' because of its:",
    "options": {
      "A": {
        "text": "Extremely large scale of funding, data, and collaboration required"
      },
      "B": {
        "text": "Focus only on protein-coding genes"
      },
      "C": {
        "text": "Short duration of completion"
      },
      "D": {
        "text": "Application only to bacteria"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "The total approximate number of base pairs in the human genome, according to the Human Genome Project, is about:",
    "options": {
      "A": {
        "text": "3.2 million"
      },
      "B": {
        "text": "3.2 billion"
      },
      "C": {
        "text": "320 million"
      },
      "D": {
        "text": "32 billion"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "According to the Human Genome Project, protein-coding sequences (exons) constitute approximately what percentage of the human genome?",
    "options": {
      "A": {
        "text": "Less than 2%"
      },
      "B": {
        "text": "About 25%"
      },
      "C": {
        "text": "About 50%"
      },
      "D": {
        "text": "About 90%"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "Repetitive sequences that do not code for any protein but occupy a large portion of the human genome are useful for:",
    "options": {
      "A": {
        "text": "Understanding chromosome structure and dynamics, including DNA fingerprinting"
      },
      "B": {
        "text": "Producing all cellular enzymes"
      },
      "C": {
        "text": "Ribosome formation exclusively"
      },
      "D": {
        "text": "Direct hormone synthesis"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "The techniques used to sequence the human genome were mainly two: Expressed Sequence Tags (EST) and:",
    "options": {
      "A": {
        "text": "Sequence Annotation by identifying overlapping DNA fragments (Sanger sequencing/shotgun)"
      },
      "B": {
        "text": "PCR alone"
      },
      "C": {
        "text": "Southern blotting"
      },
      "D": {
        "text": "Gel electrophoresis alone"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "DNA fingerprinting primarily involves identifying differences in individuals based on:",
    "options": {
      "A": {
        "text": "Repetitive DNA sequences called satellite DNA / VNTRs"
      },
      "B": {
        "text": "Exon sequences coding for proteins"
      },
      "C": {
        "text": "The number of chromosomes"
      },
      "D": {
        "text": "Ribosomal RNA sequences"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA fingerprinting"
  },
  {
    "questionText": "DNA fingerprinting technique was first developed by:",
    "options": {
      "A": {
        "text": "Alec Jeffreys"
      },
      "B": {
        "text": "Har Gobind Khorana"
      },
      "C": {
        "text": "Kary Mullis"
      },
      "D": {
        "text": "Frederick Sanger"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA fingerprinting"
  },
  {
    "questionText": "Satellite DNA is separated from bulk genomic DNA as a distinct peak during density gradient centrifugation because it:",
    "options": {
      "A": {
        "text": "Differs in base composition and hence buoyant density"
      },
      "B": {
        "text": "Is always found only in mitochondria"
      },
      "C": {
        "text": "Codes for ribosomal proteins"
      },
      "D": {
        "text": "Is single-stranded"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA fingerprinting"
  },
  {
    "questionText": "In DNA fingerprinting, the technique used to detect polymorphism (variability) in repetitive DNA sequences using a labelled probe is called:",
    "options": {
      "A": {
        "text": "Southern blot hybridization"
      },
      "B": {
        "text": "PCR amplification alone"
      },
      "C": {
        "text": "Western blotting"
      },
      "D": {
        "text": "ELISA"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA fingerprinting"
  },
  {
    "questionText": "DNA fingerprinting has forensic applications mainly because VNTR (Variable Number of Tandem Repeats) regions:",
    "options": {
      "A": {
        "text": "Show high degree of polymorphism, unique to each individual (except identical twins)"
      },
      "B": {
        "text": "Are identical in all humans"
      },
      "C": {
        "text": "Code for antibodies"
      },
      "D": {
        "text": "Are found only on the Y chromosome"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA fingerprinting"
  },
  {
    "questionText": "The technique of DNA fingerprinting in India was pioneered at which institute?",
    "options": {
      "A": {
        "text": "Centre for DNA Fingerprinting and Diagnostics (CDFD), Hyderabad"
      },
      "B": {
        "text": "IIT Delhi"
      },
      "C": {
        "text": "AIIMS, Delhi"
      },
      "D": {
        "text": "IISc, Bangalore"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "DNA fingerprinting"
  },
  {
    "questionText": "The number of protein-coding genes estimated in the human genome by the Human Genome Project was much lower than expected, approximately:",
    "options": {
      "A": {
        "text": "30,000"
      },
      "B": {
        "text": "3,00,000"
      },
      "C": {
        "text": "3 million"
      },
      "D": {
        "text": "3,000"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "The average size of a human gene, according to Human Genome Project data, is approximately:",
    "options": {
      "A": {
        "text": "3000 bases"
      },
      "B": {
        "text": "30,000 bases"
      },
      "C": {
        "text": "300 bases"
      },
      "D": {
        "text": "3,00,000 bases"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  },
  {
    "questionText": "Chromosome 1 has the highest number of genes, while which human chromosome has the fewest?",
    "options": {
      "A": {
        "text": "Y chromosome"
      },
      "B": {
        "text": "Chromosome 21"
      },
      "C": {
        "text": "Chromosome 13"
      },
      "D": {
        "text": "X chromosome"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Molecular Basis of Inheritance",
    "topic": "Human Genome Project"
  }
]
[
  {
    "questionText": "The theory that life originated from pre-existing non-living organic molecules under early Earth conditions is called:",
    "options": {
      "A": {
        "text": "Theory of special creation"
      },
      "B": {
        "text": "Theory of chemical evolution (biochemical origin of life)"
      },
      "C": {
        "text": "Theory of spontaneous generation"
      },
      "D": {
        "text": "Theory of panspermia only"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "The theory of chemical evolution / origin of life on Earth was proposed by:",
    "options": {
      "A": {
        "text": "Oparin and Haldane"
      },
      "B": {
        "text": "Darwin and Wallace"
      },
      "C": {
        "text": "Lamarck"
      },
      "D": {
        "text": "Hugo de Vries"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "The early Earth's atmosphere, according to the Oparin-Haldane hypothesis, is believed to have been rich in gases such as:",
    "options": {
      "A": {
        "text": "Oxygen and nitrogen"
      },
      "B": {
        "text": "Methane, ammonia, hydrogen, and water vapour"
      },
      "C": {
        "text": "Carbon dioxide and oxygen only"
      },
      "D": {
        "text": "Only inert gases"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "The experiment that simulated early Earth's atmospheric conditions in a laboratory flask and produced amino acids was conducted by:",
    "options": {
      "A": {
        "text": "Stanley Miller and Harold Urey"
      },
      "B": {
        "text": "Louis Pasteur"
      },
      "C": {
        "text": "Francesco Redi"
      },
      "D": {
        "text": "Alexander Oparin"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "In the Miller-Urey experiment, an electric discharge was used to simulate:",
    "options": {
      "A": {
        "text": "Volcanic heat"
      },
      "B": {
        "text": "UV radiation"
      },
      "C": {
        "text": "Lightning in the primitive atmosphere"
      },
      "D": {
        "text": "Cosmic radiation"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "The Miller-Urey experiment created conditions similar to those thought to exist in early Earth's atmosphere and demonstrated the abiotic synthesis of:",
    "options": {
      "A": {
        "text": "Amino acids"
      },
      "B": {
        "text": "Complete DNA"
      },
      "C": {
        "text": "Functional ribosomes"
      },
      "D": {
        "text": "Membrane-bound cells"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "Louis Pasteur is credited with disproving the theory of:",
    "options": {
      "A": {
        "text": "Spontaneous generation (abiogenesis of complex life)"
      },
      "B": {
        "text": "Natural selection"
      },
      "C": {
        "text": "Chemical evolution"
      },
      "D": {
        "text": "Continental drift"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "The theory suggesting that units of life were transported to Earth from outer space is called:",
    "options": {
      "A": {
        "text": "Panspermia"
      },
      "B": {
        "text": "Biogenesis"
      },
      "C": {
        "text": "Chemical evolution"
      },
      "D": {
        "text": "Abiogenesis"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "The 'RNA World' hypothesis proposes that the first genetic material capable of self-replication was:",
    "options": {
      "A": {
        "text": "DNA"
      },
      "B": {
        "text": "RNA"
      },
      "C": {
        "text": "Protein"
      },
      "D": {
        "text": "A polysaccharide"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "Study of similar structures in different organisms that have evolved from a common ancestral structure but may perform different functions is called the study of:",
    "options": {
      "A": {
        "text": "Homologous organs"
      },
      "B": {
        "text": "Analogous organs"
      },
      "C": {
        "text": "Vestigial organs"
      },
      "D": {
        "text": "Convergent structures"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "The forelimbs of a whale, a bat, a cheetah, and a human, despite different functions, share the same basic bone structure. This is an example of:",
    "options": {
      "A": {
        "text": "Analogous organs"
      },
      "B": {
        "text": "Homologous organs, indicating divergent evolution"
      },
      "C": {
        "text": "Vestigial organs"
      },
      "D": {
        "text": "Convergent evolution"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "The wings of a butterfly and the wings of a bird have a similar function but different structural origin. This is an example of:",
    "options": {
      "A": {
        "text": "Homologous organs"
      },
      "B": {
        "text": "Analogous organs, indicating convergent evolution"
      },
      "C": {
        "text": "Vestigial organs"
      },
      "D": {
        "text": "Adaptive radiation"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "The evolution of different species from a common ancestor to fill different available niches, e.g., Darwin's finches on the Galapagos Islands, is called:",
    "options": {
      "A": {
        "text": "Convergent evolution"
      },
      "B": {
        "text": "Adaptive radiation"
      },
      "C": {
        "text": "Homologous evolution"
      },
      "D": {
        "text": "Retrogressive evolution"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Placental mammals in Australia (marsupials) show a variety of forms similar to those found elsewhere, having evolved from a common ancestor along different lines within the same isolated landmass. This is an example of:",
    "options": {
      "A": {
        "text": "Divergent evolution / adaptive radiation on an isolated landmass"
      },
      "B": {
        "text": "Convergent evolution across continents"
      },
      "C": {
        "text": "Vestigial organ development"
      },
      "D": {
        "text": "Chemical evolution"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "When Australian marsupials (e.g., flying phalanger) and placental mammals in other continents (e.g., flying squirrel) develop similar body forms despite different ancestry, this is called:",
    "options": {
      "A": {
        "text": "Divergent evolution"
      },
      "B": {
        "text": "Convergent evolution"
      },
      "C": {
        "text": "Homologous evolution"
      },
      "D": {
        "text": "Adaptive radiation from one ancestor only"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Fossils provide evidence for evolution mainly by:",
    "options": {
      "A": {
        "text": "Showing progressive changes in form correlated with the age of rock strata"
      },
      "B": {
        "text": "Directly observing DNA sequences"
      },
      "C": {
        "text": "Studying only living organisms"
      },
      "D": {
        "text": "Proving spontaneous generation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Archaeopteryx, an organism showing both reptilian and avian features, is an important example of:",
    "options": {
      "A": {
        "text": "A connecting link supporting evolution from reptiles to birds"
      },
      "B": {
        "text": "An analogous structure"
      },
      "C": {
        "text": "A living fossil"
      },
      "D": {
        "text": "A vestigial organism"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "The dating of fossils in rock sediments to estimate their age is based primarily on:",
    "options": {
      "A": {
        "text": "Radioactive/carbon dating"
      },
      "B": {
        "text": "Direct observation of ancestry"
      },
      "C": {
        "text": "Comparative anatomy alone"
      },
      "D": {
        "text": "Molecular clock only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Vestigial organs such as the human vermiform appendix and coccyx are considered evidence for evolution because they:",
    "options": {
      "A": {
        "text": "Are functional and essential organs"
      },
      "B": {
        "text": "Are non-functional remnants of organs that were functional in ancestors"
      },
      "C": {
        "text": "Are found only in plants"
      },
      "D": {
        "text": "Prove independent creation"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Comparative study of embryonic development across vertebrates, showing similar early stages (e.g., presence of gill slits in all vertebrate embryos), provides evidence of evolution and is studied under:",
    "options": {
      "A": {
        "text": "Embryology"
      },
      "B": {
        "text": "Paleontology"
      },
      "C": {
        "text": "Biogeography"
      },
      "D": {
        "text": "Ecology"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Which of the following is an example of a living fossil, retaining features of ancestral forms?",
    "options": {
      "A": {
        "text": "Peripatus / Latimeria"
      },
      "B": {
        "text": "Human"
      },
      "C": {
        "text": "Housefly"
      },
      "D": {
        "text": "Sparrow"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Comparative anatomy and morphology of homologous and analogous organs was significantly studied to distinguish evolution patterns, notably contributed to by:",
    "options": {
      "A": {
        "text": "Charles Darwin"
      },
      "B": {
        "text": "Gregor Mendel"
      },
      "C": {
        "text": "Robert Hooke"
      },
      "D": {
        "text": "Rudolf Virchow"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Biochemical similarities across diverse organisms, such as the near-universal genetic code and common metabolic pathways, are considered evidence for evolution because they suggest:",
    "options": {
      "A": {
        "text": "A common ancestral origin of life"
      },
      "B": {
        "text": "Independent origins for every species"
      },
      "C": {
        "text": "Random unrelated development"
      },
      "D": {
        "text": "No relationship between organisms"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "The geographical distribution of related species, such as marsupials being largely confined to Australia, is studied under which branch that provides evidence for evolution?",
    "options": {
      "A": {
        "text": "Biogeography"
      },
      "B": {
        "text": "Paleontology"
      },
      "C": {
        "text": "Cytology"
      },
      "D": {
        "text": "Physiology"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "The age of Earth is estimated to be approximately:",
    "options": {
      "A": {
        "text": "4.5 billion years"
      },
      "B": {
        "text": "450 million years"
      },
      "C": {
        "text": "45 million years"
      },
      "D": {
        "text": "4.5 million years"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "Life on Earth is estimated to have first originated approximately how many years ago?",
    "options": {
      "A": {
        "text": "500 million years"
      },
      "B": {
        "text": "3.5-4 billion years"
      },
      "C": {
        "text": "10,000 years"
      },
      "D": {
        "text": "100 million years"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Origin of life"
  },
  {
    "questionText": "Charles Darwin's theory of evolution, published in 'On the Origin of Species' (1859), proposes that evolution occurs mainly through:",
    "options": {
      "A": {
        "text": "Natural selection acting on heritable variations"
      },
      "B": {
        "text": "Inheritance of acquired characters"
      },
      "C": {
        "text": "Use and disuse of organs"
      },
      "D": {
        "text": "Sudden large mutations only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "Darwin's theory of natural selection was independently and simultaneously proposed by:",
    "options": {
      "A": {
        "text": "Alfred Russel Wallace"
      },
      "B": {
        "text": "Jean-Baptiste Lamarck"
      },
      "C": {
        "text": "Hugo de Vries"
      },
      "D": {
        "text": "Gregor Mendel"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "Darwin's voyage on which ship provided key observations that led to his theory of evolution?",
    "options": {
      "A": {
        "text": "HMS Beagle"
      },
      "B": {
        "text": "HMS Endeavour"
      },
      "C": {
        "text": "HMS Victory"
      },
      "D": {
        "text": "HMS Discovery"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "Lamarck's theory of evolution is based on the principle of:",
    "options": {
      "A": {
        "text": "Inheritance of acquired characteristics through use and disuse of organs"
      },
      "B": {
        "text": "Natural selection of pre-existing variations"
      },
      "C": {
        "text": "Mutation as the sole driver"
      },
      "D": {
        "text": "Genetic drift"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Lamarckism"
  },
  {
    "questionText": "Lamarck used the example of the giraffe's long neck to illustrate that:",
    "options": {
      "A": {
        "text": "Continuous stretching of the neck over generations, and inheritance of this acquired trait, led to long necks"
      },
      "B": {
        "text": "Random mutation caused long necks"
      },
      "C": {
        "text": "Natural selection favored long-necked giraffes with no effort involved"
      },
      "D": {
        "text": "Long necks arose due to genetic drift"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Lamarckism"
  },
  {
    "questionText": "According to Darwinian theory, the giraffe's long neck evolved because:",
    "options": {
      "A": {
        "text": "Individuals with longer necks (a heritable variation) had a survival/reproductive advantage and were naturally selected"
      },
      "B": {
        "text": "All giraffes stretched their necks and passed on the acquired trait"
      },
      "C": {
        "text": "Giraffes deliberately evolved long necks"
      },
      "D": {
        "text": "It occurred due to genetic engineering"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "The key difference between Darwinism and Lamarckism is that Darwin's theory relies on selection of existing heritable variation, while Lamarck's theory relies on:",
    "options": {
      "A": {
        "text": "Inheritance of characters acquired during an organism's lifetime"
      },
      "B": {
        "text": "Random genetic drift"
      },
      "C": {
        "text": "Chromosomal mutations only"
      },
      "D": {
        "text": "Hybridization"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Lamarckism"
  },
  {
    "questionText": "Weismann's experiments on cutting the tails of mice for several generations, without any change in the tail length of offspring, served to disprove:",
    "options": {
      "A": {
        "text": "Lamarck's theory of inheritance of acquired characters"
      },
      "B": {
        "text": "Darwin's theory of natural selection"
      },
      "C": {
        "text": "The theory of chemical evolution"
      },
      "D": {
        "text": "Hardy-Weinberg equilibrium"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Lamarckism"
  },
  {
    "questionText": "The phrase 'survival of the fittest' associated with Darwinian evolution was actually coined by:",
    "options": {
      "A": {
        "text": "Herbert Spencer"
      },
      "B": {
        "text": "Charles Darwin himself"
      },
      "C": {
        "text": "Alfred Russel Wallace"
      },
      "D": {
        "text": "Thomas Malthus"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "Darwin's concept of natural selection was influenced by the ideas on population growth and limited resources proposed by:",
    "options": {
      "A": {
        "text": "Thomas Malthus"
      },
      "B": {
        "text": "Gregor Mendel"
      },
      "C": {
        "text": "Hugo de Vries"
      },
      "D": {
        "text": "Robert Hooke"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "The peppered moth (Biston betularia) case in industrialized England, where dark-coloured moths increased in frequency due to soot-darkened tree bark, is a classic example of:",
    "options": {
      "A": {
        "text": "Industrial melanism, demonstrating natural selection"
      },
      "B": {
        "text": "Genetic drift"
      },
      "C": {
        "text": "Artificial selection"
      },
      "D": {
        "text": "Sympatric speciation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "In the peppered moth example, before industrialization, the light-coloured moths were more common because they were:",
    "options": {
      "A": {
        "text": "Better camouflaged against lichen-covered light tree bark, escaping predation"
      },
      "B": {
        "text": "Genetically superior"
      },
      "C": {
        "text": "Immune to pollution"
      },
      "D": {
        "text": "Larger in size"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "Development of resistance to antibiotics in bacteria over generations of exposure is an example of:",
    "options": {
      "A": {
        "text": "Natural selection favoring resistant variants"
      },
      "B": {
        "text": "Inheritance of acquired characters"
      },
      "C": {
        "text": "Genetic drift alone"
      },
      "D": {
        "text": "Founder effect"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "Pesticide resistance in insect pest populations arising from repeated pesticide application is best explained by:",
    "options": {
      "A": {
        "text": "Selection of pre-existing resistant variants in the population"
      },
      "B": {
        "text": "The pesticide directly inducing resistance mutations"
      },
      "C": {
        "text": "Lamarckian inheritance"
      },
      "D": {
        "text": "Random chance without any selection"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "Natural selection can lead to an increase, a decrease, or stabilization of a population's mean value for a trait. When individuals with an average phenotype are favoured, this is called:",
    "options": {
      "A": {
        "text": "Stabilizing selection"
      },
      "B": {
        "text": "Directional selection"
      },
      "C": {
        "text": "Disruptive selection"
      },
      "D": {
        "text": "Sexual selection"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "When natural selection favours individuals at both phenotypic extremes over the intermediate phenotype, it is called:",
    "options": {
      "A": {
        "text": "Directional selection"
      },
      "B": {
        "text": "Stabilizing selection"
      },
      "C": {
        "text": "Disruptive selection"
      },
      "D": {
        "text": "Neutral selection"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "When natural selection shifts the population mean towards one extreme phenotype (e.g., DDT resistance increasing over time), this is called:",
    "options": {
      "A": {
        "text": "Directional selection"
      },
      "B": {
        "text": "Stabilizing selection"
      },
      "C": {
        "text": "Disruptive selection"
      },
      "D": {
        "text": "Balancing selection"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "Sexual selection, where certain traits (e.g., peacock's tail) increase mating success rather than survival, was also proposed as a mechanism by:",
    "options": {
      "A": {
        "text": "Charles Darwin"
      },
      "B": {
        "text": "Gregor Mendel"
      },
      "C": {
        "text": "Jean-Baptiste Lamarck"
      },
      "D": {
        "text": "Hugo de Vries"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "Which of the following is NOT a component/requirement of Darwinian natural selection?",
    "options": {
      "A": {
        "text": "Heritable variation among individuals"
      },
      "B": {
        "text": "Differential reproductive success"
      },
      "C": {
        "text": "Overproduction of offspring relative to resources"
      },
      "D": {
        "text": "Deliberate effort by the organism to change"
      }
    },
    "correctAnswer": "D",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "Hugo de Vries proposed the mutation theory of evolution based on his studies on:",
    "options": {
      "A": {
        "text": "Evening primrose (Oenothera lamarckiana)"
      },
      "B": {
        "text": "Pea plants"
      },
      "C": {
        "text": "Fruit flies"
      },
      "D": {
        "text": "Peppered moths"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Mutation theory"
  },
  {
    "questionText": "De Vries proposed that evolution occurs through:",
    "options": {
      "A": {
        "text": "Sudden, large, discontinuous variations (saltations/mutations), not small continuous ones"
      },
      "B": {
        "text": "Slow, gradual changes only, as proposed by Darwin"
      },
      "C": {
        "text": "Use and disuse of organs"
      },
      "D": {
        "text": "Only geographic isolation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Mutation theory"
  },
  {
    "questionText": "A Mendelian population is defined as a group of interbreeding individuals that share a common gene pool, characterized by:",
    "options": {
      "A": {
        "text": "Allele frequencies that remain constant under stable, non-evolving conditions"
      },
      "B": {
        "text": "Complete genetic uniformity"
      },
      "C": {
        "text": "Asexual reproduction only"
      },
      "D": {
        "text": "A single genotype throughout"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Population genetics"
  },
  {
    "questionText": "The Hardy-Weinberg principle states that in a population under equilibrium, allele and genotype frequencies:",
    "options": {
      "A": {
        "text": "Remain constant generation after generation in the absence of evolutionary forces"
      },
      "B": {
        "text": "Always change due to natural selection"
      },
      "C": {
        "text": "Are always equal to each other"
      },
      "D": {
        "text": "Continuously drift randomly"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "In the Hardy-Weinberg equation p\u00b2 + 2pq + q\u00b2 = 1, the term 2pq represents the frequency of:",
    "options": {
      "A": {
        "text": "Homozygous dominant individuals"
      },
      "B": {
        "text": "Homozygous recessive individuals"
      },
      "C": {
        "text": "Heterozygous individuals"
      },
      "D": {
        "text": "Total population"
      }
    },
    "correctAnswer": "C",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "In the Hardy-Weinberg equation, p and q represent:",
    "options": {
      "A": {
        "text": "Frequencies of the two alleles of a gene in a population"
      },
      "B": {
        "text": "Frequencies of two different genes"
      },
      "C": {
        "text": "Population sizes"
      },
      "D": {
        "text": "Mutation rates"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "If the frequency of allele A is 0.6 (p) and allele a is 0.4 (q) in a population at Hardy-Weinberg equilibrium, the expected frequency of heterozygotes (Aa) is:",
    "options": {
      "A": {
        "text": "0.24"
      },
      "B": {
        "text": "0.48"
      },
      "C": {
        "text": "0.36"
      },
      "D": {
        "text": "0.16"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "If the frequency of a recessive allele q is 0.3, the expected frequency of the homozygous recessive genotype (q\u00b2) is:",
    "options": {
      "A": {
        "text": "0.09"
      },
      "B": {
        "text": "0.3"
      },
      "C": {
        "text": "0.49"
      },
      "D": {
        "text": "0.6"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "A deviation from Hardy-Weinberg equilibrium indicates that evolution is occurring, driven by factors such as:",
    "options": {
      "A": {
        "text": "Mutation, genetic drift, gene migration, genetic recombination, and natural selection"
      },
      "B": {
        "text": "Only environmental temperature"
      },
      "C": {
        "text": "Only reproductive rate"
      },
      "D": {
        "text": "Only population size increase"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "A change in the frequency of alleles in a population due to random chance events, especially pronounced in small populations, is called:",
    "options": {
      "A": {
        "text": "Genetic drift"
      },
      "B": {
        "text": "Natural selection"
      },
      "C": {
        "text": "Gene flow"
      },
      "D": {
        "text": "Mutation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Genetic drift"
  },
  {
    "questionText": "When a small group of individuals establishes a new population and, by chance, has different allele frequencies from the original population, this is known as the:",
    "options": {
      "A": {
        "text": "Founder effect"
      },
      "B": {
        "text": "Bottleneck effect"
      },
      "C": {
        "text": "Gene flow effect"
      },
      "D": {
        "text": "Balancing selection"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Genetic drift"
  },
  {
    "questionText": "A drastic reduction in population size due to a random catastrophic event, leading to loss of genetic variation, illustrates the:",
    "options": {
      "A": {
        "text": "Bottleneck effect"
      },
      "B": {
        "text": "Founder effect only"
      },
      "C": {
        "text": "Directional selection"
      },
      "D": {
        "text": "Hardy-Weinberg equilibrium"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Genetic drift"
  },
  {
    "questionText": "The movement of alleles into or out of a population due to migration of individuals is called:",
    "options": {
      "A": {
        "text": "Gene flow"
      },
      "B": {
        "text": "Genetic drift"
      },
      "C": {
        "text": "Mutation"
      },
      "D": {
        "text": "Recombination"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Population genetics"
  },
  {
    "questionText": "The ultimate source of new genetic variation, upon which natural selection acts, is:",
    "options": {
      "A": {
        "text": "Mutation"
      },
      "B": {
        "text": "Genetic drift"
      },
      "C": {
        "text": "Gene flow"
      },
      "D": {
        "text": "Natural selection itself"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Mutation theory"
  },
  {
    "questionText": "Sexual reproduction contributes to variation mainly through:",
    "options": {
      "A": {
        "text": "Recombination during meiosis (crossing over and independent assortment)"
      },
      "B": {
        "text": "Mutation of somatic cells"
      },
      "C": {
        "text": "Mitosis"
      },
      "D": {
        "text": "Binary fission"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Population genetics"
  },
  {
    "questionText": "A population is said to be at genetic equilibrium when allele frequencies are stable, which requires assumptions including a large population size, random mating, and:",
    "options": {
      "A": {
        "text": "No mutation, no migration, and no selection"
      },
      "B": {
        "text": "Continuous mutation"
      },
      "C": {
        "text": "Directional selection acting strongly"
      },
      "D": {
        "text": "Small population size"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "If a certain disease-causing recessive allele has a frequency of 0.1 in a population at Hardy-Weinberg equilibrium, the frequency of individuals affected (homozygous recessive) will be approximately:",
    "options": {
      "A": {
        "text": "0.01 (1%)"
      },
      "B": {
        "text": "0.1 (10%)"
      },
      "C": {
        "text": "0.19 (19%)"
      },
      "D": {
        "text": "0.81 (81%)"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "Genetic drift is expected to have the greatest evolutionary impact in:",
    "options": {
      "A": {
        "text": "Small, isolated populations"
      },
      "B": {
        "text": "Very large populations"
      },
      "C": {
        "text": "Populations with continuous high gene flow"
      },
      "D": {
        "text": "Asexually reproducing bacteria only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Genetic drift"
  },
  {
    "questionText": "Which of the following would violate the assumptions required for Hardy-Weinberg equilibrium?",
    "options": {
      "A": {
        "text": "Non-random mating (assortative mating)"
      },
      "B": {
        "text": "Infinite population size"
      },
      "C": {
        "text": "No mutation"
      },
      "D": {
        "text": "No migration"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Hardy-Weinberg principle"
  },
  {
    "questionText": "Speciation refers to the process by which:",
    "options": {
      "A": {
        "text": "New species arise from existing ones"
      },
      "B": {
        "text": "Species become extinct"
      },
      "C": {
        "text": "Individuals within a species mate randomly"
      },
      "D": {
        "text": "Alleles are lost from a population"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "Speciation that occurs when populations of a species are separated by a physical/geographical barrier is called:",
    "options": {
      "A": {
        "text": "Allopatric speciation"
      },
      "B": {
        "text": "Sympatric speciation"
      },
      "C": {
        "text": "Parapatric speciation"
      },
      "D": {
        "text": "Adaptive radiation only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "Speciation occurring within the same geographical area without physical isolation, often via polyploidy or behavioral changes, is called:",
    "options": {
      "A": {
        "text": "Allopatric speciation"
      },
      "B": {
        "text": "Sympatric speciation"
      },
      "C": {
        "text": "Geographic speciation"
      },
      "D": {
        "text": "Vicariance"
      }
    },
    "correctAnswer": "B",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "Geographical isolation of populations leads to genetic divergence primarily because it prevents:",
    "options": {
      "A": {
        "text": "Gene flow between the isolated populations"
      },
      "B": {
        "text": "Mutation within each population"
      },
      "C": {
        "text": "Natural selection from acting"
      },
      "D": {
        "text": "Random mating within each population"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "When two geographically isolated populations diverge to the point that they can no longer interbreed even if reunited, this is called:",
    "options": {
      "A": {
        "text": "Reproductive isolation, marking completion of speciation"
      },
      "B": {
        "text": "Genetic drift"
      },
      "C": {
        "text": "Gene flow"
      },
      "D": {
        "text": "Convergent evolution"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "Polyploidy, a sudden change in chromosome number, can lead to speciation especially in:",
    "options": {
      "A": {
        "text": "Plants"
      },
      "B": {
        "text": "Higher vertebrates"
      },
      "C": {
        "text": "Only bacteria"
      },
      "D": {
        "text": "Only fungi"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "Darwin's finches on the Galapagos Islands, showing variation in beak shape adapted to different food sources from a common ancestral finch, are a classic example of:",
    "options": {
      "A": {
        "text": "Adaptive radiation"
      },
      "B": {
        "text": "Convergent evolution"
      },
      "C": {
        "text": "Genetic drift"
      },
      "D": {
        "text": "Gene flow"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Adaptive radiation"
  },
  {
    "questionText": "Adaptive radiation refers to the process where a single ancestral species diversifies into:",
    "options": {
      "A": {
        "text": "Multiple species adapted to different ecological niches within the same geographical area"
      },
      "B": {
        "text": "A single more advanced species"
      },
      "C": {
        "text": "Species in widely separated geographical areas independently"
      },
      "D": {
        "text": "Extinct forms only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Adaptive radiation"
  },
  {
    "questionText": "The diversification of Australian marsupials into forms resembling placental mammals elsewhere (e.g., marsupial wolf, flying phalanger) from a common marsupial ancestor is an example of:",
    "options": {
      "A": {
        "text": "Adaptive radiation"
      },
      "B": {
        "text": "Convergent evolution"
      },
      "C": {
        "text": "Reproductive isolation only"
      },
      "D": {
        "text": "Sympatric speciation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Adaptive radiation"
  },
  {
    "questionText": "When adaptive radiation occurs independently in more than one isolated geographical area but produces similar-looking, unrelated organisms, this is termed:",
    "options": {
      "A": {
        "text": "Convergent evolution"
      },
      "B": {
        "text": "Divergent evolution"
      },
      "C": {
        "text": "Allopatric speciation"
      },
      "D": {
        "text": "Founder effect"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Adaptive radiation"
  },
  {
    "questionText": "Placental mammals underwent adaptive radiation after the extinction of dinosaurs, giving rise to the great variety of modern mammals. This radiation began roughly:",
    "options": {
      "A": {
        "text": "65 million years ago"
      },
      "B": {
        "text": "6,500 years ago"
      },
      "C": {
        "text": "6.5 billion years ago"
      },
      "D": {
        "text": "650 million years ago"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Adaptive radiation"
  },
  {
    "questionText": "The scientific study of human evolution primarily relies on evidence from:",
    "options": {
      "A": {
        "text": "Fossils, comparative anatomy, and molecular/genetic data"
      },
      "B": {
        "text": "Only religious texts"
      },
      "C": {
        "text": "Only behavioral studies of living primates"
      },
      "D": {
        "text": "Only linguistic analysis"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "Humans are believed to have evolved in which continent, based on fossil evidence?",
    "options": {
      "A": {
        "text": "Africa"
      },
      "B": {
        "text": "Europe"
      },
      "C": {
        "text": "Asia"
      },
      "D": {
        "text": "Australia"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "Which of the following is considered among the earliest known hominid ancestors, dated to about 4 million years ago?",
    "options": {
      "A": {
        "text": "Australopithecus"
      },
      "B": {
        "text": "Homo erectus"
      },
      "C": {
        "text": "Homo sapiens"
      },
      "D": {
        "text": "Homo habilis"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "The hominid species considered the first toolmaker, with a brain capacity of about 650-800 cc, was:",
    "options": {
      "A": {
        "text": "Homo habilis"
      },
      "B": {
        "text": "Homo erectus"
      },
      "C": {
        "text": "Homo sapiens"
      },
      "D": {
        "text": "Australopithecus"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "Homo erectus, characterized by a larger brain capacity (about 900 cc) and known from fossils found in Java, lived approximately:",
    "options": {
      "A": {
        "text": "1.5 million years ago"
      },
      "B": {
        "text": "10,000 years ago"
      },
      "C": {
        "text": "4 million years ago"
      },
      "D": {
        "text": "500,000 years ago only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "Neanderthal man (Homo neanderthalensis), with a brain capacity of about 1400 cc, lived in the region of:",
    "options": {
      "A": {
        "text": "Europe and near-East"
      },
      "B": {
        "text": "Australia"
      },
      "C": {
        "text": "South America"
      },
      "D": {
        "text": "Antarctica"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "Modern humans, Homo sapiens, are believed to have arisen in Africa and subsequently:",
    "options": {
      "A": {
        "text": "Migrated across continents and replaced earlier hominid species"
      },
      "B": {
        "text": "Never left Africa"
      },
      "C": {
        "text": "Evolved independently and simultaneously on every continent"
      },
      "D": {
        "text": "Descended directly from modern chimpanzees"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "A common misconception about human evolution is that humans evolved directly from modern apes/chimpanzees; in reality, humans and chimpanzees:",
    "options": {
      "A": {
        "text": "Share a common ancestor but represent two different evolutionary lines"
      },
      "B": {
        "text": "Are the same species"
      },
      "C": {
        "text": "Have no evolutionary relationship at all"
      },
      "D": {
        "text": "Evolved from modern gorillas"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "Key trends observed in the fossil record of human evolution include progressive increase in brain capacity and:",
    "options": {
      "A": {
        "text": "Development of bipedalism (upright walking)"
      },
      "B": {
        "text": "Decrease in tool use"
      },
      "C": {
        "text": "Loss of social behaviour"
      },
      "D": {
        "text": "Reduction in overall body size continuously"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "The controlled use of fire is generally attributed to have first appeared with:",
    "options": {
      "A": {
        "text": "Homo erectus"
      },
      "B": {
        "text": "Australopithecus"
      },
      "C": {
        "text": "Modern Homo sapiens only"
      },
      "D": {
        "text": "Homo habilis"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Human evolution"
  },
  {
    "questionText": "Variation among individuals of a species is essential for evolution because it provides the raw material upon which:",
    "options": {
      "A": {
        "text": "Natural selection can act"
      },
      "B": {
        "text": "Genetic drift is prevented"
      },
      "C": {
        "text": "Mutation rate decreases"
      },
      "D": {
        "text": "Gene flow is stopped"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Population genetics"
  },
  {
    "questionText": "A population with zero genetic variation would be:",
    "options": {
      "A": {
        "text": "Unable to evolve in response to changing environments"
      },
      "B": {
        "text": "More likely to adapt quickly"
      },
      "C": {
        "text": "Immune to extinction"
      },
      "D": {
        "text": "Unaffected by natural selection either way"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Population genetics"
  },
  {
    "questionText": "Mass extinction events in Earth's history, such as the Cretaceous-Tertiary extinction that eliminated the dinosaurs, are significant to evolutionary theory because they:",
    "options": {
      "A": {
        "text": "Opened up ecological niches leading to adaptive radiation of surviving groups"
      },
      "B": {
        "text": "Had no effect on subsequent evolution"
      },
      "C": {
        "text": "Only affected marine organisms"
      },
      "D": {
        "text": "Proved that evolution does not occur"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Adaptive radiation"
  },
  {
    "questionText": "Coevolution refers to a situation where:",
    "options": {
      "A": {
        "text": "Two interacting species exert selective pressures on each other, evolving in tandem"
      },
      "B": {
        "text": "A single species evolves independently"
      },
      "C": {
        "text": "Evolution occurs only in isolated populations"
      },
      "D": {
        "text": "Species remain unchanged over time"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "The evolutionary relationship between flowering plants and their specific pollinators, where each has evolved traits suited to the other, is an example of:",
    "options": {
      "A": {
        "text": "Coevolution"
      },
      "B": {
        "text": "Genetic drift"
      },
      "C": {
        "text": "Founder effect"
      },
      "D": {
        "text": "Bottleneck effect"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Natural selection"
  },
  {
    "questionText": "Which of the following best distinguishes microevolution from macroevolution?",
    "options": {
      "A": {
        "text": "Microevolution involves small changes within a species/population, while macroevolution involves the origin of new species/higher taxa over long time scales"
      },
      "B": {
        "text": "Microevolution occurs only in bacteria"
      },
      "C": {
        "text": "Macroevolution occurs within a single generation"
      },
      "D": {
        "text": "There is no meaningful distinction"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Population genetics"
  },
  {
    "questionText": "The gradual accumulation of small variations over long periods, as originally proposed by Darwin, describing the tempo of evolution, is called:",
    "options": {
      "A": {
        "text": "Phyletic gradualism"
      },
      "B": {
        "text": "Punctuated equilibrium"
      },
      "C": {
        "text": "Saltation"
      },
      "D": {
        "text": "Convergent evolution"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "The model proposing that evolution occurs in rapid bursts followed by long periods of stability (stasis), rather than a slow constant rate, is called:",
    "options": {
      "A": {
        "text": "Punctuated equilibrium"
      },
      "B": {
        "text": "Phyletic gradualism"
      },
      "C": {
        "text": "Neo-Darwinism only"
      },
      "D": {
        "text": "Lamarckism"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "The modern evolutionary synthesis (Neo-Darwinism) integrates Darwin's theory of natural selection with:",
    "options": {
      "A": {
        "text": "Mendelian genetics and population genetics"
      },
      "B": {
        "text": "Lamarckian inheritance"
      },
      "C": {
        "text": "Panspermia theory"
      },
      "D": {
        "text": "Spontaneous generation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "Reproductive isolation between two populations can be caused by prezygotic barriers such as differences in mating season or courtship behaviour, which prevent:",
    "options": {
      "A": {
        "text": "Mating or fertilization from occurring between the populations"
      },
      "B": {
        "text": "Genetic drift from occurring"
      },
      "C": {
        "text": "Mutation from occurring"
      },
      "D": {
        "text": "Any phenotypic variation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "Postzygotic reproductive isolation is exemplified by:",
    "options": {
      "A": {
        "text": "Hybrid sterility, as seen in mules (horse x donkey hybrids)"
      },
      "B": {
        "text": "Different flowering times preventing pollination"
      },
      "C": {
        "text": "Geographic separation by a mountain range"
      },
      "D": {
        "text": "Different mating calls"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "A mule, the sterile hybrid offspring of a horse and a donkey, illustrates that horses and donkeys are:",
    "options": {
      "A": {
        "text": "Reproductively isolated, and hence considered separate species"
      },
      "B": {
        "text": "The same species"
      },
      "C": {
        "text": "Not related evolutionarily at all"
      },
      "D": {
        "text": "Undergoing sympatric speciation"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Speciation"
  },
  {
    "questionText": "Convergent evolution results in organisms that are analogous but not homologous. An example is the streamlined body shape found in:",
    "options": {
      "A": {
        "text": "Sharks (fish) and dolphins (mammals)"
      },
      "B": {
        "text": "Human and chimpanzee forelimbs"
      },
      "C": {
        "text": "Horse and donkey"
      },
      "D": {
        "text": "All species of birds only"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "The presence of similar camera-type eyes in both vertebrates (e.g., humans) and cephalopods (e.g., octopus), which evolved independently, illustrates:",
    "options": {
      "A": {
        "text": "Convergent evolution"
      },
      "B": {
        "text": "Homology"
      },
      "C": {
        "text": "Common recent ancestry"
      },
      "D": {
        "text": "Vestigial structures"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "In the study of comparative biochemistry, cytochrome-c sequence similarity between two species is used as a tool to estimate:",
    "options": {
      "A": {
        "text": "Evolutionary relatedness (molecular phylogeny)"
      },
      "B": {
        "text": "Population size"
      },
      "C": {
        "text": "Rate of mutation only"
      },
      "D": {
        "text": "Geographic distribution"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Which observation would be considered strong molecular evidence supporting common ancestry among all living organisms?",
    "options": {
      "A": {
        "text": "Near-universality of the genetic code and shared core metabolic pathways"
      },
      "B": {
        "text": "Different genetic codes in every species"
      },
      "C": {
        "text": "Absence of DNA in some organisms"
      },
      "D": {
        "text": "Complete lack of biochemical similarity"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Evidences of evolution"
  },
  {
    "questionText": "Artificial selection, as practiced by humans in breeding crops and livestock for desired traits, provided Darwin with an important analogy for understanding:",
    "options": {
      "A": {
        "text": "Natural selection in the wild"
      },
      "B": {
        "text": "Lamarckian inheritance"
      },
      "C": {
        "text": "Genetic drift"
      },
      "D": {
        "text": "Chemical evolution"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  },
  {
    "questionText": "The numerous breeds of dogs, all descended from wolves through selective breeding by humans over generations, best illustrate:",
    "options": {
      "A": {
        "text": "Artificial selection"
      },
      "B": {
        "text": "Natural selection acting alone"
      },
      "C": {
        "text": "Genetic drift"
      },
      "D": {
        "text": "Sympatric speciation without human involvement"
      }
    },
    "correctAnswer": "A",
    "subject": "Biology",
    "chapter": "Evolution",
    "topic": "Darwinism"
  }
]
[
  {
    "questionText": "The velocity of a particle is given by v = At^2 + Bt + C, where t is time. The dimensions of A, B, C respectively are:",
    "options": {
      "A": {
        "text": "[LT^-3], [LT^-2], [LT^-1]"
      },
      "B": {
        "text": "[LT^-1], [LT^-2], [LT^-3]"
      },
      "C": {
        "text": "[LT^-2], [LT^-1], [L]"
      },
      "D": {
        "text": "[L], [LT^-1], [LT^-2]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "In the equation (P + a/V^2)(V - b) = RT for one mole of a real gas, the dimensions of 'a' are:",
    "options": {
      "A": {
        "text": "[ML^5T^-2]"
      },
      "B": {
        "text": "[ML^-1T^-2]"
      },
      "C": {
        "text": "[ML^3T^-2]"
      },
      "D": {
        "text": "[ML^-5T^-2]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "In the same van der Waals equation (P + a/V^2)(V - b) = RT, the dimensions of 'b' are the same as those of:",
    "options": {
      "A": {
        "text": "Volume"
      },
      "B": {
        "text": "Pressure"
      },
      "C": {
        "text": "Energy"
      },
      "D": {
        "text": "Force"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "A physical quantity Q is given by Q = A^2 B^3 / (C^(1/2) D^3). If the percentage errors in A, B, C, D are 1%, 2%, 3%, and 4% respectively, the percentage error in Q is:",
    "options": {
      "A": {
        "text": "20.5%"
      },
      "B": {
        "text": "18.5%"
      },
      "C": {
        "text": "16.5%"
      },
      "D": {
        "text": "14.5%"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Error analysis",
    "difficulty": "hard"
  },
  {
    "questionText": "The period of oscillation T of a simple pendulum in an experiment is measured as T = 2π√(L/g). If L is measured with an accuracy of 2% and T with an accuracy of 1%, the percentage error in the determination of g is:",
    "options": {
      "A": {
        "text": "4%"
      },
      "B": {
        "text": "3%"
      },
      "C": {
        "text": "2%"
      },
      "D": {
        "text": "1%"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Error analysis",
    "difficulty": "hard"
  },
  {
    "questionText": "If the unit of force is 100 N, unit of length is 10 m, and unit of time is 100 s, what is the unit of mass in this new system?",
    "options": {
      "A": {
        "text": "10^5 kg"
      },
      "B": {
        "text": "10^4 kg"
      },
      "C": {
        "text": "10^3 kg"
      },
      "D": {
        "text": "10^6 kg"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "System of units",
    "difficulty": "hard"
  },
  {
    "questionText": "The dimensional formula for the coefficient of viscosity (η) is:",
    "options": {
      "A": {
        "text": "[ML^-1T^-1]"
      },
      "B": {
        "text": "[ML^-2T^-1]"
      },
      "C": {
        "text": "[MLT^-1]"
      },
      "D": {
        "text": "[ML^-1T^-2]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "Using dimensional analysis, the escape velocity v of a body depends on the mass M of the planet, its radius R, and the gravitational constant G. Which of the following is dimensionally consistent?",
    "options": {
      "A": {
        "text": "v = k√(GM/R)"
      },
      "B": {
        "text": "v = k(GM/R)"
      },
      "C": {
        "text": "v = k(GM/R)^2"
      },
      "D": {
        "text": "v = k√(GM R)"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional analysis applications",
    "difficulty": "hard"
  },
  {
    "questionText": "A quantity X is given by X = ε₀ L (ΔV/Δt), where ε₀ is the permittivity of free space, L is a length, ΔV is a potential difference, and Δt is a time interval. The dimensional formula for X is the same as that of:",
    "options": {
      "A": {
        "text": "Electric current"
      },
      "B": {
        "text": "Resistance"
      },
      "C": {
        "text": "Charge"
      },
      "D": {
        "text": "Electric potential"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "If the dimensions of a physical quantity are given by [M^a L^b T^c], and the quantity is energy, then:",
    "options": {
      "A": {
        "text": "a = 1, b = 2, c = -2"
      },
      "B": {
        "text": "a = 1, b = -2, c = 2"
      },
      "C": {
        "text": "a = -1, b = 2, c = -2"
      },
      "D": {
        "text": "a = 1, b = 2, c = -1"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "Planck's constant (h), speed of light (c), and gravitational constant (G) are combined to obtain a quantity with dimensions of length, called the Planck length. Which combination gives the correct dimensions of length?",
    "options": {
      "A": {
        "text": "√(hG/c^3)"
      },
      "B": {
        "text": "√(hG/c^5)"
      },
      "C": {
        "text": "√(hc/G^3)"
      },
      "D": {
        "text": "√(Gc/h^3)"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional analysis applications",
    "difficulty": "hard"
  },
  {
    "questionText": "In a screw gauge, the pitch is 1 mm and there are 100 divisions on the circular scale. While measuring the diameter of a wire, the main scale reads 2 mm and the 47th division on the circular scale coincides with the reference line. If there is a positive zero error of 0.03 mm, the corrected diameter of the wire is:",
    "options": {
      "A": {
        "text": "2.44 mm"
      },
      "B": {
        "text": "2.47 mm"
      },
      "C": {
        "text": "2.50 mm"
      },
      "D": {
        "text": "2.41 mm"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Measurement and instruments",
    "difficulty": "hard"
  },
  {
    "questionText": "A student measures the diameter of a wire using a screw gauge with least count 0.001 cm and lists the readings 5.32, 5.33, 5.34 mm. Taking the average and reporting with correct significant figures and considering the least count as the uncertainty, the appropriate way to express the diameter is:",
    "options": {
      "A": {
        "text": "(5.330 ± 0.001) mm"
      },
      "B": {
        "text": "(5.33 ± 0.1) mm"
      },
      "C": {
        "text": "(5.3 ± 0.01) mm"
      },
      "D": {
        "text": "(5.330 ± 0.01) mm"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Significant figures",
    "difficulty": "hard"
  },
  {
    "questionText": "Which of the following combinations of physical quantities has the same dimensional formula as the Rydberg constant (whose SI unit is m^-1)?",
    "options": {
      "A": {
        "text": "1/wavelength"
      },
      "B": {
        "text": "Frequency"
      },
      "C": {
        "text": "Energy"
      },
      "D": {
        "text": "Angular momentum"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "A physical quantity P is related to four observables a, b, c, d as P = a^2 b^3 / (√c d). The percentage errors in the measurements of a, b, c, d are 1%, 3%, 4%, 2% respectively. The percentage error in P will be closest to:",
    "options": {
      "A": {
        "text": "13%"
      },
      "B": {
        "text": "8%"
      },
      "C": {
        "text": "23%"
      },
      "D": {
        "text": "5%"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Error analysis",
    "difficulty": "hard"
  },
  {
    "questionText": "If force (F), velocity (v), and time (T) are taken as fundamental quantities instead of mass, length, and time, the dimensions of mass in this new system would be:",
    "options": {
      "A": {
        "text": "[F v^-1 T]"
      },
      "B": {
        "text": "[F v T^-1]"
      },
      "C": {
        "text": "[F v^-1 T^-1]"
      },
      "D": {
        "text": "[F^-1 v T]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "System of units",
    "difficulty": "hard"
  },
  {
    "questionText": "Using force (F), velocity (v), and time (T) as fundamental quantities, the dimensions of energy in this system would be:",
    "options": {
      "A": {
        "text": "[F v T]"
      },
      "B": {
        "text": "[F v^2 T]"
      },
      "C": {
        "text": "[F v T^2]"
      },
      "D": {
        "text": "[F^2 v T]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "System of units",
    "difficulty": "hard"
  },
  {
    "questionText": "The dimensional formula of the product of surface tension and wavelength is same as that of:",
    "options": {
      "A": {
        "text": "Force"
      },
      "B": {
        "text": "Energy per unit area"
      },
      "C": {
        "text": "Torque"
      },
      "D": {
        "text": "Power"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "A calorie is a unit of heat equal to about 4.2 J, where 1 J = 1 kg m^2 s^-2. Suppose a new system of units in which the unit of mass is α kg, unit of length is β m, and unit of time is γ s. What is the magnitude of 1 calorie in the new units?",
    "options": {
      "A": {
        "text": "4.2 α^-1 β^-2 γ^2"
      },
      "B": {
        "text": "4.2 α β^2 γ^-2"
      },
      "C": {
        "text": "4.2 α^-1 β^2 γ^-2"
      },
      "D": {
        "text": "4.2 α β^-2 γ^2"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "System of units",
    "difficulty": "hard"
  },
  {
    "questionText": "Given that the time period T of a drop of liquid under surface tension S depends on density ρ, radius r, and S, i.e., T = k ρ^a r^b S^c, the values of a, b, c using dimensional analysis are:",
    "options": {
      "A": {
        "text": "a = 1/2, b = 3/2, c = -1/2"
      },
      "B": {
        "text": "a = 1, b = 1, c = -1"
      },
      "C": {
        "text": "a = 1/2, b = 1/2, c = -1/2"
      },
      "D": {
        "text": "a = 3/2, b = 1/2, c = -1"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional analysis applications",
    "difficulty": "hard"
  },
  {
    "questionText": "The velocity of sound (v) in a gas is thought to depend on the pressure P and density ρ of the gas, i.e. v = k P^a ρ^b. Using dimensional analysis, the correct relation is:",
    "options": {
      "A": {
        "text": "v = k√(P/ρ)"
      },
      "B": {
        "text": "v = k(P/ρ)"
      },
      "C": {
        "text": "v = k√(Pρ)"
      },
      "D": {
        "text": "v = k(ρ/P)"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional analysis applications",
    "difficulty": "hard"
  },
  {
    "questionText": "Which of the following pairs does NOT have the same dimensions?",
    "options": {
      "A": {
        "text": "Torque and Work"
      },
      "B": {
        "text": "Impulse and Momentum"
      },
      "C": {
        "text": "Stress and Pressure"
      },
      "D": {
        "text": "Angular momentum and Torque"
      }
    },
    "correctAnswer": "D",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "The dimensions of (1/2)ε₀E^2, where ε₀ is permittivity of free space and E is electric field, is the same as that of:",
    "options": {
      "A": {
        "text": "Energy density"
      },
      "B": {
        "text": "Electric potential"
      },
      "C": {
        "text": "Electric charge"
      },
      "D": {
        "text": "Capacitance"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "In the expression for the magnetic field due to a long straight wire, B = μ₀I / (2πr), the dimensions of μ₀ (permeability of free space) are:",
    "options": {
      "A": {
        "text": "[MLT^-2A^-2]"
      },
      "B": {
        "text": "[MLT^-1A^-1]"
      },
      "C": {
        "text": "[ML^2T^-2A^-2]"
      },
      "D": {
        "text": "[ML^0T^-2A^-1]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "If the length L, mass M, and time T are chosen as fundamental units instead of the SI base units, then in this system the unit of the coefficient of viscosity η would be expressed with dimensions:",
    "options": {
      "A": {
        "text": "M L^-1 T^-1"
      },
      "B": {
        "text": "M L^-2 T^-1"
      },
      "C": {
        "text": "M L^-1 T^-2"
      },
      "D": {
        "text": "M L T^-1"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "The dimensional formula for the specific heat capacity is:",
    "options": {
      "A": {
        "text": "[L^2T^-2K^-1]"
      },
      "B": {
        "text": "[ML^2T^-2K^-1]"
      },
      "C": {
        "text": "[MLT^-2K^-1]"
      },
      "D": {
        "text": "[L^2T^-1K^-1]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "Two quantities A and B have different dimensions. Which of the following mathematical operations could be dimensionally valid?",
    "options": {
      "A": {
        "text": "A/B"
      },
      "B": {
        "text": "A + B"
      },
      "C": {
        "text": "A - B"
      },
      "D": {
        "text": "sin(A + B)"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional analysis applications",
    "difficulty": "hard"
  },
  {
    "questionText": "The dimensional formula for the Boltzmann constant (k_B) is:",
    "options": {
      "A": {
        "text": "[ML^2T^-2K^-1]"
      },
      "B": {
        "text": "[MLT^-2K^-1]"
      },
      "C": {
        "text": "[ML^2T^-1K^-1]"
      },
      "D": {
        "text": "[ML^0T^-2K^-1]"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Dimensional formulae",
    "difficulty": "hard"
  },
  {
    "questionText": "In a resonance tube experiment, the first resonance is obtained at a length l₁ = 10.0 cm and the second at l₂ = 32.0 cm, with the uncertainty in each length measurement being 0.1 cm. The percentage error in the calculated value of the wavelength (λ = 2(l₂ - l₁)) is closest to:",
    "options": {
      "A": {
        "text": "0.91%"
      },
      "B": {
        "text": "1.8%"
      },
      "C": {
        "text": "0.45%"
      },
      "D": {
        "text": "2.3%"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Error analysis",
    "difficulty": "hard"
  },
  {
    "questionText": "In an experiment to determine the value of acceleration due to gravity g using a simple pendulum, the measured value of L is 20.0 cm known to 1 mm accuracy, and the time for 100 oscillations is 90 s using a clock of 1 s resolution. The percentage error in the determination of g is closest to:",
    "options": {
      "A": {
        "text": "2.72%"
      },
      "B": {
        "text": "1.36%"
      },
      "C": {
        "text": "0.5%"
      },
      "D": {
        "text": "4.5%"
      }
    },
    "correctAnswer": "A",
    "subject": "Physics",
    "chapter": "Units and Dimensions",
    "topic": "Error analysis",
    "difficulty": "hard"
  }
]

[
  {
    "questionText": "A mixture of 4.5 g of H₂O and 4.4 g of CO₂ is heated to a high temperature. What is the total number of moles of atoms of oxygen present in the mixture?",
    "options": {
      "A": {
        "text": "0.45 mol"
      },
      "B": {
        "text": "0.25 mol"
      },
      "C": {
        "text": "0.55 mol"
      },
      "D": {
        "text": "0.35 mol"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  },
  {
    "questionText": "18 g of glucose (C₆H₁₂O₆) is dissolved in 178.2 g of water in a container. The mass fraction of water vapour in the vapour phase, when this solution is heated to boiling, is closest to (assume ideal behaviour, glucose non-volatile):",
    "options": {
      "A": {
        "text": "1.00"
      },
      "B": {
        "text": "0.99"
      },
      "C": {
        "text": "0.90"
      },
      "D": {
        "text": "0.95"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  },
  {
    "questionText": "A sample of a mixture of CaCl₂ and NaCl weighing 4.44 g is treated to precipitate all the calcium as CaCO₃. This CaCO₃ is heated to convert all the calcium to CaO, and the final mass of CaO obtained is 0.56 g. The percentage by mass of CaCl₂ in the original mixture is closest to:",
    "options": {
      "A": {
        "text": "25%"
      },
      "B": {
        "text": "50%"
      },
      "C": {
        "text": "75%"
      },
      "D": {
        "text": "12.5%"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Stoichiometry",
    "difficulty": "hard"
  },
  {
    "questionText": "The number of water molecules present in 1 mL of water (assuming density 1 g/mL) is closest to:",
    "options": {
      "A": {
        "text": "3.34 × 10^22"
      },
      "B": {
        "text": "6.02 × 10^23"
      },
      "C": {
        "text": "1.67 × 10^22"
      },
      "D": {
        "text": "3.34 × 10^23"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  },
  {
    "questionText": "1 g of a metal carbonate (M₂CO₃) reacted completely with an excess of HCl solution to liberate 0.01186 mol of CO₂ gas. What is the molar mass of the metal M?",
    "options": {
      "A": {
        "text": "23 g/mol (sodium)"
      },
      "B": {
        "text": "39 g/mol (potassium)"
      },
      "C": {
        "text": "7 g/mol (lithium)"
      },
      "D": {
        "text": "40 g/mol (calcium)"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Stoichiometry",
    "difficulty": "hard"
  },
  {
    "questionText": "A hydrated salt Na₂SO₄·xH₂O has a molar mass of 322 g/mol. Given the molar mass of anhydrous Na₂SO₄ is 142 g/mol, the value of x is:",
    "options": {
      "A": {
        "text": "10"
      },
      "B": {
        "text": "7"
      },
      "C": {
        "text": "5"
      },
      "D": {
        "text": "9"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  },
  {
    "questionText": "10 g of a mixture of CaCO₃ and MgCO₃ was completely decomposed by heating to give a total of 2.912 L of CO₂ at STP. The percentage composition (by mass) of CaCO₃ in the mixture is closest to:",
    "options": {
      "A": {
        "text": "58.3%"
      },
      "B": {
        "text": "41.7%"
      },
      "C": {
        "text": "50%"
      },
      "D": {
        "text": "70%"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Stoichiometry",
    "difficulty": "hard"
  },
  {
    "questionText": "For the reaction N₂(g) + 3H₂(g) → 2NH₃(g), if 4 mol of N₂ and 9 mol of H₂ are taken, the limiting reagent and the maximum moles of NH₃ produced are:",
    "options": {
      "A": {
        "text": "H₂ is limiting; 6 mol NH₃"
      },
      "B": {
        "text": "N₂ is limiting; 8 mol NH₃"
      },
      "C": {
        "text": "H₂ is limiting; 3 mol NH₃"
      },
      "D": {
        "text": "N₂ is limiting; 6 mol NH₃"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Limiting reagent",
    "difficulty": "hard"
  },
  {
    "questionText": "0.5 mol of BaCl₂ is mixed with 0.2 mol of Na₃PO₄. The maximum amount of Ba₃(PO₄)₂ that can be formed, given the reaction 3BaCl₂ + 2Na₃PO₄ → Ba₃(PO₄)₂ + 6NaCl, is:",
    "options": {
      "A": {
        "text": "0.1 mol"
      },
      "B": {
        "text": "0.167 mol"
      },
      "C": {
        "text": "0.2 mol"
      },
      "D": {
        "text": "0.5 mol"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Limiting reagent",
    "difficulty": "hard"
  },
  {
    "questionText": "A gaseous mixture contains 56 g of N₂, 44 g of CO₂, and 16 g of CH₄. The total number of moles of gas in the mixture and the mole fraction of N₂ are respectively:",
    "options": {
      "A": {
        "text": "4 mol total; mole fraction of N₂ = 0.5"
      },
      "B": {
        "text": "3 mol total; mole fraction of N₂ = 0.33"
      },
      "C": {
        "text": "4 mol total; mole fraction of N₂ = 0.25"
      },
      "D": {
        "text": "5 mol total; mole fraction of N₂ = 0.4"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  },
  {
    "questionText": "The empirical formula of a compound is CH₂O and its molar mass is found to be 180 g/mol. If the empirical formula mass is 30 g/mol, the molecular formula of the compound is:",
    "options": {
      "A": {
        "text": "C₆H₁₂O₆"
      },
      "B": {
        "text": "C₃H₆O₃"
      },
      "C": {
        "text": "C₄H₈O₄"
      },
      "D": {
        "text": "C₂H₄O₂"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Empirical and molecular formula",
    "difficulty": "hard"
  },
  {
    "questionText": "A compound on analysis was found to contain 54.5% carbon, 9.1% hydrogen and 36.4% oxygen by mass. If the molar mass of the compound is 88 g/mol, its molecular formula is:",
    "options": {
      "A": {
        "text": "C₄H₈O₂"
      },
      "B": {
        "text": "C₃H₆O₂"
      },
      "C": {
        "text": "C₂H₄O₂"
      },
      "D": {
        "text": "C₄H₈O"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Empirical and molecular formula",
    "difficulty": "hard"
  },
  {
    "questionText": "1 mole of a hydrocarbon CxHy is completely combusted to produce 4 mol of CO₂ and 5 mol of H2O. The molecular formula of the hydrocarbon is:",
    "options": {
      "A": {
        "text": "C₄H₁₀"
      },
      "B": {
        "text": "C₄H₈"
      },
      "C": {
        "text": "C₅H₄"
      },
      "D": {
        "text": "C₄H₁₂"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Stoichiometry",
    "difficulty": "hard"
  },
  {
    "questionText": "The strength of 10 volume H₂O₂ solution (i.e., 1 L of this solution liberates 10 L of O₂ at STP on decomposition) expressed as molarity is closest to:",
    "options": {
      "A": {
        "text": "0.893 M"
      },
      "B": {
        "text": "1.786 M"
      },
      "C": {
        "text": "0.446 M"
      },
      "D": {
        "text": "3.57 M"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Concentration terms",
    "difficulty": "hard"
  },
  {
    "questionText": "What volume of 0.1 M H₂SO₄ is required to exactly neutralize 50 mL of 0.2 M NaOH solution?",
    "options": {
      "A": {
        "text": "50 mL"
      },
      "B": {
        "text": "25 mL"
      },
      "C": {
        "text": "100 mL"
      },
      "D": {
        "text": "12.5 mL"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Concentration terms",
    "difficulty": "hard"
  },
  {
    "questionText": "A 5.85 g sample of NaCl is dissolved in water to make exactly 500 mL of solution. What is the molarity of Na⁺ ions in this solution?",
    "options": {
      "A": {
        "text": "0.2 M"
      },
      "B": {
        "text": "0.1 M"
      },
      "C": {
        "text": "0.4 M"
      },
      "D": {
        "text": "0.02 M"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Concentration terms",
    "difficulty": "hard"
  },
  {
    "questionText": "1 mole of ferrous oxalate (FeC₂O₄) is completely oxidized by acidified KMnO₄. If x mol of KMnO₄ is required, and the relevant half-reactions show Fe²⁺ → Fe³⁺ (1 e⁻ loss) and C₂O₄²⁻ → 2CO₂ (2 e⁻ loss) per formula unit, the value of x is:",
    "options": {
      "A": {
        "text": "0.6 mol"
      },
      "B": {
        "text": "0.2 mol"
      },
      "C": {
        "text": "1.0 mol"
      },
      "D": {
        "text": "0.4 mol"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Redox stoichiometry",
    "difficulty": "hard"
  },
  {
    "questionText": "The number of moles of KMnO₄ required to completely oxidize 1 mole of FeSO₄ in acidic medium (Fe²⁺ → Fe³⁺, Mn⁷⁺ → Mn²⁺, a 5-electron change) is:",
    "options": {
      "A": {
        "text": "0.2 mol"
      },
      "B": {
        "text": "1 mol"
      },
      "C": {
        "text": "5 mol"
      },
      "D": {
        "text": "0.5 mol"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Redox stoichiometry",
    "difficulty": "hard"
  },
  {
    "questionText": "A solution is prepared by mixing 200 mL of 0.5 M HCl with 300 mL of 0.2 M HCl. The resulting molarity of HCl in the final mixed solution is:",
    "options": {
      "A": {
        "text": "0.32 M"
      },
      "B": {
        "text": "0.35 M"
      },
      "C": {
        "text": "0.28 M"
      },
      "D": {
        "text": "0.5 M"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Concentration terms",
    "difficulty": "hard"
  },
  {
    "questionText": "Density of a 3 M solution of NaCl is 1.25 g/mL. The molality of the solution (molar mass of NaCl = 58.5 g/mol) is closest to:",
    "options": {
      "A": {
        "text": "2.79 m"
      },
      "B": {
        "text": "3.00 m"
      },
      "C": {
        "text": "2.40 m"
      },
      "D": {
        "text": "3.50 m"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Concentration terms",
    "difficulty": "hard"
  },
  {
    "questionText": "For the reaction 2Al(s) + 6HCl(aq) → 2AlCl₃(aq) + 3H₂(g), if 5.4 g of Al reacts with 25 mL of 6 M HCl, the limiting reagent and the volume of H₂ gas produced at STP are:",
    "options": {
      "A": {
        "text": "HCl is limiting; 1.68 L H₂"
      },
      "B": {
        "text": "Al is limiting; 6.72 L H₂"
      },
      "C": {
        "text": "HCl is limiting; 3.36 L H₂"
      },
      "D": {
        "text": "Al is limiting; 1.68 L H₂"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Limiting reagent",
    "difficulty": "hard"
  },
  {
    "questionText": "The percentage yield of a reaction in which 10 g of reactant A theoretically produces 15 g of product B, but only 9 g of B is actually obtained, is:",
    "options": {
      "A": {
        "text": "60%"
      },
      "B": {
        "text": "90%"
      },
      "C": {
        "text": "66.7%"
      },
      "D": {
        "text": "50%"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Stoichiometry",
    "difficulty": "hard"
  },
  {
    "questionText": "Avogadro's number of electrons, when passed as current, carries a total charge of approximately (given charge of one electron = 1.6 × 10⁻¹⁹ C):",
    "options": {
      "A": {
        "text": "96,500 C"
      },
      "B": {
        "text": "6.02 × 10²³ C"
      },
      "C": {
        "text": "1.6 × 10⁻¹⁹ C"
      },
      "D": {
        "text": "9,650 C"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  },
  {
    "questionText": "How many significant figures should the answer to the calculation 4.237 × 2.1 have, and what is the correctly rounded value?",
    "options": {
      "A": {
        "text": "2 significant figures; 8.9"
      },
      "B": {
        "text": "4 significant figures; 8.898"
      },
      "C": {
        "text": "5 significant figures; 8.8977"
      },
      "D": {
        "text": "3 significant figures; 8.90"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Significant figures",
    "difficulty": "hard"
  },
  {
    "questionText": "A gas mixture contains equal masses of CH₄ and O₂. The ratio of the number of moles of CH₄ to O₂ in the mixture is:",
    "options": {
      "A": {
        "text": "2 : 1"
      },
      "B": {
        "text": "1 : 2"
      },
      "C": {
        "text": "1 : 1"
      },
      "D": {
        "text": "4 : 1"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  },
  {
    "questionText": "An element X forms two oxides with formulae XO and XO₂. If 3.0 g of X combines with 0.8 g of oxygen to form XO, and the same mass of X combines with 1.6 g of oxygen to form XO₂, this data illustrates:",
    "options": {
      "A": {
        "text": "The Law of Multiple Proportions"
      },
      "B": {
        "text": "The Law of Conservation of Mass"
      },
      "C": {
        "text": "The Law of Definite Proportions"
      },
      "D": {
        "text": "Avogadro's Law"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Laws of chemical combination",
    "difficulty": "hard"
  },
  {
    "questionText": "A vessel contains 1.6 g of O₂ and 2.8 g of N₂ at a certain temperature and pressure. The mole fraction of O₂ in the mixture is:",
    "options": {
      "A": {
        "text": "0.33"
      },
      "B": {
        "text": "0.5"
      },
      "C": {
        "text": "0.4"
      },
      "D": {
        "text": "0.25"
      }
    },
    "correctAnswer": "A",
    "subject": "Chemistry",
    "chapter": "Some Basic Concepts of Chemistry",
    "topic": "Mole concept",
    "difficulty": "hard"
  }
]






// ─────────────────────────────────────────────
// MAIN SEEDER FUNCTION
// ─────────────────────────────────────────────
function normalizeQuestion(q) {
  return {
    questionText: q.questionText,
    options: q.options,
    correctAnswer: q.correctAnswer,
    subject: q.subject,
    chapter: q.chapter,
    topic: q.topic || '',
    difficulty: q.difficulty || 'medium',
    type: 'mcq',
    source: q.source || 'pyq',
    sourceDetails: q.sourceDetails || {},
    pyq: q.pyq || { isPYQ: true },
    explanation: q.explanation || { text: '' },
    inSyllabus: true,
    isPublished: true,
    isVerified: true,
    qualityScore: 90,
    trendingFrequency: 'high',
  };
}

async function seedPYQQuestions() {
  console.log('\n🚀 Starting NEET PYQ seed script...\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB\n');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }

  const allQuestions = [
    ...physics2024,
    ...chemistry2024,
    ...biology2024,
    ...physics2023,
    ...chemistry2023,
    ...biology2023,
    ...physics2019,
    ...chemistry2019,
    ...biology2019,
    ...physics2018,
    ...biology2018,
  ].map(normalizeQuestion);

  console.log(`📦 Total questions to seed: ${allQuestions.length}`);

  const yearCounts = {};
  const subjectCounts = {};
  const difficultyCounts = {};

  allQuestions.forEach(q => {
    const yr = q.sourceDetails?.year || 'unknown';
    yearCounts[yr] = (yearCounts[yr] || 0) + 1;
    subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1;
  });

  console.log('\n📊 Breakdown:');
  console.log('  By Year:       ', yearCounts);
  console.log('  By Subject:    ', subjectCounts);
  console.log('  By Difficulty: ', difficultyCounts);
  console.log('');

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const q of allQuestions) {
    try {
      // Check for duplicate by question text (first 120 chars) + year
      const existing = await Question.findOne({
        questionText: { $regex: q.questionText.substring(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
        'sourceDetails.year': q.sourceDetails?.year
      });

      if (existing) {
        skipped++;
        continue;
      }

      await Question.create(q);
      inserted++;
    } catch (err) {
      if (err.code === 11000) {
        skipped++;
      } else {
        console.error(`  ❌ Failed to insert "${q.questionText.substring(0, 60)}...": ${err.message}`);
        failed++;
      }
    }
  }

  console.log('\n─────────────────────────────────────────');
  console.log(`✅ Inserted : ${inserted}`);
  console.log(`⏭  Skipped  : ${skipped} (already exist)`);
  console.log(`❌ Failed   : ${failed}`);
  console.log('─────────────────────────────────────────');
  console.log('\n🏁 PYQ seed complete!\n');

  await mongoose.connection.close();
  process.exit(0);
}

seedPYQQuestions().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
