import { NextRequest } from 'next/server';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
import { database, error, json, safeHandler } from '../_accounts/server';
import { hashToken, sameOrigin, SESSION_COOKIE, validToken } from '../_accounts/security';
import { parsePollContext } from '../_polls/rules';
import { createPoll } from '../_polls/server';
import { saveVoteSql } from '../_polls/sql';

export async function postHandler(request: NextRequest) {
    return safeHandler(async () => {
        if (!sameOrigin(request)) return error('Niedozwolone źródło żądania.', 403);
        let body: { date?: unknown; season?: unknown; action?: unknown; candidateId?: unknown };
        try { body = await request.json(); } catch { return error('Nieprawidłowe dane.'); }
        if (!body || typeof body !== 'object') return error('Nieprawidłowe dane.');
        let context;
        try { context = parsePollContext(typeof body.date === 'string' ? body.date : null, String(body.season)); }
        catch { return error('Nieprawidłowy dzień lub sezon.'); }
        const { date, season } = context;
        const db = await database();
        const token = request.cookies.get(SESSION_COOKIE)?.value;
        if (body.action === 'create') {
            const host = await authenticateHostHeaders(request.headers);
            if (!host.success || !host.user) return error('Wymagane uprawnienia hosta.', 403);
            await createPoll(db, date, season, host.user.accountId && validToken(token) ? await hashToken(token) : null);
            return json({ success: true }, 201);
        }
        if (body.action !== 'vote' || typeof body.candidateId !== 'number' || !Number.isSafeInteger(body.candidateId) || body.candidateId < 1) return error('Wybierz kandydata.');
        if (!validToken(token)) return error('Zaloguj się i powiąż profil gracza.', 401);
        const result = await db.prepare(saveVoteSql).bind(await hashToken(token), date, season, body.candidateId).run();
        if (result.meta.changes !== 1) return error('Głos nie został zapisany. Sprawdź powiązanie konta, kandydata i termin ankiety.', 403);
        return json({ success: true });
    });
}
