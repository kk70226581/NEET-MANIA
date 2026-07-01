require('dotenv').config();
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

const seed = async () => {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await connectDB();

  const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@solnut.local').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  let admin = await User.findOne({ email: adminEmail });
  if (!admin && adminPassword && adminPassword !== 'change_me_in_production') {
    admin = await User.create({
      firstName: 'Solnut',
      lastName: 'Admin',
      email: adminEmail,
      password: adminPassword,
      class: 'drop',
      role: 'admin',
      isVerified: true
    });
  } else if (admin && admin.role !== 'admin' && adminPassword) {
    admin.role = 'admin';
    await admin.save();
  }

  const questions = buildQuestionBank();
  await Question.bulkWrite(questions.map((question) => ({
    updateOne: {
      filter: { questionId: question.questionId },
      update: {
        $set: {
          ...question,
          ...(admin ? { uploadedBy: admin._id, verifiedBy: admin._id } : {}),
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      upsert: true
    }
  })));

  console.log(`Seeded ${questions.length} published demo questions.`);
  if (admin) {
    console.log(`Admin account: ${adminEmail}`);
  } else {
    console.log('Demo bank seeded. Set ADMIN_EMAIL and ADMIN_PASSWORD, then rerun to create an admin account.');
  }
};

seed()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
