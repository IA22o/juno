'use client';

import { useEffect, useState } from 'react';

const DOTS_SEQUENCE = ['.', '..', '...'];

export default function LoadingSkeleton() {
  const [dotIndex, setDotIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((i) => (i + 1) % DOTS_SEQUENCE.length);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-full max-w-3xl mx-auto rounded-xl px-6 py-5 slide-up"
      role="status"
      aria-label="Consultando fuentes jurídicas"
      aria-live="polite"
      style={{
        backgroundColor: 'var(--navy-light)',
        border: '1px solid var(--border)',
      }}
    >
      {/* Shimmer lines */}
      <div className="flex flex-col gap-3 mb-5">
        {[90, 75, 85, 60].map((width, i) => (
          <div
            key={i}
            className="shimmer-base rounded"
            style={{
              width: `${width}%`,
              height: 14,
            }}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Status text */}
      <div className="flex items-center gap-2">
        {/* Pulse dot */}
        <span
          aria-hidden="true"
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'var(--gold)',
            animation: 'pulse-ring 1.4s ease-in-out infinite',
          }}
        />
        <p
          className="text-sm"
          style={{
            fontFamily: 'var(--font-body)',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          Consultando fuentes jurídicas oficiales
          <span
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '1.5ch',
              fontStyle: 'normal',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {DOTS_SEQUENCE[dotIndex]}
          </span>
        </p>
      </div>
    </div>
  );
}
