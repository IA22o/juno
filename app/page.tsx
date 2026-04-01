'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, X, ChevronRight } from 'lucide-react';
import BetaBanner from '@/components/BetaBanner';
import Hero from '@/components/Hero';
import MessageList, { type Message } from '@/components/MessageList';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import SearchInput from '@/components/SearchInput';
import Footer from '@/components/Footer';

/* ---------------------------------------------------------------
   Types for API communication
--------------------------------------------------------------- */
interface HistoryEntry {
  role: string;
  content: string;
}

interface ApiResponse {
  answer: string;
  sources: string[];
  provider: string;
  updatedHistory: HistoryEntry[];
  conversationId: string;
}

interface ApiErrorResponse {
  error: string;
  code?: string;
}

/* ---------------------------------------------------------------
   Sidebar component — query history
--------------------------------------------------------------- */
interface SidebarProps {
  open: boolean;
  onClose: () => void;
  queries: string[];
  onSelectQuery: (query: string) => void;
}

function Sidebar({ open, onClose, queries, onSelectQuery }: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {/* Panel */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          width: 280,
          backgroundColor: 'var(--navy-light)',
          borderRight: '1px solid var(--border)',
        }}
        aria-label="Historial de consultas"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Historial
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar historial"
            className="flex items-center justify-center rounded transition-colors"
            style={{ width: 28, height: 28, color: 'var(--text-secondary)' }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {/* Query list */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {queries.length === 0 ? (
            <p
              className="text-xs text-center mt-8"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
            >
              Tus consultas apareceran aqui.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {queries.map((q, i) => (
                <li key={`${i}-${q.slice(0, 20)}`}>
                  <button
                    type="button"
                    onClick={() => onSelectQuery(q)}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm transition-colors truncate"
                    style={{
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                        'rgba(74, 171, 120, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                    }}
                    title={q}
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}

/* ---------------------------------------------------------------
   Helpers
--------------------------------------------------------------- */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ---------------------------------------------------------------
   Page shell
--------------------------------------------------------------- */
export default function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiHistory, setApiHistory] = useState<HistoryEntry[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const trimmedText = text.trim();
      setError(null);

      // 1. Add user message immediately
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: trimmedText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setQueryHistory((prev) => [trimmedText, ...prev]);
      setQuery('');
      setIsLoading(true);

      // 2. POST to /api/search with history
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmedText,
            history: apiHistory,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as ApiErrorResponse | null;
          const errorMessage =
            errorData?.error ??
            `Error del servidor (${response.status}). Intenta de nuevo.`;
          setError(errorMessage);
          return;
        }

        const data = (await response.json()) as ApiResponse;

        // 3. Add assistant response with sources
        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: data.answer,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // 4. Update apiHistory with both turns
        setApiHistory(data.updatedHistory);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return; // User cancelled, do nothing
        }
        setError('Error de conexion. Verifica tu conexion a internet e intenta de nuevo.');
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, apiHistory]
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      handleSubmit(suggestion);
    },
    [handleSubmit]
  );

  const handleSidebarQuery = useCallback(
    (q: string) => {
      setQuery(q);
      setSidebarOpen(false);
    },
    []
  );

  const hasMessages = messages.length > 0;

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        queries={queryHistory}
        onSelectQuery={handleSidebarQuery}
      />

      {/* Beta warning banner */}
      <BetaBanner />

      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          borderBottom: hasMessages ? '1px solid var(--border)' : 'none',
          backgroundColor: 'var(--navy)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Sidebar toggle — visible when has messages */}
          {hasMessages && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir historial de consultas"
              className="flex items-center justify-center rounded transition-colors mr-1"
              style={{ width: 32, height: 32, color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
              }}
            >
              <MessageSquare size={18} aria-hidden="true" />
            </button>
          )}

          {/* Mini scale mark */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
            aria-hidden="true"
            style={{ color: 'var(--gold)' }}
          >
            <path d="M12 3v18M5 21h14M3 8h18M6 8l-3 7a3 3 0 006 0L6 8zM18 8l-3 7a3 3 0 006 0L18 8z" />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.0625rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            JUNO
          </span>
        </div>

        {/* Source badge cluster — visible only when has messages */}
        {hasMessages && (
          <div className="hidden sm:flex items-center gap-1.5" aria-hidden="true">
            {['BOE', 'CENDOJ', 'DGT', 'EUR-Lex'].map((src) => (
              <span
                key={src}
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.5625rem',
                  backgroundColor: 'rgba(74, 171, 120, 0.08)',
                  border: '1px solid rgba(74, 171, 120, 0.2)',
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.04em',
                }}
              >
                {src}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Hero or message list */}
        {!hasMessages && !isLoading ? (
          <div className="flex flex-col flex-1 overflow-y-auto">
            <Hero onSelectSuggestion={handleSelectSuggestion} />
          </div>
        ) : (
          <MessageList messages={messages} />
        )}

        {/* Loading skeleton — shown below last message while waiting */}
        {isLoading && (
          <div className="px-4 pb-2">
            <div className="max-w-3xl mx-auto">
              <LoadingSkeleton />
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="px-4 pb-2 fade-in">
            <div
              className="max-w-3xl mx-auto rounded-lg px-4 py-3 flex items-start gap-3"
              role="alert"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              <ChevronRight
                size={16}
                className="shrink-0 mt-0.5"
                style={{ color: '#ef4444' }}
                aria-hidden="true"
              />
              <div className="flex-1">
                <p
                  className="text-sm"
                  style={{ color: '#fca5a5', fontFamily: 'var(--font-body)' }}
                >
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="text-xs mt-1 underline transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  Descartar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} aria-hidden="true" />

        {/* Search input — always at bottom */}
        <div
          className="shrink-0"
          style={{
            borderTop: hasMessages || isLoading ? '1px solid var(--border)' : 'none',
            backgroundColor: 'var(--navy)',
          }}
        >
          <SearchInput
            onSubmit={handleSubmit}
            isLoading={isLoading}
            value={query}
            onChange={setQuery}
          />
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
