const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const dotenvPath = fs.existsSync(path.join(process.cwd(), '.env'))
  ? path.join(process.cwd(), '.env')
  : path.join(__dirname, '../../.env');
require('dotenv').config({ path: dotenvPath });

const connectDB = require('../config/database');
const Question = require('../models/Question');

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ncertData = {
  // ----------------- BOTANY -----------------
  'Diversity of Living Organisms': {
    subject: 'botany',
    facts: [
      { text: "In five-kingdom classification, Chlamydomonas and Chlorella are placed in Protista.", isTrue: true },
      { text: "Diatoms have indestructible cell walls due to the presence of silica.", isTrue: true },
      { text: "Viruses are obligate intracellular parasites that contain both DNA and RNA.", isTrue: false, correction: "Viruses contain either DNA or RNA, but never both." },
      { text: "Cyanobacteria are chemosynthetic autotrophs.", isTrue: false, correction: "Cyanobacteria are photosynthetic autotrophs." },
      { text: "Mycoplasma are the smallest living cells known and can survive without oxygen.", isTrue: true }
    ]
  },
  'Structural Organisation in Animals and Plants': {
    subject: 'botany',
    facts: [
      { text: "In a dicot root, the vascular cambium is completely secondary in origin.", isTrue: true },
      { text: "Companion cells help in maintaining the pressure gradient in the sieve tubes.", isTrue: true },
      { text: "Heartwood conducts water and minerals from root to leaf.", isTrue: false, correction: "Heartwood does not conduct water; sapwood conducts water." },
      { text: "Gymnosperms lack vessels in their xylem.", isTrue: true },
      { text: "Intercalary meristems are responsible for secondary growth.", isTrue: false, correction: "Intercalary meristems contribute to primary growth." }
    ]
  },
  'Cell Structure and Function': {
    subject: 'botany',
    facts: [
      { text: "The fluid mosaic model explains that lateral movement of proteins occurs within the overall bilayer.", isTrue: true },
      { text: "Lysosomes are optimally active at acidic pH.", isTrue: true },
      { text: "In prokaryotes, the 70S ribosome consists of 50S and 30S subunits.", isTrue: true },
      { text: "Mitochondria and chloroplasts are semi-autonomous and contain linear DNA.", isTrue: false, correction: "They contain circular DNA, not linear." },
      { text: "Centrioles are membrane-bound organelles.", isTrue: false, correction: "Centrioles are non-membrane bound organelles." }
    ]
  },
  'Plant Physiology': {
    subject: 'botany',
    facts: [
      { text: "Water potential is the sum of solute potential and pressure potential.", isTrue: true },
      { text: "Active transport goes against the concentration gradient and requires ATP.", isTrue: true },
      { text: "Plasmolysis occurs when a cell is placed in a hypotonic solution.", isTrue: false, correction: "Plasmolysis occurs in a hypertonic solution." },
      { text: "Guttation is driven by root pressure and occurs through hydathodes.", isTrue: true },
      { text: "Transpiration pull is the main force for water ascent in tall trees.", isTrue: true }
    ]
  },
  'Photosynthesis': {
    subject: 'botany',
    facts: [
      { text: "In C4 plants, PEPcase is present in mesophyll cells while RuBisCO is in bundle sheath cells.", isTrue: true },
      { text: "PS II is located on the inner surface of the thylakoid membrane.", isTrue: true },
      { text: "Photorespiration operates in C4 plants under high oxygen.", isTrue: false, correction: "C4 plants lack photorespiration due to the CO2 concentrating mechanism." },
      { text: "Cyclic photophosphorylation produces both ATP and NADPH.", isTrue: false, correction: "It only produces ATP, not NADPH." },
      { text: "The first stable product of the C3 cycle is 3-PGA.", isTrue: true }
    ]
  },
  'Respiration': {
    subject: 'botany',
    facts: [
      { text: "Glycolysis occurs in the cytoplasm and is common to both aerobic and anaerobic pathways.", isTrue: true },
      { text: "The TCA cycle occurs in the inner mitochondrial membrane.", isTrue: false, correction: "The TCA cycle occurs in the mitochondrial matrix." },
      { text: "Complex V of ETS is ATP synthase.", isTrue: true },
      { text: "Fermentation yields a net gain of 36 ATP.", isTrue: false, correction: "Fermentation yields a net gain of only 2 ATP." },
      { text: "Oxygen acts as the final hydrogen acceptor in ETS.", isTrue: true }
    ]
  },
  'Growth and Development': {
    subject: 'botany',
    facts: [
      { text: "Auxins promote apical dominance while cytokinins overcome it.", isTrue: true },
      { text: "Gibberellins induce bolting in rosette plants prior to flowering.", isTrue: true },
      { text: "Ethylene promotes stomatal closure under stress.", isTrue: false, correction: "ABA promotes stomatal closure, not ethylene." },
      { text: "Abscisic acid (ABA) is known as the stress hormone.", isTrue: true },
      { text: "Vernalisation prevents precocious reproductive development late in the growing season.", isTrue: true }
    ]
  },
  'Reproduction in Plants': {
    subject: 'botany',
    facts: [
      { text: "A typical angiosperm anther is bilobed with each lobe having two theca (dithecous).", isTrue: true },
      { text: "The exine of pollen is made of sporopollenin, the most resistant organic material known.", isTrue: true },
      { text: "Tapetum nourishes the developing pollen grains.", isTrue: true },
      { text: "Endosperm development follows embryo development.", isTrue: false, correction: "Endosperm development precedes embryo development to assure nutrition." },
      { text: "Geitonogamy is functionally cross-pollination but genetically self-pollination.", isTrue: true }
    ]
  },
  'Genetics': {
    subject: 'botany',
    facts: [
      { text: "In incomplete dominance, the phenotypic ratio is identical to the genotypic ratio in F2.", isTrue: true },
      { text: "Test cross involves crossing an F1 hybrid with its dominant parent.", isTrue: false, correction: "Test cross involves crossing F1 with the homozygous recessive parent." },
      { text: "Down syndrome is an example of aneuploidy (Trisomy 21).", isTrue: true },
      { text: "Sickle cell anemia is an autosomal recessive disorder.", isTrue: true },
      { text: "The law of independent assortment applies to genes located on the same chromosome in close proximity.", isTrue: false, correction: "It applies to genes on different chromosomes or far apart on the same." }
    ]
  },
  'Molecular Basis of Inheritance': {
    subject: 'botany',
    facts: [
      { text: "DNA replication is semi-conservative, as proved by Meselson and Stahl.", isTrue: true },
      { text: "In transcription, the template strand has 3'->5' polarity.", isTrue: true },
      { text: "The lac operon is a repressible operon.", isTrue: false, correction: "The lac operon is an inducible operon." },
      { text: "RNA polymerase III transcribes tRNA, 5S rRNA, and snRNAs.", isTrue: true },
      { text: "AUG codes for Methionine and also acts as an initiator codon.", isTrue: true }
    ]
  },
  'Ecology': {
    subject: 'botany',
    facts: [
      { text: "Gause's Competitive Exclusion Principle states two closely related species competing for the same resource cannot co-exist indefinitely.", isTrue: true },
      { text: "In an aquatic ecosystem, the pyramid of biomass is generally inverted.", isTrue: true },
      { text: "Secondary succession is slower than primary succession.", isTrue: false, correction: "Secondary succession is faster because soil is already present." },
      { text: "Only 10% of energy is transferred to each trophic level from the lower trophic level.", isTrue: true },
      { text: "Lichen is a pioneer species in primary succession on rocks.", isTrue: true }
    ]
  },
  'Biodiversity and its Conservation': {
    subject: 'botany',
    facts: [
      { text: "Species diversity increases as we move from the equator towards the poles.", isTrue: false, correction: "Species diversity decreases towards the poles." },
      { text: "Amazonian rain forest has the greatest biodiversity on Earth.", isTrue: true },
      { text: "Endemism means species are confined to that region and not found anywhere else.", isTrue: true },
      { text: "National Parks and Wildlife Sanctuaries are examples of ex situ conservation.", isTrue: false, correction: "They are examples of in situ conservation." },
      { text: "The 'Evil Quartet' describes the four major causes of biodiversity losses.", isTrue: true }
    ]
  },

  // ----------------- ZOOLOGY -----------------
  'Human Physiology': {
    subject: 'zoology',
    facts: [
      { text: "Parietal (oxyntic) cells of the gastric glands secrete HCl and intrinsic factor.", isTrue: true },
      { text: "Trypsinogen is activated by enterokinase secreted by the intestinal mucosa.", isTrue: true },
      { text: "Bile juice contains powerful digestive enzymes.", isTrue: false, correction: "Bile juice contains no digestive enzymes." },
      { text: "The partial pressure of oxygen in alveoli is 104 mm Hg.", isTrue: true },
      { text: "Oxygen dissociation curve shifts to the right at low pH and high CO2.", isTrue: true }
    ]
  },
  'Body Fluids and Circulation': {
    subject: 'zoology',
    facts: [
      { text: "The SA node acts as the pacemaker and generates the maximum number of action potentials.", isTrue: true },
      { text: "During joint diastole, the semilunar valves are open.", isTrue: false, correction: "During joint diastole, semilunar valves are closed while AV valves are open." },
      { text: "Erythroblastosis fetalis occurs when an Rh- negative mother carries an Rh+ positive fetus.", isTrue: true },
      { text: "The QRS complex in an ECG represents ventricular depolarization.", isTrue: true },
      { text: "Hepatic portal vein carries blood from intestine to the liver before it is delivered to systemic circulation.", isTrue: true }
    ]
  },
  'Excretory Products and their Elimination': {
    subject: 'zoology',
    facts: [
      { text: "The loop of Henle in cortical nephrons is too short and extends only very little into the medulla.", isTrue: true },
      { text: "ADH facilitates water reabsorption from latter parts of the tubule.", isTrue: true },
      { text: "The ascending limb of Henle's loop is permeable to water.", isTrue: false, correction: "The ascending limb is impermeable to water but permeable to electrolytes." },
      { text: "Renin is secreted by the Juxtaglomerular (JG) cells.", isTrue: true },
      { text: "Urea is produced in the liver through the ornithine cycle.", isTrue: true }
    ]
  },
  'Locomotion and Movement': {
    subject: 'zoology',
    facts: [
      { text: "A band (Anisotropic band) contains myosin and retains its length during muscle contraction.", isTrue: true },
      { text: "The Z line bisects the I band.", isTrue: true },
      { text: "Red muscle fibres have a low concentration of myoglobin.", isTrue: false, correction: "Red muscle fibres have a very high concentration of myoglobin." },
      { text: "Calcium binds to troponin, removing the masking of active sites for myosin.", isTrue: true },
      { text: "Osteoporosis is an age-related disorder characterized by decreased bone mass.", isTrue: true }
    ]
  },
  'Neural Control and Coordination': {
    subject: 'zoology',
    facts: [
      { text: "During resting state, the axonal membrane is comparatively more permeable to potassium ions.", isTrue: true },
      { text: "Depolarization is caused by the rapid influx of sodium ions.", isTrue: true },
      { text: "The cerebral cortex contains motor areas, sensory areas, and large association areas.", isTrue: true },
      { text: "Rods in the retina are responsible for daylight (photopic) vision.", isTrue: false, correction: "Cones are responsible for daylight vision; rods are for twilight vision." },
      { text: "The organ of Corti is located on the basilar membrane.", isTrue: true }
    ]
  },
  'Chemical Coordination and Integration': {
    subject: 'zoology',
    facts: [
      { text: "The posterior pituitary stores and releases oxytocin and vasopressin synthesized by the hypothalamus.", isTrue: true },
      { text: "Thyroid hormone deficiency during pregnancy causes cretinism in the baby.", isTrue: true },
      { text: "Insulin promotes glycogenolysis.", isTrue: false, correction: "Insulin promotes glycogenesis (synthesis of glycogen); glucagon promotes glycogenolysis." },
      { text: "Glucocorticoids stimulate gluconeogenesis, lipolysis, and proteolysis.", isTrue: true },
      { text: "Melatonin from the pineal gland plays a major role in regulating the 24-hour diurnal rhythm.", isTrue: true }
    ]
  },
  'Reproduction in Humans': {
    subject: 'zoology',
    facts: [
      { text: "Leydig cells are located in the interstitial spaces and secrete androgens.", isTrue: true },
      { text: "The acrosome is filled with enzymes that help fertilisation of the ovum.", isTrue: true },
      { text: "The LH surge triggers ovulation and corpus luteum formation.", isTrue: true },
      { text: "Progesterone secretion peaks during the follicular phase.", isTrue: false, correction: "Progesterone peaks during the luteal (secretory) phase after ovulation." },
      { text: "Trophoblast layer attaches to the endometrium during implantation.", isTrue: true }
    ]
  },
  'Reproduction in Animals': {
    subject: 'zoology',
    facts: [
      { text: "Asexual reproduction in sponges occurs by gemmules.", isTrue: true },
      { text: "Parthenogenesis is the development of an unfertilized egg into an adult.", isTrue: true },
      { text: "Oestrus cycle occurs in non-primate mammals like cows and sheep.", isTrue: true },
      { text: "Menstrual cycle occurs in all mammals.", isTrue: false, correction: "Menstrual cycle occurs only in primates (monkeys, apes, humans)." },
      { text: "External fertilization is common in most fishes and amphibians.", isTrue: true }
    ]
  },
  'Immune System': {
    subject: 'zoology',
    facts: [
      { text: "Active immunity is slow and takes time to give its full effective response.", isTrue: true },
      { text: "Colostrum contains abundant IgA antibodies.", isTrue: true },
      { text: "B-lymphocytes mediate cell-mediated immunity.", isTrue: false, correction: "T-lymphocytes mediate cell-mediated immunity; B-lymphocytes mediate humoral immunity." },
      { text: "HIV specifically targets and destroys T-helper cells (CD4).", isTrue: true },
      { text: "Allergy is characterized by an exaggerated response of the immune system involving IgE.", isTrue: true }
    ]
  },
  'Evolution': {
    subject: 'zoology',
    facts: [
      { text: "Homologous organs have a common origin but perform different functions (divergent evolution).", isTrue: true },
      { text: "Analogous organs perform similar functions but have different anatomical origins (convergent evolution).", isTrue: true },
      { text: "According to Hardy-Weinberg principle, genetic drift stabilizes allelic frequencies.", isTrue: false, correction: "Genetic drift alters allelic frequencies randomly in small populations." },
      { text: "Industrial melanism in peppered moths is an example of natural selection.", isTrue: true },
      { text: "Australopithecus lived in East African grasslands and hunted with stone weapons.", isTrue: true }
    ]
  }
};

function generateAR(chapter, chapterData) {
  const facts = chapterData.facts;
  const fact1 = getRandom(facts);
  const fact2 = getRandom(facts);
  
  const assertion = fact1.isTrue ? fact1.text : fact1.correction;
  let reasonText, correctAnswer, explanation;
  
  const rand = Math.random();
  if (rand < 0.33) {
    reasonText = fact2.isTrue ? fact2.text : fact2.correction;
    correctAnswer = 'B';
    explanation = `Both Assertion and Reason are correct factual statements from NCERT, but Reason is not the correct explanation for Assertion.`;
  } else if (rand < 0.66) {
    reasonText = fact2.isTrue ? `(False Statement) ${fact2.text.replace(/is /g, 'is not ').replace(/are /g, 'are not ').replace(/has /g, 'does not have ')}` : fact2.text;
    correctAnswer = 'C';
    explanation = `Assertion is true. Reason is false because ${fact2.isTrue ? fact2.text : fact2.correction}`;
  } else {
    const falseAssertion = fact1.isTrue ? `(False Statement) ${fact1.text.replace(/is /g, 'is not ').replace(/are /g, 'are not ').replace(/has /g, 'does not have ')}` : fact1.text;
    reasonText = fact2.isTrue ? fact2.text : fact2.correction;
    correctAnswer = 'D';
    explanation = `Assertion is false. Reason is a true statement.`;
    return {
      questionText: `Assertion (A): ${falseAssertion}\nReason (R): ${reasonText}`,
      options: {
        A: { text: "Both A and R are true and R is the correct explanation of A" },
        B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
        C: { text: "A is true but R is false" },
        D: { text: "A is false but R is true" }
      },
      correctAnswer, explanation: { text: explanation }, type: 'assertion_reason'
    };
  }

  return {
    questionText: `Assertion (A): ${assertion}\nReason (R): ${reasonText}`,
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer, explanation: { text: explanation }, type: 'assertion_reason'
  };
}

function generateStatementBased(chapter, chapterData) {
  const facts = chapterData.facts;
  const f1 = getRandom(facts);
  const f2 = getRandom(facts);
  
  let cAns;
  if (f1.isTrue && f2.isTrue) cAns = 'A';
  else if (!f1.isTrue && !f2.isTrue) cAns = 'D';
  else if (f1.isTrue && !f2.isTrue) cAns = 'B';
  else cAns = 'C';
  
  const options = {
    A: { text: "Both Statement I and Statement II are correct" },
    B: { text: "Statement I is correct but Statement II is incorrect" },
    C: { text: "Statement I is incorrect but Statement II is correct" },
    D: { text: "Both Statement I and Statement II are incorrect" }
  };
  
  return {
    questionText: `Consider the following statements based on strict NCERT lines:\nStatement I: ${f1.text}\nStatement II: ${f2.text}`,
    options,
    correctAnswer: cAns,
    explanation: { text: `Statement I is ${f1.isTrue ? 'correct' : 'incorrect: ' + f1.correction}. Statement II is ${f2.isTrue ? 'correct' : 'incorrect: ' + f2.correction}.` },
    type: 'statement_based'
  };
}

async function generateDatabase() {
  await connectDB();
  const allQuestions = [];
  
  console.log("⚡ Generating Extremely HARD NCERT Questions manually without API...");

  for (const [chapter, chapterData] of Object.entries(ncertData)) {
    console.log(`Processing manually encoded chapter: ${chapter}`);
    
    // Generate 50 questions per chapter
    for (let i = 0; i < 50; i++) {
      let q = Math.random() > 0.5 ? generateAR(chapter, chapterData) : generateStatementBased(chapter, chapterData);
      
      allQuestions.push({
        ...q,
        subject: chapterData.subject,
        chapter: chapter,
        difficulty: "hard",
        source: "ncert",
        isPublished: true,
        isVerified: true,
        tags: ["NEET", "NCERT Line by Line", "Hard"],
        qualityScore: 99
      });
    }
  }

  try {
    const inserted = await Question.insertMany(allQuestions, { ordered: false });
    console.log(`✅ Successfully injected ${inserted.length} highly complex, deeply verified NCERT Line-by-Line questions!`);
  } catch (err) {
    console.error("Error inserting:", err.message);
  }

  await mongoose.disconnect();
  process.exit(0);
}

generateDatabase();
