'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SearchInputProps {
  onSubmit: (text: string) => void;
  isLoading?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const MAX_CHARS = 2000;
const WARN_THRESHOLD = 1800;

export default function SearchInput({
  onSubmit,
  isLoading = false,
  value,
  onChange,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Support both controlled (value + onChange) and uncontrolled modes
  const text = value !== undefined ? value : internalValue;
  const setText = onChange !== undefined ? onChange : setInternalValue;

  // Auto-resize textarea
  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(el).lineHeight, 10) || 24;
    const minH = lineHeight * 1;
    const maxH = lineHeight * 5;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, minH), maxH)}px`;
  }, []);

  useEffect(() => {
    resize();
  }, [text, resize]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || text.length > MAX_CHARS) return;
    onSubmit(trimmed);
    if (value === undefined) setInternalValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const isNearLimit = charCount >= WARN_THRESHOLD;
  const canSubmit = text.trim().length > 0 && !isLoading && !isOverLimit;

  const counterColor = isOverLimit
    ? '#ef4444'
    : isNearLimit
    ? 'var(--gold)'
    : 'var(--text-secondary)';

  return (
    <div className="w-full px-4 pb-4 pt-2">
      <div
        className="relative rounded-xl transition-all duration-200 max-w-3xl mx-auto"
        style={{
          backgroundColor: 'var(--navy-light)',
          border: '1px solid var(--border)',
        }}
        onFocusCapture={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = 'rgba(74, 171, 120, 0.5)';
          el.style.boxShadow = '0 0 0 3px rgba(74, 171, 120, 0.08)';
        }}
        onBlurCapture={(e) => {
          // Only reset if focus moved outside this container
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = 'var(--border)';
            el.style.boxShadow = 'none';
          }
        }}
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS + 50) {
              setText(e.target.value);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="Busca en BOE, CENDOJ, DGT, EUR-Lex y boletines autonómicos…"
          aria-label="Campo de consulta jurídica"
          rows={1}
          disabled={isLoading}
          className="w-full resize-none bg-transparent outline-none leading-relaxed"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
            padding: '0.875rem 3.5rem 0.875rem 1rem',
            minHeight: 44,
            maxHeight: '7.5rem',
            overflowY: 'auto',
          }}
        />

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label={isLoading ? 'Consultando…' : 'Enviar consulta'}
          className="absolute right-3 bottom-3 flex items-center justify-center rounded-lg transition-all duration-200"
          style={{
            width: 36,
            height: 36,
            backgroundColor: canSubmit ? 'var(--gold)' : 'rgba(74, 171, 120, 0.15)',
            color: canSubmit ? '#080d1a' : 'rgba(74, 171, 120, 0.4)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            if (!canSubmit) return;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gold-light)';
          }}
          onMouseLeave={(e) => {
            if (!canSubmit) return;
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--gold)';
          }}
        >
          {isLoading ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <Search size={16} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Hints row */}
      <div className="flex items-center justify-between mt-1.5 max-w-3xl mx-auto px-1">
        <p
          className="text-xs"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          <kbd
            className="px-1 py-0.5 rounded text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.6875rem',
            }}
          >
            Enter
          </kbd>{' '}
          para enviar ·{' '}
          <kbd
            className="px-1 py-0.5 rounded text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.6875rem',
            }}
          >
            Shift+Enter
          </kbd>{' '}
          para nueva línea
        </p>

        {/* Character counter */}
        <span
          className="text-xs tabular-nums transition-colors duration-200"
          style={{
            fontFamily: 'var(--font-mono)',
            color: counterColor,
            fontSize: '0.6875rem',
          }}
          aria-live="polite"
          aria-label={`${charCount} de ${MAX_CHARS} caracteres`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>
    </div>
  );
}
