import { NextRequest, NextResponse } from 'next/server';
import { callPerplexity } from '@/lib/perplexity';
import { callNvidia } from '@/lib/nvidia';
import { callOpenRouter } from '@/lib/openrouter';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const IS_DEV = process.env.NODE_ENV === 'development';

function logError(context: string, message: string): void {
  if (IS_DEV) {
    // eslint-disable-next-line no-console
    console.error(`[search/route] ${context}: ${message}`);
  }
}

export function OPTIONS(): NextResponse {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

interface SearchRequestBody {
  query: string;
  history?: Array<{ role: string; content: string }>;
}

interface SearchResponseBody {
  answer: string;
  sources: string[];
  provider: 'perplexity' | 'nvidia' | 'openrouter';
  updatedHistory: Array<{ role: string; content: string }>;
  conversationId: string;
}

function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: SearchRequestBody;

  try {
    body = (await request.json()) as SearchRequestBody;
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la solicitud invalido o no es JSON valido.', code: 'INVALID_JSON', status: 400 },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const { query, history = [] } = body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return NextResponse.json(
      { error: 'El campo "query" es obligatorio y no puede estar vacio.', code: 'MISSING_QUERY', status: 400 },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (query.trim().length > 2000) {
    return NextResponse.json(
      { error: 'La consulta no puede superar los 2000 caracteres.', code: 'QUERY_TOO_LONG', status: 400 },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const trimmedQuery = query.trim();
  const conversationId = generateConversationId();
  const providerErrors: Record<string, string> = {};

  type ProviderEntry = {
    name: 'perplexity' | 'nvidia' | 'openrouter';
    call: (q: string, h: Array<{ role: string; content: string }>) => Promise<{ answer: string; sources: string[] }>;
  };

  const providers: ProviderEntry[] = [
    { name: 'perplexity', call: callPerplexity },
    { name: 'nvidia', call: callNvidia },
    { name: 'openrouter', call: callOpenRouter },
  ];

  for (const provider of providers) {
    try {
      const result = await provider.call(trimmedQuery, history);
      const updatedHistory = [
        ...history,
        { role: 'user', content: trimmedQuery },
        { role: 'assistant', content: result.answer },
      ];
      const responseBody: SearchResponseBody = {
        answer: result.answer,
        sources: result.sources,
        provider: provider.name,
        updatedHistory,
        conversationId,
      };
      return NextResponse.json(responseBody, { status: 200, headers: CORS_HEADERS });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      providerErrors[provider.name] = message;
      logError(`${provider.name} fallo`, message);
    }
  }

  // All providers failed
  logError('Todos los proveedores fallaron', JSON.stringify(providerErrors));
  return NextResponse.json(
    {
      error: 'Todos los proveedores LLM no estan disponibles en este momento. Intenta de nuevo mas tarde.',
      code: 'ALL_PROVIDERS_FAILED',
      status: 503,
    },
    { status: 503, headers: CORS_HEADERS }
  );
}
