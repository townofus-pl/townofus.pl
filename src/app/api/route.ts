import { NextResponse } from 'next/server';

// GET /api - Redirect to API documentation
export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/api/docs', url.origin));
}