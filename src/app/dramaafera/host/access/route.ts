import { NextRequest, NextResponse } from 'next/server';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
// Permission discovery is safe for anonymous callers and must never issue a Basic challenge.
export async function GET(request: NextRequest) {
    const auth = await authenticateHostHeaders(request.headers);
    return NextResponse.json(
        { isHost: auth.success },
        { headers: { 'Cache-Control': 'no-store' } },
    );
}
