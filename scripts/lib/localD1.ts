import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { listLocalDatabases } from '@prisma/adapter-d1';

/**
 * Resolves the single local D1 SQLite file that `wrangler d1 ... --local` creates.
 *
 * Same resolution as `prisma.config.ts` — deliberately reusing `listLocalDatabases()`
 * so the scripts and the Prisma CLI can never disagree about which file is "the"
 * local database.
 */
export function resolveLocalD1Path(): string {
    let candidates: string[];

    try {
        // Miniflare keeps its own `metadata.sqlite` bookkeeping file in the same
        // directory and `listLocalDatabases()` happily returns it, which trips the
        // "exactly one" guard below. It is not a D1 database — drop it.
        candidates = listLocalDatabases().filter((file) => path.basename(file) !== 'metadata.sqlite');
    } catch (err) {
        throw new Error(
            'No local D1 directory found at .wrangler/state/v3/d1/miniflare-D1DatabaseObject/. ' +
                'Run `npm run db:migrate:apply:local` first. ' +
                `(${(err as Error).message})`,
        );
    }

    if (candidates.length === 0) {
        throw new Error('No local D1 database files found. Run `npm run db:migrate:apply:local` first.');
    }

    if (candidates.length > 1) {
        throw new Error(
            `Multiple local D1 databases found — expected exactly one, got ${candidates.length}:\n` +
                candidates.map((c) => `  - ${c}`).join('\n'),
        );
    }

    return candidates[0];
}

export function openLocalD1(readOnly = true): DatabaseSync {
    return new DatabaseSync(resolveLocalD1Path(), { readOnly });
}

export function queryAll<T>(db: DatabaseSync, sql: string, ...params: unknown[]): T[] {
    // node:sqlite returns null-prototype objects; spread them so callers get plain ones.
    return db
        .prepare(sql)
        .all(...(params as never[]))
        .map((row) => ({ ...row }) as T);
}

export function queryOne<T>(db: DatabaseSync, sql: string, ...params: unknown[]): T | undefined {
    const row = db.prepare(sql).get(...(params as never[]));
    return row === undefined ? undefined : ({ ...row } as T);
}

export function count(db: DatabaseSync, sql: string): number {
    const row = queryOne<{ c: number }>(db, sql);
    return Number(row?.c ?? 0);
}
