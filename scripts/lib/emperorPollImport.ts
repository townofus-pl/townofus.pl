/**
 * Pure mapping for the one-off import of `public/emperor-polls/*.json` into `emperor_polls` and
 * `emperor_poll_candidates` (#360). No I/O here: `scripts/import-emperor-polls.ts` reads the
 * files and the database, and this module decides what to write.
 */
import { PlayerRankingReason } from '../../src/app/api/_constants/rankingTypes';
import { CURRENT_SEASON, getSeasonForDate } from '../../src/app/dramaafera/_constants/seasons';

/** Same initial ranking as `createPlayerWithRanking` and the bot's sign-up (#366). */
const INITIAL_SCORE = 2000.0;

/** One `public/emperor-polls/<YYYYMMDD>.json` file, the shape the presentation reads. */
export interface PollFile {
    date: string; // YYYYMMDD
    question: string;
    totalVotes: number;
    votes: { nickname: string; votes: number }[];
}

export interface PlannedCandidate {
    nickname: string;
    voteCount: number;
    /** Null when no player has this exact name yet: the import creates one. */
    playerId: number | null;
}

export interface PlannedPoll {
    date: string; // YYYY-MM-DD
    season: number;
    question: string;
    /** Used for `closesAt`, `closedAt` and `finalizedAt`. */
    closedAt: number;
    candidates: PlannedCandidate[];
}

export interface ImportPlan {
    polls: PlannedPoll[];
    skipped: { date: string; reason: string }[];
    newPlayers: string[];
    /**
     * Dates where `getSeasonForDate` differs from the season of that day's games. The page
     * looks the poll up by the page's season, so such a row would never show. `--write` refuses
     * to run while this list is not empty.
     */
    seasonMismatches: { date: string; season: number; gameSeasons: number[] }[];
    warnings: string[];
}

export interface DatabaseState {
    /** Every `emperor_polls.date`, soft-deleted rows included: the unique index covers them too. */
    pollDates: Set<string>;
    /** Exact `players.name` → row. Soft-deleted rows included: `name` is unique over all rows. */
    players: Map<string, { id: number; deletedAt: string | null }>;
    /** Session date (YYYY-MM-DD) → distinct `games.season` values of the games that day. */
    gameSeasons: Map<string, number[]>;
}

/** `20260923` → `2026-09-23`. Throws on anything else. */
export function toPollDate(fileDate: string): string {
    const match = /^(\d{4})(\d{2})(\d{2})$/.exec(fileDate);
    if (!match) throw new Error(`Expected a YYYYMMDD date, got "${fileDate}"`);
    return `${match[1]}-${match[2]}-${match[3]}`;
}

/** Validates one file. `fileName` is the base name, e.g. `20260923.json`. */
export function parsePollFile(raw: unknown, fileName: string): PollFile {
    const fail = (why: string): never => {
        throw new Error(`${fileName}: ${why}`);
    };
    if (typeof raw !== 'object' || raw === null) fail('not a JSON object');
    const file = raw as Record<string, unknown>;

    const date = file.date;
    if (typeof date !== 'string' || !/^\d{8}$/.test(date)) fail('"date" must be YYYYMMDD');
    if (`${date}.json` !== fileName) fail(`"date" ${String(date)} does not match the file name`);

    const question = file.question;
    if (typeof question !== 'string' || question.trim() === '') fail('"question" is missing');

    if (!Array.isArray(file.votes) || file.votes.length === 0) fail('"votes" must be a non-empty array');
    const votes = (file.votes as unknown[]).map((entry, i) => {
        const v = entry as Record<string, unknown>;
        if (typeof v?.nickname !== 'string' || v.nickname.trim() === '') fail(`votes[${i}].nickname is missing`);
        if (!Number.isInteger(v.votes) || (v.votes as number) < 0) fail(`votes[${i}].votes must be a whole number ≥ 0`);
        return { nickname: v.nickname as string, votes: v.votes as number };
    });

    const names = votes.map((v) => v.nickname);
    const duplicate = names.find((n, i) => names.indexOf(n) !== i);
    if (duplicate !== undefined) fail(`"${duplicate}" is a candidate twice`);

    const sum = votes.reduce((total, v) => total + v.votes, 0);
    if (file.totalVotes !== sum) fail(`"totalVotes" is ${String(file.totalVotes)}, the votes add up to ${sum}`);

    return { date: date as string, question: question as string, totalVotes: sum, votes };
}

/** Offset of Europe/Warsaw from UTC at `utcMs`, in ms (+1 h in winter, +2 h in summer). */
function warsawOffsetMs(utcMs: number): number {
    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Warsaw',
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(new Date(utcMs));
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    const wallClock = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return wallClock - utcMs;
}

/**
 * When the poll for a session closed: the next Wednesday (session date + 7 days) at 17:00
 * Europe/Warsaw, the time the bot closes a poll (spec in #351). The old polls were closed by
 * hand at no recorded time, so this is a fixed, reproducible stand-in.
 */
export function pollClosingTimeMs(pollDate: string): number {
    const [year, month, day] = pollDate.split('-').map(Number);
    const guess = Date.UTC(year, month - 1, day + 7, 17);
    // 17:00 is never inside a DST switch (those happen at 02:00-03:00), so one correction is exact.
    return guess - warsawOffsetMs(guess);
}

/** The season the site gives a session on this date — same function the ingest uses. */
export function seasonForPollDate(pollDate: string): number {
    return getSeasonForDate(new Date(pollDate));
}

/** Decides, per file, whether to import it, and with which player for each candidate. */
export function planImport(files: PollFile[], state: DatabaseState): ImportPlan {
    const plan: ImportPlan = { polls: [], skipped: [], newPlayers: [], seasonMismatches: [], warnings: [] };
    const sorted = [...files].sort((a, b) => a.date.localeCompare(b.date));

    for (const file of sorted) {
        const date = toPollDate(file.date);
        if (state.pollDates.has(date)) {
            plan.skipped.push({ date, reason: 'a poll row for this date already exists' });
            continue;
        }

        const season = seasonForPollDate(date);
        const seasonsOfGames = state.gameSeasons.get(date) ?? [];
        if (seasonsOfGames.length === 0) {
            plan.warnings.push(`${date}: no games on this date in the database`);
        } else if (seasonsOfGames.some((s) => s !== season)) {
            plan.seasonMismatches.push({ date, season, gameSeasons: seasonsOfGames });
        }

        const candidates = file.votes.map((v): PlannedCandidate => {
            const player = state.players.get(v.nickname);
            if (!player) {
                if (!plan.newPlayers.includes(v.nickname)) plan.newPlayers.push(v.nickname);
                return { nickname: v.nickname, voteCount: v.votes, playerId: null };
            }
            if (player.deletedAt !== null) {
                plan.warnings.push(`${date}: "${v.nickname}" matches a soft-deleted player (id ${player.id})`);
            }
            return { nickname: v.nickname, voteCount: v.votes, playerId: player.id };
        });

        plan.polls.push({ date, season, question: file.question, closedAt: pollClosingTimeMs(date), candidates });
    }

    return plan;
}

/** SQLite string literal. */
export function sqlString(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
}

/** Prisma's DateTime text format in D1, e.g. `2026-10-19T12:00:00.000+00:00`. */
export function toPrismaDateTime(date: Date): string {
    return date.toISOString().replace('Z', '+00:00');
}

/**
 * The INSERT statements for a plan, in an order that satisfies the foreign keys. Child rows
 * find their parent through a subquery on a unique key (`players.name`, `emperor_polls.date`),
 * so the statements need no ids from each other and can run as one file or one transaction.
 *
 * A new player gets the same shape as from `createPlayerWithRanking` and the bot's sign-up
 * (#366): the name, an initial `player_rankings` row in the current season, and
 * `currentRankingId`. Each of the three statements is a no-op when the player already exists
 * (for example, the bot created it between the dry run and the write), so the import does not
 * roll back. Candidates then find the player by name.
 */
export function buildImportSql(plan: ImportPlan, now: Date): string[] {
    const ts = sqlString(toPrismaDateTime(now));
    const statements: string[] = [];

    for (const name of plan.newPlayers) {
        const player = `(SELECT id FROM players WHERE name = ${sqlString(name)} AND deletedAt IS NULL)`;
        statements.push(
            `INSERT INTO players (name, createdAt, updatedAt) VALUES (${sqlString(name)}, ${ts}, ${ts}) ` +
                'ON CONFLICT (name) DO NOTHING;',
            'INSERT INTO player_rankings (playerId, score, reason, season, createdAt) ' +
                `SELECT p.id, ${INITIAL_SCORE.toFixed(1)}, ${sqlString(PlayerRankingReason.InitialValue)}, ${CURRENT_SEASON}, ${ts} ` +
                `FROM players p WHERE p.id = ${player} ` +
                'AND NOT EXISTS (SELECT 1 FROM player_rankings r WHERE r.playerId = p.id);',
            'UPDATE players SET currentRankingId = ' +
                '(SELECT MAX(r.id) FROM player_rankings r WHERE r.playerId = players.id) ' +
                `WHERE id = ${player} AND currentRankingId IS NULL;`,
        );
    }

    for (const poll of plan.polls) {
        const date = sqlString(poll.date);
        statements.push(
            'INSERT INTO emperor_polls (date, season, question, closesAt, discordChannelId, discordMessageId, ' +
                'closedAt, finalizedAt, createdAt, updatedAt) VALUES ' +
                `(${date}, ${poll.season}, ${sqlString(poll.question)}, ${poll.closedAt}, NULL, NULL, ` +
                `${poll.closedAt}, ${poll.closedAt}, ${ts}, ${ts});`,
        );
        // File order is kept: the presentation lists candidates by id.
        for (const c of poll.candidates) {
            const playerId = c.playerId ?? `(SELECT id FROM players WHERE name = ${sqlString(c.nickname)})`;
            statements.push(
                'INSERT INTO emperor_poll_candidates (pollId, playerId, nickname, voteCount, createdAt, updatedAt) VALUES ' +
                    `((SELECT id FROM emperor_polls WHERE date = ${date}), ${playerId}, ${sqlString(c.nickname)}, ` +
                    `${c.voteCount}, ${ts}, ${ts});`,
            );
        }
    }

    return statements;
}
