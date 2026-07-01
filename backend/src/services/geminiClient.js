/**
 * Unified AI Client
 * Dynamically switches between OpenAI, AWS Bedrock, and Google Gemini
 * based on the AI_PROVIDER setting in backend/.env:
 *
 *   AI_PROVIDER=openai   --> Uses OpenAI (gpt-4o-mini)
 *   AI_PROVIDER=bedrock  --> Uses AWS Bedrock Converse API (token-efficient)
 *   AI_PROVIDER=gemini   --> Uses Google Gemini (gemini-2.0-flash)
 *
 * Bedrock model selection (set BEDROCK_MODEL_ID in .env):
 *   amazon.nova-lite-v1:0             -- Cheapest, fast, good for JSON tasks (default)
 *   amazon.nova-pro-v1:0              -- Stronger reasoning, moderate cost
 *   anthropic.claude-3-5-haiku-20241022-v1:0  -- Best quality/token balance
 *   anthropic.claude-3-haiku-20240307-v1:0    -- Older Haiku, very cheap
 */

const { OpenAI } = require('openai');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

// ── Configuration ─────────────────────────────────────────────────────────────

const getProvider = () => {
  return (process.env.AI_PROVIDER || 'bedrock').toLowerCase().trim();
};

const getModelName = () => {
  const provider = getProvider();
  if (provider === 'openai') {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  } else if (provider === 'bedrock') {
    // amazon.nova-lite-v1:0 is the most token-efficient model for structured tasks
    return process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';
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
    const key = process.env.AWS_ACCESS_KEY_ID || '';
    return Boolean(key) && !/your-aws|placeholder/i.test(key);
  } else {
    const key = process.env.GEMINI_API_KEY || '';
    return Boolean(key) && !/your-gemini|placeholder/i.test(key);
  }
};

// ── Bedrock client singleton ──────────────────────────────────────────────────

let _bedrockClient = null;
const getBedrockClient = () => {
  if (!_bedrockClient) {
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKeyId || !secretAccessKey || /your-aws|placeholder/i.test(accessKeyId)) {
      throw new Error('AWS credentials are not configured. Set AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY in backend/.env');
    }

    _bedrockClient = new BedrockRuntimeClient({
      region,
      credentials: { accessKeyId, secretAccessKey }
    });
  }
  return _bedrockClient;
};

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
// The Converse API is a unified interface that works across all Bedrock model
// families without per-model body formatting. This avoids the need to maintain
// separate request schemas for Claude vs. Nova vs. other providers.

const callBedrock = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const bedrock = getBedrockClient();
  const modelId = getModelName();

  let userText = prompt || '';
  if (responseMimeType === 'application/json') {
    userText += '\n\nIMPORTANT: Return ONLY valid JSON with no markdown fences or extra text outside the JSON.';
  }

  const converseInput = {
    modelId,
    messages: [
      {
        role: 'user',
        content: [{ text: userText }]
      }
    ],
    inferenceConfig: {
      maxTokens: Math.min(maxOutputTokens || 1000, 4096),
      temperature: temperature ?? 0.1
    }
  };

  // system is an array of { text } blocks in the Converse API
  if (systemInstruction) {
    converseInput.system = [{ text: systemInstruction }];
  }

  const response = await bedrock.send(new ConverseCommand(converseInput));

  // Extract text from the response content blocks
  const content = response?.output?.message?.content || [];
  return content
    .filter(block => block.text)
    .map(block => block.text)
    .join('')
    .trim();
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
  getGeminiModel: getModelName,
  getGeminiModelCandidates: () => [getModelName()],
  isGeminiConfigured: isAIConfigured,
  isBedrockConfigured: isAIConfigured,
  getProvider
};
