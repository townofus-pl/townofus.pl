/**
 * One-off import of the hand-made Emperor polls (`public/emperor-polls/*.json`) into
 * `emperor_polls` + `emperor_poll_candidates` (#360), so the presentation reads every poll from
 * D1 and the JSON fallback can go.
 *
 * Idempotent: a date that already has a poll row is skipped, so a re-run writes nothing and a
 * JSON file added later (same format) is picked up by the next run. Dry run by default.
 *
 * Usage:
 *   npm run emperor-polls:import                                 # dry run against local D1
 *   npm run emperor-polls:import -- --write                      # write to local D1
 *   npm run emperor-polls:import -- --target staging             # dry run against staging
 *   npm run emperor-polls:import -- --target staging --write     # write to staging
 *   npm run emperor-polls:import -- --dir <folder>               # other JSON folder
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { REMOTE_DB, describeTarget, makeRunner, parseTarget, wranglerCommand, type Target } from './lib/d1Runner';
import { openLocalD1 } from './lib/localD1';
import {
    buildImportSql,
    parsePollFile,
    planImport,
    sqlString,
    toPollDate,
    type DatabaseState,
    type PollFile,
} from './lib/emperorPollImport';

type Options = { target: Target; write: boolean; dir: string };

function parseArgs(argv: string[]): Options {
    const options: Options = { target: 'local', write: false, dir: 'public/emperor-polls' };
    for (let i = 0; i < argv.length; i += 1) {
        const arg = argv[i];
        if (arg === '--') continue;
        else if (arg === '--target') options.target = parseTarget(argv[(i += 1)]);
        else if (arg === '--write') options.write = true;
        else if (arg === '--dir') options.dir = argv[(i += 1)] ?? options.dir;
        else if (arg === '--help' || arg === '-h') {
            console.log('Usage: npm run emperor-polls:import -- [--target local|staging|production] [--write] [--dir <folder>]');
            process.exit(0);
        } else throw new Error(`Unknown argument: ${arg}`);
    }
    return options;
}

function readPollFiles(dir: string): PollFile[] {
    return readdirSync(dir)
        .filter((name) => /^\d{8}\.json$/.test(name))
        .sort()
        .map((name) => parsePollFile(JSON.parse(readFileSync(path.join(dir, name), 'utf8')), name));
}

function readDatabaseState(target: Target, files: PollFile[]): DatabaseState {
    const run = makeRunner(target);
    const pollDates = new Set(run('SELECT date FROM emperor_polls').map((r) => String(r.date)));

    const players = new Map<string, { id: number; deletedAt: string | null }>();
    for (const r of run('SELECT id, name, deletedAt FROM players')) {
        players.set(String(r.name), { id: Number(r.id), deletedAt: r.deletedAt === null ? null : String(r.deletedAt) });
    }

    // Only the dates in the files. startTime starts with the Warsaw session date in both eras.
    const dates = files.map((f) => sqlString(toPollDate(f.date))).join(', ');
    const gameSeasons = new Map<string, number[]>();
    for (const r of run(
        `SELECT DISTINCT substr(startTime, 1, 10) AS day, season FROM games
         WHERE deletedAt IS NULL AND substr(startTime, 1, 10) IN (${dates})`,
    )) {
        const day = String(r.day);
        gameSeasons.set(day, [...(gameSeasons.get(day) ?? []), Number(r.season)]);
    }

    return { pollDates, players, gameSeasons };
}

function writeLocal(statements: string[]): void {
    const db = openLocalD1(false);
    db.exec('BEGIN');
    try {
        for (const sql of statements) db.exec(sql);
        db.exec('COMMIT');
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    } finally {
        db.close();
    }
}

function writeRemote(target: Exclude<Target, 'local'>, statements: string[]): void {
    const dir = mkdtempSync(path.join(os.tmpdir(), 'emperor-polls-'));
    const file = path.join(dir, 'import.sql');
    try {
        writeFileSync(file, statements.join('\n') + '\n');
        const [command, ...prefix] = wranglerCommand();
        // stdio inherit: wrangler asks for confirmation before a remote write.
        execFileSync(command, [...prefix, 'd1', 'execute', REMOTE_DB[target], '--remote', '--env', target, '--file', file], {
            stdio: 'inherit',
        });
    } finally {
        rmSync(dir, { recursive: true, force: true });
    }
}

function main(): void {
    const options = parseArgs(process.argv.slice(2));
    const files = readPollFiles(options.dir);
    console.log(`${files.length} poll file(s) in ${options.dir} · ${describeTarget(options.target)} · ${options.write ? 'WRITE' : 'dry run'}\n`);
    if (files.length === 0) return;

    const plan = planImport(files, readDatabaseState(options.target, files));

    for (const poll of plan.polls) {
        const votes = poll.candidates.reduce((sum, c) => sum + c.voteCount, 0);
        console.log(
            `IMPORT  ${poll.date}  season ${poll.season}  ${poll.candidates.length} candidates  ${votes} votes  ` +
                `closed ${new Date(poll.closedAt).toISOString()}`,
        );
    }
    for (const s of plan.skipped) console.log(`SKIP    ${s.date}  ${s.reason}`);
    for (const name of plan.newPlayers) console.log(`PLAYER  "${name}" has no player row: it will be created`);
    for (const w of plan.warnings) console.log(`WARN    ${w}`);

    const statements = buildImportSql(plan, new Date());
    const candidates = plan.polls.reduce((sum, p) => sum + p.candidates.length, 0);
    console.log(
        `\n${plan.polls.length} to import · ${plan.skipped.length} skipped · ${candidates} candidates · ` +
            `${plan.newPlayers.length} new player(s) · ${statements.length} statements`,
    );

    if (statements.length === 0) {
        console.log('Nothing to write.');
        return;
    }
    if (!options.write) {
        console.log('Dry run: nothing written. Add --write to import.');
        return;
    }

    if (options.target === 'local') writeLocal(statements);
    else writeRemote(options.target, statements);

    const after = readDatabaseState(options.target, files);
    const missing = plan.polls.filter((p) => !after.pollDates.has(p.date)).map((p) => p.date);
    if (missing.length > 0) throw new Error(`Write finished, but these dates still have no poll row: ${missing.join(', ')}`);
    console.log(`Written: ${plan.polls.length} poll(s), ${candidates} candidate(s).`);
}

main();
