import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { createHash } from 'node:crypto';
import type { BotEnv } from '../src/env';
import { loadGameDay } from '../src/poll/candidates';
import { runAnkieta } from '../src/poll/command';
import { ensurePoll } from '../src/poll/createPoll';
import { DiscordApiError, type DiscordRest } from '../src/poll/discordApi';
import {
    createAvatarEmojis,
    discordAvatarUrl,
    emojiName,
    MAX_EMOJI_BYTES,
    siteAvatarUrl,
    type AvatarEmojiDeps,
} from '../src/poll/emojis';
import { clearPollTables, createTestD1, seedGames } from './d1';

const APP = 'app-staging';
const BASE = 'https://townofus.pl/cdn-cgi/image/width=128,height=128,fit=cover,format=png/images/avatars';
const EMOJIS = `https://discord.com/api/v10/applications/${APP}/emojis`;
const env = {
    DISCORD_APPLICATION_ID: APP,
    DISCORD_CHANNEL_ID: 'chan-staging',
    DISCORD_BOT_TOKEN: 'token',
    DISCORD_PING_ROLE_ID: '',
    AVATAR_EMOJI_BASE_URL: BASE,
    TEXT_POLL_QUESTION: 'KTO ZOSTANIE EMPEROREM?',
    TEXT_SIGNUP: 'Kto gra w środę {date}?',
    TEXT_SIGNUP_LIST: 'LISTA {date}',
    TEXT_SIGNUP_JOIN: 'CHUJ',
    TEXT_SIGNUP_LEAVE: 'wypisz mnie',
    TEXT_SIGNUP_CLOSED: 'Zapisy zamknięte',
} as BotEnv;

const SESSION = '2026-10-21';
const NOW = Date.parse('2026-10-21T21:00:00Z');

const png = (seed: string, size = 64) => {
    const bytes = new Uint8Array(size);
    bytes.set(new TextEncoder().encode(seed).slice(0, size));
    return bytes;
};
const hash8 = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex').slice(0, 8);

interface Call {
    method: string;
    url: string;
    body?: { name: string; image: string };
}

/**
 * A fake network: image URLs from `images`, everything else 404, and the application emoji API in
 * memory. `failCreate`: names whose create Discord refuses.
 */
function fakeNet(options: {
    images?: Record<string, { bytes: Uint8Array; type?: string }>;
    emojis?: { id: string; name: string }[];
    failCreate?: string[];
    failList?: boolean;
    rateLimitCreate?: number;
} = {}) {
    const emojis = [...(options.emojis ?? [])];
    const calls: Call[] = [];
    let nextId = 900;
    let rateLimits = options.rateLimitCreate ?? 0;
    const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const method = init?.method ?? 'GET';
        const body = init?.body ? (JSON.parse(String(init.body)) as Call['body']) : undefined;
        calls.push({ method, url, body });
        if (url === EMOJIS && method === 'GET') {
            if (options.failList) return new Response('{"message":"boom"}', { status: 500 });
            return Response.json({ items: emojis });
        }
        if (url === EMOJIS && method === 'POST') {
            if (rateLimits-- > 0) return Response.json({ retry_after: 0.01 }, { status: 429 });
            if (options.failCreate?.includes(body!.name)) return new Response('{"code":50035}', { status: 400 });
            const emoji = { id: String(nextId++), name: body!.name };
            emojis.push(emoji);
            return Response.json(emoji, { status: 201 });
        }
        if (url.startsWith(`${EMOJIS}/`) && method === 'DELETE') {
            const id = url.slice(EMOJIS.length + 1);
            const at = emojis.findIndex((e) => e.id === id);
            if (at >= 0) emojis.splice(at, 1);
            return new Response(null, { status: 204 });
        }
        const image = options.images?.[url];
        if (image) {
            return new Response(image.bytes, { status: 200, headers: { 'Content-Type': image.type ?? 'image/png' } });
        }
        return new Response('not found', { status: 404, headers: { 'Content-Type': 'text/html' } });
    }) as typeof fetch;
    return {
        emojis,
        calls,
        deps: { fetcher, sleep: async () => {} } satisfies AvatarEmojiDeps,
        creates: () => calls.filter((c) => c.method === 'POST'),
        deletes: () => calls.filter((c) => c.method === 'DELETE').map((c) => c.url.slice(EMOJIS.length + 1)),
    };
}

/**
 * `url` answers 200 image/png with a body that never ends. The body errors when the request's
 * signal aborts, as a real fetch does. `signals` collects that request's signal.
 */
function endlessBody(url: string, fallback: typeof fetch, signals: AbortSignal[]): typeof fetch {
    return (async (input: RequestInfo | URL, init?: RequestInit) => {
        if (String(input) !== url) return fallback(input, init);
        const signal = init!.signal!;
        signals.push(signal);
        const body = new ReadableStream({
            start(controller) {
                controller.enqueue(new Uint8Array([1, 2, 3]));
                signal.addEventListener('abort', () => controller.error(signal.reason), { once: true });
            },
        });
        return new Response(body, { status: 200, headers: { 'Content-Type': 'image/png' } });
    }) as typeof fetch;
}

/** Captures the poll body. Everything else succeeds. */
function fakeDiscord() {
    const polls: { poll_media: { text: string; emoji?: { id: string } } }[][] = [];
    const discord: DiscordRest = {
        async createMessage(_channel, raw) {
            const body = raw as { poll?: { answers: (typeof polls)[number] } };
            if (body.poll) polls.push(body.poll.answers);
            return { id: `msg-${polls.length}` };
        },
        async listMessages() {
            return [];
        },
        async editOriginalResponse() {},
        async followup() {},
        async editMessage() {},
    };
    return { discord, polls };
}

let d1: Awaited<ReturnType<typeof createTestD1>>;
let db: D1Database;

beforeAll(async () => {
    d1 = await createTestD1();
    db = d1.db;
}, 30_000);
afterAll(() => d1.dispose());
beforeEach(() => clearPollTables(db));
afterEach(() => {
    jest.restoreAllMocks();
});

/** Three players: Bartek 30, Łoś 20, Pacia 10. Returns name → playerId. */
async function seed(): Promise<Record<string, number>> {
    await seedGames(db, [
        { gameIdentifier: '20261021_2000', createdAt: '2026-10-21 18:15:00', points: { Bartek: 30, 'Łoś': 20, Pacia: 10 } },
    ]);
    const { results } = await db.prepare('SELECT "id", "name" FROM "players"').all<{ id: number; name: string }>();
    return Object.fromEntries(results.map((r) => [r.name, r.id]));
}

async function link(playerId: number, discordUserId: string, avatar: string | null) {
    await db
        .prepare(
            `INSERT INTO "discord_accounts" ("discordUserId", "username", "avatar", "playerId", "updatedAt")
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        )
        .bind(discordUserId, `user-${discordUserId}`, avatar, playerId)
        .run();
}

const candidatesOf = (ids: Record<string, number>, ...names: string[]) =>
    names.map((nickname) => ({ playerId: ids[nickname], nickname }));

describe('avatar emojis', () => {
    it('reuses an emoji with the same name and creates only the missing one', async () => {
        const ids = await seed();
        const bartek = png('bartek');
        const pacia = png('pacia');
        const net = fakeNet({
            images: {
                [siteAvatarUrl(BASE, 'Bartek')]: { bytes: bartek },
                [siteAvatarUrl(BASE, 'Pacia')]: { bytes: pacia },
            },
            emojis: [{ id: '111', name: emojiName(ids.Bartek, hash8(bartek)) }],
        });
        const resolve = createAvatarEmojis(env, db, net.deps);

        const result = await resolve(candidatesOf(ids, 'Bartek', 'Pacia'));

        expect(result.get(ids.Bartek)).toBe('111');
        expect(result.get(ids.Pacia)).toBe('900');
        expect(net.creates().map((c) => c.body!.name)).toEqual([`av_${ids.Pacia}_${hash8(pacia)}`]);
        expect(net.creates()[0].body!.image).toBe(`data:image/png;base64,${Buffer.from(pacia).toString('base64')}`);
        // One list for the whole poll.
        expect(net.calls.filter((c) => c.url === EMOJIS && c.method === 'GET')).toHaveLength(1);
    });

    it('URL-encodes the current player name', async () => {
        const ids = await seed();
        await db.prepare('UPDATE "players" SET "name" = ? WHERE "id" = ?').bind('Łoś Nowy', ids['Łoś']).run();
        const net = fakeNet({ images: { [`${BASE}/%C5%81o%C5%9B%20Nowy.png`]: { bytes: png('los') } } });

        // The poll row still has the old nick. The file is under the current name.
        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Łoś'));

        expect(result.has(ids['Łoś'])).toBe(true);
    });

    it('falls back to the linked Discord avatar when the site has none', async () => {
        const ids = await seed();
        await link(ids.Pacia, '555', 'abc123');
        const discordPng = png('discord-pacia');
        const net = fakeNet({ images: { [discordAvatarUrl('555', 'abc123')]: { bytes: discordPng } } });

        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Pacia'));

        expect(discordAvatarUrl('555', 'abc123')).toBe('https://cdn.discordapp.com/avatars/555/abc123.png?size=128');
        expect(result.get(ids.Pacia)).toBe('900');
        expect(net.creates()[0].body!.name).toBe(emojiName(ids.Pacia, hash8(discordPng)));
    });

    it('a non-image from the site also falls back to Discord', async () => {
        const ids = await seed();
        await link(ids.Pacia, '555', 'abc123');
        const net = fakeNet({
            images: {
                [siteAvatarUrl(BASE, 'Pacia')]: { bytes: png('<html>'), type: 'text/html' },
                [discordAvatarUrl('555', 'abc123')]: { bytes: png('discord') },
            },
        });

        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Pacia'));

        expect(result.get(ids.Pacia)).toBe('900');
    });

    it('no image anywhere gives no emoji and no create', async () => {
        const ids = await seed();
        await link(ids.Pacia, '555', null);
        const net = fakeNet();

        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Bartek', 'Pacia'));

        expect(result.size).toBe(0);
        expect(net.creates()).toHaveLength(0);
    });

    it('an image over 256 KiB gives no emoji', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Bartek')]: { bytes: png('big', MAX_EMOJI_BYTES + 1) } } });

        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Bartek'));

        expect(result.size).toBe(0);
        expect(net.creates()).toHaveLength(0);
    });

    it('deletes the older versions of a player after the new one exists', async () => {
        const ids = await seed();
        const bartek = png('bartek-new');
        const net = fakeNet({
            images: { [siteAvatarUrl(BASE, 'Bartek')]: { bytes: bartek } },
            emojis: [
                { id: '1', name: `av_${ids.Bartek}_deadbeef` },
                { id: '2', name: `av_${ids.Pacia}_deadbeef` },
                // Another player whose ID starts with the same digits.
                { id: '3', name: `av_${ids.Bartek}0_deadbeef` },
                { id: '4', name: 'av_test_cleopatrie' },
            ],
        });

        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Bartek'));

        expect(result.get(ids.Bartek)).toBe('900');
        expect(net.deletes()).toEqual(['1']);
        expect(net.emojis.map((e) => e.id).sort()).toEqual(['2', '3', '4', '900']);
    });

    it('a 429 with a short wait is retried once', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Bartek')]: { bytes: png('b') } }, rateLimitCreate: 1 });

        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Bartek'));

        expect(result.get(ids.Bartek)).toBe('900');
        expect(net.creates()).toHaveLength(2);
    });

    it('a request over the timeout gives no emoji for that answer only', async () => {
        const ids = await seed();
        const net = fakeNet({
            images: { [siteAvatarUrl(BASE, 'Pacia')]: { bytes: png('p') } },
        });
        const slowSite = siteAvatarUrl(BASE, 'Bartek');
        const fetcher = ((input: RequestInfo | URL, init?: RequestInit) =>
            String(input) === slowSite ? new Promise<Response>(() => {}) : net.deps.fetcher(input, init)) as typeof fetch;
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await createAvatarEmojis(env, db, { ...net.deps, fetcher, timeoutMs: 20 })(
            candidatesOf(ids, 'Bartek', 'Pacia'),
        );

        expect([...result.keys()]).toEqual([ids.Pacia]);
    });

    it('the per-request timeout also covers a body that never ends', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Pacia')]: { bytes: png('p') } } });
        const signals: AbortSignal[] = [];
        const fetcher = endlessBody(siteAvatarUrl(BASE, 'Bartek'), net.deps.fetcher, signals);
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await createAvatarEmojis(env, db, { ...net.deps, fetcher, timeoutMs: 20 })(
            candidatesOf(ids, 'Bartek', 'Pacia'),
        );

        expect([...result.keys()]).toEqual([ids.Pacia]);
        expect(signals[0].aborted).toBe(true);
    });

    it('the hard budget returns the ready emojis while a body never ends, and aborts it', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Pacia')]: { bytes: png('p') } } });
        const signals: AbortSignal[] = [];
        const fetcher = endlessBody(siteAvatarUrl(BASE, 'Bartek'), net.deps.fetcher, signals);
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        const started = Date.now();

        // The per-request timeout is far away: only the hard budget can end this.
        const result = await createAvatarEmojis(env, db, { ...net.deps, fetcher, timeoutMs: 60_000, budgetMs: 200 })(
            candidatesOf(ids, 'Pacia', 'Bartek', 'Łoś'),
        );

        expect(Date.now() - started).toBeLessThan(5_000);
        expect([...result.keys()]).toEqual([ids.Pacia]);
        expect(signals[0].aborted).toBe(true);
        // Nothing starts after the cut.
        await new Promise((resolve) => setTimeout(resolve, 20));
        expect(net.calls.some((c) => c.url === siteAvatarUrl(BASE, 'Łoś'))).toBe(false);
    });

    it('the hard budget also cuts a fetcher that ignores the signal', async () => {
        const ids = await seed();
        const net = fakeNet();
        const fetcher = (async () => new Response(new ReadableStream({ start() {} }), {
            headers: { 'Content-Type': 'image/png' },
        })) as typeof fetch;
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await createAvatarEmojis(env, db, { ...net.deps, fetcher, timeoutMs: 60_000, budgetMs: 50 })(
            candidatesOf(ids, 'Bartek'),
        );

        expect(result.size).toBe(0);
    });

    it('no new candidate starts once the clock passes the budget', async () => {
        const ids = await seed();
        const net = fakeNet({
            images: {
                [siteAvatarUrl(BASE, 'Bartek')]: { bytes: png('b') },
                [siteAvatarUrl(BASE, 'Łoś')]: { bytes: png('l') },
                [siteAvatarUrl(BASE, 'Pacia')]: { bytes: png('p') },
            },
        });
        // Every request moves the clock 5 s. List, site, create: 15 s, over the 12 s budget.
        let now = 0;
        const fetcher = ((input: RequestInfo | URL, init?: RequestInit) => {
            now += 5_000;
            return net.deps.fetcher(input, init);
        }) as typeof fetch;
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await createAvatarEmojis(env, db, { ...net.deps, fetcher, clock: () => now, budgetMs: 12_000 })(
            candidatesOf(ids, 'Bartek', 'Łoś', 'Pacia'),
        );

        expect([...result.keys()]).toEqual([ids.Bartek]);
        expect(net.calls.map((c) => c.method)).toEqual(['GET', 'GET', 'POST']);
    });

    it('a 429 without retry_after in the body uses the Retry-After header', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Bartek')]: { bytes: png('b') } } });
        let limited = false;
        const waits: number[] = [];
        const fetcher = ((input: RequestInfo | URL, init?: RequestInit) => {
            if (init?.method === 'POST' && !limited) {
                limited = true;
                return Promise.resolve(Response.json({}, { status: 429, headers: { 'Retry-After': '2' } }));
            }
            return net.deps.fetcher(input, init);
        }) as typeof fetch;

        const result = await createAvatarEmojis(env, db, {
            ...net.deps,
            fetcher,
            sleep: async (ms) => {
                waits.push(ms);
            },
        })(candidatesOf(ids, 'Bartek'));

        expect(result.get(ids.Bartek)).toBe('900');
        expect(waits).toEqual([2_000]);
    });

    it('a failed list gives no emojis and no creates', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Bartek')]: { bytes: png('b') } }, failList: true });
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const result = await createAvatarEmojis(env, db, net.deps)(candidatesOf(ids, 'Bartek'));

        expect(result.size).toBe(0);
        expect(net.creates()).toHaveLength(0);
    });

    it('is off when AVATAR_EMOJI_BASE_URL is empty: no request at all', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Bartek')]: { bytes: png('b') } } });

        const result = await createAvatarEmojis({ ...env, AVATAR_EMOJI_BASE_URL: '' }, db, net.deps)(
            candidatesOf(ids, 'Bartek'),
        );

        expect(result.size).toBe(0);
        expect(net.calls).toHaveLength(0);
    });
});

describe('poll payload with avatar emojis', () => {
    it('puts poll_media.emoji = {id} on answers with an emoji, and sends the poll when a create fails', async () => {
        const ids = await seed();
        const bartek = png('bartek');
        const los = png('los');
        const net = fakeNet({
            images: {
                [siteAvatarUrl(BASE, 'Bartek')]: { bytes: bartek },
                [siteAvatarUrl(BASE, 'Łoś')]: { bytes: los },
            },
            emojis: [{ id: '111', name: emojiName(ids.Bartek, hash8(bartek)) }],
            failCreate: [emojiName(ids['Łoś'], hash8(los))],
        });
        const { discord, polls } = fakeDiscord();
        jest.spyOn(console, 'warn').mockImplementation(() => {});

        const outcome = await ensurePoll(
            // random() near 1 keeps the selected order, so the answers are easy to read here.
            { db, discord, env, now: NOW, random: () => 0.999999, avatarEmojis: createAvatarEmojis(env, db, net.deps) },
            await loadGameDay(db, SESSION),
        );

        expect(outcome).toMatchObject({ kind: 'created' });
        expect(polls).toEqual([
            [
                { poll_media: { text: 'Bartek', emoji: { id: '111' } } },
                // The create failed: the answer has no emoji, the poll goes out.
                { poll_media: { text: 'Łoś' } },
                // No image anywhere.
                { poll_media: { text: 'Pacia' } },
            ],
        ]);
    });

    describe('Discord refuses the poll', () => {
        type Body = { nonce: string; poll: { answers: { poll_media: { text: string; emoji?: { id: string } } }[] } };

        /** `status` for every poll body with an emoji (or for every body with `always`). */
        function refusing(status: number, always = false) {
            const sent: Body[] = [];
            const discord: DiscordRest = {
                ...fakeDiscord().discord,
                async createMessage(_channel, raw) {
                    const body = raw as Body;
                    if (!(raw as { poll?: unknown }).poll) return { id: 'msg-signup' };
                    sent.push(body);
                    if (always || body.poll.answers.some((a) => a.poll_media.emoji)) {
                        throw new DiscordApiError(status, '{"code":50035,"message":"Invalid Form Body"}');
                    }
                    return { id: 'msg-plain' };
                },
            };
            return { discord, sent };
        }

        const emojiFor = (ids: Record<string, number>) => async () => new Map([[ids.Bartek, '111']]);

        it('a 4xx on a poll with emojis sends it once more without emojis, with the same nonce', async () => {
            const ids = await seed();
            const { discord, sent } = refusing(400);
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

            const outcome = await ensurePoll(
                { db, discord, env, now: NOW, random: () => 0.999999, avatarEmojis: emojiFor(ids) },
                await loadGameDay(db, SESSION),
            );

            expect(outcome).toMatchObject({ kind: 'created' });
            expect(sent).toHaveLength(2);
            expect(sent[0].poll.answers.find((a) => a.poll_media.text === 'Bartek')?.poll_media.emoji).toEqual({ id: '111' });
            expect(sent[1].poll.answers.every((a) => a.poll_media.emoji === undefined)).toBe(true);
            expect(sent[1].nonce).toBe(sent[0].nonce);
            expect(warn.mock.calls.some(([line]) => String(line).includes('pollEmojisRejected'))).toBe(true);
            const row = await db.prepare('SELECT "discordMessageId" FROM "emperor_polls"').first<{ discordMessageId: string }>();
            expect(row?.discordMessageId).toBe('msg-plain');
        });

        it.each([429, 500])('a %i is not retried without emojis', async (status) => {
            const ids = await seed();
            const { discord, sent } = refusing(status);
            jest.spyOn(console, 'error').mockImplementation(() => {});

            const outcome = await ensurePoll(
                { db, discord, env, now: NOW, avatarEmojis: emojiFor(ids) },
                await loadGameDay(db, SESSION),
            );

            expect(outcome).toMatchObject({ kind: 'sendFailed' });
            expect(sent).toHaveLength(1);
        });

        it('a 4xx on a poll without emojis is not retried', async () => {
            await seed();
            const { discord, sent } = refusing(400, true);
            jest.spyOn(console, 'error').mockImplementation(() => {});

            const outcome = await ensurePoll({ db, discord, env, now: NOW }, await loadGameDay(db, SESSION));

            expect(outcome).toMatchObject({ kind: 'sendFailed' });
            expect(sent).toHaveLength(1);
        });

        it('a retry that is refused too gives sendFailed after two sends', async () => {
            const ids = await seed();
            const { discord, sent } = refusing(403, true);
            jest.spyOn(console, 'warn').mockImplementation(() => {});
            jest.spyOn(console, 'error').mockImplementation(() => {});

            const outcome = await ensurePoll(
                { db, discord, env, now: NOW, avatarEmojis: emojiFor(ids) },
                await loadGameDay(db, SESSION),
            );

            expect(outcome).toMatchObject({ kind: 'sendFailed' });
            expect(sent).toHaveLength(2);
        });
    });

    it('a resolver that throws does not stop the poll', async () => {
        await seed();
        const { discord, polls } = fakeDiscord();
        jest.spyOn(console, 'error').mockImplementation(() => {});

        const outcome = await ensurePoll(
            { db, discord, env, now: NOW, avatarEmojis: async () => Promise.reject(new Error('boom')) },
            await loadGameDay(db, SESSION),
        );

        expect(outcome).toMatchObject({ kind: 'created' });
        expect(polls[0].every((a) => a.poll_media.emoji === undefined)).toBe(true);
    });

    it('/ankieta passes the resolver to the poll', async () => {
        const ids = await seed();
        const net = fakeNet({ images: { [siteAvatarUrl(BASE, 'Pacia')]: { bytes: png('p') } } });
        const { discord, polls } = fakeDiscord();

        await runAnkieta(db, discord, env, NOW, createAvatarEmojis(env, db, net.deps));

        expect(polls[0].find((a) => a.poll_media.text === 'Pacia')?.poll_media.emoji).toEqual({ id: '900' });
        expect(net.creates()[0].body!.name).toMatch(new RegExp(`^av_${ids.Pacia}_[0-9a-f]{8}$`));
    });
});
