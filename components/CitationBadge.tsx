'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { parseDomain, domainToSourceName, SOURCE_COLORS, getFaviconUrl } from '../lib/sourceUtils';

/* ------------------------------------------------------------------ */
/*  Props                                                               */
/* ------------------------------------------------------------------ */

interface CitationBadgeProps {
  href: string;
  children: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/*  CitationBadge                                                       */
/* ------------------------------------------------------------------ */

export default function CitationBadge({ href, children }: CitationBadgeProps) {
  const [open, setOpen]             = useState(false);
  const [faviconOk, setFaviconOk]   = useState(true);
  const [flipLeft, setFlipLeft]     = useState(false);
  const containerRef                = useRef<HTMLSpanElement>(null);
  const cardRef                     = useRef<HTMLSpanElement>(null);

  const domain     = parseDomain(href);
  const sourceName = domainToSourceName(domain);
  const colors     = SOURCE_COLORS[sourceName] ?? { bg: 'rgba(74,171,120,0.08)', text: '#4aab78' };
  const favicon    = getFaviconUrl(domain);
  const label      = typeof children === 'string' ? children : String(children ?? domain);
  const shortUrl   = href.length > 55 ? href.slice(0, 52) + '...' : href;

  /* Detect available horizontal space before opening */
  const handleOpen = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setFlipLeft(window.innerWidth - rect.right < 300);
    }
    setOpen(true);
  }, []);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <span
      ref={containerRef}
      style={{ position: 'relative', display: 'inline' }}
    >
      {/* ── Inline badge ──────────────────────────────────────────── */}
      <span
        role="button"
        tabIndex={0}
        aria-label={'Cita: ' + sourceName + ' — ' + label}
        aria-expanded={open}
        onMouseEnter={handleOpen}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }}
        style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            '3px',
          cursor:         'pointer',
          borderBottom:   '1px dashed #4aab78',
          color:          '#6dbf96',
          fontFamily:     'var(--font-body)',
          paddingBottom:  '1px',
          minHeight:      '44px',
          minWidth:       '44px',
          verticalAlign:  'baseline',
        }}
      >
        {/* Favicon 16x16 */}
        {faviconOk ? (
          <img
            src={favicon}
            alt=""
            aria-hidden="true"
            width={14}
            height={14}
            style={{ display: 'inline', verticalAlign: 'middle', borderRadius: '2px', flexShrink: 0 }}
            onError={() => setFaviconOk(false)}
          />
        ) : (
          <ExternalLink
            size={12}
            aria-hidden="true"
            style={{ display: 'inline', verticalAlign: 'middle', flexShrink: 0, color: '#4aab78' }}
          />
        )}
        {children}
      </span>

      {/* ── Floating card ─────────────────────────────────────────── */}
      {open && (
        <span
          ref={cardRef}
          role="tooltip"
          className="citation-card"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          style={{
            position:        'absolute',
            top:             'calc(100% + 6px)',
            ...(flipLeft ? { right: 0 } : { left: 0 }),
            zIndex:          50,
            width:           '280px',
            display:         'flex',
            flexDirection:   'column',
            gap:             '8px',
            backgroundColor: 'var(--navy-light)',
            border:          '1px solid var(--border)',
            borderRadius:    '10px',
            padding:         '12px',
            boxShadow:       '0 8px 32px rgba(0,0,0,0.45)',
            pointerEvents:   'auto',
          }}
        >
          {/* Row: favicon + source name + domain pill */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
            {faviconOk ? (
              <img
                src={favicon}
                alt=""
                aria-hidden="true"
                width={20}
                height={20}
                style={{ borderRadius: '3px', flexShrink: 0 }}
                onError={() => setFaviconOk(false)}
              />
            ) : (
              <ExternalLink size={16} aria-hidden="true" style={{ color: '#4aab78', flexShrink: 0 }} />
            )}
            <span
              style={{
                fontFamily:  'var(--font-display)',
                fontSize:    '0.9375rem',
                fontWeight:  600,
                color:       'var(--text-primary)',
                flexShrink:  0,
              }}
            >
              {sourceName}
            </span>
            <span
              style={{
                fontFamily:      'var(--font-mono)',
                fontSize:        '0.5625rem',
                backgroundColor: colors.bg,
                border:          '1px solid ' + colors.text + '40',
                color:           colors.text,
                borderRadius:    '9999px',
                padding:         '1px 7px',
                flexShrink:      0,
              }}
            >
              {domain}
            </span>
          </span>

          {/* Divider */}
          <span
            style={{ display: 'block', borderTop: '1px solid var(--border)' }}
            aria-hidden="true"
          />

          {/* Document title */}
          <span
            style={{
              fontFamily:  'var(--font-body)',
              fontSize:    '0.8125rem',
              color:       'var(--text-primary)',
              lineHeight:  1.5,
            }}
          >
            {label}
          </span>

          {/* URL truncated */}
          <span
            style={{
              fontFamily:  'var(--font-mono)',
              fontSize:    '0.5625rem',
              color:       'var(--text-secondary)',
              opacity:     0.6,
              wordBreak:   'break-all',
              lineHeight:  1.4,
            }}
          >
            {shortUrl}
          </span>

          {/* Open link */}
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '4px',
              fontFamily:     'var(--font-body)',
              fontSize:       '0.75rem',
              color:          'var(--gold)',
              textDecoration: 'none',
              alignSelf:      'flex-start',
              minHeight:      '44px',
              padding:        '0 2px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold-light)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--gold)'; }}
          >
            Abrir fuente
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        </span>
      )}
    </span>
  );
}
