/**
 * POSTs a game payload at a running local server and reports what landed in the
 * local D1 database.
 *
 * Answers the two questions the ingest work keeps needing: "what did this payload
 * actually write?" and "what happens when the same payload arrives twice?".
 *
 * Start a server first — `npm run dev` (port 3000) or `npm run preview` (port 8787) —
 * and point `--url` at whichever endpoint is being exercised. `/api/v2/games` does not
 * exist yet; until it does, this runs against v1's `/api/games` with a v1-shaped payload.
 *
 * Usage:
 *   npm run replay -- --file fixtures/game.json
 *   npm run replay -- --file fixtures/game.json --twice
 *   npm run replay -- --file fixtures/game.json --url http://localhost:8787/api/games
 */
import { readFileSync, existsSync } from 'node:fs';
import { openLocalD1, count } from './lib/localD1';

const DEFAULT_URL = 'http://localhost:3000/api/v2/games';

const TRACKED_TABLES = [
    'games',
    'players',
    'game_player_statistics',
    'player_roles',
    'player_modifiers',
    'player_rankings',
    'game_events',
    'meetings',
    'meeting_votes',
    'meeting_skip_votes',
    'meeting_no_votes',
    'meeting_blackmailed_players',
    'meeting_jailed_players',
] as const;

type Options = { file: string; url: string; twice: boolean };

function parseArgs(argv: string[]): Options {
    const options: Options = { file: '', url: DEFAULT_URL, twice: false };

    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--') continue;
        else if (arg === '--file') options.file = argv[(i += 1)] ?? '';
        else if (arg === '--url') options.url = argv[(i += 1)] ?? DEFAULT_URL;
        else if (arg === '--twice') options.twice = true;
        else if (arg === '--help' || arg === '-h') {
            console.log('Usage: npm run replay -- --file <payload.json> [--url <endpoint>] [--twice]');
            process.exit(0);
        } else throw new Error(`Unknown argument: ${arg}`);
    }

    if (!options.file) throw new Error('--file is required');
    if (!existsSync(options.file)) throw new Error(`No such file: ${options.file}`);

    return options;
}

/** Credentials live in `.dev.vars`; ingest is HTTP Basic. */
function readDevVars(): Record<string, string> {
    if (!existsSync('.dev.vars')) return {};

    const vars: Record<string, string> = {};
    for (const line of readFileSync('.dev.vars', 'utf8').split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eq = trimmed.indexOf('=');
        if (eq === -1) continue;
        vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    }
    return vars;
}

function snapshot(): Record<string, number> {
    const db = openLocalD1();
    const counts: Record<string, number> = {};
    for (const table of TRACKED_TABLES) {
        try {
            counts[table] = count(db, `select count(*) c from ${table}`);
        } catch {
            counts[table] = -1; // table absent in this schema version
        }
    }
    db.close();
    return counts;
}

function printDelta(before: Record<string, number>, after: Record<string, number>): void {
    const changed = TRACKED_TABLES.filter((t) => before[t] !== after[t]);

    if (changed.length === 0) {
        console.log('  (nothing was written)');
        return;
    }

    for (const table of changed) {
        const delta = after[table] - before[table];
        console.log(`  ${table.padEnd(30)} ${delta > 0 ? '+' : ''}${delta}   (${before[table]} → ${after[table]})`);
    }
}

async function post(url: string, body: string, auth: string | null): Promise<{ status: number; text: string }> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (auth) headers.Authorization = auth;

    const response = await fetch(url, { method: 'POST', headers, body });
    return { status: response.status, text: await response.text() };
}

async function main(): Promise<void> {
    const options = parseArgs(process.argv.slice(2));
    const payload = readFileSync(options.file, 'utf8');

    const vars = readDevVars();
    const auth =
        vars.API_USERNAME && vars.API_PASSWORD
            ? `Basic ${Buffer.from(`${vars.API_USERNAME}:${vars.API_PASSWORD}`).toString('base64')}`
            : null;

    if (!auth) console.log('Warning: no API_USERNAME/API_PASSWORD in .dev.vars — posting unauthenticated.\n');

    console.log(`POST ${options.url}`);
    console.log(`  payload: ${options.file} (${(payload.length / 1024).toFixed(1)} KB)\n`);

    const before = snapshot();

    let first: { status: number; text: string };
    try {
        first = await post(options.url, payload, auth);
    } catch (err) {
        console.error(`Request failed: ${(err as Error).message}`);
        console.error('Is the server running? Try `npm run dev` (port 3000) or `npm run preview` (port 8787).');
        process.exit(1);
    }

    const after = snapshot();

    console.log(`First POST  → ${first.status}`);
    console.log(`  ${first.text.slice(0, 500)}\n`);
    console.log('Database delta:');
    printDelta(before, after);

    if (!options.twice) {
        process.exit(first.status >= 200 && first.status < 300 ? 0 : 1);
    }

    const second = await post(options.url, payload, auth);
    const afterSecond = snapshot();

    console.log(`\nSecond POST → ${second.status}`);
    console.log(`  ${second.text.slice(0, 500)}\n`);
    console.log('Database delta from the duplicate:');
    printDelta(after, afterSecond);

    const wroteNothingTwice = TRACKED_TABLES.every((t) => after[t] === afterSecond[t]);

    console.log('');
    if (second.status === 409 && wroteNothingTwice) {
        console.log('PASS  duplicate rejected with 409 and wrote nothing');
    } else if (wroteNothingTwice) {
        console.log(`WARN  duplicate wrote nothing but answered ${second.status}, not 409`);
    } else {
        console.log(`FAIL  duplicate wrote rows — ingest is not idempotent`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
