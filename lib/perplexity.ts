import { LEGAL_SYSTEM_PROMPT } from '@/lib/prompts';

interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PerplexityResponseBody {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  citations?: string[];
}

export interface LLMResult {
  answer: string;
  sources: string[];
}

export async function callPerplexity(
  query: string,
  history: Array<{ role: string; content: string }>
): Promise<LLMResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error('PERPLEXITY_API_KEY no está configurada');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25_000);

  const messages: PerplexityMessage[] = [
    { role: 'system', content: LEGAL_SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: query },
  ];

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'sonar',
        messages,
        temperature: 0.1,
        max_tokens: 4000,
        return_citations: true,
        return_images: false,
        return_related_questions: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `Perplexity API error ${response.status}: ${errorBody}`
      );
    }

    const data = (await response.json()) as PerplexityResponseBody;

    const answer = data.choices[0]?.message?.content ?? '';
    const sources: string[] = data.citations ?? [];

    return { answer, sources };
  } finally {
    clearTimeout(timeoutId);
  }
}
