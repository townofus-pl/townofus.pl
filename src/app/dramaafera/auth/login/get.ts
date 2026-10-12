import { NextRequest, NextResponse } from 'next/server';
import { database, error, oauthConfig, safeHandler } from '../../_accounts/server';
import { STATE_COOKIE, cookieOptions, hashToken, randomToken } from '../../_accounts/security';
export async function GET(request: NextRequest) {
    return safeHandler(async () => {
        const config = await oauthConfig();
        if (!config) return error('Logowanie Discord nie jest jeszcze skonfigurowane.', 503);
        if (new URL(config.redirectUri).origin !== request.nextUrl.origin)
            return error('Nieprawidłowy adres logowania.', 503);
        const state = randomToken();
        const db = await database();
        await db.batch([
            db.prepare('DELETE FROM discord_oauth_states WHERE expiresAt<=?').bind(Date.now()),
            db
                .prepare('INSERT INTO discord_oauth_states(stateHash,expiresAt) VALUES (?,?)')
                .bind(await hashToken(state), Date.now() + 10 * 60 * 1000),
        ]);
        const url = new URL('https://discord.com/oauth2/authorize');
        url.search = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: 'identify',
            state,
        }).toString();
        const response = NextResponse.redirect(url);
        response.headers.set('Cache-Control', 'no-store');
        response.headers.set('Referrer-Policy', 'no-referrer');
        response.cookies.set(STATE_COOKIE, state, cookieOptions(request.url, 600));
        return response;
    });
}
