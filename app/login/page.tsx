'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError('Contraseña incorrecta.');
        setPassword('');
        inputRef.current?.focus();
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Error de conexión. Inténtelo de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
          style={{ color: 'var(--gold)' }}
          aria-hidden="true"
        >
          <path d="M12 3v18M5 21h14M3 8h18M6 8l-3 7a3 3 0 006 0L6 8zM18 8l-3 7a3 3 0 006 0L18 8z" />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '0.04em',
          }}
        >
          JUNO
        </span>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-xl px-8 py-8"
        style={{
          backgroundColor: 'var(--navy-light)',
          border: '1px solid var(--border)',
        }}
      >
        <p
          className="text-sm mb-6 text-center"
          style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}
        >
          Acceso restringido — sesión de evaluación
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-xs"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
            >
              CLAVE DE ACCESO
            </label>
            <input
              ref={inputRef}
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
              className="w-full rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--gold)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
          </div>

          {error && (
            <p
              className="text-xs text-center"
              style={{ color: '#fca5a5', fontFamily: 'var(--font-body)' }}
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{
              backgroundColor: 'var(--gold)',
              color: 'var(--navy)',
              fontFamily: 'var(--font-body)',
            }}
          >
            {loading ? 'Verificando...' : 'Acceder'}
          </button>
        </form>
      </div>

      <p
        className="mt-8 text-xs text-center max-w-xs"
        style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', opacity: 0.5 }}
      >
        Buscador jurídico de precisión crítica para derecho español y europeo.
      </p>
    </div>
  );
}
