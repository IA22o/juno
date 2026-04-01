import { LEGAL_SYSTEM_PROMPT } from '@/lib/prompts';

interface NvidiaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface NvidiaResponseBody {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export interface LLMResult {
  answer: string;
  sources: string[];
}

export async function callNvidia(
  query: string,
  history: Array<{ role: string; content: string }>
): Promise<LLMResult> {
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY no está configurada');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25_000);

  const messages: NvidiaMessage[] = [
    { role: 'system', content: LEGAL_SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: query },
  ];

  try {
    const response = await fetch(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages,
          temperature: 0.1,
          max_tokens: 4000,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `NVIDIA NIM API error ${response.status}: ${errorBody}`
      );
    }

    const data = (await response.json()) as NvidiaResponseBody;

    const answer = data.choices[0]?.message?.content ?? '';

    return { answer, sources: [] };
  } finally {
    clearTimeout(timeoutId);
  }
}
