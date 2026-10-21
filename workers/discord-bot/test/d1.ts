// A real D1 (workerd, in memory) with every migration from prisma/migrations applied.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Miniflare } from 'miniflare';

const MIGRATIONS = join(__dirname, '../../../prisma/migrations');

export async function createTestD1(): Promise<{ db: D1Database; dispose: () => Promise<void> }> {
    const mf = new Miniflare({
        modules: true,
        script: 'export default { fetch() { return new Response("ok") } }',
        d1Databases: { DB: 'signup-test' },
        d1Persist: false,
        compatibilityDate: '2026-05-01',
    });
    const db = (await mf.getD1Database('DB')) as unknown as D1Database;
    for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
        const sql = readFileSync(join(MIGRATIONS, file), 'utf8')
            .split('\n')
            .filter((line) => !line.trim().startsWith('--'))
            .join('\n');
        const statements = sql.split(/;\s*(?:\n|$)/).map((s) => s.trim()).filter(Boolean);
        await db.batch(statements.map((s) => db.prepare(s)));
    }
    return { db, dispose: () => mf.dispose() };
}

/** Wipes the rows the poll tests write. */
export async function clearPollTables(db: D1Database): Promise<void> {
    await db.batch(
        [
            'DELETE FROM "emperor_poll_candidates"',
            'DELETE FROM "emperor_polls"',
            'DELETE FROM "game_player_statistics"',
            'DELETE FROM "discord_accounts"',
            'DELETE FROM "games"',
            'UPDATE "players" SET "currentRankingId" = NULL',
            'DELETE FROM "player_rankings"',
            'DELETE FROM "players"',
        ].map((sql) => db.prepare(sql)),
    );
}

export interface SeedGame {
    /** `YYYYMMDD_HHMM`, Warsaw wall clock. */
    gameIdentifier: string;
    /** UTC, in the `CURRENT_TIMESTAMP` format the v2 ingest writes. */
    createdAt: string;
    deleted?: boolean;
    /** nickname → the player's total in that game */
    points: Record<string, number>;
}

const DELETED_AT = '2026-01-01T00:00:00.000+00:00';

export async function seedGames(db: D1Database, games: SeedGame[], deletedPlayers: string[] = []): Promise<void> {
    for (const name of new Set(games.flatMap((g) => Object.keys(g.points)))) {
        await db
            .prepare(`INSERT OR IGNORE INTO "players" ("name", "updatedAt", "deletedAt") VALUES (?, ?, ?)`)
            .bind(name, DELETED_AT, deletedPlayers.includes(name) ? DELETED_AT : null)
            .run();
    }
    for (const game of games) {
        const id = game.gameIdentifier;
        const start = `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}T${id.slice(9, 11)}:${id.slice(11, 13)}:00.000+00:00`;
        await db
            .prepare(
                `INSERT INTO "games" ("gameIdentifier", "startTime", "endTime", "map", "season", "createdAt", "updatedAt", "deletedAt")
                 VALUES (?, ?, ?, 'Skeld', 4, ?, ?, ?)`,
            )
            .bind(id, start, start, game.createdAt, game.createdAt, game.deleted ? DELETED_AT : null)
            .run();
        for (const [name, points] of Object.entries(game.points)) {
            await db
                .prepare(
                    `INSERT INTO "game_player_statistics" ("gameId", "playerId", "totalPoints")
                     SELECT g."id", p."id", ? FROM "games" g, "players" p WHERE g."gameIdentifier" = ? AND p."name" = ?`,
                )
                .bind(points, id, name)
                .run();
        }
    }
}
