'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const STORAGE_KEY = 'juno-beta-banner-dismissed';

export default function BetaBanner() {
  const [visible, setVisible] = useState(false);

  // Avoid hydration mismatch — read localStorage after mount
  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) setVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="banner"
      aria-label="Aviso de versión prototipo"
      className="fade-in w-full flex items-center gap-3 px-4 py-2.5"
      style={{
        backgroundColor: 'rgba(42, 112, 80, 0.12)',
        borderBottom: '1px solid rgba(74, 171, 120, 0.25)',
      }}
    >
      {/* Icon */}
      <AlertTriangle
        size={14}
        aria-hidden="true"
        style={{ color: 'var(--gold)', flexShrink: 0 }}
      />

      {/* Message */}
      <p
        className="flex-1 text-center text-xs leading-snug"
        style={{
          color: 'var(--gold-light)',
          fontFamily: 'var(--font-body)',
        }}
      >
        Esta plataforma está en fase de prototipo. Las respuestas tienen carácter informativo y
        pueden contener inexactitudes.{' '}
        <span style={{ color: 'var(--text-secondary)' }}>
          Verifique siempre la normativa en las fuentes oficiales.
        </span>
      </p>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Cerrar aviso"
        className="flex items-center justify-center rounded transition-colors"
        style={{
          width: 28,
          height: 28,
          flexShrink: 0,
          color: 'var(--text-secondary)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
        }}
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
