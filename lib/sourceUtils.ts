/* ------------------------------------------------------------------ */
/*  JUNO — Source utilities                                             */
/*  Shared between ResearchPanel, CitationBadge, and MessageList       */
/* ------------------------------------------------------------------ */

export function parseDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

export function domainToSourceName(domain: string): string {
  const map: Record<string, string> = {
    'boe.es':                    'BOE',
    'poderjudicial.es':          'CENDOJ',
    'eur-lex.europa.eu':         'EUR-Lex',
    'tributos.hacienda.gob.es':  'DGT',
    'hacienda.gob.es':           'DGT/TEAC',
    'tribunalconstitucional.es': 'Tribunal Constitucional',
    'congreso.es':               'Congreso',
  };
  for (const [key, val] of Object.entries(map)) {
    if (domain.includes(key)) return val;
  }
  return domain;
}

export const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
  'BOE':                    { bg: '#7fa8c812', text: '#7fa8c8' },
  'CENDOJ':                 { bg: '#9496bb12', text: '#9496bb' },
  'DGT':                    { bg: '#6aaa9512', text: '#6aaa95' },
  'DGT/TEAC':               { bg: '#6aaa9512', text: '#6aaa95' },
  'EUR-Lex':                { bg: '#c4a87a12', text: '#c4a87a' },
  'Tribunal Constitucional':{ bg: '#8a9caa12', text: '#8a9caa' },
  'Congreso':               { bg: '#7aaa8a12', text: '#7aaa8a' },
};

export function getFaviconUrl(hostname: string): string {
  return 'https://www.google.com/s2/favicons?domain=' + hostname + '&sz=32';
}
