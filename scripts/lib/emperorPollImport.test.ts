import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { mapEmperorPoll } from '../../src/app/dramaafera/_services/season/getEmperorPoll';
import {
    buildImportSql,
    parsePollFile,
    planImport,
    pollClosingTimeMs,
    seasonForPollDate,
    sqlString,
    toPollDate,
    type DatabaseState,
    type PollFile,
} from './emperorPollImport';

// getEmperorPoll.ts reads the Cloudflare context at call time only; mapEmperorPoll is pure.
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
jest.mock('../../src/app/dramaafera/_services/db',() => ({ getDatabaseClient: jest.fn() }));

const ROOT = path.resolve(__dirname, '../..');
const POLL_DIR = path.join(ROOT, 'public/emperor-polls');
const NOW = new Date('2026-10-19T12:00:00.000Z');

const file = (date: string, votes: [string, number][], question = 'Kto zostanie Emperorem?'): PollFile => ({
    date,
    question,
    totalVotes: votes.reduce((s, [, v]) => s + v, 0),
    votes: votes.map(([nickname, v]) => ({ nickname, votes: v })),
});

const state = (overrides: Partial<DatabaseState> = {}): DatabaseState => ({
    pollDates: new Set(),
    players: new Map([
        ['Malkiz', { id: 1, deletedAt: null }],
        ['Subek', { id: 2, deletedAt: null }],
    ]),
    gameSeasons: new Map(),
    ...overrides,
});

describe('parsePollFile', () => {
    const valid = { date: '20260923', question: 'Q?', totalVotes: 3, votes: [{ nickname: 'Malkiz', votes: 3 }] };

    test('accepts a well-formed file', () => {
        expect(parsePollFile(valid, '20260923.json')).toEqual(valid);
    });

    test.each([
        ['a date that differs from the file name', { ...valid, date: '20260924' }, /does not match/],
        ['a missing question', { ...valid, question: ' ' }, /question/],
        ['a wrong total', { ...valid, totalVotes: 4 }, /add up to 3/],
        ['a negative vote count', { ...valid, totalVotes: -1, votes: [{ nickname: 'Malkiz', votes: -1 }] }, /whole number/],
        ['a duplicate candidate', { ...valid, totalVotes: 2, votes: [{ nickname: 'A', votes: 1 }, { nickname: 'A', votes: 1 }] }, /twice/],
        ['no candidates', { ...valid, totalVotes: 0, votes: [] }, /non-empty/],
    ])('rejects %s', (_, raw, message) => {
        expect(() => parsePollFile(raw, '20260923.json')).toThrow(message);
    });

    test('every file in public/emperor-polls parses', () => {
        const names = readdirSync(POLL_DIR).filter((n) => n.endsWith('.json'));
        expect(names.length).toBeGreaterThan(0);
        for (const name of names) {
            expect(() => parsePollFile(JSON.parse(readFileSync(path.join(POLL_DIR, name), 'utf8')), name)).not.toThrow();
        }
    });
});

describe('toPollDate', () => {
    test('turns the file date into the D1 date', () => {
        expect(toPollDate('20251105')).toBe('2025-11-05');
    });

    test('throws on a malformed date', () => {
        expect(() => toPollDate('2025-11-05')).toThrow();
    });
});

describe('pollClosingTimeMs', () => {
    test('is the next Wednesday 17:00 Warsaw, summer time (UTC+2)', () => {
        expect(new Date(pollClosingTimeMs('2026-09-23')).toISOString()).toBe('2026-09-30T15:00:00.000Z');
    });

    test('is the next Wednesday 17:00 Warsaw, winter time (UTC+1)', () => {
        expect(new Date(pollClosingTimeMs('2025-11-05')).toISOString()).toBe('2025-11-12T16:00:00.000Z');
    });

    test('follows the clock change between the session and the close', () => {
        // 2026-03-25 → 2026-04-01; DST starts on 2026-03-29.
        expect(new Date(pollClosingTimeMs('2026-03-25')).toISOString()).toBe('2026-04-01T15:00:00.000Z');
        // 2025-10-22 → 2025-10-29; DST ends on 2025-10-26.
        expect(new Date(pollClosingTimeMs('2025-10-22')).toISOString()).toBe('2025-10-29T16:00:00.000Z');
    });

    test('crosses a month and a year', () => {
        expect(new Date(pollClosingTimeMs('2025-12-31')).toISOString()).toBe('2026-01-07T16:00:00.000Z');
    });
});

describe('seasonForPollDate', () => {
    test('puts a season start date in the new season', () => {
        expect(seasonForPollDate('2026-09-16')).toBe(3);
        expect(seasonForPollDate('2026-09-23')).toBe(4);
        expect(seasonForPollDate('2026-03-18')).toBe(2);
        expect(seasonForPollDate('2026-03-25')).toBe(3);
    });
});

describe('planImport', () => {
    test('maps a file to a poll with the player ids, in file order', () => {
        const plan = planImport([file('20260923', [['Subek', 2], ['Malkiz', 0]])], state());

        expect(plan.polls).toEqual([
            {
                date: '2026-09-23',
                season: 4,
                question: 'Kto zostanie Emperorem?',
                closedAt: pollClosingTimeMs('2026-09-23'),
                candidates: [
                    { nickname: 'Subek', voteCount: 2, playerId: 2 },
                    { nickname: 'Malkiz', voteCount: 0, playerId: 1 },
                ],
            },
        ]);
        expect(plan.newPlayers).toEqual([]);
    });

    test('skips a date that already has a poll row', () => {
        const plan = planImport([file('20260923', [['Malkiz', 1]])], state({ pollDates: new Set(['2026-09-23']) }));

        expect(plan.polls).toEqual([]);
        expect(plan.skipped).toEqual([{ date: '2026-09-23', reason: expect.any(String) }]);
    });

    test('matches the name exactly and lists a missing player once', () => {
        const plan = planImport(
            [file('20260923', [['malkiz', 1]]), file('20260930', [['malkiz', 2]])],
            state(),
        );

        expect(plan.newPlayers).toEqual(['malkiz']);
        expect(plan.polls.flatMap((p) => p.candidates.map((c) => c.playerId))).toEqual([null, null]);
    });

    test('sorts polls by date', () => {
        const plan = planImport([file('20260930', [['Malkiz', 1]]), file('20260923', [['Malkiz', 1]])], state());
        expect(plan.polls.map((p) => p.date)).toEqual(['2026-09-23', '2026-09-30']);
    });

    test('warns when the games of the day are in another season, or there are none', () => {
        const plan = planImport(
            [file('20260923', [['Malkiz', 1]]), file('20260930', [['Malkiz', 1]])],
            state({ gameSeasons: new Map([['2026-09-23', [3]]]) }),
        );

        expect(plan.warnings).toEqual([
            '2026-09-23: getSeasonForDate gives season 4, the games that day are in 3',
            '2026-09-30: no games on this date in the database',
        ]);
    });

    test('warns about a soft-deleted player but still uses the row', () => {
        const plan = planImport(
            [file('20260923', [['Gone', 1]])],
            state({ players: new Map([['Gone', { id: 9, deletedAt: '2026-01-01T00:00:00.000+00:00' }]]) }),
        );

        expect(plan.polls[0].candidates[0].playerId).toBe(9);
        expect(plan.warnings).toContain('2026-09-23: "Gone" matches a soft-deleted player (id 9)');
    });
});

describe('sqlString', () => {
    test('doubles single quotes', () => {
        expect(sqlString("O'Neil")).toBe("'O''Neil'");
    });
});

describe('buildImportSql against the real schema', () => {
    const migrationsDir = path.join(ROOT, 'prisma/migrations');

    function freshDatabase(): DatabaseSync {
        const db = new DatabaseSync(':memory:');
        for (const name of readdirSync(migrationsDir).filter((n) => n.endsWith('.sql')).sort()) {
            db.exec(readFileSync(path.join(migrationsDir, name), 'utf8'));
        }
        db.exec(
            "INSERT INTO players (name, createdAt, updatedAt) VALUES ('Malkiz', '2025-01-01', '2025-01-01'), ('Subek', '2025-01-01', '2025-01-01');",
        );
        return db;
    }

    function readState(db: DatabaseSync): DatabaseState {
        return {
            pollDates: new Set(db.prepare('SELECT date FROM emperor_polls').all().map((r) => String(r.date))),
            players: new Map(
                db.prepare('SELECT id, name, deletedAt FROM players').all()
                    .map((r) => [String(r.name), { id: Number(r.id), deletedAt: null }]),
            ),
            gameSeasons: new Map(),
        };
    }

    /** What the presentation's D1 read gives for a date — same select and order as getEmperorPoll. */
    function readBack(db: DatabaseSync, fileDate: string) {
        const poll = db.prepare('SELECT id, question FROM emperor_polls WHERE date = ? AND finalizedAt IS NOT NULL')
            .get(toPollDate(fileDate)) as { id: number; question: string };
        const candidates = db
            .prepare(
                `SELECT c.nickname, c.voteCount, p.name, p.deletedAt FROM emperor_poll_candidates c
                 JOIN players p ON p.id = c.playerId WHERE c.pollId = ? AND c.deletedAt IS NULL ORDER BY c.id`,
            )
            .all(poll.id)
            .map((r) => ({
                nickname: String(r.nickname),
                voteCount: Number(r.voteCount),
                player: { name: String(r.name), deletedAt: r.deletedAt === null ? null : new Date(String(r.deletedAt)) },
            }));
        return mapEmperorPoll(fileDate, poll.question, candidates);
    }

    test('the imported rows read back as the same poll the JSON file shows', () => {
        const db = freshDatabase();
        const files = [
            file('20260923', [['Subek', 2], ['Newbie', 1], ['Malkiz', 0]], 'KTO ZOSTANIE EMPEROREM?'),
            file('20251105', [["O'Neil", 4], ['Malkiz', 3]]),
        ];

        for (const sql of buildImportSql(planImport(files, readState(db)), NOW)) db.exec(sql);

        for (const f of files) expect(readBack(db, f.date)).toEqual(f);
        expect(db.prepare("SELECT friendCode, hashedProductUserId, currentRankingId FROM players WHERE name = 'Newbie'").get())
            .toEqual({ friendCode: null, hashedProductUserId: null, currentRankingId: null });
        const poll = db.prepare("SELECT * FROM emperor_polls WHERE date = '2026-09-23'").get() as Record<string, unknown>;
        expect(poll).toMatchObject({
            season: 4,
            closesAt: pollClosingTimeMs('2026-09-23'),
            closedAt: pollClosingTimeMs('2026-09-23'),
            finalizedAt: pollClosingTimeMs('2026-09-23'),
            discordChannelId: null,
            discordMessageId: null,
            createdAt: '2026-10-19T12:00:00.000+00:00',
            updatedAt: '2026-10-19T12:00:00.000+00:00',
        });
    });

    test('a second run plans nothing', () => {
        const db = freshDatabase();
        const files = [file('20260923', [['Subek', 2], ['Newbie', 1]])];
        for (const sql of buildImportSql(planImport(files, readState(db)), NOW)) db.exec(sql);

        const again = planImport(files, readState(db));

        expect(buildImportSql(again, NOW)).toEqual([]);
        expect(again.skipped.map((s) => s.date)).toEqual(['2026-09-23']);
    });
});
