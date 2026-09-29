/**
 * Unified AI Client
 * Supports Google Gemma / Gemini, AWS Bedrock, Groq (Gemma 2 / Llama 3), and OpenAI.
 * Automatically selects provider and model based on environment variables on Render:
 *
 *   AI_PROVIDER=gemini (or gemma)  --> Uses Google Gemini / Gemma (e.g. gemini-2.0-flash or gemma-2-9b-it)
 *   AI_PROVIDER=groq               --> Uses Groq ultra-fast API (e.g. gemma2-9b-it)
 *   AI_PROVIDER=bedrock            --> Uses Amazon Bedrock Converse API (e.g. amazon.nova-lite-v1:0 or claude-3-haiku)
 *   AI_PROVIDER=openai             --> Uses OpenAI (e.g. gpt-4o-mini)
 */

const { OpenAI } = require('openai');
const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

// ── Configuration Helpers ───────────────────────────────────────────────────

const getProvider = () => {
  const explicit = (process.env.AI_PROVIDER || '').toLowerCase().trim();
  if (explicit === 'gemma' || explicit === 'gemini') return 'gemini';
  if (explicit === 'groq') return 'groq';
  if (explicit === 'openai') return 'openai';
  if (explicit === 'bedrock') return 'bedrock';

  // Smart Auto-detection based on configured keys if AI_PROVIDER is not set:
  if (process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY) return 'gemini';
  if (process.env.GROQ_API_KEY) return 'groq';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) return 'bedrock';
  if (process.env.AWS_BEARER_TOKEN_BEDROCK) return 'bedrock';

  // Default
  return 'bedrock';
};

const getModelName = () => {
  const provider = getProvider();
  if (provider === 'openai') {
    return process.env.OPENAI_MODEL || 'gpt-4o-mini';
  } else if (provider === 'groq') {
    return process.env.GROQ_MODEL || 'gemma2-9b-it';
  } else if (provider === 'bedrock') {
    // Bedrock models: amazon.nova-lite-v1:0, anthropic.claude-3-haiku-20240307-v1:0, mistral.mistral-7b-instruct-v0:2
    return process.env.BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';
  } else {
    // Gemini / Gemma on Google AI Studio
    return process.env.GEMMA_MODEL || process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  }
};

const isBedrockConfigured = () => {
  const hasAwsKeys = Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    !/your-access|placeholder/i.test(process.env.AWS_ACCESS_KEY_ID)
  );
  const hasBearer = Boolean(
    process.env.AWS_BEARER_TOKEN_BEDROCK &&
    !/your-bedrock|placeholder/i.test(process.env.AWS_BEARER_TOKEN_BEDROCK)
  );
  const hasEnvCredentials = Boolean(
    process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || process.env.AWS_EXECUTION_ENV
  );
  return hasAwsKeys || hasBearer || hasEnvCredentials;
};

const isAIConfigured = () => {
  const provider = getProvider();
  if (provider === 'openai') {
    const key = process.env.OPENAI_API_KEY || '';
    return Boolean(key) && !/your-openai|placeholder|sk-your/i.test(key);
  } else if (provider === 'groq') {
    const key = process.env.GROQ_API_KEY || '';
    return Boolean(key) && !/your-groq|placeholder/i.test(key);
  } else if (provider === 'bedrock') {
    return isBedrockConfigured();
  } else {
    const key = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY || '';
    return Boolean(key) && !/your-gemini|placeholder/i.test(key);
  }
};

// ── Bedrock SDK Client ──────────────────────────────────────────────────────

let bedrockRuntimeClientSingleton = null;

const getBedrockClient = () => {
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const sessionToken = process.env.AWS_SESSION_TOKEN?.trim();

  const clientConfig = { region };
  if (accessKeyId && secretAccessKey) {
    clientConfig.credentials = {
      accessKeyId,
      secretAccessKey,
      ...(sessionToken ? { sessionToken } : {})
    };
  }

  bedrockRuntimeClientSingleton = new BedrockRuntimeClient(clientConfig);
  return bedrockRuntimeClientSingleton;
};

// ── AWS Bedrock Converse API ────────────────────────────────────────────────

const callBedrockSDK = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const client = getBedrockClient();
  const modelId = getModelName();

  let userText = prompt || '';
  if (responseMimeType === 'application/json') {
    userText += '\n\nIMPORTANT: Return ONLY valid JSON with no markdown fences, comments, or extra text outside the JSON.';
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
      maxTokens: Math.min(maxOutputTokens || 1200, 4096),
      temperature: temperature !== undefined ? temperature : 0.7
    }
  };

  if (systemInstruction) {
    converseInput.system = [{ text: systemInstruction }];
  }

  const command = new ConverseCommand(converseInput);
  const response = await client.send(command);

  const text = (response?.output?.message?.content || [])
    .filter((block) => block.text)
    .map((block) => block.text)
    .join('')
    .trim();

  return text;
};

// ── AWS Bedrock Mantle / Bearer Token HTTP Endpoint (Fallback) ──────────────

const callBedrockMantle = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const apiKey = process.env.AWS_BEARER_TOKEN_BEDROCK || '';
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

const callBedrock = async (options) => {
  const hasAwsKeys = Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    !/your-access|placeholder/i.test(process.env.AWS_ACCESS_KEY_ID)
  );
  const hasBearer = Boolean(
    process.env.AWS_BEARER_TOKEN_BEDROCK &&
    !/your-bedrock|placeholder/i.test(process.env.AWS_BEARER_TOKEN_BEDROCK)
  );

  if (hasAwsKeys) {
    return await callBedrockSDK(options);
  }

  if (hasBearer) {
    return await callBedrockMantle(options);
  }

  if (process.env.AWS_CONTAINER_CREDENTIALS_RELATIVE_URI || process.env.AWS_EXECUTION_ENV) {
    return await callBedrockSDK(options);
  }

  throw new Error('AWS Bedrock is not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY on Render.');
};

// ── Google Gemini & Gemma Implementation ────────────────────────────────────

const callGemini = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY;
  if (!apiKey || /your-gemini|placeholder/i.test(apiKey)) {
    throw new Error('Gemini/Gemma key is not configured. Set GEMINI_API_KEY in server environment variables.');
  }

  const model = getModelName();
  const isGemma = model.toLowerCase().includes('gemma');

  let userText = prompt || '';
  if (isGemma && systemInstruction) {
    // Gemma models do not accept systemInstruction parameter in Google API; prepend to prompt
    userText = `${systemInstruction}\n\n${userText}`;
  }

  if (responseMimeType === 'application/json') {
    userText += '\n\nIMPORTANT: Return ONLY a valid JSON object.';
  }

  const requestBody = {
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    generationConfig: {
      temperature: temperature !== undefined ? temperature : 0.7,
      maxOutputTokens: maxOutputTokens || 1200,
    }
  };

  if (!isGemma && systemInstruction) {
    requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
  }
  if (!isGemma && responseMimeType) {
    requestBody.generationConfig.responseMimeType = responseMimeType;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || `Gemini/Gemma API failed with status ${response.status}`);
  }

  return payload.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim() || '';
};

// ── Groq Implementation (Gemma 2 / Llama 3) ─────────────────────────────────

const callGroq = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || /your-groq|placeholder/i.test(apiKey)) {
    throw new Error('Groq key is not configured. Set GROQ_API_KEY in server environment variables.');
  }

  const groq = new OpenAI({
    apiKey,
    baseURL: 'https://api.groq.com/openai/v1'
  });

  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt || '' });

  const model = process.env.GROQ_MODEL || 'gemma2-9b-it';
  const responseFormat = responseMimeType === 'application/json' ? { type: 'json_object' } : undefined;

  const completion = await groq.chat.completions.create({
    model,
    messages,
    max_tokens: Math.min(maxOutputTokens || 1200, 4000),
    temperature: temperature !== undefined ? temperature : 0.7,
    ...(responseFormat ? { response_format: responseFormat } : {})
  });

  return completion.choices?.[0]?.message?.content?.trim() || '';
};

// ── OpenAI Implementation ───────────────────────────────────────────────────

const callOpenAI = async ({ prompt, systemInstruction, maxOutputTokens, temperature, responseMimeType }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || /your-openai|placeholder|sk-your/i.test(apiKey)) {
    throw new Error('OpenAI key is not configured. Set OPENAI_API_KEY in server environment variables.');
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
    max_tokens: Math.min(maxOutputTokens || 1200, 4000),
    temperature: temperature !== undefined ? temperature : 0.7,
    ...(responseFormat ? { response_format: responseFormat } : {})
  });

  return completion.choices?.[0]?.message?.content?.trim() || '';
};

// ── Public Router with Provider Fallback ────────────────────────────────────

const getGeminiText = async (options) => {
  const provider = getProvider();

  try {
    if (provider === 'gemini') {
      return await callGemini(options);
    } else if (provider === 'groq') {
      return await callGroq(options);
    } else if (provider === 'openai') {
      return await callOpenAI(options);
    } else {
      return await callBedrock(options);
    }
  } catch (error) {
    console.error(`[Unified AI Client] Provider '${provider}' error:`, error.message);

    // Resilience: Fall back to alternative configured provider if active one fails
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY;
    if (provider !== 'gemini' && geminiKey && !/placeholder|your-gemini/i.test(geminiKey)) {
      console.warn('[Unified AI Client] Falling back to Gemini/Gemma API...');
      try {
        return await callGemini(options);
      } catch (e) {
        console.error('[Unified AI Client] Gemini fallback error:', e.message);
      }
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (provider !== 'groq' && groqKey && !/placeholder|your-groq/i.test(groqKey)) {
      console.warn('[Unified AI Client] Falling back to Groq API...');
      try {
        return await callGroq(options);
      } catch (e) {
        console.error('[Unified AI Client] Groq fallback error:', e.message);
      }
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (provider !== 'openai' && openaiKey && !/placeholder|your-openai|sk-your/i.test(openaiKey)) {
      console.warn('[Unified AI Client] Falling back to OpenAI API...');
      try {
        return await callOpenAI(options);
      } catch (e) {
        console.error('[Unified AI Client] OpenAI fallback error:', e.message);
      }
    }

    throw error;
  }
};

// ── Diagnostics and Testing Tools ───────────────────────────────────────────

const getAIConfigurationDiagnostics = () => {
  const provider = getProvider();
  const model = getModelName();
  const region = process.env.AWS_REGION || 'us-east-1';

  const hasAwsAccessKey = Boolean(
    process.env.AWS_ACCESS_KEY_ID && !/placeholder|your-/i.test(process.env.AWS_ACCESS_KEY_ID)
  );
  const hasAwsSecretKey = Boolean(
    process.env.AWS_SECRET_ACCESS_KEY && !/placeholder|your-/i.test(process.env.AWS_SECRET_ACCESS_KEY)
  );
  const hasBearerToken = Boolean(
    process.env.AWS_BEARER_TOKEN_BEDROCK && !/placeholder|your-/i.test(process.env.AWS_BEARER_TOKEN_BEDROCK)
  );
  const hasGeminiKey = Boolean(
    (process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY) &&
    !/placeholder|your-/i.test(process.env.GEMINI_API_KEY || process.env.GEMMA_API_KEY)
  );
  const hasGroqKey = Boolean(
    process.env.GROQ_API_KEY && !/placeholder|your-/i.test(process.env.GROQ_API_KEY)
  );
  const hasOpenAiKey = Boolean(
    process.env.OPENAI_API_KEY && !/placeholder|your-/i.test(process.env.OPENAI_API_KEY)
  );

  const configured = isAIConfigured();

  return {
    provider,
    model,
    region,
    isConfigured: configured,
    credentials: {
      hasAwsAccessKey,
      hasAwsSecretKey,
      hasBearerToken,
      hasGeminiKey,
      hasGroqKey,
      hasOpenAiKey,
      bedrockReady: (hasAwsAccessKey && hasAwsSecretKey) || hasBearerToken
    }
  };
};

const testAIConnectivity = async (customPrompt) => {
  const startTime = Date.now();
  const provider = getProvider();
  const model = getModelName();
  const testPrompt = customPrompt || 'Provide a 15-word encouraging NEET study tip for Biology.';

  try {
    const reply = await getGeminiText({
      prompt: testPrompt,
      systemInstruction: 'You are an encouraging NEET mentor.',
      maxOutputTokens: 120,
      temperature: 0.7
    });

    const latencyMs = Date.now() - startTime;
    return {
      success: true,
      provider,
      model,
      latencyMs,
      reply
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    let diagnosis = 'Configuration or network issue connecting to the AI provider.';
    let suggestion = 'Check your API credentials and environment variables in the Render dashboard.';

    if (error.name === 'AccessDeniedException' || error.message?.includes('AccessDenied')) {
      diagnosis = `Bedrock Model Access has not been granted for '${model}'.`;
      suggestion = `Go to AWS Bedrock Console -> Model Access -> Request access for '${model}' in region ${process.env.AWS_REGION || 'us-east-1'}, or switch to gemini-2.0-flash / gemma-2-9b-it on Render.`;
    } else if (error.name === 'UnrecognizedClientException' || error.message?.includes('security token') || error.message?.includes('InvalidSignatureException')) {
      diagnosis = 'Invalid AWS Access Key or Secret Access Key.';
      suggestion = 'Verify AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in Render environment variables.';
    } else if (error.name === 'ResourceNotFoundException' || error.message?.includes('ResourceNotFound')) {
      diagnosis = `Model '${model}' is not available in region ${process.env.AWS_REGION || 'us-east-1'}.`;
      suggestion = 'Set BEDROCK_MODEL_ID to a supported model (e.g. anthropic.claude-3-haiku-20240307-v1:0 or amazon.nova-lite-v1:0).';
    } else if (error.message?.includes('not configured')) {
      diagnosis = `AI credentials for '${provider}' are not configured.`;
      suggestion = `In your Render dashboard, add the API key for ${provider} (e.g. GEMINI_API_KEY, GROQ_API_KEY, or AWS keys).`;
    }

    return {
      success: false,
      provider,
      model,
      latencyMs,
      error: error.message,
      diagnosis,
      suggestion
    };
  }
};

module.exports = {
  getGeminiText,
  getBedrockText: callBedrock,
  getGeminiModel: getModelName,
  getGeminiModelCandidates: () => [getModelName()],
  isGeminiConfigured: isAIConfigured,
  isBedrockConfigured,
  getProvider,
  getAIConfigurationDiagnostics,
  testAIConnectivity
};
