/**
 * Unified AI Client
 * Dynamically switches between OpenAI, AWS Bedrock, and Google Gemini
 * based on the AI_PROVIDER setting in backend/.env:
 *
 *   AI_PROVIDER=openai   --> Uses OpenAI (gpt-4o-mini)
 *   AI_PROVIDER=bedrock  --> Uses Amazon Bedrock Mantle with a bearer token
 *   AI_PROVIDER=gemini   --> Uses Google Gemini (gemini-2.0-flash)
 *
 * Set BEDROCK_MODEL_ID to a model that supports Mantle Chat Completions.
 */

const { OpenAI } = require('openai');

// ── Configuration ─────────────────────────────────────────────────────────────

const getProvider = () => {
  return (process.env.AI_PROVIDER || 'bedrock').toLowerCase().trim();
};

const getModelName = () => {
  const provider = getProvider();
  if (provider === 'openai') {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  } else if (provider === 'bedrock') {
    return process.env.BEDROCK_MODEL_ID || 'mistral.ministral-3-3b-instruct';
  } else {
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }
};

const isAIConfigured = () => {
  const provider = getProvider();
  if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY || '';
    return Boolean(key) && !/your-openai|placeholder|sk-your/i.test(key);
  } else if (provider === 'bedrock') {
    const key = process.env.AWS_BEARER_TOKEN_BEDROCK || '';
    return Boolean(key) && !/your-bedrock|placeholder/i.test(key);
  } else {
    const key = process.env.GEMINI_API_KEY || '';
    return Boolean(key) && !/your-gemini|placeholder/i.test(key);
  }
};

// ── Bedrock client singleton ──────────────────────────────────────────────────

// ── OpenAI Implementation ─────────────────────────────────────────────────────

const callOpenAI = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || /your-openai|placeholder|sk-your/i.test(apiKey)) {
    throw new Error('OpenAI key is not configured. Set OPENAI_API_KEY in backend/.env');
  }

  const openai = new OpenAI({ apiKey });
  const messages = [];

  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt || '' });

  const responseFormat = responseMimeType === 'application/json' ? { type: 'json_object' } : undefined;

  const completion = await openai.chat.completions.create({
    model: getModelName(),
    messages,
    max_tokens: Math.min(maxOutputTokens, 4000),
    temperature,
    ...(responseFormat ? { response_format: responseFormat } : {})
  });

  return completion.choices?.[0]?.message?.content?.trim() || '';
};

// ── AWS Bedrock Implementation (Converse API — works for Nova + Claude) ───────
//
// This uses the OpenAI-compatible Chat Completions endpoint on Bedrock Mantle.

const callBedrock = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK || '';
  if (!apiKey || /your-bedrock|placeholder/i.test(apiKey)) {
    throw new Error('Bedrock API key is not configured. Set AWS_BEARER_TOKEN_BEDROCK in backend/.env');
  }

  const region = process.env.AWS_REGION || 'us-east-1';
  const baseUrl = (process.env.BEDROCK_BASE_URL || `https://bedrock-mantle.${region}.api.aws/v1`).replace(/\/+$/, '');
  const modelId = getModelName();

  let userText = prompt || '';
  if (responseMimeType === 'application/json') {
    userText += '\n\nIMPORTANT: Return ONLY valid JSON with no markdown fences or extra text outside the JSON.';
  }

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: userText });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      max_tokens: Math.min(maxOutputTokens || 1000, 4096),
      temperature: temperature ?? 0.1
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error?.message || `Bedrock Mantle failed with status ${response.status}`);
  }

  return payload.choices?.[0]?.message?.content?.trim() || '';
};

// ── Google Gemini Implementation ──────────────────────────────────────────────

const callGemini = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || /your-gemini|placeholder/i.test(apiKey)) {
    throw new Error('Gemini key is not configured. Set GEMINI_API_KEY in backend/.env');
  }

  let userText = prompt || '';
  if (responseMimeType === 'application/json') {
    userText += '\n\nIMPORTANT: Return ONLY a valid JSON object.';
  }

  const requestBody = {
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: { temperature, maxOutputTokens, responseMimeType: responseMimeType || undefined }
  };

  const model = getModelName();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini failed with status ${response.status}`);
  }

  return payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim() || '';
};

// ── Public Router ─────────────────────────────────────────────────────────────

const getGeminiText = async (options) => {
  const provider = getProvider();
  
  try {
    if (provider === 'openai') {
      return await callOpenAI(options);
    } else if (provider === 'bedrock') {
      return await callBedrock(options);
    } else {
      return await callGemini(options);
    }
  } catch (error) {
    console.error(`[Unified AI Client] Error using provider ${provider}:`, error.message);
    throw error;
  }
};

module.exports = {
  getGeminiText,
  getBedrockText: callBedrock,
  getGeminiModel: getModelName,
  getGeminiModelCandidates: () => [getModelName()],
  isGeminiConfigured: isAIConfigured,
  isBedrockConfigured: isAIConfigured,
  getProvider
};
