// Which name a click puts on the list, and the discord_accounts link behind it (spec: #351).
//
// 1. Linked account → its player's name. An existing link is never changed.
// 2. Unlinked, nick matches a player without an account → link to that player.
// 3. Unlinked, no player with that nick → new player (name only) + its initial ranking row, the
//    same rows the site's createPlayerWithRanking writes, + link.
// 4. Unlinked, the nick belongs to a player linked to another account → "taken": the click
//    changes nothing on the list. The name there is someone else's, so this account can neither
//    add it nor remove it. The host checks who it is.
//
// An account removes only its own player's name, or its own nick when no linked player has it.
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

interface Player {
    id: number;
    name: string;
}

type NickMatch =
    | { kind: 'none' }
    | { kind: 'free'; player: Player }
    | { kind: 'taken' }
    /** Several players differ from the nick only in case, and none of them is linked. */
    | { kind: 'ambiguous' };

// SQLite's NOCASE folds ASCII only, so "łoś" would not find "Łoś". Fold in JS instead.
const fold = (name: string) => name.toLocaleLowerCase('pl');

/**
 * The player whose name equals the nick: the exact match first, otherwise a case-insensitive
 * match (Polish letters included) when there is exactly one.
 *
 * Reads every non-deleted player (id and name only): one row read per player, a few hundred at
 * most, and only for clicks from accounts without a link.
 */
async function matchNick(db: D1Database, nick: string): Promise<NickMatch> {
    const { results: players } = await db
        .prepare('SELECT id, name FROM players WHERE deletedAt IS NULL')
        .all<Player>();
    const exact = players.find((p) => p.name === nick);
    const candidates = exact ? [exact] : players.filter((p) => fold(p.name) === fold(nick));
    if (candidates.length === 0) return { kind: 'none' };

    const { results: linked } = await db
        .prepare(`SELECT playerId FROM discord_accounts WHERE playerId IN (${candidates.map(() => '?').join(',')})`)
        .bind(...candidates.map((p) => p.id))
        .all<{ playerId: number }>();
    if (linked.length > 0) return { kind: 'taken' };
    return candidates.length === 1 ? { kind: 'free', player: candidates[0] } : { kind: 'ambiguous' };
}

/** The name an unlinked account may write or remove: a free player's own spelling, or the nick. */
function unlinkedIdentity(nick: string, match: NickMatch): SignupIdentity {
    if (match.kind === 'taken') return { name: nick, outcome: 'taken' };
    return { name: match.kind === 'free' ? match.player.name : nick, outcome: 'unlinked' };
}

/** Read-only, for "Wypisz mnie": a leave never creates a player or a link. */
export async function resolveForLeave(db: D1Database, member: GuildMember): Promise<SignupIdentity> {
    const linked = await linkedPlayerName(db, member.user.id);
    if (linked) return { name: linked, outcome: 'linked' };
    const nick = displayName(member);
    return unlinkedIdentity(nick, await matchNick(db, nick));
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

    const match = await matchNick(db, nick);
    if (match.kind === 'taken' || match.kind === 'ambiguous') return unlinkedIdentity(nick, match);

    if (match.kind === 'free') {
        await db
            .prepare(
                `UPDATE discord_accounts SET playerId = ?1, version = version + 1, updatedAt = ${SQL_NOW}
                 WHERE discordUserId = ?2 AND playerId IS NULL AND deletedAt IS NULL
                   AND NOT EXISTS (SELECT 1 FROM discord_accounts WHERE playerId = ?1)`,
            )
            .bind(match.player.id, userId)
            .run();
    } else {
        await createLinkedPlayer(db, userId, nick);
    }

    // Whatever happened in between (a double click, another account with the same nick), the
    // stored link decides.
    const name = await linkedPlayerName(db, userId);
    if (name) {
        const expected = match.kind === 'free' ? match.player.name : nick;
        if (name !== expected) return { name, outcome: 'linked' };
        return { name, outcome: match.kind === 'free' ? 'newLink' : 'newPlayer' };
    }
    // No link: another account took the player first, or a deleted player holds the name.
    return unlinkedIdentity(nick, await matchNick(db, nick));
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
