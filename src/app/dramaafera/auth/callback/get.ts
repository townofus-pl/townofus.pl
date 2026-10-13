import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { database, error, oauthConfig, safeHandler } from '../../_accounts/server';
import {
    STATE_COOKIE,
    SESSION_COOKIE,
    SESSION_SECONDS,
    cookieOptions,
    hashToken,
    randomToken,
    validToken,
} from '../../_accounts/security';
const userSchema = z.object({
    id: z.string().regex(/^\d{1,32}$/),
    username: z.string().min(1).max(100),
    avatar: z
        .string()
        .regex(/^[a-f0-9_]+$/)
        .nullable(),
});
export async function GET(request: NextRequest) {
    return safeHandler(async () => {
        const config = await oauthConfig();
        if (!config || new URL(config.redirectUri).origin !== request.nextUrl.origin)
            return error('Logowanie nie jest skonfigurowane.', 503);
        const state = request.nextUrl.searchParams.get('state') ?? undefined;
        const browserState = request.cookies.get(STATE_COOKIE)?.value;
        if (!validToken(state) || state !== browserState)
            return error('Nieprawidłowy stan logowania.', 400);
        const db = await database();
        const used = await db
            .prepare(
                'DELETE FROM discord_oauth_states WHERE stateHash=? AND expiresAt>? RETURNING id',
            )
            .bind(await hashToken(state), Date.now())
            .first();
        if (!used) return error('Logowanie wygasło lub zostało już wykorzystane.', 400);
        const failed = () => {
            const r = error('Logowanie Discord nie powiodło się.', 400);
            r.cookies.set(STATE_COOKIE, '', cookieOptions(request.url, 0));
            return r;
        };
        const code = request.nextUrl.searchParams.get('code');
        if (!code || code.length > 2048) return failed();
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: config.clientId,
                client_secret: config.clientSecret,
                grant_type: 'authorization_code',
                code,
                redirect_uri: config.redirectUri,
            }),
            cache: 'no-store',
            signal: AbortSignal.timeout(15000),
        });
        if (!tokenResponse.ok) return failed();
        const parsed = z
            .object({ access_token: z.string().min(1), token_type: z.literal('Bearer') })
            .safeParse(await tokenResponse.json());
        if (!parsed.success) return failed();
        const token = parsed.data.access_token;
        try {
            const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { Authorization: `Bearer ${token}` },
                cache: 'no-store',
                signal: AbortSignal.timeout(15000),
            });
            if (!userResponse.ok) return failed();
            const result = userSchema.safeParse(await userResponse.json());
            if (!result.success) return failed();
            const user = result.data,
                sessionToken = randomToken();
            await db.batch([
                db
                    .prepare(
                        `INSERT INTO discord_accounts(discordUserId,username,avatar) VALUES (?,?,?)
 ON CONFLICT(discordUserId) DO UPDATE SET username=excluded.username,avatar=excluded.avatar,updatedAt=CURRENT_TIMESTAMP`,
                    )
                    .bind(user.id, user.username, user.avatar),
                db
                    .prepare(
                        `INSERT INTO discord_sessions(tokenHash,accountId,expiresAt)
 SELECT ?,id,? FROM discord_accounts WHERE discordUserId=? AND deletedAt IS NULL`,
                    )
                    .bind(
                        await hashToken(sessionToken),
                        Date.now() + SESSION_SECONDS * 1000,
                        user.id,
                    ),
                db.prepare('DELETE FROM discord_sessions WHERE expiresAt<=?').bind(Date.now()),
            ]);
            const response = NextResponse.redirect(new URL('/dramaafera/konto', request.url));
            response.headers.set('Cache-Control', 'no-store');
            response.headers.set('Referrer-Policy', 'no-referrer');
            response.cookies.set(STATE_COOKIE, '', cookieOptions(request.url, 0));
            response.cookies.set(
                SESSION_COOKIE,
                sessionToken,
                cookieOptions(request.url, SESSION_SECONDS),
            );
            return response;
        } finally {
            // No Discord tokens are persisted. Revoke immediately after retrieving identity.
            try {
                await fetch('https://discord.com/api/oauth2/token/revoke', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: config.clientId,
                        client_secret: config.clientSecret,
                        token,
                    }),
                    signal: AbortSignal.timeout(5000),
                });
            } catch {
                /* Never log OAuth secrets. */
            }
        }
    });
}
