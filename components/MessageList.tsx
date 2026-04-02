'use client';

import ReactMarkdown from 'react-markdown';
import { useEffect, useMemo, useRef, memo } from 'react';
import CitationBadge from './CitationBadge';

/* ---------------------------------------------------------------
   Types
--------------------------------------------------------------- */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
}

/* ---------------------------------------------------------------
   Source detection — scan content for source keywords
--------------------------------------------------------------- */
interface SourcePill {
  label: string;
  color: string;
  bg: string;
}

const SOURCE_PATTERNS: Array<{
  pattern: RegExp;
  pill: SourcePill;
}> = [
  {
    pattern: /\bBOE\b/i,
    pill: { label: 'BOE',             color: '#7fa8c8', bg: '#7fa8c812' },
  },
  {
    pattern: /\bCENDOJ\b/i,
    pill: { label: 'CENDOJ',          color: '#9496bb', bg: '#9496bb12' },
  },
  {
    pattern: /\b(DGT|TEAC)\b/i,
    pill: { label: 'DGT / TEAC',      color: '#6aaa95', bg: '#6aaa9512' },
  },
  {
    pattern: /\b(EUR-Lex|eurlex|tjue|tribunal de justicia de la uni[oó]n)\b/i,
    pill: { label: 'EUR-Lex',         color: '#c4a87a', bg: '#c4a87a12' },
  },
  {
    pattern: /\b(CC\.AA\.|comunidades? aut[oó]nomas?|auton[oó]mico)\b/i,
    pill: { label: 'CC.AA.',          color: '#7aaa8a', bg: '#7aaa8a12' },
  },
  {
    pattern: /\b(tribunal supremo|TS|sala (de lo )?civil|sala (de lo )?contencioso|sala (de lo )?social)\b/i,
    pill: { label: 'Tribunal Supremo', color: '#8a9caa', bg: '#8a9caa12' },
  },
];

function detectSources(content: string): SourcePill[] {
  const found: SourcePill[] = [];
  const seen = new Set<string>();
  for (const { pattern, pill } of SOURCE_PATTERNS) {
    if (pattern.test(content) && !seen.has(pill.label)) {
      found.push(pill);
      seen.add(pill.label);
    }
  }
  return found;
}

/* ---------------------------------------------------------------
   Timestamp formatter
--------------------------------------------------------------- */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ---------------------------------------------------------------
   Individual message components
--------------------------------------------------------------- */
const UserMessage = memo(function UserMessage({ message }: { message: Message }) {
  return (
    <div className="flex justify-end fade-in" aria-label="Tu consulta">
      <div className="flex flex-col items-end gap-1 max-w-[85%] sm:max-w-[72%]">
        <div
          className="rounded-2xl rounded-tr-sm px-4 py-3"
          style={{
            backgroundColor: 'rgba(74, 171, 120, 0.15)',
            border: '1px solid rgba(74, 171, 120, 0.25)',
          }}
        >
          <p
            className="text-sm leading-relaxed whitespace-pre-wrap break-words"
            style={{
              fontFamily: 'var(--font-body)',
              color: 'var(--text-primary)',
            }}
          >
            {message.content}
          </p>
        </div>
        <time
          dateTime={message.timestamp.toISOString()}
          className="text-xs px-1"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}
        >
          {formatTime(message.timestamp)}
        </time>
      </div>
    </div>
  );
});

const AssistantMessage = memo(function AssistantMessage({ message }: { message: Message }) {
  const sources = useMemo(() => detectSources(message.content), [message.content]);

  return (
    <div className="flex justify-start fade-in" aria-label="Respuesta jurídica">
      <div className="flex flex-col gap-2 w-full">
        {/* Card */}
        <div
          className="w-full rounded-xl px-5 py-5"
          style={{
            backgroundColor: 'var(--navy-light)',
            border: '1px solid rgba(74, 171, 120, 0.1)',
          }}
        >
          {/* Markdown content */}
          <div className="legal-result">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <CitationBadge href={href ?? ''}>{children}</CitationBadge>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Source pills */}
          {sources.length > 0 && (
            <div
              className="flex flex-wrap gap-2 mt-4 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}
              aria-label="Fuentes detectadas en la respuesta"
            >
              <span
                className="text-xs mr-1 self-center"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Fuentes
              </span>
              {sources.map((source) => (
                <span
                  key={source.label}
                  className="px-2 py-0.5 rounded-full text-xs"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    backgroundColor: source.bg,
                    border: `1px solid ${source.color}40`,
                    color: source.color,
                  }}
                >
                  {source.label}
                </span>
              ))}
            </div>
          )}

          {/* Beta badge + Disclaimer */}
          <div
            className="mt-4 pt-3 flex flex-col gap-2"
            style={{ borderTop: sources.length > 0 ? 'none' : '1px solid var(--border)' }}
          >
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs w-fit"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.5625rem',
                backgroundColor: 'rgba(74, 171, 120, 0.1)',
                border: '1px solid rgba(74, 171, 120, 0.25)',
                color: 'var(--gold)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Prototipo Beta
            </span>
            <p
              className="text-xs leading-relaxed"
              style={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)',
                fontStyle: 'italic',
                opacity: 0.8,
              }}
            >
              Esta respuesta tiene caracter informativo y no constituye asesoramiento juridico profesional.
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <time
          dateTime={message.timestamp.toISOString()}
          className="text-xs px-1"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}
        >
          {formatTime(message.timestamp)}
        </time>
      </div>
    </div>
  );
});

/* ---------------------------------------------------------------
   MessageList
--------------------------------------------------------------- */
export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <section
      className="flex-1 w-full overflow-y-auto px-4 py-6"
      role="log"
      aria-label="Historial de consultas"
      aria-live="polite"
    >
      <div className="flex flex-col gap-5 max-w-3xl mx-auto">
        {messages.map((message) =>
          message.role === 'user' ? (
            <UserMessage key={message.id} message={message} />
          ) : (
            <AssistantMessage key={message.id} message={message} />
          )
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} aria-hidden="true" />
      </div>
    </section>
  );
}
