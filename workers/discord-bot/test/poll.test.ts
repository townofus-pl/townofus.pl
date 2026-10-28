import { describe, expect, it } from '@jest/globals';
import { InteractionResponseType, InteractionType, MessageFlags, type Interaction } from '../src/discord';
import type { BotEnv } from '../src/env';
import { isDayQuiet, pickCandidates, shuffleCandidates, type GameDay, type PlayerDayStats } from '../src/poll/candidates';
import { createAnkietaHandler, NOT_HOST_REPLY } from '../src/poll/command';
import { createDiscordRest, type DiscordRest } from '../src/poll/discordApi';
import {
    gameIdentifierAt,
    nextWednesday,
    parseDbTimestamp,
    pollClosesAt,
    pollDurationHours,
    warsawHourToUtc,
} from '../src/poll/time';

const player = (playerId: number, nickname: string, points: number, games = 1): PlayerDayStats => ({
    playerId,
    nickname,
    points,
    games,
});

describe('pickCandidates', () => {
    it('takes exactly 10 and breaks a tie at 10th place on games, then the alphabet', () => {
        const players = [
            ...Array.from({ length: 9 }, (_, i) => player(i + 1, `Top${i + 1}`, 100 - i)),
            player(20, 'zenek', 50, 3),
            player(21, 'Żaneta', 50, 3),
            player(22, 'adam', 50, 3),
            player(23, 'Bartek', 50, 4),
        ];
        const picked = pickCandidates(players).map((c) => c.nickname);
        expect(picked).toHaveLength(10);
        expect(picked[9]).toBe('Bartek');

        // Same games: the alphabet decides, case-insensitive and with Polish letters after Latin ones.
        const sameGames = pickCandidates(players.filter((p) => p.playerId !== 23)).map((c) => c.nickname);
        expect(sameGames[9]).toBe('adam');
        expect(pickCandidates([player(1, 'Żaneta', 1), player(2, 'zenek', 1)]).map((c) => c.nickname)).toEqual([
            'zenek',
            'Żaneta',
        ]);
    });

    it('treats float sums that differ in the last bits as equal', () => {
        const picked = pickCandidates([player(1, 'b', 0.1 + 0.2, 2), player(2, 'a', 0.3, 1)]);
        expect(picked.map((c) => c.nickname)).toEqual(['b', 'a']);
    });

    it('returns everyone when fewer than 10 played', () => {
        expect(pickCandidates([player(1, 'a', 1), player(2, 'b', 2)])).toEqual([
            { playerId: 2, nickname: 'b' },
            { playerId: 1, nickname: 'a' },
        ]);
    });
});

describe('shuffleCandidates', () => {
    const candidates = Array.from({ length: 10 }, (_, i) => ({ playerId: i + 1, nickname: `P${i + 1}` }));

    it('keeps the same players and does not change the input', () => {
        const copy = [...candidates];
        let n = 0;
        const shuffled = shuffleCandidates(candidates, () => ((n += 0.37) % 1));
        expect(candidates).toEqual(copy);
        expect(shuffled).toHaveLength(10);
        expect([...shuffled].sort((a, b) => a.playerId - b.playerId)).toEqual(candidates);
    });

    it('is deterministic for a given random source', () => {
        const always0 = shuffleCandidates(candidates, () => 0);
        // random() = 0 swaps each position with index 0, from the end: a rotation.
        expect(always0.map((c) => c.playerId)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 1]);
        const nearOne = shuffleCandidates(candidates, () => 0.999999);
        expect(nearOne).toEqual(candidates);
    });

    it('handles empty and one-item lists', () => {
        expect(shuffleCandidates([], () => 0.5)).toEqual([]);
        expect(shuffleCandidates(candidates.slice(0, 1), () => 0.5)).toEqual(candidates.slice(0, 1));
    });
});

describe('isDayQuiet', () => {
    const last = Date.parse('2026-10-21T20:01:00Z');
    const day = (gameCount: number): GameDay => ({ date: '2026-10-21', gameCount, lastIngestedAt: last, players: [] });

    it('needs games and 30 minutes since the last one came in', () => {
        expect(isDayQuiet(day(5), last + 29 * 60_000)).toBe(false);
        expect(isDayQuiet(day(5), last + 30 * 60_000)).toBe(true);
        expect(isDayQuiet(day(0), last + 120 * 60_000)).toBe(false);
    });
});

describe('time', () => {
    it('finds the next Wednesday strictly after the session', () => {
        expect(nextWednesday('2026-10-21')).toBe('2026-10-28');
        expect(nextWednesday('2026-10-24')).toBe('2026-10-28');
        expect(nextWednesday('2026-10-27')).toBe('2026-10-28');
    });

    it('converts Warsaw 17:00 to UTC on both sides of the DST change', () => {
        expect(warsawHourToUtc('2026-10-21', 17)).toBe(Date.parse('2026-10-21T15:00:00Z'));
        expect(warsawHourToUtc('2026-10-28', 17)).toBe(Date.parse('2026-10-28T16:00:00Z'));
        expect(pollClosesAt('2026-10-21')).toBe(Date.parse('2026-10-28T16:00:00Z'));
    });

    it('gives a duration in whole hours that ends after the close time', () => {
        const closesAt = Date.parse('2026-10-28T16:00:00Z');
        const now = Date.parse('2026-10-21T20:30:00Z');
        const hours = pollDurationHours(now, closesAt);
        expect(Number.isInteger(hours)).toBe(true);
        expect(now + hours * 3_600_000).toBeGreaterThan(closesAt);
        expect(pollDurationHours(closesAt - 3_600_000, closesAt)).toBe(2);
    });

    it('reads both DATETIME formats as UTC', () => {
        expect(parseDbTimestamp('2026-10-21 20:01:00')).toBe(Date.parse('2026-10-21T20:01:00Z'));
        expect(parseDbTimestamp('2026-10-21T20:01:00.000+00:00')).toBe(Date.parse('2026-10-21T20:01:00Z'));
    });

    it('builds game identifiers in Warsaw wall clock', () => {
        expect(gameIdentifierAt(Date.parse('2026-10-21T20:01:00Z'))).toBe('20261021_2201');
    });
});

describe('/ankieta handler', () => {
    const env = { DISCORD_HOST_ROLE_ID: 'host' } as BotEnv;
    const interaction = (roles: string[]): Interaction => ({
        id: '1',
        type: InteractionType.ApplicationCommand,
        token: 'tok',
        application_id: 'app',
        member: { user: { id: 'u', username: 'u' }, roles },
        data: { name: 'ankieta' },
    });

    function setup() {
        const edits: string[] = [];
        const pending: Promise<unknown>[] = [];
        const discord: DiscordRest = {
            createMessage: async () => ({ id: 'm' }),
            editOriginalResponse: async (_app, _token, content) => void edits.push(content),
            listMessages: async () => [],
            followup: async () => {},
            editMessage: async () => {},
        };
        const ctx = { waitUntil: (p: Promise<unknown>) => pending.push(p), passThroughOnException() {} } as unknown as ExecutionContext;
        return { handler: createAnkietaHandler(() => discord), edits, pending, ctx };
    }

    it('refuses a member without the Host role, visible only to them', async () => {
        const { handler, ctx, pending } = setup();
        const response = await handler(interaction(['other']), env, ctx);
        expect(await response.json()).toEqual({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: { content: NOT_HOST_REPLY, flags: MessageFlags.Ephemeral },
        });
        expect(pending).toHaveLength(0);
    });

    it('defers for a host and edits the reply from waitUntil', async () => {
        const { handler, ctx, pending, edits } = setup();
        // A D1 that throws: the host still gets an answer in the edited reply.
        const brokenEnv = { ...env, DB: { prepare: () => { throw new Error('d1 down'); } } } as unknown as BotEnv;
        const response = await handler(interaction(['host']), brokenEnv, ctx);
        expect(await response.json()).toEqual({ type: 5, data: { flags: MessageFlags.Ephemeral } });
        await Promise.all(pending);
        expect(edits).toEqual(['Coś poszło nie tak. Spróbuj ponownie za 5 minut.']);
    });
});

describe('editOriginalResponse', () => {
    const fetcherWith = (statuses: number[]) => {
        const calls: string[] = [];
        const fetcher = (async (url: string) => {
            calls.push(url);
            const status = statuses.shift() ?? 200;
            return new Response(status === 200 ? '{}' : 'Unknown Webhook', { status });
        }) as unknown as typeof fetch;
        return { calls, fetcher };
    };

    it('tries again when the edit reaches Discord before the deferred reply (404)', async () => {
        const { calls, fetcher } = fetcherWith([404, 404, 200]);
        await createDiscordRest({ DISCORD_BOT_TOKEN: 't' }, fetcher, 1).editOriginalResponse('app', 'tok', 'ok');
        expect(calls).toHaveLength(3);
        expect(calls[0]).toBe('https://discord.com/api/v10/webhooks/app/tok/messages/@original');
    });

    it('gives up after three attempts, and at once on a status it cannot fix', async () => {
        const many = fetcherWith([404, 404, 404, 200]);
        await expect(createDiscordRest({ DISCORD_BOT_TOKEN: 't' }, many.fetcher, 1).editOriginalResponse('a', 't', 'x')).rejects.toThrow('404');
        expect(many.calls).toHaveLength(3);

        const forbidden = fetcherWith([403]);
        await expect(createDiscordRest({ DISCORD_BOT_TOKEN: 't' }, forbidden.fetcher, 1).editOriginalResponse('a', 't', 'x')).rejects.toThrow('403');
        expect(forbidden.calls).toHaveLength(1);
    });
});
