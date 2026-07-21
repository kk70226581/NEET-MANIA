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
    
    console.log('Fetching questions for quality improvement (skipping already processed)...');
    const cutoffDate = new Date('2026-07-19T16:50:00Z');
    const allQuestions = await Question.find({
      $or: [
        { updatedAt: { $lt: cutoffDate } },
        { updatedAt: { $exists: false } }
      ]
    });
    console.log(`Found ${allQuestions.length} total questions.`);

    let upgradedCount = 0;

    for (let i = 0; i < allQuestions.length; i += BATCH_SIZE) {
      const batch = allQuestions.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(allQuestions.length / BATCH_SIZE)}...`);

      const batchPayload = batch.map(q => ({
        id: q._id.toString(),
        questionText: q.questionText,
        options: {
          A: q.options?.A?.text,
          B: q.options?.B?.text,
          C: q.options?.C?.text,
          D: q.options?.D?.text
        },
        correctAnswer: q.correctAnswer,
        isPYQ: q.pyq?.isPYQ || false
      }));

      const prompt = `You are a strict, expert examiner for the NEET (UG) exam.
I am providing a JSON array of biology/physics/chemistry questions.
Your task is to REWRITE each question to improve its quality to NEET standards:
- Remove any page number references like "(Pg. 267, E)" or "(Pg. X)" from the text.
- If it's a standard MCQ, make sure the language is clear, unambiguous, and formatted perfectly.
- If it's an Assertion-Reason question, structure it clearly with "Assertion (A): ..." and "Reason (R): ...".
- Ensure options are plausible and follow the NEET pattern.
- If the question is marked as isPYQ=false, do NOT refer to it as a PYQ. Ensure the text doesn't contain the acronym "PYQ".

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
            
            // Clean up PYQ status if it shouldn't be PYQ
            let isPYQ = original.pyq?.isPYQ || false;
            if (res.newQuestionText.toLowerCase().includes('pyq')) {
              res.newQuestionText = res.newQuestionText.replace(/pyq/ig, 'practice');
            }

            try {
              await Question.findByIdAndUpdate(original._id, {
                $set: {
                  questionText: res.newQuestionText,
                  'options.A.text': res.newOptions.A,
                  'options.B.text': res.newOptions.B,
                  'options.C.text': res.newOptions.C,
                  'options.D.text': res.newOptions.D,
                  correctAnswer: res.newCorrectAnswer,
                  'explanation.text': res.newExplanation || original.explanation?.text || '',
                  updatedAt: new Date()
                }
              });
              upgradedCount++;
            } catch (dbErr) {
              if (dbErr.code === 11000) {
                console.warn(`[Duplicate Key] Skipping question ID ${original._id} because the rewritten question text already exists.`);
              } else {
                console.error(`Failed to update question ID ${original._id}: ${dbErr.message}`);
              }
            }
          }
        }
        console.log(`Successfully improved ${results.length} questions in this batch.`);
      } catch (err) {
        console.error(`Error processing batch: ${err.message}`);
        const errMsg = err.message.toLowerCase();
        if (errMsg.includes('quota') || errMsg.includes('rate limit') || errMsg.includes('429') || errMsg.includes('limit')) {
          console.warn('\n[Rate Limit Detected] Sleeping for 60 seconds before retrying this batch...');
          await new Promise(resolve => setTimeout(resolve, 60000));
          i -= BATCH_SIZE; // Retry the same batch
        }
      }
      
      // Delay to avoid hitting the 15 RPM rate limit on Gemini Free Tier
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    console.log(`\nScript Complete. Improved ${upgradedCount} questions using Antigravity AI.`);
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    mongoose.disconnect();
    process.exit(0);
  }
}

run();
