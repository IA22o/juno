// ============================================================
// GENERA Legal Intelligence — Core Types
// ============================================================

/** A single chat message (user or assistant) */
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
}

/** One exchange in a multi-turn conversation */
export interface ConversationTurn {
  id: string;
  query: string;
  answer: string;
  sources: Source[];
  model: ModelProvider;
  createdAt: Date;
  durationMs?: number;
}

/** A cited legal source returned by the search engine */
export interface Source {
  title: string;
  url: string;
  snippet?: string;
  publishedDate?: string;
  type?: LegalSourceType;
}

/** The full response from the search API route */
export interface SearchResponse {
  answer: string;
  sources: Source[];
  model: ModelProvider;
  durationMs: number;
  conversationId: string;
}

/** Error shape returned by API routes */
export interface ApiError {
  error: string;
  code?: string;
  status: number;
}

/** The providers supported by the engine, in fallback order */
export type ModelProvider = 'perplexity' | 'nvidia-nim' | 'openrouter';

/** Categories of Spanish legal sources */
export type LegalSourceType =
  | 'legislation'
  | 'jurisprudencia'
  | 'doctrina'
  | 'boe'
  | 'doue'
  | 'other';

/** Payload sent to POST /api/search */
export interface SearchRequestBody {
  query: string;
  conversationId?: string;
  history?: Pick<Message, 'role' | 'content'>[];
}
