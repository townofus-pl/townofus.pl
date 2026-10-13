import { NextRequest } from 'next/server';
import { z } from 'zod';
import { database, error, json, mutationAllowed, safeHandler } from '../../_accounts/server';
import { hashToken, SESSION_COOKIE, validToken } from '../../_accounts/security';
import { changeSignup } from '../../_signups/storage';

const requestSchema = z.object({ action: z.enum(['join', 'leave']), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).strict();

export async function postHandler(request: NextRequest) {
    return safeHandler(async () => {
        if (!mutationAllowed(request)) return error('Niedozwolone źródło żądania.', 403);
        const parsed = requestSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return error('Nieprawidłowe dane zapisu.');
        const token = request.cookies.get(SESSION_COOKIE)?.value;
        if (!validToken(token)) return error('Zaloguj się przez Discord, aby się zapisać.', 401);
        const saved = await changeSignup(await database(), await hashToken(token), parsed.data.date, parsed.data.action === 'join');
        if (!saved) return error('Termin się zmienił albo konto nie jest powiązane z aktywnym graczem. Odśwież listę.', 409);
        return json({ success: true });
    });
}
