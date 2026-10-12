import { NextRequest, NextResponse } from 'next/server';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if(request.nextUrl.pathname==='/dramaafera/host/access')return NextResponse.next();
  const authResult = await authenticateHostHeaders(request.headers);

  if (!authResult.success) {
    if (request.nextUrl.pathname === '/dramaafera/host/konta') {
      return NextResponse.json({ success: false, error: 'Wymagane uprawnienia hosta.' },
        { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
    return authResult.response ?? new NextResponse('Unauthorized', { status: 401 });
  }

  const response=NextResponse.next();
  response.headers.set('Cache-Control','no-store');
  return response;
}

export const config = {
  matcher: [
    '/dramaafera/host',
    '/dramaafera/host/:path*',
    '/dramaafera/historia-gier/:date/podsumowanie',
    '/dramaafera/sezon/:seasonId/historia-gier/:date/podsumowanie',
  ],
};
