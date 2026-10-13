import { NextRequest } from 'next/server';
import { database, error, json, mutationAllowed, safeHandler } from '../../_accounts/server';
import { SESSION_COOKIE, cookieOptions, hashToken, validToken } from '../../_accounts/security';
export async function POST(request: NextRequest) {
    return safeHandler(async () => {
        if (!mutationAllowed(request)) return error('Niedozwolone źródło żądania.', 403);
        const token = request.cookies.get(SESSION_COOKIE)?.value;
        if (validToken(token))
            await (
                await database()
            )
                .prepare('DELETE FROM discord_sessions WHERE tokenHash=?')
                .bind(await hashToken(token))
                .run();
        const response = json({ success: true });
        response.cookies.set(SESSION_COOKIE, '', cookieOptions(request.url, 0));
        return response;
    });
}
