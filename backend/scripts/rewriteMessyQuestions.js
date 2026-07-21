require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

const updates = [
  {
    id: '6a5a17c1a44fcde677646b97',
    questionText: 'A logic gate circuit yields output Y according to the following truth table:\n\n| A | B | Y |\n|---|---|---|\n| 0 | 0 | 0 |\n| 0 | 1 | 1 |\n| 1 | 0 | 1 |\n| 1 | 1 | 0 |\n\nWhich of the following logic gates is represented by this truth table?',
    options: {
      A: { text: 'AND Gate' },
      B: { text: 'OR Gate' },
      C: { text: 'XOR Gate' },
      D: { text: 'NAND Gate' }
    },
    correctAnswer: 'C',
    chapter: 'Semiconductor Electronics'
  },
  {
    id: '6a5c5ea14549ba9646bf0b75',
    questionText: 'For a cell reaction involving a one-electron transfer (n = 1), the standard electrode potential is E°cell = 0.59 V at 298 K. Calculate the equilibrium constant (Kc) for the cell reaction:\n(Given: 2.303 RT / F = 0.059 V at 298 K)',
    options: {
      A: { text: '1.0 × 10^2' },
      B: { text: '1.0 × 10^5' },
      C: { text: '1.0 × 10^10' },
      D: { text: '1.0 × 10^30' }
    },
    correctAnswer: 'C',
    chapter: 'Electrochemistry'
  },
  {
    id: '6a5c5ea14549ba9646bf0b76',
    questionText: 'Which of the following chemical reactions are classification examples of disproportionation reactions?\n\n(a) 2Cu⁺ → Cu²⁺ + Cu⁰\n(b) 3MnO₄²⁻ + 4H⁺ → 2MnO₄⁻ + MnO₂ + 2H₂O\n(c) 2KMnO₄ ⎯⎯Δ→ K₂MnO₄ + MnO₂ + O₂\n(d) 2MnO₄⁻ + 3Mn²⁺ + 2H₂O → 5MnO₂ + 4H⁺\n\nSelect the correct option:',
    options: {
      A: { text: '(a) and (b) only' },
      B: { text: '(a), (b) and (c)' },
      C: { text: '(a), (c) and (d)' },
      D: { text: '(a) and (d) only' }
    },
    correctAnswer: 'A',
    chapter: 'Redox Reactions'
  },
  {
    id: '6a5c94d34549ba9646bf17aa',
    questionText: 'In a typical angiospermic flower, what is the correct sequence of the four whorls from the outermost to the innermost?',
    options: {
      A: { text: 'Calyx ⎯→ Corolla ⎯→ Androecium ⎯→ Gynoecium' },
      B: { text: 'Calyx ⎯→ Corolla ⎯→ Gynoecium ⎯→ Androecium' },
      C: { text: 'Corolla ⎯→ Calyx ⎯→ Androecium ⎯→ Gynoecium' },
      D: { text: 'Androecium ⎯→ Gynoecium ⎯→ Corolla ⎯→ Calyx' }
    },
    correctAnswer: 'A',
    chapter: 'Morphology of Flowering Plants'
  },
  {
    id: '6a5c94d34549ba9646bf18db',
    questionText: 'Which of the following marine or freshwater plants is correctly matched with its mode of pollination according to NCERT?',
    options: {
      A: { text: 'Vallisneria: Wind pollination in a freshwater habitat' },
      B: { text: 'Zostera: Submerged water pollination (hydrophily) in a marine seagrass habitat' },
      C: { text: 'Hydrilla: Insect pollination in a marine habitat' },
      D: { text: 'Water Lily: Water pollination in a freshwater habitat' }
    },
    correctAnswer: 'B',
    chapter: 'Sexual Reproduction in Flowering Plants'
  },
  {
    id: '6a5c94d34549ba9646bf1aa8',
    questionText: 'Identify the three plant life cycles (A, B, and C) and select the option that correctly matches them with their corresponding plant examples:',
    options: {
      A: { text: 'A = Haplontic (e.g., Volvox), B = Haplodiplontic (e.g., Marchantia), C = Diplontic (e.g., Fucus)' },
      B: { text: 'A = Diplontic (e.g., Gymnosperms), B = Haplontic (e.g., Spirogyra), C = Haplodiplontic (e.g., Kelps)' },
      C: { text: 'A = Haplodiplontic (e.g., Bryophytes), B = Haplontic (e.g., Fucus), C = Diplontic (e.g., Polysiphonia)' },
      D: { text: 'A = Haplontic (e.g., Volvox, Spirogyra), B = Haplodiplontic (e.g., Ectocarpus, Bryophytes, Pteridophytes), C = Diplontic (e.g., Fucus, Gymnosperms, Angiosperms)' }
    },
    correctAnswer: 'D',
    chapter: 'Plant Kingdom'
  }
];

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');

    const bulkOps = [];
    for (const update of updates) {
      bulkOps.push({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(update.id) },
          update: {
            $set: {
              questionText: update.questionText,
              options: update.options,
              correctAnswer: update.correctAnswer,
              chapter: update.chapter,
              updatedAt: new Date()
            }
          }
        }
      });
    }

    console.log(`Executing bulk updates for ${bulkOps.length} messy questions...`);
    const result = await Question.bulkWrite(bulkOps);
    console.log('Successfully completed rewriting messy questions!');
    console.log(result);

  } catch (error) {
    console.error('Error during updates:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
