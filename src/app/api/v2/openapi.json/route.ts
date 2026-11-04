import { NextResponse } from 'next/server';
import { buildOpenApiDocument } from '../_lib/openapi';

// Publiczna definicja OpenAPI. Opisuje tylko trasy GET bez logowania.
export const GET = () =>
  NextResponse.json(buildOpenApiDocument(), {
    headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'public, max-age=60' },
  });
