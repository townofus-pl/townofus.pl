import { NextRequest } from 'next/server';
import {
    database,
    error,
    json,
    mutationAllowed,
    safeHandler,
    session,
} from '../../_accounts/server';
import { SESSION_COOKIE, cookieOptions } from '../../_accounts/security';
export async function DELETE(request: NextRequest) {
    return safeHandler(async () => {
        if (!mutationAllowed(request)) return error('Niedozwolone źródło żądania.', 403);
        const account = await session(request);
        if (!account) return error('Zaloguj się.', 401);
        // FK cascades physically erase all sessions, requests, audits and transient commands.
        // This single statement atomically removes the link and all Discord-identifying traces.
        await (await database())
            .prepare('DELETE FROM discord_accounts WHERE id=?')
            .bind(account.id)
            .run();
        const response = json({ success: true });
        response.cookies.set(SESSION_COOKIE, '', cookieOptions(request.url, 0));
        return response;
    });
}
