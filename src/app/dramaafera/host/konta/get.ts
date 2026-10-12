import { NextRequest } from 'next/server';
import { authenticateHostHeaders } from '@/app/api/_middlewares/hostAuth';
import { database, error, json, safeHandler } from '../../_accounts/server';
export async function GET(request: NextRequest) {
    return safeHandler(async () => {
        const auth = await authenticateHostHeaders(request.headers);
        if (!auth.success) return error('Wymagane uprawnienia hosta.', 403);
        const auditAccount = request.nextUrl.searchParams.get('auditAccount');
        if (auditAccount !== null) {
            const accountId = Number(auditAccount);
            const before = Number(
                request.nextUrl.searchParams.get('before') ?? Number.MAX_SAFE_INTEGER,
            );
            if (
                !Number.isSafeInteger(accountId) ||
                accountId <= 0 ||
                !Number.isSafeInteger(before) ||
                before <= 0
            )
                return error('Nieprawidłowa strona historii.');
            const history = await (
                await database()
            )
                .prepare(
                    `SELECT h.id,h.accountId,h.action,h.reason,h.previousPlayerId,h.newPlayerId,h.createdAt, COALESCE(actor.username,h.actor) AS actor FROM discord_link_audits h LEFT JOIN discord_accounts actor ON actor.id=h.actorAccountId AND actor.deletedAt IS NULL
                JOIN discord_accounts a ON a.id=h.accountId
                WHERE h.accountId=? AND h.id<? AND h.deletedAt IS NULL AND a.deletedAt IS NULL
                ORDER BY h.id DESC LIMIT 51`,
                )
                .bind(accountId, before)
                .all();
            const audits = history.results.slice(0, 50);
            return json({ success: true, data: { audits, hasMore: history.results.length > 50 } });
        }
        const cursor = Number(request.nextUrl.searchParams.get('cursor') ?? 0);
        if (!Number.isSafeInteger(cursor) || cursor < 0) return error('Nieprawidłowa strona.');
        const db = await database();
        const accounts = await db
            .prepare(
                `SELECT a.id,a.username,a.discordUserId,a.playerId,a.retryBlocked,a.version,a.isHost,p.name playerName,p.hashedProductUserId,p.friendCode
 FROM discord_accounts a LEFT JOIN players p ON p.id=a.playerId WHERE a.deletedAt IS NULL AND a.id>? ORDER BY a.id LIMIT 21`,
            )
            .bind(cursor)
            .all();
        // Bound page: relation subquery contributes one parameter rather than a growing IN list.
        const requests = await db
            .prepare(
                `SELECT r.*,p.name,p.hashedProductUserId,p.friendCode FROM discord_link_requests r JOIN players p ON p.id=r.playerId
 WHERE r.accountId IN (SELECT id FROM discord_accounts WHERE deletedAt IS NULL AND id>? ORDER BY id LIMIT 20)
 AND r.status='pending' AND r.deletedAt IS NULL ORDER BY r.id`,
            )
            .bind(cursor)
            .all();
        const audits = await db
            .prepare(
                `SELECT h.id,h.accountId,h.action,h.reason,h.previousPlayerId,h.newPlayerId,h.createdAt, COALESCE(actor.username,h.actor) AS actor FROM discord_link_audits h LEFT JOIN discord_accounts actor ON actor.id=h.actorAccountId AND actor.deletedAt IS NULL WHERE h.accountId IN
 (SELECT id FROM discord_accounts WHERE deletedAt IS NULL AND id>? ORDER BY id LIMIT 20)
 AND h.deletedAt IS NULL ORDER BY h.id DESC LIMIT 100`,
            )
            .bind(cursor)
            .all();
        const rows = accounts.results.slice(0, 20);
        return json({
            success: true,
            data: {
                accounts: rows,
                requests: requests.results,
                audits: audits.results,
                nextCursor: accounts.results.length > 20 ? rows[rows.length - 1].id : null,
            },
        });
    });
}
