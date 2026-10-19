// Which name a click puts on the list, and the discord_accounts link behind it (spec: #351).
//
// 1. Linked account → its player's name. An existing link is never changed.
// 2. Unlinked, nick matches a player without an account → link to that player.
// 3. Unlinked, no player with that nick → new player (name only) + its initial ranking row, the
//    same rows the site's createPlayerWithRanking writes, + link.
// 4. Unlinked, the player has another account → no link, the nick as it is.
//
// D1 has no interactive transactions, so every write is guarded in SQL and the account is read
// again at the end. Two clicks at the same time end in the same state as two in a row.

import { CURRENT_SEASON } from '../../../../src/app/dramaafera/_constants/seasons';
import type { GuildMember } from '../discord';

/** Prisma's DateTime text format (`2026-10-21T18:00:00.000+00:00`), so the site reads our rows. */
export const SQL_NOW = `strftime('%Y-%m-%dT%H:%M:%f+00:00','now')`;

/** Same values as createPlayerWithRanking (src/app/api/_utils). */
const INITIAL_SCORE = 2000.0;
const INITIAL_REASON = 'initial_value';

export type IdentityOutcome = 'linked' | 'newLink' | 'newPlayer' | 'taken' | 'unlinked';

export interface SignupIdentity {
    name: string;
    outcome: IdentityOutcome;
}

type Member = GuildMember & { user: GuildMember['user'] & { avatar?: string | null } };

/** The name Discord shows on the server: nick → global_name → username. */
export function displayName(member: GuildMember): string {
    return (member.nick || member.user.global_name || member.user.username).trim();
}

async function linkedPlayerName(db: D1Database, discordUserId: string): Promise<string | null> {
    const row = await db
        .prepare(
            `SELECT p.name FROM discord_accounts a JOIN players p ON p.id = a.playerId
             WHERE a.discordUserId = ? AND a.deletedAt IS NULL AND p.deletedAt IS NULL`,
        )
        .bind(discordUserId)
        .first<{ name: string }>();
    return row?.name ?? null;
}

interface PlayerMatch {
    id: number;
    name: string;
    hasAccount: number;
}

/**
 * The player whose name equals the nick: the exact match first, otherwise a case-insensitive
 * match when there is exactly one. `ambiguous` when several players differ only in case.
 */
async function findPlayer(db: D1Database, nick: string): Promise<PlayerMatch | 'ambiguous' | null> {
    const { results } = await db
        .prepare(
            `SELECT p.id, p.name,
                    EXISTS (SELECT 1 FROM discord_accounts a WHERE a.playerId = p.id) AS hasAccount
             FROM players p
             WHERE p.name = ?1 COLLATE NOCASE AND p.deletedAt IS NULL
             ORDER BY p.name = ?1 DESC
             LIMIT 2`,
        )
        .bind(nick)
        .all<PlayerMatch>();
    if (results.length === 0) return null;
    if (results[0].name === nick || results.length === 1) return results[0];
    return 'ambiguous';
}

/** Read-only, for "Wypisz mnie": a leave never creates a player or a link. */
export async function resolveForLeave(db: D1Database, member: GuildMember): Promise<SignupIdentity> {
    const linked = await linkedPlayerName(db, member.user.id);
    return linked ? { name: linked, outcome: 'linked' } : { name: displayName(member), outcome: 'unlinked' };
}

/** For "Gram": creates the account row, and the link or the player when the rules allow it. */
export async function resolveForJoin(db: D1Database, member: Member): Promise<SignupIdentity> {
    const userId = member.user.id;
    const nick = displayName(member);

    const linked = await linkedPlayerName(db, userId);
    if (linked) return { name: linked, outcome: 'linked' };

    // The account row, without touching playerId. Stage 3's OAuth login upserts the same way.
    await db
        .prepare(
            `INSERT INTO discord_accounts (discordUserId, username, avatar, createdAt, updatedAt)
             VALUES (?, ?, ?, ${SQL_NOW}, ${SQL_NOW})
             ON CONFLICT (discordUserId) DO UPDATE SET
                username = excluded.username, avatar = excluded.avatar, updatedAt = excluded.updatedAt`,
        )
        .bind(userId, member.user.username, member.user.avatar ?? null)
        .run();

    const match = await findPlayer(db, nick);
    if (match === 'ambiguous' || (match && match.hasAccount)) return { name: nick, outcome: 'taken' };

    let expected: IdentityOutcome;
    if (match) {
        expected = 'newLink';
        await db
            .prepare(
                `UPDATE discord_accounts SET playerId = ?1, version = version + 1, updatedAt = ${SQL_NOW}
                 WHERE discordUserId = ?2 AND playerId IS NULL AND deletedAt IS NULL
                   AND NOT EXISTS (SELECT 1 FROM discord_accounts WHERE playerId = ?1)`,
            )
            .bind(match.id, userId)
            .run();
    } else {
        expected = 'newPlayer';
        await createLinkedPlayer(db, userId, nick);
    }

    // Whatever happened in between (a double click, another account with the same nick), the
    // stored link decides.
    const name = await linkedPlayerName(db, userId);
    if (!name) return { name: nick, outcome: 'taken' };
    return { name, outcome: name === (match ? match.name : nick) ? expected : 'linked' };
}

/**
 * One batch (one transaction). Each statement is a no-op when an earlier one did nothing: the
 * player exists only if this account is still unlinked and the name is free, the ranking row
 * only if the player has none, the link only if the player has no account.
 */
async function createLinkedPlayer(db: D1Database, userId: string, name: string): Promise<void> {
    const player = `(SELECT id FROM players WHERE name = ?1 AND deletedAt IS NULL)`;
    await db.batch([
        db
            .prepare(
                `INSERT INTO players (name, createdAt, updatedAt)
                 SELECT ?1, ${SQL_NOW}, ${SQL_NOW}
                 WHERE EXISTS (SELECT 1 FROM discord_accounts
                               WHERE discordUserId = ?2 AND playerId IS NULL AND deletedAt IS NULL)
                 ON CONFLICT (name) DO NOTHING`,
            )
            .bind(name, userId),
        db
            .prepare(
                `INSERT INTO player_rankings (playerId, score, reason, season, createdAt)
                 SELECT p.id, ?2, ?3, ?4, ${SQL_NOW} FROM players p
                 WHERE p.id = ${player}
                   AND NOT EXISTS (SELECT 1 FROM player_rankings r WHERE r.playerId = p.id)`,
            )
            .bind(name, INITIAL_SCORE, INITIAL_REASON, CURRENT_SEASON),
        db
            .prepare(
                `UPDATE players SET currentRankingId =
                    (SELECT MAX(r.id) FROM player_rankings r WHERE r.playerId = players.id)
                 WHERE id = ${player} AND currentRankingId IS NULL`,
            )
            .bind(name),
        db
            .prepare(
                `UPDATE discord_accounts SET playerId = ${player}, version = version + 1, updatedAt = ${SQL_NOW}
                 WHERE discordUserId = ?2 AND playerId IS NULL AND deletedAt IS NULL
                   AND ${player} IS NOT NULL
                   AND NOT EXISTS (SELECT 1 FROM discord_accounts WHERE playerId = ${player})`,
            )
            .bind(name, userId),
    ]);
}
