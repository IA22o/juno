// NOTE: This in-memory rate limiter works for local dev and single-instance
// deployments. On Vercel, each serverless instance has isolated memory, so
// limits are per-instance, not per-user globally. For production enforcement,
// replace with an Edge-compatible KV store (e.g. Vercel KV / Upstash Redis).
import { NextRequest, NextResponse } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;   // limpieza cada 5 minutos

const ipMap = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();

function cleanExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  for (const [ip, entry] of ipMap.entries()) {
    if (now > entry.resetAt) {
      ipMap.delete(ip);
    }
  }
  lastCleanup = now;
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

export function proxy(request: NextRequest): NextResponse {
  // Solo aplicar a /api/search
  if (!request.nextUrl.pathname.startsWith('/api/search')) {
    return NextResponse.next();
  }

  // Dejar pasar OPTIONS sin consumir cuota (preflight CORS)
  if (request.method === 'OPTIONS') {
    return NextResponse.next();
  }

  cleanExpiredEntries();

  const ip = getClientIp(request);
  const now = Date.now();

  const existing = ipMap.get(ip);

  if (!existing || now > existing.resetAt) {
    // Ventana nueva
    ipMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return NextResponse.next();
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    const retryAfterSecs = Math.ceil((existing.resetAt - now) / 1000);
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Max 20 requests per 10 minutes.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: retryAfterSecs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSecs),
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(existing.resetAt / 1000)),
        },
      }
    );
  }

  existing.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/search'],
};
