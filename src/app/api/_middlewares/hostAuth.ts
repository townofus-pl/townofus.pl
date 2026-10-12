import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { authenticateHeaders } from './auth';
import {
    hashToken,
    validToken,
    SESSION_COOKIE,
    sameOrigin,
} from '@/app/dramaafera/_accounts/security';
export interface HostAuthResult {
    success: boolean;
    response?: NextResponse;
    user?: { username: string; accountId?: number };
}
export async function authenticateHostHeaders(headers: Headers): Promise<HostAuthResult> {
    const raw = headers
        .get('cookie')
        ?.split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(SESSION_COOKIE + '='))
        ?.slice(SESSION_COOKIE.length + 1);
    if (validToken(raw)) {
        try {
            const { env } = await getCloudflareContext();
            const account = await env.DB.prepare(
                `SELECT a.id FROM discord_sessions s JOIN discord_accounts a ON a.id=s.accountId
    WHERE s.tokenHash=? AND s.expiresAt>? AND s.deletedAt IS NULL AND a.deletedAt IS NULL AND a.isHost=1`,
            )
                .bind(await hashToken(raw), Date.now())
                .first<{ id: number }>();
            if (account)
                return { success: true, user: { username: 'Host Discord', accountId: account.id } };
        } catch {
            return {
                success: false,
                response: NextResponse.json(
                    { success: false, error: 'Nie udało się sprawdzić uprawnień hosta.' },
                    { status: 503, headers: { 'Cache-Control': 'no-store' } },
                ),
            };
        }
    }
    return authenticateHeaders(headers);
}
export function withHostAuth(
    handler: (
        request: NextRequest,
        context: { user: { username: string; accountId?: number } },
    ) => Promise<Response>,
) {
    return async (request: NextRequest) => {
        const auth = await authenticateHostHeaders(request.headers);
        if (!auth.success || !auth.user)
            return (
                auth.response ??
                NextResponse.json(
                    { success: false, error: 'Brak uprawnień hosta.' },
                    { status: 403 },
                )
            );
        if (!sameOrigin(request))
            return NextResponse.json(
                { success: false, error: 'Niedozwolone źródło żądania.' },
                { status: 403 },
            );
        const response = await handler(request, { user: auth.user });
        response.headers.set('Cache-Control', 'no-store');
        return response;
    };
}
