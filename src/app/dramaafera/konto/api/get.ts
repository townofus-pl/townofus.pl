import { NextRequest } from 'next/server';
import { database, json, session, safeHandler } from '../../_accounts/server';
export async function GET(request: NextRequest) {
    return safeHandler(async () => {
        const account = await session(request);
        if (!account) return json({ success: true, data: null });
        const db = await database();
        const requests = await db
            .prepare(
                `SELECT r.id,r.playerId,r.status,r.createdAt,p.name FROM discord_link_requests r JOIN players p ON p.id=r.playerId
 WHERE r.accountId=? AND r.deletedAt IS NULL ORDER BY r.id DESC LIMIT 20`,
            )
            .bind(account.id)
            .all();
        const player = account.playerId
            ? await db
                  .prepare('SELECT id,name FROM players WHERE id=? AND deletedAt IS NULL')
                  .bind(account.playerId)
                  .first()
            : null;
        return json({
            success: true,
            data: {
                username: account.username,
                avatarUrl: account.avatar
                    ? `https://cdn.discordapp.com/avatars/${account.discordUserId}/${account.avatar}.png?size=128`
                    : null,
                player,
                retryBlocked: !!account.retryBlocked,
                requests: requests.results,
            },
        });
    });
}
