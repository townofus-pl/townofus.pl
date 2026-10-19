import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import type { BotEnv } from '../src/env';
import { latestGameDate, loadGameDay } from '../src/poll/candidates';
import { runAnkieta } from '../src/poll/command';
import { createPollTick, ensurePoll, type PollContext } from '../src/poll/createPoll';
import { DiscordApiError, type DiscordRest, type PollChannelMessage } from '../src/poll/discordApi';
import { clearPollTables, createTestD1, seedGames } from './d1';

const CHANNEL = 'chan-staging';
const APP = 'app-staging';
const env = {
    DISCORD_APPLICATION_ID: APP,
    DISCORD_CHANNEL_ID: CHANNEL,
    TEXT_POLL_QUESTION: 'KTO ZOSTANIE EMPEROREM?',
    TEXT_SIGNUP: 'Kto gra w środę {date}? Kliknij Gram.',
    TEXT_SIGNUP_CLOSED: 'Zapisy zamknięte',
} as BotEnv;

const SESSION = '2026-10-21';
// The last game came in at 22:01 Warsaw (20:01 UTC).
const LAST_INGEST = Date.parse('2026-10-21T20:01:00Z');
const MIN = 60_000;

interface Body {
    poll?: { answers: { poll_media: { text: string } }[]; duration: number; allow_multiselect: boolean };
    content?: string;
    components?: { components: { custom_id: string }[] }[];
    nonce?: string;
    enforce_nonce?: boolean;
}
interface Sent {
    channelId: string;
    body: Body;
}

/**
 * `ok`: Discord creates the message. `fail`: Discord refuses it. `lose`: Discord creates it, but
 * the reply never arrives. One mode per createMessage call, in order, then `ok`.
 */
type Mode = 'ok' | 'fail' | 'lose';

/** A channel in memory. Messages carry `clock` as their timestamp. Newest first, like Discord. */
function fakeDiscord(modes: Mode[] = []) {
    const sent: Sent[] = [];
    const channel: (PollChannelMessage & { nonce?: string })[] = [];
    const fake = { clock: 0 };
    const discord: DiscordRest = {
        async createMessage(channelId, raw) {
            const body = raw as Body;
            // Yield, so two concurrent callers really interleave.
            await new Promise((r) => setTimeout(r, 5));
            const mode = modes.shift() ?? 'ok';
            if (mode === 'fail') throw new DiscordApiError(500, 'boom');
            const known = body.enforce_nonce && channel.find((m) => m.nonce === body.nonce);
            if (known) return { id: known.id };
            sent.push({ channelId, body });
            const message = {
                id: `msg-${sent.length}`,
                timestamp: new Date(fake.clock).toISOString(),
                author: { id: APP, bot: true },
                poll: body.poll,
                components: body.components,
                nonce: body.nonce,
            };
            channel.unshift(message);
            if (mode === 'lose') throw new Error('timeout');
            return { id: message.id };
        },
        async listMessages() {
            return channel;
        },
        async editOriginalResponse() {},
        async followup() {},
        async editMessage() {},
    };
    return {
        fake,
        discord,
        sent,
        polls: () => sent.filter((s) => s.body.poll),
        signups: () => sent.filter((s) => s.body.components),
    };
}

let d1: Awaited<ReturnType<typeof createTestD1>>;
let db: D1Database;

beforeAll(async () => {
    d1 = await createTestD1();
    db = d1.db;
}, 30_000);
afterAll(() => d1.dispose());
beforeEach(() => clearPollTables(db));

/** A context at `now`. The fake channel stamps new messages with the same time. */
const ctxAt = (now: number, discord: DiscordRest, fake?: { clock: number }): PollContext => {
    if (fake) fake.clock = now;
    return { db, discord, env, now };
};

/** Twelve players over two games, so the cut at 10 matters. */
async function seedSession() {
    const first: Record<string, number> = {};
    const second: Record<string, number> = {};
    for (let i = 1; i <= 12; i++) first[`Gracz${String(i).padStart(2, '0')}`] = 20 - i;
    second.Gracz12 = 2;
    await seedGames(db, [
        { gameIdentifier: '20261021_2000', createdAt: '2026-10-21 18:15:00', points: first },
        { gameIdentifier: '20261021_2145', createdAt: '2026-10-21 20:01:00', points: second },
    ]);
}

const pollRows = () =>
    db.prepare('SELECT * FROM "emperor_polls" ORDER BY "id"').all<Record<string, unknown>>().then((r) => r.results);
const candidateRows = () =>
    db
        .prepare('SELECT "playerId", "nickname", "voteCount" FROM "emperor_poll_candidates" ORDER BY "id"')
        .all<{ playerId: number; nickname: string; voteCount: number }>()
        .then((r) => r.results);

describe('loadGameDay', () => {
    it('sums the day per player and skips deleted games and deleted players', async () => {
        await seedGames(
            db,
            [
                { gameIdentifier: '20261021_2000', createdAt: '2026-10-21 18:15:00', points: { A: 5, B: 4, Gone: 9 } },
                { gameIdentifier: '20261021_2100', createdAt: '2026-10-21 19:15:00', points: { A: 1 }, deleted: true },
                { gameIdentifier: '20261014_2000', createdAt: '2026-10-14 18:15:00', points: { B: 7 } },
            ],
            ['Gone'],
        );
        const day = await loadGameDay(db, SESSION);
        expect(day.gameCount).toBe(1);
        expect(day.lastIngestedAt).toBe(Date.parse('2026-10-21T18:15:00Z'));
        expect(day.players.map((p) => [p.nickname, p.points, p.games]).sort()).toEqual([
            ['A', 5, 1],
            ['B', 4, 1],
        ]);
    });
});

describe('cron step', () => {
    it('waits for the quiet rule, then creates the poll and the signup message', async () => {
        await seedSession();
        const { discord, sent } = fakeDiscord();

        expect(await createPollTick(ctxAt(LAST_INGEST + 29 * MIN, discord), SESSION)).toBeNull();
        expect(sent).toHaveLength(0);

        const now = LAST_INGEST + 30 * MIN;
        expect(await createPollTick(ctxAt(now, discord), SESSION)).toEqual({ kind: 'created', date: SESSION, signupSent: true });

        const [poll, signup] = sent;
        expect(poll.channelId).toBe(CHANNEL);
        expect(poll.body.poll!.allow_multiselect).toBe(false);
        expect(poll.body.poll!.answers).toHaveLength(10);
        // 2026-10-21 20:31 UTC → 2026-10-28 17:00 CET (16:00 UTC) is 163.5 h.
        expect(poll.body.poll!.duration).toBe(165);
        expect(poll.body).toMatchObject({ nonce: `poll-${(await pollRows())[0].id}`, enforce_nonce: true });
        expect(signup.body.content).toContain('Kto gra w środę 28.10? Kliknij Gram.');
        expect(signup.body.content).toContain('Na razie nikt.');
        expect(signup.body.components![0].components.map((c) => c.custom_id)).toEqual([
            'signup:join:2026-10-28',
            'signup:leave:2026-10-28',
        ]);

        const [row] = await pollRows();
        expect(row).toMatchObject({
            date: SESSION,
            season: 4,
            question: env.TEXT_POLL_QUESTION,
            closesAt: Date.parse('2026-10-28T16:00:00Z'),
            discordChannelId: CHANNEL,
            discordMessageId: 'msg-1',
            closedAt: null,
        });
        const candidates = await candidateRows();
        expect(candidates).toHaveLength(10);
        expect(candidates.every((c) => c.voteCount === 0)).toBe(true);
        // 10th place is a tie between Gracz10 (one game) and Gracz12 (two games). More games wins.
        expect(candidates.map((c) => c.nickname)).toEqual([
            'Gracz01', 'Gracz02', 'Gracz03', 'Gracz04', 'Gracz05', 'Gracz06', 'Gracz07', 'Gracz08', 'Gracz09', 'Gracz12',
        ]);
        expect(poll.body.poll!.answers.map((a) => a.poll_media.text)).toEqual(candidates.map((c) => c.nickname));

        // The next tick finds the signup message in the channel and changes nothing.
        expect(await createPollTick(ctxAt(now + 10 * MIN, discord), SESSION)).toEqual({
            kind: 'exists',
            date: SESSION,
            signupSent: false,
        });
        expect(sent).toHaveLength(2);
    });

    it('cron and /ankieta at the same moment give one poll', async () => {
        await seedSession();
        const { discord, polls } = fakeDiscord();
        const now = LAST_INGEST + 40 * MIN;

        const [cron, command] = await Promise.all([
            createPollTick(ctxAt(now, discord), SESSION),
            runAnkieta(db, discord, env, now),
        ]);

        expect(polls()).toHaveLength(1);
        expect(await pollRows()).toHaveLength(1);
        expect(await candidateRows()).toHaveLength(10);
        // Exactly one of them created it. The other found the row (sent or still sending).
        const created = [cron?.kind === 'created', command.startsWith('Ankieta i zapisy')];
        expect(created.filter(Boolean)).toHaveLength(1);
    });

    it('sends again on the next tick after a failed send, with the same candidates', async () => {
        await seedSession();
        const { discord, polls } = fakeDiscord(['fail']);
        const now = LAST_INGEST + 30 * MIN;

        expect(await createPollTick(ctxAt(now, discord), SESSION)).toEqual({ kind: 'sendFailed', date: SESSION });
        expect((await pollRows())[0].discordMessageId).toBeNull();
        const before = await candidateRows();

        // Inside the lease the row belongs to the caller that failed.
        expect(await runAnkieta(db, discord, env, now + 2 * MIN)).toMatch(/właśnie wysyłana/);
        expect(polls()).toHaveLength(0);

        expect(await createPollTick(ctxAt(now + 10 * MIN, discord), SESSION)).toEqual({
            kind: 'created',
            date: SESSION,
            signupSent: true,
        });
        expect(polls()).toHaveLength(1);
        expect((await pollRows())[0].discordMessageId).toBe('msg-1');
        expect(await candidateRows()).toEqual(before);
    });

    it('closes a stale unsent row without sending it, so it does not block the new week', async () => {
        await seedSession();
        // The send for 14.10 failed on every tick. Its close time (21.10 17:00) has passed.
        await db
            .prepare(
                `INSERT INTO "emperor_polls" ("date", "season", "question", "closesAt", "discordChannelId", "createdAt", "updatedAt")
                 VALUES ('2026-10-14', 4, 'q', ?, ?, '2026-10-14T20:30:00.000+00:00', '2026-10-14T21:50:00.000+00:00')`,
            )
            .bind(Date.parse('2026-10-21T15:00:00Z'), CHANNEL)
            .run();
        const { discord, polls, signups, fake } = fakeDiscord();
        const now = LAST_INGEST + 30 * MIN;

        expect(await createPollTick(ctxAt(now, discord, fake), SESSION)).toEqual({
            kind: 'created',
            date: SESSION,
            signupSent: true,
        });
        const [stale, fresh] = await pollRows();
        expect(stale).toMatchObject({ date: '2026-10-14', discordMessageId: null, closedAt: now });
        expect(fresh).toMatchObject({ date: SESSION, discordMessageId: 'msg-1' });
        expect(polls()).toHaveLength(1);
        expect(signups().map((s) => s.body.components![0].components[0].custom_id)).toEqual(['signup:join:2026-10-28']);
    });

    it('sends a missing signup message when the poll already exists', async () => {
        await seedSession();
        const { discord, polls, signups, fake } = fakeDiscord(['ok', 'fail']);
        const now = LAST_INGEST + 30 * MIN;

        expect(await createPollTick(ctxAt(now, discord, fake), SESSION)).toEqual({
            kind: 'created',
            date: SESSION,
            signupSent: false,
        });
        expect(signups()).toHaveLength(0);

        // Inside the lease nobody touches the row.
        expect(await runAnkieta(db, discord, env, now + 2 * MIN)).toBe('Ankieta już istnieje.');
        expect(signups()).toHaveLength(0);

        expect(await runAnkieta(db, discord, env, now + 10 * MIN)).toBe(
            'Ankieta już istnieje. Wysłano brakującą wiadomość z zapisami.',
        );
        expect(await createPollTick(ctxAt(now + 20 * MIN, discord, fake), SESSION)).toEqual({
            kind: 'exists',
            date: SESSION,
            signupSent: false,
        });
        expect(signups()).toHaveLength(1);
        expect(polls()).toHaveLength(1);
    });

    it('adopts its own poll when the reply got lost, instead of posting a second one', async () => {
        await seedSession();
        const { discord, polls, signups, fake } = fakeDiscord(['lose']);
        const now = LAST_INGEST + 30 * MIN;

        expect(await createPollTick(ctxAt(now, discord, fake), SESSION)).toEqual({ kind: 'sendFailed', date: SESSION });
        expect(polls()).toHaveLength(1); // Discord has it, D1 does not.
        expect((await pollRows())[0].discordMessageId).toBeNull();

        expect(await createPollTick(ctxAt(now + 10 * MIN, discord, fake), SESSION)).toEqual({
            kind: 'created',
            date: SESSION,
            signupSent: true,
        });
        expect(polls()).toHaveLength(1);
        expect((await pollRows())[0].discordMessageId).toBe('msg-1');
        expect(signups()).toHaveLength(1);
    });

    it('does not adopt a bot poll older than the row', async () => {
        await seedSession();
        const { discord, polls, fake } = fakeDiscord(['ok', 'fail']);
        // Last week's poll of the bot is still in the channel history.
        fake.clock = Date.parse('2026-10-14T20:40:00Z');
        await discord.createMessage(CHANNEL, { poll: { answers: [] } });
        const now = LAST_INGEST + 30 * MIN;

        expect(await createPollTick(ctxAt(now, discord, fake), SESSION)).toEqual({ kind: 'sendFailed', date: SESSION });
        expect(await createPollTick(ctxAt(now + 10 * MIN, discord, fake), SESSION)).toMatchObject({ kind: 'created' });
        expect(polls()).toHaveLength(2);
        expect((await pollRows())[0].discordMessageId).toBe('msg-2');
    });

    it('an open poll on another channel does not block, one on this channel does', async () => {
        await seedSession();
        await db
            .prepare(
                `INSERT INTO "emperor_polls" ("date", "season", "question", "closesAt", "discordChannelId", "discordMessageId", "updatedAt")
                 VALUES ('2026-10-14', 4, 'q', 0, 'chan-production', 'prod-msg', '2026-10-14T21:00:00.000+00:00')`,
            )
            .run();
        const { discord, polls } = fakeDiscord();
        const now = LAST_INGEST + 30 * MIN;
        expect((await createPollTick(ctxAt(now, discord), SESSION))?.kind).toBe('created');
        expect(polls()).toHaveLength(1);

        // Now this channel has an open poll. A poll for another day is refused.
        await seedGames(db, [{ gameIdentifier: '20261024_2000', createdAt: '2026-10-24 18:00:00', points: { X: 1 } }]);
        expect(await ensurePoll(ctxAt(now, discord), await loadGameDay(db, '2026-10-24'))).toEqual({
            kind: 'blocked',
            date: '2026-10-24',
        });
        expect(await pollRows()).toHaveLength(2);
    });
});

describe('/ankieta', () => {
    it('picks the newest day with games in the last 24 hours', async () => {
        await seedGames(db, [
            { gameIdentifier: '20261014_2000', createdAt: '2026-10-14 18:15:00', points: { A: 1 } },
            { gameIdentifier: '20261021_2000', createdAt: '2026-10-21 18:15:00', points: { A: 1 } },
        ]);
        expect(await latestGameDate(db, Date.parse('2026-10-22T10:00:00Z'))).toBe(SESSION);
        expect(await latestGameDate(db, Date.parse('2026-10-23T10:00:00Z'))).toBeNull();
    });

    it('answers "Brak gier w tym dniu" without games', async () => {
        const { discord, sent } = fakeDiscord();
        expect(await runAnkieta(db, discord, env, Date.parse('2026-10-22T10:00:00Z'))).toBe('Brak gier w tym dniu.');
        expect(sent).toHaveLength(0);
    });

    it('creates the poll without the quiet rule, and a second call finds it', async () => {
        await seedSession();
        const { discord, polls } = fakeDiscord();
        const now = LAST_INGEST + 5 * MIN;
        expect(await runAnkieta(db, discord, env, now)).toBe('Ankieta i zapisy za 21.10 utworzone.');
        expect(await runAnkieta(db, discord, env, now + MIN)).toBe('Ankieta już istnieje.');
        expect(polls()).toHaveLength(1);
    });
});
