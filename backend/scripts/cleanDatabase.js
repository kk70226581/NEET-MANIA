require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');
const { getGeminiText } = require('../src/services/geminiClient');

const BATCH_SIZE = 5;

// Override DNS to fix ECONNREFUSED issues
const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB.');

    console.log('Fetching all questions...');
    const allQuestions = await Question.find({});
    console.log(`Found ${allQuestions.length} total questions.`);

    let duplicatesRemoved = 0;
    const seenTexts = new Set();
    const uniqueQuestions = [];

    // Phase 1: Exact Deduplication
    console.log('\n--- Phase 1: Exact Deduplication ---');
    for (const q of allQuestions) {
      const normalized = normalizeText(q.questionText);
      if (seenTexts.has(normalized)) {
        await Question.findByIdAndDelete(q._id);
        duplicatesRemoved++;
      } else {
        seenTexts.add(normalized);
        uniqueQuestions.push(q);
      }
    }
    console.log(`Phase 1 Complete. Removed ${duplicatesRemoved} duplicate questions.`);

    // Phase 2: Upgrade "easy" questions
    console.log('\n--- Phase 2: Upgrading Easy Questions ---');
    const easyQuestions = uniqueQuestions.filter(q => q.difficulty === 'easy');
    console.log(`Found ${easyQuestions.length} unique easy questions to upgrade.`);

    let upgradedCount = 0;

    for (let i = 0; i < easyQuestions.length; i += BATCH_SIZE) {
      const batch = easyQuestions.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(easyQuestions.length / BATCH_SIZE)}...`);

      const batchPayload = batch.map(q => ({
        id: q._id.toString(),
        subject: q.subject,
        chapter: q.chapter,
        questionText: q.questionText,
        options: {
          A: q.options?.A?.text,
          B: q.options?.B?.text,
          C: q.options?.C?.text,
          D: q.options?.D?.text
        },
        correctAnswer: q.correctAnswer
      }));

      const prompt = `You are a strict, expert examiner for the NEET (UG) Indian medical entrance exam.
I am providing a JSON array of "easy" questions. 
Your task is to rewrite each question to make it "medium" difficulty, matching the tricky, application-based, or assertion-reasoning style of the real NEET exam.
Do not change the core topic, just increase the cognitive load (e.g. make it a multi-statement question, match-the-following, or add distractor data).

Input JSON array:
${JSON.stringify(batchPayload, null, 2)}

Return ONLY a JSON array with exactly ${batch.length} objects, matching the exact 'id' for each. 
Format of each object:
{
  "id": "...",
  "newQuestionText": "...",
  "newOptions": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "newCorrectAnswer": "...",
  "newExplanation": "..."
}
`;

      try {
        const responseText = await getGeminiText({
          prompt,
          systemInstruction: 'You are an AI generating rigorous NEET questions. Output only valid JSON array.',
          maxOutputTokens: 2500,
          temperature: 0.3,
          responseMimeType: 'application/json'
        });

        const cleanedText = responseText.replace(/```json/i, '').replace(/```/g, '').trim();
        const results = JSON.parse(cleanedText);

        for (const res of results) {
          const original = batch.find(q => q._id.toString() === res.id);
          if (original && res.newQuestionText) {
            await Question.findByIdAndUpdate(original._id, {
              $set: {
                questionText: res.newQuestionText,
                'options.A.text': res.newOptions.A,
                'options.B.text': res.newOptions.B,
                'options.C.text': res.newOptions.C,
                'options.D.text': res.newOptions.D,
                correctAnswer: res.newCorrectAnswer,
                'explanation.text': res.newExplanation || original.explanation?.text || '',
                difficulty: 'medium',
                updatedAt: new Date()
              }
            });
            upgradedCount++;
          }
        }
        console.log(`Successfully upgraded ${results.length} questions in this batch.`);
      } catch (err) {
        console.error(`Error processing batch: ${err.message}`);
        // Continue with the next batch even if this one fails
      }
    }

    console.log(`\nPhase 2 Complete. Upgraded ${upgradedCount} easy questions to medium.`);
    console.log(`\nDatabase cleanup finished!`);

  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
