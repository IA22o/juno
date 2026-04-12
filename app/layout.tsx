import type { Metadata } from 'next';
import { Cormorant_Garamond, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

/* ---------------------------------------------------------------
   Font Definitions
--------------------------------------------------------------- */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});

/* ---------------------------------------------------------------
   SEO Metadata
--------------------------------------------------------------- */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://juno-lilac.vercel.app'),
  title: 'JUNO | Portal Jurídico Centralizado',
  description:
    'JUNO unifica BOE, CENDOJ, DGT, EUR-Lex y boletines autonómicos en un único portal de consulta jurídica. Normativa, jurisprudencia y resoluciones oficiales al instante.',
  keywords: [
    'buscador jurídico',
    'normativa BOE',
    'jurisprudencia CENDOJ',
    'resoluciones DGT',
    'EUR-Lex',
    'derecho tributario',
    'legislación española',
    'derecho laboral',
    'Tribunal Supremo',
    'TEAC',
  ],
  authors: [{ name: 'JUNO' }],
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'JUNO | Portal Jurídico Centralizado',
    description:
      'JUNO unifica BOE, CENDOJ, DGT, EUR-Lex y boletines autonómicos en un único portal de consulta jurídica.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'JUNO',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'JUNO — Portal Jurídico Centralizado',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JUNO | Portal Jurídico Centralizado',
    description: 'JUNO unifica BOE, CENDOJ, DGT, EUR-Lex y boletines autonómicos en un único portal de consulta jurídica.',
    images: ['/og-image.png'],
  },
};

/* ---------------------------------------------------------------
   Root Layout
--------------------------------------------------------------- */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
