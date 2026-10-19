import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import worker from '../src/index';
import type { BotEnv } from '../src/env';
import { closePollTick, POLL_EXPIRED, UNKNOWN_MESSAGE, type ClosePollContext } from '../src/poll/closePoll';
import { createDiscordPollRest, DiscordApiError, type DiscordPollRest, type PollMessage } from '../src/poll/discordApi';
import { clearPollTables, createTestD1 } from './d1';

const CHANNEL = 'chan-staging';
const OTHER_CHANNEL = 'chan-production';
// The poll of the 2026-10-21 session closes 2026-10-28 17:00 CET.
const CLOSES_AT = Date.parse('2026-10-28T16:00:00Z');
const MIN = 60_000;

let d1: Awaited<ReturnType<typeof createTestD1>>;
let db: D1Database;

beforeAll(async () => {
    d1 = await createTestD1();
    db = d1.db;
}, 30_000);
afterAll(() => d1.dispose());
beforeEach(() => clearPollTables(db));

interface SeedPoll {
    date: string;
    channel?: string;
    messageId?: string | null;
    closesAt?: number;
    closedAt?: number | null;
    nicknames?: string[];
}

async function seedPoll(p: SeedPoll): Promise<number> {
    const nicknames = p.nicknames ?? ['Alfa', 'Beta', 'Gamma'];
    for (const name of nicknames) {
        await db.prepare(`INSERT OR IGNORE INTO "players" ("name", "updatedAt") VALUES (?, '2026-10-01T00:00:00.000+00:00')`).bind(name).run();
    }
    const insert = await db
        .prepare(
            `INSERT INTO "emperor_polls"
                ("date", "season", "question", "closesAt", "discordChannelId", "discordMessageId", "closedAt", "updatedAt")
             VALUES (?, 4, 'q', ?, ?, ?, ?, '2026-10-21T21:00:00.000+00:00')`,
        )
        .bind(p.date, p.closesAt ?? CLOSES_AT, p.channel ?? CHANNEL, p.messageId === undefined ? `msg-${p.date}` : p.messageId, p.closedAt ?? null)
        .run();
    const pollId = insert.meta.last_row_id;
    for (const name of nicknames) {
        await db
            .prepare(
                `INSERT INTO "emperor_poll_candidates" ("pollId", "playerId", "nickname", "updatedAt")
                 SELECT ?, "id", "name", '2026-10-21T21:00:00.000+00:00' FROM "players" WHERE "name" = ?`,
            )
            .bind(pollId, name)
            .run();
    }
    return pollId;
}

const pollRow = (date: string) =>
    db.prepare(`SELECT * FROM "emperor_polls" WHERE "date" = ?`).bind(date).first<Record<string, unknown>>();
const votes = (pollId: number) =>
    db
        .prepare(`SELECT "nickname", "voteCount" FROM "emperor_poll_candidates" WHERE "pollId" = ? ORDER BY "id"`)
        .bind(pollId)
        .all<{ nickname: string; voteCount: number }>()
        .then((r) => r.results.map((c) => [c.nickname, c.voteCount]));

/** A Discord that holds one poll per message id. Answer ids start at 7 on purpose. */
function fakeDiscord() {
    const calls: string[] = [];
    const messages = new Map<string, { texts: string[]; ended: boolean; finalized: boolean; counts: Record<string, number> }>();
    const errors: { expire?: DiscordApiError; get?: DiscordApiError } = {};
    const answerId = (i: number) => 7 + i * 3;

    const discord: DiscordPollRest = {
        async expirePoll(channelId, messageId) {
            calls.push(`expire ${channelId} ${messageId}`);
            if (errors.expire) throw errors.expire;
            const m = messages.get(messageId);
            if (!m) throw new DiscordApiError(404, JSON.stringify({ code: UNKNOWN_MESSAGE }));
            if (m.ended) throw new DiscordApiError(400, JSON.stringify({ code: POLL_EXPIRED, message: 'Poll expired' }));
            m.ended = true;
        },
        async getMessage(channelId, messageId): Promise<PollMessage> {
            calls.push(`get ${channelId} ${messageId}`);
            if (errors.get) throw errors.get;
            const m = messages.get(messageId);
            if (!m) throw new DiscordApiError(404, JSON.stringify({ code: UNKNOWN_MESSAGE }));
            return {
                id: messageId,
                poll: {
                    expiry: m.ended ? '2026-10-28T16:00:00.000000+00:00' : '2026-10-28T17:00:00.000000+00:00',
                    answers: m.texts.map((text, i) => ({ answer_id: answerId(i), poll_media: { text } })),
                    results: {
                        is_finalized: m.finalized,
                        // Only answers with votes have an entry.
                        answer_counts: m.texts.flatMap((text, i) =>
                            m.counts[text] ? [{ id: answerId(i), count: m.counts[text] }] : [],
                        ),
                    },
                },
            };
        },
    };
    const addPoll = (messageId: string, texts = ['Alfa', 'Beta', 'Gamma'], counts: Record<string, number> = {}) =>
        messages.set(messageId, { texts, ended: false, finalized: false, counts });
    return { discord, calls, messages, errors, addPoll };
}

const ctxAt = (now: number, discord: DiscordPollRest): ClosePollContext => ({ db, discord, channelId: CHANNEL, now });

describe('close', () => {
    it('waits for closesAt, then ends the poll once across several ticks', async () => {
        await seedPoll({ date: '2026-10-21' });
        const { discord, calls, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21');

        expect((await closePollTick(ctxAt(CLOSES_AT - MIN, discord))).closed).toEqual([]);
        expect(calls).toEqual([]);

        expect((await closePollTick(ctxAt(CLOSES_AT, discord))).closed).toEqual(['2026-10-21']);
        expect(await closePollTick(ctxAt(CLOSES_AT + 10 * MIN, discord))).toMatchObject({ closed: [], waiting: ['2026-10-21'] });
        expect(await closePollTick(ctxAt(CLOSES_AT + 20 * MIN, discord))).toMatchObject({ closed: [], waiting: ['2026-10-21'] });

        expect(calls.filter((c) => c.startsWith('expire'))).toEqual(['expire chan-staging msg-2026-10-21']);
        expect((await pollRow('2026-10-21'))!.closedAt).toBe(CLOSES_AT);
    });

    it('sets closedAt when Discord already ended the poll (by duration)', async () => {
        await seedPoll({ date: '2026-10-21' });
        const { discord, messages, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21');
        messages.get('msg-2026-10-21')!.ended = true;

        const result = await closePollTick(ctxAt(CLOSES_AT + 10 * MIN, discord));
        expect(result).toMatchObject({ closed: ['2026-10-21'], failed: [], stopped: null });
        expect((await pollRow('2026-10-21'))!.closedAt).toBe(CLOSES_AT + 10 * MIN);
    });

    it('with an unknown 400, asks the message whether the poll is over', async () => {
        await seedPoll({ date: '2026-10-21' });
        const { discord, messages, errors, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21');
        errors.expire = new DiscordApiError(400, JSON.stringify({ code: 123456 }));

        expect((await closePollTick(ctxAt(CLOSES_AT, discord))).failed).toEqual(['2026-10-21']);
        expect((await pollRow('2026-10-21'))!.closedAt).toBeNull();

        messages.get('msg-2026-10-21')!.ended = true; // expiry 16:00 UTC
        expect((await closePollTick(ctxAt(CLOSES_AT + 10 * MIN, discord))).closed).toEqual(['2026-10-21']);
    });

    it('closes a poll whose message was deleted (10008), and its result then fails to read', async () => {
        await seedPoll({ date: '2026-10-21' });
        const { discord, calls } = fakeDiscord(); // no message: 404 with code 10008
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(await closePollTick(ctxAt(CLOSES_AT, discord))).toMatchObject({
            closed: ['2026-10-21'],
            failed: ['2026-10-21'],
            stopped: null,
        });
        expect(calls).toEqual(['expire chan-staging msg-2026-10-21', 'get chan-staging msg-2026-10-21']);
        expect((await pollRow('2026-10-21'))!.closedAt).toBe(CLOSES_AT);
        spy.mockRestore();
    });

    it('after closesAt + 2 h, sets closedAt without Discord when End Poll kept failing', async () => {
        await seedPoll({ date: '2026-10-21' });
        const { discord, calls, errors, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21');
        errors.expire = new DiscordApiError(503, 'upstream');
        errors.get = new DiscordApiError(503, 'upstream');
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

        for (const at of [CLOSES_AT, CLOSES_AT + 60 * MIN, CLOSES_AT + 119 * MIN]) {
            expect((await closePollTick(ctxAt(at, discord))).failed).toEqual(['2026-10-21']);
        }
        expect((await pollRow('2026-10-21'))!.closedAt).toBeNull();
        expect(calls.filter((c) => c.startsWith('expire'))).toHaveLength(3);

        const at = CLOSES_AT + 120 * MIN;
        expect((await closePollTick(ctxAt(at, discord))).closed).toEqual(['2026-10-21']);
        expect(calls.filter((c) => c.startsWith('expire'))).toHaveLength(3);
        expect((await pollRow('2026-10-21'))!.closedAt).toBe(at);
        expect(warn.mock.calls[0][0]).toContain('pollClosedWithoutDiscord');
        spy.mockRestore();
        warn.mockRestore();
    });

    it('never touches a poll of another channel, nor one without a message', async () => {
        await seedPoll({ date: '2026-10-14', channel: OTHER_CHANNEL, closesAt: CLOSES_AT - 7 * 24 * 60 * MIN });
        await seedPoll({ date: '2026-10-21', messageId: null });
        const { discord, calls } = fakeDiscord();

        expect(await closePollTick(ctxAt(CLOSES_AT + MIN, discord))).toEqual({
            closed: [],
            finalized: [],
            waiting: [],
            failed: [],
            gaveUp: [],
            stopped: null,
        });
        expect(calls).toEqual([]);
        expect((await pollRow('2026-10-14'))!.closedAt).toBeNull();
    });

    it('stops the tick on 401 or 403 without trying the next poll', async () => {
        await seedPoll({ date: '2026-10-14', closesAt: CLOSES_AT - MIN });
        await seedPoll({ date: '2026-10-21' });
        const { discord, calls, errors } = fakeDiscord();
        errors.expire = new DiscordApiError(403, JSON.stringify({ code: 50001, message: 'Missing Access' }));

        expect((await closePollTick(ctxAt(CLOSES_AT, discord))).stopped).toBe('auth');
        expect(calls).toEqual(['expire chan-staging msg-2026-10-14']);
        expect((await pollRow('2026-10-14'))!.closedAt).toBeNull();
    });

    it('stops the tick on a 429 the client could not wait out', async () => {
        await seedPoll({ date: '2026-10-21' });
        const { discord, errors } = fakeDiscord();
        errors.expire = new DiscordApiError(429, '{}', 60_000);
        expect((await closePollTick(ctxAt(CLOSES_AT, discord))).stopped).toBe('rateLimited');
        expect((await pollRow('2026-10-21'))!.closedAt).toBeNull();
    });
});

describe('finalize', () => {
    it('writes the votes only after is_finalized, by answer_id, once', async () => {
        const pollId = await seedPoll({ date: '2026-10-21' });
        const { discord, messages, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21', ['Alfa', 'Beta', 'Gamma'], { Alfa: 2, Gamma: 5 });

        expect(await closePollTick(ctxAt(CLOSES_AT, discord))).toMatchObject({ closed: ['2026-10-21'], waiting: ['2026-10-21'] });
        expect(await votes(pollId)).toEqual([['Alfa', 0], ['Beta', 0], ['Gamma', 0]]);
        expect((await pollRow('2026-10-21'))!.finalizedAt).toBeNull();

        messages.get('msg-2026-10-21')!.finalized = true;
        const at = CLOSES_AT + 10 * MIN;
        expect(await closePollTick(ctxAt(at, discord))).toMatchObject({ finalized: ['2026-10-21'], waiting: [] });
        expect(await votes(pollId)).toEqual([['Alfa', 2], ['Beta', 0], ['Gamma', 5]]);
        expect((await pollRow('2026-10-21'))!.finalizedAt).toBe(at);

        // A later tick reads nothing and writes nothing.
        messages.get('msg-2026-10-21')!.counts = { Beta: 9 };
        expect(await closePollTick(ctxAt(at + 10 * MIN, discord))).toMatchObject({ finalized: [], waiting: [] });
        expect(await votes(pollId)).toEqual([['Alfa', 2], ['Beta', 0], ['Gamma', 5]]);
    });

    it('treats missing results as unknown, not as zero votes', async () => {
        await seedPoll({ date: '2026-10-21', closedAt: CLOSES_AT });
        const discord: DiscordPollRest = {
            expirePoll: async () => {},
            getMessage: async (_c, id) => ({ id, poll: { expiry: null, answers: [] } }),
        };
        expect((await closePollTick(ctxAt(CLOSES_AT + MIN, discord))).waiting).toEqual(['2026-10-21']);
        expect((await pollRow('2026-10-21'))!.finalizedAt).toBeNull();
    });

    it('matches a nickname longer than 55 characters to its cut answer', async () => {
        const long = 'X'.repeat(60);
        const pollId = await seedPoll({ date: '2026-10-21', closedAt: CLOSES_AT, nicknames: ['Alfa', long] });
        const { discord, messages, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21', ['Alfa', 'X'.repeat(55)], { ['X'.repeat(55)]: 3 });
        messages.get('msg-2026-10-21')!.finalized = true;

        expect((await closePollTick(ctxAt(CLOSES_AT + MIN, discord))).finalized).toEqual(['2026-10-21']);
        expect(await votes(pollId)).toEqual([['Alfa', 0], [long, 3]]);
    });

    it('matches a nickname with a trailing space to a trimmed answer', async () => {
        const pollId = await seedPoll({ date: '2026-10-21', closedAt: CLOSES_AT, nicknames: ['Kuba ', 'Beta'] });
        const { discord, messages, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21', ['Kuba', 'Beta'], { Kuba: 2 });
        messages.get('msg-2026-10-21')!.finalized = true;

        expect((await closePollTick(ctxAt(CLOSES_AT + MIN, discord))).finalized).toEqual(['2026-10-21']);
        expect(await votes(pollId)).toEqual([['Kuba ', 2], ['Beta', 0]]);
    });

    it('stops reading after 8 days and reports the given-up poll once', async () => {
        await seedPoll({ date: '2026-10-21', closedAt: CLOSES_AT });
        const { discord, calls, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21'); // never finalized
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const WEEK = 7 * 24 * 60 * MIN;

        // Next Wednesday 17:00: still inside the window.
        expect(await closePollTick(ctxAt(CLOSES_AT + WEEK, discord))).toMatchObject({ waiting: ['2026-10-21'], gaveUp: [] });
        const reads = calls.length;

        // The Wednesday after: past the window. Only its first tick reports it.
        expect(await closePollTick(ctxAt(CLOSES_AT + 2 * WEEK, discord))).toMatchObject({ waiting: [], gaveUp: ['2026-10-21'] });
        for (const at of [CLOSES_AT + 2 * WEEK + 10 * MIN, CLOSES_AT + 2 * WEEK + 3 * 60 * MIN, CLOSES_AT + 3 * WEEK]) {
            expect(await closePollTick(ctxAt(at, discord))).toMatchObject({ waiting: [], gaveUp: [] });
        }
        expect(calls).toHaveLength(reads);
        expect(spy.mock.calls.filter((c) => String(c[0]).includes('pollFinalizeGaveUp'))).toHaveLength(1);
        expect((await pollRow('2026-10-21'))!.finalizedAt).toBeNull();
        spy.mockRestore();
    });

    it('writes nothing when the answers do not match the candidates', async () => {
        const pollId = await seedPoll({ date: '2026-10-21', closedAt: CLOSES_AT });
        const { discord, messages, addPoll } = fakeDiscord();
        addPoll('msg-2026-10-21', ['Alfa', 'Gamma', 'Beta'], { Alfa: 1 });
        messages.get('msg-2026-10-21')!.finalized = true;
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect((await closePollTick(ctxAt(CLOSES_AT + MIN, discord))).failed).toEqual(['2026-10-21']);
        expect(spy.mock.calls[0][0]).toContain('pollAnswerMismatch');
        expect(await votes(pollId)).toEqual([['Alfa', 0], ['Beta', 0], ['Gamma', 0]]);
        expect((await pollRow('2026-10-21'))!.finalizedAt).toBeNull();
        spy.mockRestore();
    });

    it('never reads a closed poll of another channel', async () => {
        await seedPoll({ date: '2026-10-14', channel: OTHER_CHANNEL, closedAt: CLOSES_AT });
        const { discord, calls } = fakeDiscord();
        await closePollTick(ctxAt(CLOSES_AT + MIN, discord));
        expect(calls).toEqual([]);
        expect((await pollRow('2026-10-14'))!.finalizedAt).toBeNull();
    });
});

describe('REST client', () => {
    const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
        new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...headers } });

    it('waits out a short 429 once, then succeeds', async () => {
        const responses = [json(429, { retry_after: 0.25 }, { 'Retry-After': '1' }), json(200, { id: 'm' })];
        const fetcher = jest.fn(async () => responses.shift()!);
        const waits: number[] = [];
        const rest = createDiscordPollRest({ DISCORD_BOT_TOKEN: 'tok' }, fetcher as unknown as typeof fetch, async (ms) => void waits.push(ms));

        await rest.expirePoll('c', 'm');
        expect(waits).toEqual([250]);
        expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('fails a 429 with a long wait at once, and never retries a 401', async () => {
        const sleep = jest.fn(async () => {});
        const long = createDiscordPollRest({ DISCORD_BOT_TOKEN: 'tok' }, (async () => json(429, {}, { 'Retry-After': '30' })) as unknown as typeof fetch, sleep);
        await expect(long.getMessage('c', 'm')).rejects.toMatchObject({ status: 429, retryAfterMs: 30_000 });

        const fetcher = jest.fn(async () => json(401, { code: 0, message: '401: Unauthorized' }));
        const auth = createDiscordPollRest({ DISCORD_BOT_TOKEN: 'tok' }, fetcher as unknown as typeof fetch, sleep);
        await expect(auth.expirePoll('c', 'm')).rejects.toMatchObject({ status: 401 });
        expect(fetcher).toHaveBeenCalledTimes(1);
        expect(sleep).not.toHaveBeenCalled();
    });
});

describe('GET /__dev/tick', () => {
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;
    let fetchSpy: jest.SpiedFunction<typeof fetch>;
    afterEach(() => fetchSpy.mockRestore());

    it('closes and finalizes the poll at the given now, through the real REST client', async () => {
        const pollId = await seedPoll({ date: '2026-10-21' });
        const requests: string[] = [];
        fetchSpy = jest.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
            const url = String(input);
            requests.push(`${init?.method} ${url.replace('https://discord.com/api/v10', '')}`);
            if (url.endsWith('/expire')) return new Response('{}', { status: 200 });
            return new Response(
                JSON.stringify({
                    id: 'msg-2026-10-21',
                    poll: {
                        expiry: '2026-10-28T16:00:00Z',
                        answers: ['Alfa', 'Beta', 'Gamma'].map((text, i) => ({ answer_id: i + 1, poll_media: { text } })),
                        results: { is_finalized: true, answer_counts: [{ id: 2, count: 4 }] },
                    },
                }),
                { status: 200 },
            );
        });
        const env = { ENVIRONMENT: 'dev', DB: db, DISCORD_CHANNEL_ID: CHANNEL, DISCORD_BOT_TOKEN: 'tok' } as BotEnv;
        const tick = (now: string) =>
            worker.fetch(new Request(`http://localhost:8787/__dev/tick?now=${encodeURIComponent(now)}`) as Parameters<typeof worker.fetch>[0], env, ctx);

        // 16:50 CET: not due yet.
        expect(await (await tick('2026-10-28T16:50:00+01:00')).json()).toMatchObject({ step: null });
        const response = await tick('2026-10-28T17:10:00+01:00');
        expect(await response.json()).toMatchObject({ step: 'closePoll' });

        expect(requests).toEqual([
            'POST /channels/chan-staging/polls/msg-2026-10-21/expire',
            'GET /channels/chan-staging/messages/msg-2026-10-21',
        ]);
        expect((await pollRow('2026-10-21'))!.closedAt).toBe(Date.parse('2026-10-28T16:10:00Z'));
        expect(await votes(pollId)).toEqual([['Alfa', 0], ['Beta', 4], ['Gamma', 0]]);
    });
});
