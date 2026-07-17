/**
 * Direct NEET Biology Seeder - Breathing and Exchange of Gases (50 questions)
 * Run using: node src/scripts/seedBreathingDirectly.js
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
  // ─── SUBTOPIC 1: RESPIRATORY ORGANS & MECHANISM OF BREATHING (1-9) ───
  {
    questionText: "Which of the following animals respiratory organ is correctly matched with its classification?",
    options: {
      A: { text: "Earthworm - Moist cuticle" },
      B: { text: "Insects - Gills" },
      C: { text: "Fishes - Lungs" },
      D: { text: "Reptiles - Tracheal tubes" }
    },
    correctAnswer: "A",
    explanation: "Earthworms use their moist skin/cuticle for cutaneous respiration. Insects use a tracheal system, fishes use gills, and reptiles use lungs.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Organs",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "268" }
  },
  {
    questionText: "During inspiration, the diaphragm and external intercostal muscles contract. This causes:",
    options: {
      A: { text: "Decrease in thoracic volume and increase in intra-pulmonary pressure" },
      B: { text: "Increase in thoracic volume and decrease in intra-pulmonary pressure" },
      C: { text: "Decrease in thoracic volume and decrease in intra-pulmonary pressure" },
      D: { text: "Increase in thoracic volume and increase in intra-pulmonary pressure" }
    },
    correctAnswer: "B",
    explanation: "Contraction of diaphragm increases the thoracic volume in the antero-posterior axis. Contraction of external intercostals lifts ribs/sternum increasing volume dorso-ventrally. Increased volume leads to decreased pressure, driving air in.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Mechanism of Breathing",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "270" }
  },
  {
    questionText: "Which muscular contractions are responsible for active expiration in humans during forced breathing?",
    options: {
      A: { text: "Internal intercostal muscles and abdominal muscles" },
      B: { text: "External intercostal muscles and diaphragm" },
      C: { text: "Diaphragm and abdominal muscles" },
      D: { text: "External intercostal muscles and internal intercostal muscles" }
    },
    correctAnswer: "A",
    explanation: "Normal expiration is a passive process. Forced expiration is active, utilizing contraction of internal intercostal muscles (which pull the ribs down) and abdominal muscles (which push the diaphragm up).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Mechanism of Breathing",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "271" }
  },
  {
    questionText: "Assertion (A): Inspiration occurs when there is a negative pressure in the lungs with respect to atmospheric pressure.\nReason (R): The contraction of diaphragm decreases the volume of the thoracic chamber in the antero-posterior axis.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "C",
    explanation: "A is true because negative pressure drives air into the lungs. R is false because diaphragm contraction increases (not decreases) the thoracic volume.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Mechanism of Breathing",
    difficulty: "medium", type: "assertion_reason", source: "custom", ncertReference: { class: "11", page: "270" }
  },
  {
    questionText: "The intra-pleural pressure is always negative during normal breathing. What is the primary reason for this?",
    options: {
      A: { text: "Constant action of pleural fluid pumps" },
      B: { text: "Elastic recoil of lungs pulling inward and chest wall pulling outward" },
      C: { text: "Active contraction of the diaphragm" },
      D: { text: "High atmospheric pressure pushing on the chest wall" }
    },
    correctAnswer: "B",
    explanation: "The opposing forces of lung elastic recoil (pulling inward) and chest wall elasticity (pulling outward) create a sub-atmospheric (negative) pressure in the pleural cavity, preventing lung collapse.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Mechanism of Breathing",
    difficulty: "hard", type: "mcq", source: "custom", ncertReference: { class: "11", page: "270" }
  },
  {
    questionText: "Match Column I with Column II regarding respiratory organs:\nColumn I:\n(a) Larynx\n(b) Trachea\n(c) Epiglottis\n(d) Pleural fluid\n\nColumn II:\n(i) Cartilaginous flap preventing entry of food\n(ii) Sound box\n(iii) Reduces friction on lung surface\n(iv) Straight tube extending up to mid-thoracic cavity",
    options: {
      A: { text: "a-(ii), b-(iv), c-(i), d-(iii)" },
      B: { text: "a-(ii), b-(i), c-(iv), d-(iii)" },
      C: { text: "a-(iii), b-(iv), c-(i), d-(ii)" },
      D: { text: "a-(i), b-(iv), c-(ii), d-(iii)" }
    },
    correctAnswer: "A",
    explanation: "Larynx is the sound box (ii); trachea is a straight tube extending up to the mid-thoracic cavity (iv); epiglottis is a cartilaginous flap (i); pleural fluid reduces friction (iii).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Organs",
    difficulty: "easy", type: "match_following", source: "custom", ncertReference: { class: "11", page: "269" }
  },
  {
    questionText: "Consider the following statements:\n(i) Healthy human breathes 12-16 times per minute.\n(ii) The volume of air involved in breathing movements can be estimated using a spirometer.\nSelect the correct option:",
    options: {
      A: { text: "Statement (i) is correct but (ii) is incorrect" },
      B: { text: "Statement (ii) is correct but (i) is incorrect" },
      C: { text: "Both statements (i) and (ii) are correct" },
      D: { text: "Both statements (i) and (ii) are incorrect" }
    },
    correctAnswer: "C",
    explanation: "Both statements are direct facts from NCERT Class 11 Biology: breathing rate is 12-16 breaths/min and spirometry estimates breathing volumes.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Mechanism of Breathing",
    difficulty: "easy", type: "statement_based", source: "custom", ncertReference: { class: "11", page: "271" }
  },
  {
    questionText: "The conducting zone of the human respiratory system extends from the external nostrils up to the:",
    options: {
      A: { text: "Primary bronchi" },
      B: { text: "Terminal bronchioles" },
      C: { text: "Respiratory bronchioles" },
      D: { text: "Alveolar ducts" }
    },
    correctAnswer: "B",
    explanation: "The conducting part starts from nostrils up to terminal bronchioles. The respiratory or exchange part consists of alveoli and their ducts.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Organs",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "269" }
  },
  {
    questionText: "Assertion (A): Trachea, primary, secondary and tertiary bronchi, and initial bronchioles are supported by incomplete cartilaginous rings.\nReason (R): These cartilaginous rings are made of elastic cartilage to allow maximum expansion during forced inhalation.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "C",
    explanation: "A is true because these structures are indeed supported by incomplete rings. R is false because the cartilaginous rings are made of hyaline cartilage, not elastic cartilage.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Organs",
    difficulty: "hard", type: "assertion_reason", source: "custom", ncertReference: { class: "11", page: "269" }
  },

  // ─── SUBTOPIC 2: RESPIRATORY VOLUMES AND CAPACITIES (10-18) ───
  {
    questionText: "What is the typical volume of air inspired or expired during normal respiration (Tidal Volume) in a healthy young human?",
    options: {
      A: { text: "500 mL" },
      B: { text: "1000 mL" },
      C: { text: "2500 mL" },
      D: { text: "6000 mL" }
    },
    correctAnswer: "A",
    explanation: "Tidal Volume (TV) is about 500 mL. A healthy man can inspire or expire approximately 6000 to 8000 mL of air per minute.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "271" }
  },
  {
    questionText: "Select the correct formula representing Vital Capacity (VC):",
    options: {
      A: { text: "VC = TV + IRV + RV" },
      B: { text: "VC = TV + ERV + RV" },
      C: { text: "VC = TV + IRV + ERV" },
      D: { text: "VC = ERV + RV" }
    },
    correctAnswer: "C",
    explanation: "Vital Capacity (VC) is the maximum volume of air a person can breathe in after a forced expiration. VC = ERV + TV + IRV.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Residual Volume (RV) is defined as the volume of air remaining in the lungs even after a forcible expiration. Its value is approximately:",
    options: {
      A: { text: "500 mL - 1000 mL" },
      B: { text: "1100 mL - 1200 mL" },
      C: { text: "2500 mL - 3000 mL" },
      D: { text: "3500 mL - 4500 mL" }
    },
    correctAnswer: "B",
    explanation: "Residual Volume (RV) averages 1100 mL to 1200 mL in a healthy adult.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Match the following capacities/volumes with their values:\n(a) Tidal Volume\n(b) Inspiratory Reserve Volume\n(c) Expiratory Reserve Volume\n(d) Residual Volume\n\n(i) 2500 - 3000 mL\n(ii) 1100 - 1200 mL\n(iii) 500 mL\n(iv) 1000 - 1100 mL",
    options: {
      A: { text: "a-(iii), b-(i), c-(iv), d-(ii)" },
      B: { text: "a-(iii), b-(iv), c-(i), d-(ii)" },
      C: { text: "a-(ii), b-(i), c-(iv), d-(iii)" },
      D: { text: "a-(iii), b-(i), c-(ii), d-(iv)" }
    },
    correctAnswer: "A",
    explanation: "Tidal Volume is 500 mL (iii), IRV is 2500-3000 mL (i), ERV is 1000-1100 mL (iv), Residual Volume is 1100-1200 mL (ii).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "medium", type: "match_following", source: "custom", ncertReference: { class: "11", page: "271" }
  },
  {
    questionText: "Functional Residual Capacity (FRC) represents the volume of air that remains in lungs after normal expiration. FRC is equal to:",
    options: {
      A: { text: "ERV + TV" },
      B: { text: "IRV + RV" },
      C: { text: "ERV + RV" },
      D: { text: "IC + RV" }
    },
    correctAnswer: "C",
    explanation: "FRC is the volume of air remaining in the lungs after a normal expiration. FRC = ERV + RV.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Which of the following lung volumes or capacities CANNOT be measured directly by simple spirometry?",
    options: {
      A: { text: "Tidal Volume and Inspiratory Capacity" },
      B: { text: "Expiratory Reserve Volume and Vital Capacity" },
      C: { text: "Residual Volume, Functional Residual Capacity, and Total Lung Capacity" },
      D: { text: "Inspiratory Reserve Volume and Expiratory Capacity" }
    },
    correctAnswer: "C",
    explanation: "Spirometry cannot measure air that cannot be exhaled, i.e., Residual Volume (RV). Since FRC and TLC both include RV, they also cannot be measured directly by simple spirometry.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "hard", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Assertion (A): Vital capacity is the maximum volume of air a person can breathe in after a forced expiration.\nReason (R): Vital capacity includes Tidal Volume, Inspiratory Reserve Volume and Residual Volume.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "C",
    explanation: "A is true (NCERT definition of VC). R is false because Vital Capacity includes ERV, TV, and IRV, but NOT Residual Volume (RV).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "medium", type: "assertion_reason", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "A person has a Tidal Volume of 500 mL, a respiratory rate of 12 breaths/minute, and an anatomical dead space of 150 mL. What is their Alveolar Ventilation Rate (AVR) per minute?",
    options: {
      A: { text: "6000 mL/min" },
      B: { text: "4200 mL/min" },
      C: { text: "1800 mL/min" },
      D: { text: "5850 mL/min" }
    },
    correctAnswer: "B",
    explanation: "Alveolar Ventilation Rate = (Tidal Volume - Dead Space Volume) × Breathing Rate = (500 - 150) × 12 = 350 × 12 = 4200 mL/min.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "hard", type: "mcq", source: "custom", ncertReference: { class: "11", page: "271" }
  },
  {
    questionText: "If a person's Tidal Volume is 550 mL, Expiratory Reserve Volume is 1100 mL, and Inspiratory Capacity is 3200 mL, what is their Inspiratory Reserve Volume (IRV)?",
    options: {
      A: { text: "2100 mL" },
      B: { text: "2650 mL" },
      C: { text: "1650 mL" },
      D: { text: "1550 mL" }
    },
    correctAnswer: "B",
    explanation: "Inspiratory Capacity (IC) = TV + IRV. Therefore, IRV = IC - TV = 3200 mL - 550 mL = 2650 mL.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Volumes",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },

  // ─── SUBTOPIC 3: EXCHANGE OF GASES (19-27) ───
  {
    questionText: "What are the partial pressures of oxygen (pO2) and carbon dioxide (pCO2) in the atmospheric air (in mmHg) compared to alveolar air?",
    options: {
      A: { text: "Atmospheric: pO2 = 159, pCO2 = 0.3; Alveolar: pO2 = 104, pCO2 = 40" },
      B: { text: "Atmospheric: pO2 = 104, pCO2 = 40; Alveolar: pO2 = 159, pCO2 = 0.3" },
      C: { text: "Atmospheric: pO2 = 40, pCO2 = 46; Alveolar: pO2 = 95, pCO2 = 40" },
      D: { text: "Atmospheric: pO2 = 159, pCO2 = 40; Alveolar: pO2 = 104, pCO2 = 46" }
    },
    correctAnswer: "A",
    explanation: "In atmospheric air: pO2 = 159, pCO2 = 0.3 mmHg. In alveoli: pO2 = 104, pCO2 = 40 mmHg. This gradient allows diffusion of O2 into the blood and CO2 out.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "The diffusion membrane is made up of three layers. Which of the following is NOT one of these layers?",
    options: {
      A: { text: "Thin squamous epithelium of alveoli" },
      B: { text: "Endothelium of alveolar capillaries" },
      C: { text: "Basement substance in between them" },
      D: { text: "Smooth muscle layers of respiratory bronchioles" }
    },
    correctAnswer: "D",
    explanation: "The diffusion membrane (total thickness < 1 mm) consists of: 1) squamous epithelium of alveoli, 2) endothelium of alveolar capillaries, and 3) basement membrane. Smooth muscle is not part of this membrane.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "273" }
  },
  {
    questionText: "The solubility of CO2 in blood is approximately how many times higher than that of O2?",
    options: {
      A: { text: "2 to 5 times" },
      B: { text: "20 to 25 times" },
      C: { text: "50 to 100 times" },
      D: { text: "200 to 250 times" }
    },
    correctAnswer: "B",
    explanation: "CO2 solubility is 20-25 times higher than that of O2, which makes the rate of diffusion of CO2 across the respiratory membrane per unit difference in partial pressure much higher than that of O2.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "273" }
  },
  {
    questionText: "Identify the correct values of partial pressure of O2 and CO2 in deoxygenated blood (in mmHg):",
    options: {
      A: { text: "pO2 = 40, pCO2 = 45" },
      B: { text: "pO2 = 95, pCO2 = 40" },
      C: { text: "pO2 = 104, pCO2 = 40" },
      D: { text: "pO2 = 40, pCO2 = 40" }
    },
    correctAnswer: "A",
    explanation: "Deoxygenated blood has a pO2 of 40 mmHg and a pCO2 of 45 mmHg. Oxygenated blood has a pO2 of 95 mmHg and a pCO2 of 40 mmHg.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Assertion (A): The amount of CO2 that can diffuse through the diffusion membrane per unit difference in partial pressure is much higher than that of O2.\nReason (R): The solubility of CO2 in blood is 20-25 times higher than that of O2.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "A",
    explanation: "Both statements are true and R explains A perfectly because higher solubility directly causes a higher rate of diffusion across the membrane.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "medium", type: "assertion_reason", source: "custom", ncertReference: { class: "11", page: "273" }
  },
  {
    questionText: "What is the direction of concentration gradient for oxygen and carbon dioxide from tissues to alveoli?",
    options: {
      A: { text: "O2: Tissues -> Blood -> Alveoli; CO2: Alveoli -> Blood -> Tissues" },
      B: { text: "O2: Alveoli -> Blood -> Tissues; CO2: Tissues -> Blood -> Alveoli" },
      C: { text: "O2: Tissues -> Alveoli; CO2: Alveoli -> Tissues" },
      D: { text: "Both flow from Tissues -> Blood -> Alveoli" }
    },
    correctAnswer: "B",
    explanation: "O2 moves from higher pressure (Alveoli, 104) to lower pressure (Tissues, 40). CO2 moves from higher pressure (Tissues, 45) to lower pressure (Alveoli, 40).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Which of the following physical factors does NOT directly affect the rate of simple gas diffusion across the alveolar membrane?",
    options: {
      A: { text: "Solubility of the gases" },
      B: { text: "Thickness of the diffusion membrane" },
      C: { text: "Partial pressure gradient of the gases" },
      D: { text: "pH and temperature of the alveolar air" }
    },
    correctAnswer: "D",
    explanation: "The rate of gas diffusion depends on solubility, thickness of membrane, and pressure gradients. Although pH and temperature affect hemoglobin binding (transport), they do not directly dictate simple diffusion rates across the membrane.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "hard", type: "mcq", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Match the following locations with their correct pO2 values:\n(a) Alveoli\n(b) Deoxygenated blood\n(c) Oxygenated blood\n(d) Tissues\n\n(i) 95 mmHg\n(ii) 40 mmHg\n(iii) 104 mmHg\n(iv) 40 mmHg",
    options: {
      A: { text: "a-(iii), b-(ii), c-(i), d-(iv)" },
      B: { text: "a-(ii), b-(iii), c-(i), d-(iv)" },
      C: { text: "a-(iii), b-(iv), c-(ii), d-(i)" },
      D: { text: "a-(i), b-(ii), c-(iii), d-(iv)" }
    },
    correctAnswer: "A",
    explanation: "Alveoli pO2 is 104 mmHg (iii), deoxygenated blood is 40 mmHg (ii), oxygenated blood is 95 mmHg (i), tissue is 40 mmHg (iv).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "medium", type: "match_following", source: "custom", ncertReference: { class: "11", page: "272" }
  },
  {
    questionText: "Consider the following statements regarding the diffusion membrane:\n(i) Its total thickness is much less than a millimeter.\n(ii) All the factors in our body are structured to facilitate diffusion of O2 from alveoli to tissues and CO2 from tissues to alveoli.\nSelect the correct option:",
    options: {
      A: { text: "Statement (i) is correct but (ii) is incorrect" },
      B: { text: "Statement (ii) is correct but (i) is incorrect" },
      C: { text: "Both statements (i) and (ii) are correct" },
      D: { text: "Both statements (i) and (ii) are incorrect" }
    },
    correctAnswer: "C",
    explanation: "Both statements are correct. The total thickness is less than 1 mm (0.2 mm average), and the body gradients are optimized for O2 intake and CO2 removal.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Exchange of Gases",
    difficulty: "medium", type: "statement_based", source: "custom", ncertReference: { class: "11", page: "273" }
  },

  // ─── SUBTOPIC 4: TRANSPORT OF GASES (28-36) ───
  {
    questionText: "What percentage of oxygen is transported in a dissolved state through the plasma?",
    options: {
      A: { text: "About 97%" },
      B: { text: "About 20-25%" },
      C: { text: "About 7%" },
      D: { text: "About 3%" }
    },
    correctAnswer: "D",
    explanation: "About 97% of O2 is transported by RBCs as oxyhemoglobin. The remaining 3% is carried in a dissolved state through plasma.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "274" }
  },
  {
    questionText: "Under normal physiological conditions, every 100 mL of oxygenated blood can deliver around how many mL of O2 to the tissues?",
    options: {
      A: { text: "5 mL" },
      B: { text: "15 mL" },
      C: { text: "20 mL" },
      D: { text: "4 mL" }
    },
    correctAnswer: "A",
    explanation: "Every 100 mL of oxygenated blood delivers about 5 mL of oxygen to the tissues under normal physiological conditions.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "274" }
  },
  {
    questionText: "Which of the following factors shifts the oxygen dissociation curve to the right (facilitating oxygen release to tissues)?",
    options: {
      A: { text: "High pO2, low pCO2, low H+ concentration, low temperature" },
      B: { text: "Low pO2, high pCO2, high H+ concentration, high temperature" },
      C: { text: "Low pO2, low pCO2, low H+ concentration, low temperature" },
      D: { text: "High pO2, high pCO2, low H+ concentration, low temperature" }
    },
    correctAnswer: "B",
    explanation: "A right shift (Bohr effect) decreases hemoglobin's affinity for O2, promoting O2 unloading. This is caused by low pO2, high pCO2, high acidity (high H+/low pH), and high temperature (typical of metabolizing tissues).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "hard", type: "mcq", source: "custom", ncertReference: { class: "11", page: "274" }
  },
  {
    questionText: "Carbon dioxide is transported in three forms. Identify the correct percentage distribution of these forms in blood:",
    options: {
      A: { text: "Bicarbonate: 70%, Carbamino-hemoglobin: 20-25%, Dissolved in plasma: 7%" },
      B: { text: "Bicarbonate: 20-25%, Carbamino-hemoglobin: 70%, Dissolved in plasma: 7%" },
      C: { text: "Bicarbonate: 70%, Carbamino-hemoglobin: 7%, Dissolved in plasma: 20-25%" },
      D: { text: "Bicarbonate: 97%, Carbamino-hemoglobin: 3%, Dissolved in plasma: 0%" }
    },
    correctAnswer: "A",
    explanation: "About 70% of CO2 is carried as bicarbonate, 20-25% as carbamino-hemoglobin, and 7% is dissolved in plasma.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "274" }
  },
  {
    questionText: "The enzyme carbonic anhydrase plays a vital role in CO2 transport. Where is this enzyme found in highest concentration?",
    options: {
      A: { text: "Blood plasma" },
      B: { text: "Red Blood Cells (RBCs)" },
      C: { text: "Alveolar epithelial cells" },
      D: { text: "White Blood Cells (WBCs)" }
    },
    correctAnswer: "B",
    explanation: "RBCs contain a very high concentration of carbonic anhydrase, and minute quantities are present in plasma too. It facilitates: CO2 + H2O <-> H2CO3 <-> HCO3- + H+.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "Every 100 mL of deoxygenated blood delivers approximately how many mL of carbon dioxide to the alveoli?",
    options: {
      A: { text: "5 mL" },
      B: { text: "4 mL" },
      C: { text: "20 mL" },
      D: { text: "10 mL" }
    },
    correctAnswer: "B",
    explanation: "Every 100 mL of deoxygenated blood delivers about 4 mL of CO2 to the alveoli.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "Assertion (A): In alveoli, high pO2, low pCO2 and lower temperature favour the formation of oxyhaemoglobin.\nReason (R): These factors cause a shift in the oxygen-haemoglobin dissociation curve to the right.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "C",
    explanation: "A is true because these alveolar conditions promote binding of O2 (association). R is false because these conditions shift the curve to the left (increasing affinity), not the right.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "hard", type: "assertion_reason", source: "custom", ncertReference: { class: "11", page: "274" }
  },
  {
    questionText: "What is the primary role of the chloride shift (Hamburger phenomenon) in RBCs during gas transport?",
    options: {
      A: { text: "To maintain electrical neutrality of RBCs as bicarbonate ions diffuse out" },
      B: { text: "To stimulate carbonic anhydrase activity" },
      C: { text: "To facilitate oxygen association with hemoglobin" },
      D: { text: "To prevent hemoglobin precipitation" }
    },
    correctAnswer: "A",
    explanation: "When bicarbonate (HCO3-) built up in RBCs diffuses out into the plasma, chloride (Cl-) ions shift from plasma into the RBCs to maintain electrical neutrality.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "hard", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "Match the following transport modes with their gases:\n(a) As Carbamino-hemoglobin\n(b) As Oxyhemoglobin\n(c) Dissolved in Plasma (major contribution)\n(d) As Bicarbonate ions\n\n(i) 97% of Oxygen\n(ii) 70% of Carbon dioxide\n(iii) 20-25% of Carbon dioxide\n(iv) 7% of Carbon dioxide",
    options: {
      A: { text: "a-(iii), b-(i), c-(iv), d-(ii)" },
      B: { text: "a-(ii), b-(i), c-(iv), d-(iii)" },
      C: { text: "a-(iii), b-(ii), c-(iv), d-(i)" },
      D: { text: "a-(iv), b-(i), c-(iii), d-(ii)" }
    },
    correctAnswer: "A",
    explanation: "Carbamino-hemoglobin matches 20-25% of CO2 (iii), Oxyhemoglobin matches 97% of O2 (i), Plasma dissolved matches 7% of CO2 (iv), Bicarbonate matches 70% of CO2 (ii).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Transport of Gases",
    difficulty: "medium", type: "match_following", source: "custom", ncertReference: { class: "11", page: "274" }
  },

  // ─── SUBTOPIC 5: REGULATION OF RESPIRATION (37-43) ───
  {
    questionText: "Where in the brain is the respiratory rhythm center, primarily responsible for the regulation of respiration, located?",
    options: {
      A: { text: "Pons region" },
      B: { text: "Medulla oblongata region" },
      C: { text: "Cerebrum" },
      D: { text: "Cerebellum" }
    },
    correctAnswer: "B",
    explanation: "The respiratory rhythm center is located in the medulla region of the brain and is primarily responsible for this regulation.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Regulation of Respiration",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "The pneumotaxic center, which can moderate the functions of the respiratory rhythm center, is located in:",
    options: {
      A: { text: "Medulla oblongata" },
      B: { text: "Pons Varolii" },
      C: { text: "Midbrain" },
      D: { text: "Diencephalon" }
    },
    correctAnswer: "B",
    explanation: "The pneumotaxic center is located in the pons region of the brain and can moderate the respiratory rhythm center's activity.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Regulation of Respiration",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "Activation of the pneumotaxic center primarily causes:",
    options: {
      A: { text: "Increase in duration of inspiration and increase in breathing rate" },
      B: { text: "Decrease in duration of inspiration and increase in breathing rate" },
      C: { text: "Increase in duration of inspiration and decrease in breathing rate" },
      D: { text: "Decrease in duration of inspiration and decrease in breathing rate" }
    },
    correctAnswer: "B",
    explanation: "Neural signals from the pneumotaxic center can reduce the duration of inspiration and thereby alter the respiratory rate (making it faster/shallow).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Regulation of Respiration",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "The chemosensitive area adjacent to the rhythm center is highly sensitive to which of the following substances?",
    options: {
      A: { text: "Oxygen concentration (pO2)" },
      B: { text: "Carbon dioxide (CO2) and hydrogen ions (H+)" },
      C: { text: "Nitrogen gas and oxygen" },
      D: { text: "Bicarbonate ions only" }
    },
    correctAnswer: "B",
    explanation: "The chemosensitive area is highly sensitive to CO2 and hydrogen ions. Increase in these substances activates this center, which signals the rhythm center to make adjustments.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Regulation of Respiration",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "Receptors associated with the aortic arch and carotid artery can recognize changes in CO2 and H+ concentration. Where do they send signals for remedial action?",
    options: {
      A: { text: "Pneumotaxic center" },
      B: { text: "Respiratory rhythm center" },
      C: { text: "Cerebral cortex" },
      D: { text: "Spinal cord" }
    },
    correctAnswer: "B",
    explanation: "Receptors in the aortic arch and carotid artery send signals to the respiratory rhythm center (located in medulla) for remedial action.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Regulation of Respiration",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "What is the role of oxygen (O2) in the regulation of respiratory rhythm in humans?",
    options: {
      A: { text: "Oxygen is the primary driver of normal breathing rhythm" },
      B: { text: "The role of oxygen in the regulation of respiratory rhythm is quite insignificant" },
      C: { text: "Oxygen levels are monitored by chemoreceptors to alter the heartbeat" },
      D: { text: "Oxygen excess immediately inhibits the pneumotaxic center" }
    },
    correctAnswer: "B",
    explanation: "The role of oxygen in the regulation of respiratory rhythm is quite insignificant under normal conditions; regulation is primarily driven by CO2 and H+ levels.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Regulation of Respiration",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "275" }
  },
  {
    questionText: "Assertion (A): Receptors associated with aortic arch and carotid artery can recognize changes in CO2 and H+ concentration.\nReason (R): The chemoreceptive role of oxygen is dominant over carbon dioxide in driving normal ventilation adjustments.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "C",
    explanation: "A is true because these peripheral chemoreceptors indeed monitor CO2/H+. R is false because the role of oxygen is insignificant, not dominant.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Regulation of Respiration",
    difficulty: "medium", type: "assertion_reason", source: "custom", ncertReference: { class: "11", page: "275" }
  },

  // ─── SUBTOPIC 6: DISORDERS OF RESPIRATORY SYSTEM (44-50) ───
  {
    questionText: "Which of the following respiratory disorders is characterized by spasm of smooth muscles in bronchi and bronchioles causing wheezing?",
    options: {
      A: { text: "Emphysema" },
      B: { text: "Asthma" },
      C: { text: "Occupational Respiratory Disorder" },
      D: { text: "Bronchitis" }
    },
    correctAnswer: "B",
    explanation: "Asthma is a difficulty in breathing causing wheezing due to inflammation and spasm of bronchi and bronchioles.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "276" }
  },
  {
    questionText: "Emphysema is a chronic disorder in which alveolar walls are damaged. What is its major cause in human populations?",
    options: {
      A: { text: "Coal dust inhalation" },
      B: { text: "Cigarette smoking" },
      C: { text: "Bacterial infection (Mycobacterium)" },
      D: { text: "Genetic deficiency of surfactant" }
    },
    correctAnswer: "B",
    explanation: "Cigarette smoking is the major cause of emphysema, a condition where alveolar walls break down, significantly reducing the surface area for gas exchange.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "easy", type: "mcq", source: "custom", ncertReference: { class: "11", page: "276" }
  },
  {
    questionText: "Occupational Respiratory Disorders like Silicosis and Asbestosis are characterized by:",
    options: {
      A: { text: "Destruction of lung capillaries and hemorrhage" },
      B: { text: "Proliferation of fibrous connective tissues (fibrosis) in upper lungs" },
      C: { text: "Spasm of bronchial tree muscles" },
      D: { text: "Excessive secretion of surfactant" }
    },
    correctAnswer: "B",
    explanation: "In certain industries (stone breaking, grinding), long exposure to dust triggers inflammation leading to fibrosis (proliferation of fibrous tissues) and serious lung damage.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "276" }
  },
  {
    questionText: "Assertion (A): Emphysema is a chronic obstructive lung disease that reduces the respiratory surface area.\nReason (R): Cigarette smoke contains irritants that damage alveolar septa, leading to their coalescence.",
    options: {
      A: { text: "Both A and R are true and R is the correct explanation of A" },
      B: { text: "Both A and R are true but R is NOT the correct explanation of A" },
      C: { text: "A is true but R is false" },
      D: { text: "A is false but R is true" }
    },
    correctAnswer: "A",
    explanation: "Both statements are true. Alveolar wall damage (septal breakdown) reduces exchange area, and cigarette smoking is the primary cause that irritates and breaks down these septa.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "medium", type: "assertion_reason", source: "custom", ncertReference: { class: "11", page: "276" }
  },
  {
    questionText: "Match the following respiratory disorders with their descriptions:\n(a) Asthma\n(b) Emphysema\n(c) Silicosis\n(d) Occupational disease prevention\n\n(i) Alveolar surface area decreased\n(ii) Fibrosis of lung tissues due to stone dust\n(iii) Inflammation of bronchi and bronchioles\n(iv) Wearing protective masks",
    options: {
      A: { text: "a-(iii), b-(i), c-(ii), d-(iv)" },
      B: { text: "a-(ii), b-(i), c-(iii), d-(iv)" },
      C: { text: "a-(iii), b-(ii), c-(i), d-(iv)" },
      D: { text: "a-(i), b-(iii), c-(ii), d-(iv)" }
    },
    correctAnswer: "A",
    explanation: "Asthma is bronchi inflammation (iii), Emphysema is decreased surface area (i), Silicosis is dust-induced fibrosis (ii), prevention is wearing protective masks (iv).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "easy", type: "match_following", source: "custom", ncertReference: { class: "11", page: "276" }
  },
  {
    questionText: "Carbon monoxide (CO) poisoning is dangerous primarily because CO has an affinity for hemoglobin that is how many times higher than that of oxygen?",
    options: {
      A: { text: "2 times" },
      B: { text: "20 times" },
      C: { text: "200 times" },
      D: { text: "2000 times" }
    },
    correctAnswer: "C",
    explanation: "Carbon monoxide binds to hemoglobin about 200-250 times more tightly than oxygen, forming carboxyhemoglobin, which prevents oxygen from binding and causes cellular hypoxia.",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "medium", type: "mcq", source: "custom", ncertReference: { class: "11", page: "276" }
  },
  {
    questionText: "Consider the following statements regarding respiratory system disorders:\n(i) Workers in stone breaking industries should wear protective masks to prevent fibrosis.\n(ii) Emphysema results in a decrease in lung compliance and increase in alveolar surface area.\nSelect the correct option:",
    options: {
      A: { text: "Statement (i) is correct but (ii) is incorrect" },
      B: { text: "Statement (ii) is correct but (i) is incorrect" },
      C: { text: "Both statements (i) and (ii) are correct" },
      D: { text: "Both statements (i) and (ii) are incorrect" }
    },
    correctAnswer: "A",
    explanation: "Statement (i) is correct (NCERT recommendation). Statement (ii) is incorrect because emphysema decreases alveolar surface area (doesn't increase it).",
    subject: "biology", chapter: "Breathing and Exchange of Gases", topic: "Respiratory Disorders",
    difficulty: "medium", type: "statement_based", source: "custom", ncertReference: { class: "11", page: "276" }
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('🔌 Connected to MongoDB');

    // Add unique identifier to each question
    const formatted = questions.map((q, index) => ({
      ...q,
      questionId: `DIRECT-BIO-BEG-${String(index + 1).padStart(3, '0')}`,
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
      tags: ["NEET", "Biology", "Human Physiology", "Breathing", q.topic],
      isPublished: true,
      isVerified: true,
      qualityScore: 95,
      estimatedTime: 50,
      marks: 4,
      negativeMarks: -1,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`📦 Bulk inserting ${formatted.length} hand-crafted Biology questions...`);
    
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
