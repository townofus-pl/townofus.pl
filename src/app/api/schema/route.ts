import { NextResponse } from 'next/server';
import { buildOpenApiDocument } from '@/app/api/v2/_lib/openapi';

// Publiczna definicja OpenAPI, bez logowania. Opisuje tylko 12 tras GET z `/api/v2`.
// Nie importuje starych rejestracji tras. Stare trasy zostają do etapu 2.
export const GET = () =>
  NextResponse.json(buildOpenApiDocument(), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
  });
