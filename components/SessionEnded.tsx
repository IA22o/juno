'use client';

import { Linkedin, MessageCircle } from 'lucide-react';

const LINKEDIN_URL = 'https://www.linkedin.com/in/juan-fernandez-gallego-ba26a6345/';
const WHATSAPP_URL = 'https://wa.me/34680113903';

export default function SessionEnded() {
  return (
    <div
      className="w-full px-4 pb-6 pt-4"
      role="status"
      aria-live="polite"
    >
      <div
        className="max-w-3xl mx-auto rounded-xl px-6 py-5 flex flex-col items-center gap-4 text-center"
        style={{
          backgroundColor: 'var(--navy-light)',
          border: '1px solid rgba(74, 171, 120, 0.25)',
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 44,
            height: 44,
            backgroundColor: 'rgba(74, 171, 120, 0.1)',
            border: '1px solid rgba(74, 171, 120, 0.2)',
          }}
        >
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
        </div>

        {/* Message */}
        <div className="flex flex-col gap-1">
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Sesión de demostración finalizada
          </p>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', maxWidth: 420 }}
          >
            Has alcanzado el límite de consultas gratuitas. Si quieres acceso completo o tienes alguna pregunta, contacta conmigo directamente.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: '#0A66C2',
              color: '#ffffff',
              fontFamily: 'var(--font-body)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#004182';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#0A66C2';
            }}
          >
            <Linkedin size={15} aria-hidden="true" />
            LinkedIn
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: '#25D366',
              color: '#ffffff',
              fontFamily: 'var(--font-body)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#128C7E';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#25D366';
            }}
          >
            <MessageCircle size={15} aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
