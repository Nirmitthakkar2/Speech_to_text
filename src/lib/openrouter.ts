// OpenRouter API helper for LLM text refinement

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// System prompt optimized for token efficiency
const SYSTEM_PROMPT = `Transform speech-to-text output into clear, professional text. Preserve meaning and intent.

Rules:
- Add proper punctuation and capitalization
- Remove filler words (um, uh, like, you know)
- Fix grammar and awkward phrasing
- Break run-on sentences
- Correct speech recognition errors
- Keep speaker's voice, tone, terminology
- Preserve names and technical terms
- Do not add new information

Output only the refined text.`;

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
  };
}

export async function refineText(rawText: string, apiKey?: string, modelId?: string): Promise<string> {
  const effectiveApiKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (!effectiveApiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  // Use provided model or default to xiaomi/mimo-v2-flash:free
  const selectedModel = modelId || 'xiaomi/mimo-v2-flash:free';

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: rawText }
  ];

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${effectiveApiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Speech to Text App'
    },
    body: JSON.stringify({
      model: selectedModel,
      messages,
      temperature: 0.3,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenRouter API error: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No response from OpenRouter');
  }

  return data.choices[0].message.content;
}