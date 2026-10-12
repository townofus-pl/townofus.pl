import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
    database,
    error,
    json,
    mutationAllowed,
    safeHandler,
    session,
} from '../../_accounts/server';
const schema = z.object({ playerId: z.number().int().positive().max(2147483647) }).strict();
export async function POST(request: NextRequest) {
    return safeHandler(async () => {
        if (!mutationAllowed(request)) return error('Niedozwolone źródło żądania.', 403);
        const account = await session(request);
        if (!account) return error('Zaloguj się.', 401);
        const parsed = schema.safeParse(await request.json());
        if (!parsed.success) return error('Nieprawidłowy gracz.');
        const db = await database();
        // INSERT ... SELECT makes repetitions idempotent; trigger handles availability and retry guards atomically.
        await db
            .prepare(
                `INSERT INTO discord_link_requests(accountId,playerId)
 SELECT ?,? WHERE NOT EXISTS(SELECT 1 FROM discord_link_requests WHERE accountId=? AND status='pending' AND playerId=?)`,
            )
            .bind(account.id, parsed.data.playerId, account.id, parsed.data.playerId)
            .run();
        return json({ success: true });
    });
}
