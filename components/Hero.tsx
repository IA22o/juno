'use client';

interface HeroProps {
  onSelectSuggestion: (text: string) => void;
}

const SUGGESTIONS = [
  '¿Cuáles son los plazos para recurrir una liquidación de IRPF?',
  'Requisitos del despido disciplinario según jurisprudencia del Tribunal Supremo',
  '¿Cómo funciona la reducción por arrendamiento de vivienda en el IRPF?',
  'Doctrina DGT sobre IVA en operaciones inmobiliarias',
  'Plazo de prescripción de deudas tributarias',
  '¿Qué dice el TJUE sobre cláusulas suelo en hipotecas?',
];

/* Scale icon SVG */
function ScaleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="w-12 h-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Pillar */}
      <line x1="32" y1="8" x2="32" y2="56" />
      {/* Base */}
      <line x1="20" y1="56" x2="44" y2="56" />
      {/* Beam */}
      <line x1="12" y1="18" x2="52" y2="18" />
      {/* Left pan chain */}
      <line x1="16" y1="18" x2="12" y2="30" />
      <line x1="12" y1="18" x2="8" y2="30" />
      {/* Left pan */}
      <path d="M6 30 Q12 36 18 30" />
      {/* Right pan chain */}
      <line x1="48" y1="18" x2="52" y2="30" />
      <line x1="52" y1="18" x2="56" y2="30" />
      {/* Right pan */}
      <path d="M46 30 Q52 36 58 30" />
      {/* Center top knob */}
      <circle cx="32" cy="8" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Hero({ onSelectSuggestion }: HeroProps) {
  return (
    <section
      className="flex flex-col items-center justify-center flex-1 px-6 py-12 sm:py-16 slide-up"
      aria-label="Pantalla de inicio"
    >
      {/* Logo mark */}
      <div
        className="flex items-center justify-center w-20 h-20 rounded-full mb-6"
        style={{
          border: '1px solid rgba(74, 171, 120, 0.3)',
          backgroundColor: 'rgba(74, 171, 120, 0.06)',
          color: 'var(--gold)',
        }}
      >
        <ScaleIcon />
      </div>

      {/* Title */}
      <h1
        className="text-center mb-3 leading-tight"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.8rem, 5vw, 2.75rem)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '0.01em',
        }}
      >
        El portal que{' '}
        <span style={{ color: 'var(--gold)' }}>unifica las fuentes oficiales</span>
      </h1>

      {/* Subtitle */}
      <p
        className="text-center mb-6 max-w-lg"
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        BOE, CENDOJ, DGT, EUR-Lex y boletines autonómicos — centralizados en un único portal jurídico
      </p>

      {/* Source pills */}
      <div className="flex flex-wrap justify-center gap-2 mb-10" role="list" aria-label="Fuentes jurídicas consultadas">
        {[
          { label: 'BOE',                color: '#7fa8c8' },
          { label: 'CENDOJ',             color: '#9496bb' },
          { label: 'DGT / TEAC',         color: '#6aaa95' },
          { label: 'EUR-Lex',            color: '#c4a87a' },
          { label: 'Boletines Autonómicos', color: '#7aaa8a' },
        ].map((source) => (
          <span
            key={source.label}
            role="listitem"
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              fontFamily: 'var(--font-mono)',
              backgroundColor: `${source.color}18`,
              border: `1px solid ${source.color}40`,
              color: source.color,
              letterSpacing: '0.02em',
            }}
          >
            {source.label}
          </span>
        ))}
      </div>

      {/* Suggestion grid */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-3xl"
        role="list"
        aria-label="Consultas sugeridas"
      >
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            role="listitem"
            onClick={() => onSelectSuggestion(suggestion)}
            className="text-left rounded-lg px-4 py-3 transition-all duration-200 group"
            style={{
              backgroundColor: 'var(--navy-light)',
              border: '1px solid var(--border)',
              minHeight: 44,
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'rgba(74, 171, 120, 0.4)';
              el.style.backgroundColor = 'rgba(74, 171, 120, 0.05)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = 'var(--border)';
              el.style.backgroundColor = 'var(--navy-light)';
            }}
          >
            {/* Leading quote mark */}
            <span
              aria-hidden="true"
              className="block text-xl leading-none mb-1"
              style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', opacity: 0.6 }}
            >
              "
            </span>
            <span
              className="block text-sm leading-snug"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--text-primary)',
              }}
            >
              {suggestion}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
