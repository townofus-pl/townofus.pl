import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withCors } from '@/app/api/_middlewares';

// GET /api - Redirect to API documentation
export const GET = withCors(withAuth(async (request: NextRequest) => {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL('/api/docs', url.origin));
}));