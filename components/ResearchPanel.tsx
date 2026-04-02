'use client';

import { useState, useEffect, useRef } from 'react';
import { Globe, ExternalLink, RotateCw, Scale, Newspaper } from 'lucide-react';
import { parseDomain, domainToSourceName, SOURCE_COLORS } from '../lib/sourceUtils';

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const BROWSE_SEQUENCE = [
  { name: 'BOE',     url: 'https://www.boe.es/buscar/act.php',                          label: 'Boletín Oficial del Estado' },
  { name: 'CENDOJ',  url: 'https://www.poderjudicial.es/search/indexAN.jsp',             label: 'Centro de Documentación Judicial' },
  { name: 'EUR-Lex', url: 'https://eur-lex.europa.eu/search.html',                      label: 'Derecho de la Unión Europea' },
  { name: 'DGT',     url: 'https://petete.tributos.hacienda.gob.es',                     label: 'Dirección General de Tributos' },
  { name: 'TC',      url: 'https://www.tribunalconstitucional.es/es/jurisprudencia',     label: 'Tribunal Constitucional' },
  { name: 'TEAC',    url: 'https://serviciostelematicosext.hacienda.gob.es/TEAC',        label: 'Tribunal Económico-Administrativo' },
];

/* Source pill colours — identical to MessageList SOURCE_PATTERNS */
const SOURCE_PILL: Record<string, { color: string; bg: string }> = {
  'BOE':                    { color: '#7fa8c8', bg: '#7fa8c812' },
  'CENDOJ':                 { color: '#9496bb', bg: '#9496bb12' },
  'DGT':                    { color: '#6aaa95', bg: '#6aaa9512' },
  'DGT/TEAC':               { color: '#6aaa95', bg: '#6aaa9512' },
  'EUR-Lex':                { color: '#c4a87a', bg: '#c4a87a12' },
  'Tribunal Constitucional':{ color: '#8a9caa', bg: '#8a9caa12' },
  'Congreso':               { color: '#7aaa8a', bg: '#7aaa8a12' },
};

const CATEGORY_PILL: Record<string, { color: string; bg: string }> = {
  constitucional: { color: '#a78bfa', bg: '#a78bfa12' },
  tributario:     { color: '#fbbf24', bg: '#fbbf2412' },
  laboral:        { color: '#60a5fa', bg: '#60a5fa12' },
  civil:          { color: '#34d399', bg: '#34d39912' },
  penal:          { color: '#f87171', bg: '#f8717112' },
  administrativo: { color: '#9ca3af', bg: '#9ca3af12' },
  mercantil:      { color: '#fb923c', bg: '#fb923c12' },
  europeo:        { color: '#7dd3fc', bg: '#7dd3fc12' },
};

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface NewsItem {
  headline: string;
  source:   string;
  date:     string;
  snippet:  string;
  category: string;
}

interface ResearchPanelProps {
  isLoading: boolean;
  sources:   string[];
  query:     string;
}

/* ================================================================== */
/*  Main component                                                      */
/* ================================================================== */

export default function ResearchPanel({ isLoading, sources, query }: ResearchPanelProps) {
  const [activeTab,    setActiveTab]    = useState<'sources' | 'news'>('sources');
  const [browseIndex,  setBrowseIndex]  = useState(0);
  const [displayedUrl, setDisplayedUrl] = useState('');
  const [news,         setNews]         = useState<NewsItem[]>([]);
  const [newsLoading,  setNewsLoading]  = useState(false);

  const lastQueryRef   = useRef<string>('');
  const browseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typeTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---- browsing animation ---------------------------------------- */
  useEffect(() => {
    if (!isLoading) {
      if (browseTimerRef.current) clearInterval(browseTimerRef.current);
      if (typeTimerRef.current)   clearInterval(typeTimerRef.current);
      return;
    }
    let current = 0;
    setBrowseIndex(0);

    const animateUrl = (idx: number) => {
      const target = BROWSE_SEQUENCE[idx % BROWSE_SEQUENCE.length]?.url ?? '';
      let ci = 0;
      setDisplayedUrl('');
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      typeTimerRef.current = setInterval(() => {
        ci++;
        setDisplayedUrl(target.slice(0, ci));
        if (ci >= target.length && typeTimerRef.current) clearInterval(typeTimerRef.current);
      }, 18);
    };

    animateUrl(0);
    browseTimerRef.current = setInterval(() => {
      current++;
      setBrowseIndex(current % BROWSE_SEQUENCE.length);
      animateUrl(current);
    }, 2500);

    return () => {
      if (browseTimerRef.current) clearInterval(browseTimerRef.current);
      if (typeTimerRef.current)   clearInterval(typeTimerRef.current);
    };
  }, [isLoading]);

  /* ---- fetch constitutional news --------------------------------- */
  useEffect(() => {
    if (!query || query === lastQueryRef.current || isLoading) return;
    lastQueryRef.current = query;
    setNewsLoading(true);
    setNews([]);

    fetch('/api/news', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
    })
      .then((r) => r.json())
      .then((d) => setNews((d as { news?: NewsItem[] }).news ?? []))
      .catch(() => setNews([]))
      .finally(() => setNewsLoading(false));
  }, [query, isLoading]);

  /* ---- switch to sources when they arrive ------------------------ */
  useEffect(() => {
    if (sources.length > 0 && !isLoading) setActiveTab('sources');
  }, [sources, isLoading]);

  const currentSource = BROWSE_SEQUENCE[browseIndex] ?? BROWSE_SEQUENCE[0]!;

  /* ---------------------------------------------------------------- */
  return (
    <aside
      className="hidden lg:flex flex-col shrink-0 h-full"
      style={{ width: 380, backgroundColor: 'var(--navy)', borderLeft: '1px solid var(--border)' }}
    >
      {/* ── Browser chrome ───────────────────────────────────────── */}
      <div
        className="shrink-0 px-4 pt-3 pb-2"
        style={{
          backgroundColor: 'var(--navy-light)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Traffic lights + address bar */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.55)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(245,158,11,0.55)' }} />
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.55)' }} />
          </div>

          <div
            className="flex-1 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 overflow-hidden"
            style={{ backgroundColor: 'var(--navy)', border: '1px solid var(--border)' }}
          >
            <Globe size={9} className="shrink-0" style={{ color: isLoading ? 'var(--gold)' : 'var(--text-secondary)' }} />
            <span
              className="flex-1 truncate"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: isLoading ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {isLoading
                ? (displayedUrl || 'Iniciando búsqueda…')
                : (sources[0] ? parseDomain(sources[0]) : 'fuentes jurídicas')}
            </span>
            {isLoading && (
              <span className="animate-pulse shrink-0" style={{ color: 'var(--gold)', fontFamily: 'var(--font-mono)', fontSize: '0.625rem' }}>|</span>
            )}
          </div>

          <RotateCw
            size={12}
            className={isLoading ? 'animate-spin' : ''}
            style={{ color: 'var(--text-secondary)', opacity: 0.5, flexShrink: 0 }}
          />
        </div>

        {/* Source mini-tabs during loading */}
        {isLoading && (
          <div className="flex gap-1 overflow-x-hidden">
            {BROWSE_SEQUENCE.map((src, i) => (
              <span
                key={src.name}
                className="shrink-0 px-1.5 py-0.5 rounded transition-all duration-300"
                style={{
                  fontFamily:      'var(--font-mono)',
                  fontSize:        '0.5rem',
                  letterSpacing:   '0.04em',
                  backgroundColor: i === browseIndex ? 'rgba(74,171,120,0.15)' : 'transparent',
                  border:          `1px solid ${i === browseIndex ? 'rgba(74,171,120,0.35)' : 'transparent'}`,
                  color:           i === browseIndex ? 'var(--gold)' : 'var(--text-secondary)',
                  opacity:         i === browseIndex ? 1 : 0.45,
                }}
              >
                {src.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────── */}
      <div
        className="flex shrink-0"
        style={{ backgroundColor: 'var(--navy-light)', borderBottom: '1px solid var(--border)' }}
      >
        {(['sources', 'news'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 transition-colors"
            style={{
              fontFamily:      'var(--font-body)',
              fontSize:        '0.75rem',
              color:           activeTab === tab ? 'var(--gold)' : 'var(--text-secondary)',
              borderBottom:    activeTab === tab ? '2px solid var(--gold)' : '2px solid transparent',
              backgroundColor: activeTab === tab ? 'rgba(74,171,120,0.04)' : 'transparent',
            }}
          >
            {tab === 'sources' ? <Scale size={11} /> : <Newspaper size={11} />}
            {tab === 'sources' ? 'Fuentes' : 'Noticias'}
            {tab === 'sources' && sources.length > 0 && (
              <span
                className="ml-0.5 px-1.5 rounded-full"
                style={{ fontSize: '0.5rem', backgroundColor: 'rgba(74,171,120,0.2)', color: 'var(--gold)', fontFamily: 'var(--font-mono)' }}
              >
                {sources.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5">

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col gap-4">
            {/* Active source indicator — same card style as assistant message */}
            <div
              className="rounded-xl px-4 py-4 fade-in"
              style={{ backgroundColor: 'var(--navy-light)', border: '1px solid rgba(74,171,120,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--gold)' }} />
                <span
                  style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 500 }}
                >
                  {currentSource.name}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem' }}>
                {currentSource.label}
              </p>
            </div>

            {[1, 2, 3].map((i) => <SkeletonCard key={i} delay={i * 120} />)}
          </div>
        )}

        {/* Sources tab */}
        {!isLoading && activeTab === 'sources' && (
          <div className="flex flex-col gap-4">
            {sources.length === 0 ? (
              <EmptyState icon={<Scale size={24} style={{ color: 'var(--text-secondary)' }} />} text="Las fuentes citadas aparecerán aquí tras tu consulta." />
            ) : (
              sources.map((url, i) => <SourceCard key={`${i}-${url}`} url={url} />)
            )}
          </div>
        )}

        {/* News tab */}
        {!isLoading && activeTab === 'news' && (
          <div className="flex flex-col gap-4">
            {newsLoading ? (
              [1, 2, 3].map((i) => <SkeletonCard key={i} delay={i * 120} />)
            ) : news.length === 0 ? (
              <EmptyState icon={<Newspaper size={24} style={{ color: 'var(--text-secondary)' }} />} text="Noticias con relevancia constitucional relacionadas con tu consulta." />
            ) : (
              news.map((item, i) => <NewsCard key={i} item={item} />)
            )}
          </div>
        )}
      </div>
    </aside>
  );
}

/* ================================================================== */
/*  Sub-components                                                      */
/* ================================================================== */

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      {icon}
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-body)', fontSize: '0.8125rem', maxWidth: 240, lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  );
}

/* Shimmer skeleton — matches shimmer-base from globals.css */
function SkeletonCard({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ backgroundColor: 'var(--navy-light)', border: '1px solid rgba(74,171,120,0.08)', animationDelay: `${delay}ms` }}
    >
      {/* Source name line */}
      <div className="flex items-center gap-2 mb-3">
        <div className="shimmer-base h-2.5 w-12 rounded" />
        <div className="shimmer-base h-2 w-24 rounded" />
      </div>
      {/* Divider */}
      <div className="mb-3" style={{ borderTop: '1px solid var(--border)' }} />
      {/* URL lines */}
      <div className="shimmer-base h-2 w-full rounded mb-2" />
      <div className="shimmer-base h-2 w-4/5 rounded" />
    </div>
  );
}

function SourceCard({ url }: { url: string }) {
  const domain = parseDomain(url);
  const name   = domainToSourceName(domain);
  const pill   = SOURCE_PILL[name] ?? { color: 'var(--gold)', bg: 'rgba(74,171,120,0.1)' };
  const short  = url.length > 60 ? url.slice(0, 57) + '…' : url;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-xl px-4 py-4 flex flex-col gap-2.5 transition-all fade-in"
      style={{ backgroundColor: 'var(--navy-light)', border: '1px solid rgba(74,171,120,0.1)', textDecoration: 'none' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor     = 'rgba(74,171,120,0.28)';
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'rgba(13,21,38,0.9)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor     = 'rgba(74,171,120,0.1)';
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--navy-light)';
      }}
    >
      {/* Source name row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Name in font-display — matches assistant message headings */}
          <span
            style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 500, color: 'var(--gold)', lineHeight: 1.2 }}
          >
            {name}
          </span>
          {/* Source pill — matches MessageList style */}
          <span
            className="px-2 py-0.5 rounded-full text-xs shrink-0"
            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', backgroundColor: pill.bg, border: `1px solid ${pill.color}40`, color: pill.color }}
          >
            {domain}
          </span>
        </div>
        <ExternalLink
          size={12}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--gold)' }}
        />
      </div>

      {/* Divider — same as message card internal dividers */}
      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* URL */}
      <p
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-secondary)', lineHeight: 1.55, wordBreak: 'break-all', opacity: 0.65 }}
      >
        {short}
      </p>
    </a>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const pill = CATEGORY_PILL[item.category] ?? { color: '#9ca3af', bg: '#9ca3af12' };
  const formatted = item.date
    ? (() => {
        try { return new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch { return item.date; }
      })()
    : '';

  return (
    <article
      className="rounded-xl px-4 py-4 flex flex-col gap-2.5 fade-in"
      style={{ backgroundColor: 'var(--navy-light)', border: '1px solid rgba(74,171,120,0.1)' }}
    >
      {/* Meta row: category pill + source + date — same pattern as source pills in MessageList */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="px-2 py-0.5 rounded-full text-xs"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', letterSpacing: '0.04em', backgroundColor: pill.bg, border: `1px solid ${pill.color}40`, color: pill.color }}
        >
          {item.category}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-secondary)', opacity: 0.65 }}>
          {item.source}
        </span>
        {formatted && (
          <>
            <span style={{ color: 'var(--border)', fontSize: '0.5rem' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.5625rem', color: 'var(--text-secondary)', opacity: 0.45 }}>
              {formatted}
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* Headline — font-display matching assistant message h3 */}
      <h4
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.0625rem', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.35, letterSpacing: '0.01em' }}
      >
        {item.headline}
      </h4>

      {/* Snippet — font-body matching legal-result paragraphs */}
      <p
        style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}
      >
        {item.snippet}
      </p>
    </article>
  );
}
