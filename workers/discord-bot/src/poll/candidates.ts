// Who goes on the poll, and whether the day's games are over.

import { dateOfGameIdentifier, gameIdentifierAt, gameIdentifierRange, parseDbTimestamp } from './time';

/** Discord allows at most 10 answers in a poll. */
export const CANDIDATE_COUNT = 10;

/** The cron waits this long after the last ingested game before it creates the poll. */
export const QUIET_MS = 30 * 60 * 1000;

export interface PlayerDayStats {
    playerId: number;
    nickname: string;
    points: number;
    games: number;
}

export interface Candidate {
    playerId: number;
    nickname: string;
}

export interface GameDay {
    date: string;
    gameCount: number;
    /** Epoch ms of the newest `games.createdAt` of the day. NaN when there are no games. */
    lastIngestedAt: number;
    players: PlayerDayStats[];
}

// Sums of float columns can differ in the last bits for equal results. Compare at a fixed precision.
const comparablePoints = (points: number) => Math.round(points * 1e6);

/**
 * Selects the players for the poll. Returns at most CANDIDATE_COUNT players, best first. Ties:
 * more games that day, then the nickname in Polish alphabetical order.
 * This order is for the selection only. Do not post it: use `shuffleCandidates` first.
 */
export function pickCandidates(players: PlayerDayStats[]): Candidate[] {
    return [...players]
        .sort(
            (a, b) =>
                comparablePoints(b.points) - comparablePoints(a.points) ||
                b.games - a.games ||
                a.nickname.localeCompare(b.nickname, 'pl') ||
                a.playerId - b.playerId,
        )
        .slice(0, CANDIDATE_COUNT)
        .map(({ playerId, nickname }) => ({ playerId, nickname }));
}

/**
 * Returns the candidates in random order (Fisher-Yates). The input array does not change.
 * `random` returns a number from 0 (included) to 1 (excluded), like `Math.random`.
 * The answers are in random order, so the order does not show the results of the day.
 */
export function shuffleCandidates(candidates: Candidate[], random: () => number = Math.random): Candidate[] {
    const result = [...candidates];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/** The quiet rule for the cron: the day has games, and the last one came in QUIET_MS ago or more. */
export function isDayQuiet(day: GameDay, now: number): boolean {
    return day.gameCount > 0 && now - day.lastIngestedAt >= QUIET_MS;
}

/** The non-deleted games of a session date, and the sums per non-deleted player. */
export async function loadGameDay(db: D1Database, date: string): Promise<GameDay> {
    const [from, to] = gameIdentifierRange(date);
    // The range on `gameIdentifier` uses its unique index. The site groups a day the same way
    // (`getGamesListByDate`: identifier starts with the date).
    const [games, players] = await db.batch([
        db
            .prepare(
                `SELECT "createdAt" FROM "games"
                 WHERE "gameIdentifier" >= ? AND "gameIdentifier" < ? AND "deletedAt" IS NULL`,
            )
            .bind(from, to),
        db
            .prepare(
                `SELECT s."playerId" AS playerId, p."name" AS nickname,
                        SUM(s."totalPoints") AS points, COUNT(*) AS games
                 FROM "games" g
                 JOIN "game_player_statistics" s ON s."gameId" = g."id"
                 JOIN "players" p ON p."id" = s."playerId" AND p."deletedAt" IS NULL
                 WHERE g."gameIdentifier" >= ? AND g."gameIdentifier" < ? AND g."deletedAt" IS NULL
                 GROUP BY s."playerId", p."name"`,
            )
            .bind(from, to),
    ]);
    const createdAt = (games.results as { createdAt: string }[]).map((g) => parseDbTimestamp(g.createdAt));
    return {
        date,
        gameCount: createdAt.length,
        // Mixed text formats rule out MAX() in SQL. A day has about a dozen games.
        lastIngestedAt: createdAt.length ? Math.max(...createdAt) : NaN,
        players: players.results as unknown as PlayerDayStats[],
    };
}

/** For `/ankieta`: the session date of the newest game that started in the last 24 hours. */
export async function latestGameDate(db: D1Database, now: number): Promise<string | null> {
    const row = await db
        .prepare(
            `SELECT "gameIdentifier" FROM "games"
             WHERE "gameIdentifier" >= ? AND "deletedAt" IS NULL
             ORDER BY "gameIdentifier" DESC LIMIT 1`,
        )
        .bind(gameIdentifierAt(now - 24 * 60 * 60 * 1000))
        .first<{ gameIdentifier: string }>();
    return row ? dateOfGameIdentifier(row.gameIdentifier) : null;
}
