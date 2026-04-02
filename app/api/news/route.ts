import { NextRequest, NextResponse } from 'next/server';

const TODAY = new Date().toISOString().split('T')[0];

const NEWS_SYSTEM = `Eres editor jurídico de un portal de noticias legales español.
Dado una consulta jurídica, genera exactamente 3 noticias recientes con alta relevancia constitucional.

Reglas:
- Noticias de los últimos 30 días (fecha base: ${TODAY})
- Medios reales españoles: El País, El Mundo, Cinco Días, Expansión, ABC, La Vanguardia, El Confidencial, Vozpopuli
- Incluye datos específicos: números de sentencias, artículos, cifras
- La categoría debe reflejar la rama jurídica más relevante para la consulta
- Prioriza relevancia constitucional aunque la consulta sea tributaria, laboral, etc.

Devuelve ÚNICAMENTE un array JSON válido, sin markdown, sin explicaciones:
[
  {
    "headline": "Titular informativo y específico",
    "source": "Nombre del medio",
    "date": "YYYY-MM-DD",
    "snippet": "Una o dos frases con datos concretos y relevancia jurídica",
    "category": "constitucional|tributario|laboral|civil|penal|administrativo|mercantil|europeo"
  }
]`;

export async function POST(req: NextRequest) {
  try {
    const { query } = (await req.json()) as { query?: string };
    if (!query?.trim()) return NextResponse.json({ news: [] });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) return NextResponse.json({ news: [] });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://genera.legal',
        'X-Title': 'JUNO Legal Intelligence',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          { role: 'system', content: NEWS_SYSTEM },
          { role: 'user',   content: `Consulta jurídica: ${query.slice(0, 400)}` },
        ],
        temperature: 0.75,
        max_tokens:  900,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) return NextResponse.json({ news: [] });

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = data.choices[0]?.message?.content ?? '[]';

    // Strip possible markdown code fences
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) return NextResponse.json({ news: [] });

    const news = JSON.parse(match[0]) as unknown[];
    return NextResponse.json({ news });
  } catch {
    return NextResponse.json({ news: [] });
  }
}
