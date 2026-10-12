import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { NextRequest, NextResponse } from 'next/server';
import { hashToken, validToken, SESSION_COOKIE, sameOrigin } from './security';
export interface Account {
    id: number;
    username: string;
    discordUserId: string;
    avatar: string | null;
    playerId: number | null;
    retryBlocked: number;
    version: number;
}
export async function database() {
    return (await getCloudflareContext()).env.DB;
}
export function json(data: unknown, status = 200) {
    return NextResponse.json(data, {
        status,
        headers: { 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' },
    });
}
export function error(message: string, status = 400) {
    return json({ success: false, error: message }, status);
}
export async function session(request: NextRequest): Promise<Account | null> {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!validToken(token)) return null;
    const db = await database();
    return db
        .prepare(
            `SELECT a.id,a.username,a.discordUserId,a.avatar,a.playerId,a.retryBlocked,a.version FROM discord_sessions s
 JOIN discord_accounts a ON a.id=s.accountId WHERE s.tokenHash=? AND s.expiresAt>?
 AND s.deletedAt IS NULL AND a.deletedAt IS NULL`,
        )
        .bind(await hashToken(token), Date.now())
        .first<Account>();
}
export function mutationAllowed(request: NextRequest) {
    return sameOrigin(request);
}
export async function safeHandler(work: () => Promise<Response>): Promise<Response> {
    try {
        return await work();
    } catch (cause) {
        // Inspect only for classification; never expose or log SQL/OAuth error details.
        const conflict = cause instanceof Error && /constraint|conflict/i.test(cause.message);
        return error(
            'Operacja nie powiodła się. Odśwież dane i spróbuj ponownie.',
            conflict ? 409 : 500,
        );
    }
}
export async function oauthConfig() {
    const { env } = await getCloudflareContext();
    const values = env as unknown as Record<string, string | undefined>;
    const clientId = values.DISCORD_CLIENT_ID || process.env.DISCORD_CLIENT_ID;
    const clientSecret = values.DISCORD_CLIENT_SECRET || process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = values.DISCORD_REDIRECT_URI || process.env.DISCORD_REDIRECT_URI;
    if (!clientId || !clientSecret || !redirectUri) return null;
    const url = new URL(redirectUri);
    if (
        url.pathname !== '/dramaafera/auth/callback' ||
        url.search ||
        url.hash ||
        url.username ||
        url.password ||
        (url.protocol !== 'https:' &&
            !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))
    )
        return null;
    return { clientId, clientSecret, redirectUri };
}
