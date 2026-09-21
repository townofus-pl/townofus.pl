import { execFileSync } from 'node:child_process';
import { openLocalD1 } from './localD1';

export type Target = 'local' | 'staging' | 'production';

/** Runs one SQL statement and returns its rows. */
export type Runner = (sql: string) => Record<string, unknown>[];

const REMOTE_DB: Record<Exclude<Target, 'local'>, string> = {
    staging: 'townofus_pl_preview',
    production: 'townofus-pl',
};

export function parseTarget(value: string | undefined): Target {
    if (value === undefined || value === 'local') return 'local';
    if (value === 'staging' || value === 'production') return value;
    throw new Error(`--target expects one of: local, staging, production (got "${value}")`);
}

/**
 * Builds a query runner for the chosen environment.
 *
 * Local reads the miniflare SQLite file directly. Remote shells out to
 * `wrangler d1 execute --remote --env <env>`, which is one network round trip per statement —
 * fine for a handful of integrity checks, not for anything in a loop.
 */
export function makeRunner(target: Target): Runner {
    if (target === 'local') {
        const db = openLocalD1();
        return (sql) => db.prepare(sql).all().map((row) => ({ ...row }));
    }

    const database = REMOTE_DB[target];

    return (sql) => {
        // One line: wrangler passes --command straight through and newlines confuse some shells
        // even via execFile. Args go through argv, so no quoting is needed beyond this.
        const oneLine = sql.replace(/\s+/g, ' ').trim();

        const raw = execFileSync(
            'npx',
            ['wrangler', 'd1', 'execute', database, '--remote', '--env', target, '--command', oneLine, '--json'],
            { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] },
        );

        // wrangler prints a banner before the JSON payload.
        const start = raw.indexOf('[');
        if (start === -1) throw new Error(`No JSON in wrangler output:\n${raw.slice(0, 500)}`);

        const parsed = JSON.parse(raw.slice(start)) as Array<{ results?: Record<string, unknown>[] }>;
        return parsed[0]?.results ?? [];
    };
}

export function describeTarget(target: Target): string {
    return target === 'local' ? 'local D1' : `${target} (${REMOTE_DB[target as Exclude<Target, 'local'>]})`;
}
