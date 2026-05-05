import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/app/api/_middlewares/auth';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const authResult = await authenticateApiRequest(request);

  if (!authResult.success) {
    return authResult.response ?? new NextResponse('Unauthorized', { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dramaafera/host',
    '/dramaafera/host/:path*',
    '/dramaafera/historia-gier/:date/podsumowanie',
    '/dramaafera/sezon/:seasonId/historia-gier/:date/podsumowanie',
  ],
};
