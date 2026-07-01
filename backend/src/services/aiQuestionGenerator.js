const { getGeminiText, isGeminiConfigured } = require('./geminiClient');

// Use the unified AI client (geminiClient) so the project AI_PROVIDER config applies.
function buildPrompt({ subject, chapter, topic, bloomLevel, difficulty, count = 3 }) {
  return `You are an expert NEET question writer. Generate ${count} NEET-style multiple-choice questions for subject: ${subject}, chapter: ${chapter}, topic: ${topic}. Include a mix of difficulty: ${difficulty || 'medium'} and bloom level: ${bloomLevel || 'apply'}. Return ONLY a JSON array of candidate objects with the following schema for each item:\n{\n  \"questionText\": string,\n  \"options\": { A:{ text:string }, B:{ text:string }, C:{ text:string }, D:{ text:string } },\n  \"correctAnswer\": "A|B|C|D",\n  \"confidenceScore\": number (0-1),\n  \"source\": string (e.g., 'ai_generated' or 'pyq_reference'),\n  \"assertion\": { isAssertionReason: boolean, assertionText?: string, reasonText?: string, pairIsCorrect?: boolean }\n}`;
}

async function generateCandidates({ subject, chapter, topic, bloomLevel, difficulty, count = 3 }) {
  if (!isGeminiConfigured()) {
    throw new Error('AI provider is not configured. Set AI_PROVIDER and the corresponding keys in backend/.env');
  }

  const prompt = buildPrompt({ subject, chapter, topic, bloomLevel, difficulty, count });
  const raw = await getGeminiText({ prompt, maxOutputTokens: 1400, temperature: 0.2, responseMimeType: 'application/json' });

  // raw is expected to be a JSON string or JSON object
  let parsed;
  try {
    if (typeof raw === 'string') parsed = JSON.parse(raw);
    else parsed = raw;
  } catch (err) {
    // If parsing fails, try to extract JSON substring
    const jsonMatch = raw && raw.match ? raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/) : null;
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI response as JSON: ' + err.message);
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error('AI response did not return an array of candidate questions');
  }

  return parsed.map(item => ({
    questionText: item.questionText,
    options: item.options,
    correctAnswer: item.correctAnswer,
    confidenceScore: item.confidenceScore ?? (item.confidence || 0),
    source: item.source || 'ai_generated',
    assertion: item.assertion || null,
    generatedAt: new Date()
  }));
}

module.exports = { generateCandidates };
