import { NextRequest } from 'next/server';
import { database, json, safeHandler, session } from '../../_accounts/server';
import { readUpcomingRoster } from '../../_signups/storage';

export async function getHandler(request: NextRequest) {
    return safeHandler(async () => {
        const db = await database();
        const account = await session(request);
        const player = account?.playerId == null ? null : await db.prepare(
            'SELECT id,name FROM players WHERE id=? AND deletedAt IS NULL',
        ).bind(account.playerId).first<{ id: number; name: string }>();
        return json({ roster: await readUpcomingRoster(db), loggedIn: !!account, player });
    });
}
