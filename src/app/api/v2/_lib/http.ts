import type { z } from 'zod';
import { NextResponse } from 'next/server';
import { CURRENT_SEASON, getSeasonById } from '@/app/dramaafera/_constants/seasons';

/** Błąd z kodem HTTP. Handler zamienia go na odpowiedź JSON. */
export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

// Publiczne GET-y są dostępne dla każdego origin. Nie ma tu cookies ani logowania.
const PUBLIC_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, max-age=30',
};

export function json(body: unknown, status = 200, extra: Record<string, string> = {}): NextResponse {
  return NextResponse.json(body, { status, headers: { ...PUBLIC_HEADERS, ...extra } });
}

export function errorResponse(status: number, message: string): NextResponse {
  return json({ error: message }, status, { 'Cache-Control': 'no-store' });
}

/**
 * Opakowuje publiczny handler GET. Odpowiedź przechodzi przez schemat (lista
 * dozwolonych pól), a błędy domenowe mają stały kształt `{ error }`.
 */
export function publicGet<S extends z.ZodType, A extends unknown[]>(
  schema: S,
  build: (request: Request, ...args: A) => Promise<z.input<S>>,
) {
  return async (request: Request, ...args: A): Promise<NextResponse> => {
    try {
      const data = schema.parse(await build(request, ...args));
      return json(data);
    } catch (error) {
      if (error instanceof ApiError) return errorResponse(error.status, error.message);
      console.error('Błąd publicznego API v2:', error);
      return errorResponse(500, 'Błąd serwera');
    }
  };
}

export function preflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: PUBLIC_HEADERS });
}

function parseSeason(raw: string): number {
  if (!/^\d+$/.test(raw)) throw new ApiError(400, 'Parametr season musi być liczbą całkowitą');
  const season = Number(raw);
  if (!getSeasonById(season)) throw new ApiError(404, 'Nie ma takiego sezonu w bazie danych');
  return season;
}

/**
 * `?season=`. Brak wartości daje bieżący sezon, a wartość niecałkowita daje 400.
 * Sezon spoza listy sezonów z bazy (np. sezon 1) daje 404.
 */
export function seasonParam(request: Request): number {
  const raw = new URL(request.url).searchParams.get('season');
  return raw === null ? CURRENT_SEASON : parseSeason(raw);
}

/** Jak `seasonParam`, ale brak wartości daje `undefined` (trasy gry: gra z dowolnego sezonu). */
export function optionalSeasonParam(request: Request): number | undefined {
  const raw = new URL(request.url).searchParams.get('season');
  return raw === null ? undefined : parseSeason(raw);
}

export function intParam(request: Request, name: string, fallback: number, { min = 0, max = 1000 } = {}): number {
  const raw = new URL(request.url).searchParams.get(name);
  if (raw === null) return fallback;
  if (!/^\d+$/.test(raw) || Number(raw) < min || Number(raw) > max) {
    throw new ApiError(400, `Parametr ${name} musi być liczbą całkowitą od ${min} do ${max}`);
  }
  return Number(raw);
}

/** Data sesji: `YYYYMMDD` albo `YYYY-MM-DD`. Zwraca `YYYYMMDD`. */
export function normalizeDate(raw: string): string {
  const compact = raw.replace(/-/g, '');
  if (!/^\d{8}$/.test(compact) || Number.isNaN(Date.parse(`${compact.slice(0, 4)}-${compact.slice(4, 6)}-${compact.slice(6, 8)}`))) {
    throw new ApiError(400, 'Data musi mieć format YYYYMMDD lub YYYY-MM-DD');
  }
  return compact;
}
