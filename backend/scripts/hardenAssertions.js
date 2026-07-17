require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
const mongoose = require('mongoose');
const Question = require('../src/models/Question');
const { getGeminiText } = require('../src/services/geminiClient');

const BATCH_SIZE = 5;

const dnsServers = process.env.DNS_SERVERS?.split(',').map(s => s.trim()).filter(Boolean) || ['8.8.8.8', '8.8.4.4'];
dns.setServers(dnsServers);

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    
    console.log('Fetching all Assertion-Reason and Statement questions...');
    const assertions = await Question.find({
      questionText: /given below are two statements|assertion/i
    });
    console.log(`Found ${assertions.length} questions to harden.`);

    let upgradedCount = 0;

    for (let i = 0; i < assertions.length; i += BATCH_SIZE) {
      const batch = assertions.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(assertions.length / BATCH_SIZE)}...`);

      const batchPayload = batch.map(q => ({
        id: q._id.toString(),
        questionText: q.questionText,
        options: {
          A: q.options?.A?.text,
          B: q.options?.B?.text,
          C: q.options?.C?.text,
          D: q.options?.D?.text
        },
        correctAnswer: q.correctAnswer
      }));

      const prompt = `You are a strict, expert examiner for the NEET (UG) exam.
I am providing a JSON array of Assertion-Reason / Statement based questions.
Your task is to REWRITE each question to make it EXTREMELY HARD and CONCEPTUAL.
- Add subtle traps, edge cases, or require deep multi-concept understanding from the NCERT syllabus.
- Keep the format intact (Assertion/Reason or Statement I/II).
- Provide the output as a JSON array of objects.

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
          maxOutputTokens: 3000,
          temperature: 0.4,
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
                difficulty: 'hard', // FORCE HARD
                updatedAt: new Date()
              }
            });
            upgradedCount++;
          }
        }
        console.log(`Successfully hardened ${results.length} questions in this batch.`);
      } catch (err) {
        console.error(`Error processing batch: ${err.message}`);
      }
    }

    console.log(`\nScript Complete. Hardened ${upgradedCount} assertion questions.`);
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
