import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CURRENT_SEASON } from '../../../src/app/dramaafera/_constants/seasons';
import { InteractionType, MessageFlags, type GuildMember, type Interaction } from '../src/discord';
import type { BotEnv } from '../src/env';
import { closeSignupMessages } from '../src/signup/close';
import { handleSignupButton } from '../src/signup/handler';
import { displayName } from '../src/signup/identity';
import { parseSignupCustomId, pingAllowedMentions, renderSignupMessage, signupCustomId, type SignupMessage } from '../src/signup/message';
import type { ChannelMessage, SignupRest } from '../src/signup/rest';
import { joinRoster, readRoster, seasonForSession, signupClosesAt } from '../src/signup/roster';
import { createTestD1 } from './d1';

// A Wednesday far enough ahead that the SQL clock never closes it during the test.
const DATE = '2030-01-02';
const SEASON = seasonForSession(DATE);

let db: D1Database;
let dispose: () => Promise<void>;
let env: BotEnv;

beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    ({ db, dispose } = await createTestD1());
    env = {
        DB: db,
        DISCORD_CHANNEL_ID: 'channel',
        DISCORD_APPLICATION_ID: 'app',
        TEXT_SIGNUP: 'Kto gra w środę {date}? Kliknij Gram.',
    TEXT_SIGNUP_LIST: 'LISTA CWELI {date}',
    TEXT_SIGNUP_JOIN: 'CHUJ',
    TEXT_SIGNUP_LEAVE: 'wypisz mnie',
        TEXT_SIGNUP_CLOSED: 'Zapisy zamknięte',
        TEXT_SIGNUP_CLOSED_REPLY: 'Zapisy zamknięte, napisz do hosta',
    } as BotEnv;
}, 30_000);

afterAll(() => dispose());

beforeEach(async () => {
    await db.batch(
        ['UPDATE players SET currentRankingId = NULL', 'DELETE FROM discord_accounts', 'DELETE FROM player_rankings', 'DELETE FROM players', 'DELETE FROM lista_cweli'].map(
            (sql) => db.prepare(sql),
        ),
    );
});

const all = async <T>(sql: string, ...args: unknown[]) => (await db.prepare(sql).bind(...args).all<T>()).results;
const roster = () => readRoster(db, SEASON, DATE);

async function addPlayer(name: string, discordUserId?: string): Promise<number> {
    const row = await db
        .prepare(`INSERT INTO players (name, updatedAt) VALUES (?, CURRENT_TIMESTAMP) RETURNING id`)
        .bind(name)
        .first<{ id: number }>();
    if (discordUserId) {
        await db
            .prepare(`INSERT INTO discord_accounts (discordUserId, username, playerId, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
            .bind(discordUserId, `user${discordUserId}`, row!.id)
            .run();
    }
    return row!.id;
}

const member = (id: string, nick: string | null, globalName: string | null = null): GuildMember => ({
    user: { id, username: `user${id}`, global_name: globalName },
    nick,
    roles: [],
});

interface Click {
    response: { type: number; data: Partial<SignupMessage> & { flags?: number } };
    followups: string[];
}

async function click(action: 'join' | 'leave', who: GuildMember, options: { date?: string; now?: number } = {}): Promise<Click> {
    const followups: string[] = [];
    const pending: Promise<unknown>[] = [];
    const rest = { followup: async (_app: string, _token: string, content: string) => void followups.push(content) } as SignupRest;
    const interaction: Interaction = {
        id: '1',
        type: InteractionType.MessageComponent,
        token: 'token',
        application_id: 'app',
        member: who,
        data: { custom_id: signupCustomId(action, options.date ?? DATE) },
    };
    const ctx = { waitUntil: (p: Promise<unknown>) => pending.push(p) } as unknown as ExecutionContext;
    const response = await handleSignupButton(interaction, env, ctx, { now: () => options.now ?? Date.now(), rest });
    await Promise.all(pending);
    return { response: (await response.json()) as Click['response'], followups };
}

const accountOf = async (discordUserId: string) =>
    (await all<{ playerId: number | null }>('SELECT playerId FROM discord_accounts WHERE discordUserId = ?', discordUserId))[0];

describe('signup message', () => {
    const base = {
        TEXT_SIGNUP: 'KTO GRA W NASTĘPNĄ ŚRODĘ KLIKA "CHUJ"',
        TEXT_SIGNUP_LIST: 'LISTA CWELI {date}',
        TEXT_SIGNUP_JOIN: 'CHUJ',
        TEXT_SIGNUP_LEAVE: 'wypisz mnie',
        TEXT_SIGNUP_CLOSED: 'Zamknięte',
    };

    it('renders the configured texts, the dated list heading and the button labels', () => {
        const message = renderSignupMessage(base, '2026-10-28', ['A', 'B'], false);
        expect(message.content).toBe('KTO GRA W NASTĘPNĄ ŚRODĘ KLIKA "CHUJ"\n\n**LISTA CWELI 28.10**\n1. A\n2. B');
        const buttons = (message.components[0] as { components: { label: string }[] }).components;
        expect(buttons.map((b) => b.label)).toEqual(['CHUJ', 'wypisz mnie']);
    });

    it('pings nobody, also with DISCORD_PING_ROLE_ID set: the poll message carries the ping', () => {
        const message = renderSignupMessage({ ...base, DISCORD_PING_ROLE_ID: '42' } as typeof base, '2026-10-28', [], false);
        expect(message.content).not.toContain('<@&');
        expect(message.allowed_mentions).toEqual({ parse: [] });
        expect(pingAllowedMentions({ DISCORD_PING_ROLE_ID: '42' })).toEqual({ parse: [], roles: ['42'] });
        expect(pingAllowedMentions({ DISCORD_PING_ROLE_ID: '' })).toEqual({ parse: [] });
    });
});

describe('custom_id and time', () => {
    it('parses only signup buttons with a real date', () => {
        expect(parseSignupCustomId('signup:join:2026-10-21')).toEqual({ action: 'join', date: '2026-10-21' });
        expect(parseSignupCustomId('signup:leave:2026-10-21')).toEqual({ action: 'leave', date: '2026-10-21' });
        expect(parseSignupCustomId('signup:join')).toBeNull();
        expect(parseSignupCustomId('signup:join:2026-02-30')).toBeNull();
        expect(parseSignupCustomId('signup:kick:2026-10-21')).toBeNull();
    });

    it('closes at 18:00 Warsaw in summer and in winter time', () => {
        expect(new Date(signupClosesAt('2026-10-21')).toISOString()).toBe('2026-10-21T16:00:00.000Z');
        expect(new Date(signupClosesAt('2026-10-28')).toISOString()).toBe('2026-10-28T17:00:00.000Z');
    });

    it('takes the name as Discord shows it: nick, then global_name, then username', () => {
        expect(displayName(member('1', 'Nick', 'Global'))).toBe('Nick');
        expect(displayName(member('1', null, 'Global'))).toBe('Global');
        expect(displayName(member('1', null, null))).toBe('user1');
    });
});

describe('join and leave', () => {
    it('updates the message (type 7) and confirms to the clicker only', async () => {
        const { response, followups } = await click('join', member('1', 'Ala'));
        expect(response.type).toBe(7);
        expect(response.data.content).toContain('Kto gra w środę 02.01?');
        expect(response.data.content).toContain('1. Ala');
        expect(response.data.allowed_mentions).toEqual({ parse: [] });
        expect(followups).toEqual(['Jesteś na liście na 02.01 jako **Ala**.']);
        expect(await roster()).toEqual(['Ala']);
    });

    it('does not add a name twice, and removes it on leave', async () => {
        await click('join', member('1', 'Ala'));
        await click('join', member('1', 'Ala'));
        await click('join', member('2', 'Bob'));
        expect(await roster()).toEqual(['Ala', 'Bob']);

        const { response } = await click('leave', member('1', 'Ala'));
        expect(response.type).toBe(7);
        expect(await roster()).toEqual(['Bob']);
        await click('leave', member('1', 'Ala'));
        expect(await roster()).toEqual(['Bob']);
    });

    it('stores the session the way the site does: season by date, Prisma date text', async () => {
        await click('join', member('1', 'Ala'));
        const [row] = await all<{ season: number; date: string }>('SELECT season, date FROM lista_cweli');
        expect(row).toEqual({ season: SEASON, date: `${DATE}T00:00:00.000+00:00` });
    });

    it('keeps a host edit made between two clicks', async () => {
        await click('join', member('1', 'Ala'));
        // The host saves the list in the panel: adds a name and reorders.
        await db.prepare(`UPDATE lista_cweli SET playerNames = ? `).bind(JSON.stringify(['Gość', 'Ala'])).run();
        await click('join', member('2', 'Bob'));
        expect(await roster()).toEqual(['Gość', 'Ala', 'Bob']);
        await click('leave', member('1', 'Ala'));
        expect(await roster()).toEqual(['Gość', 'Bob']);
    });

    it('treats a host-typed name in another case as the same person', async () => {
        await db
            .prepare(`INSERT INTO lista_cweli (season, date, playerNames, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`)
            .bind(SEASON, `${DATE}T00:00:00.000+00:00`, JSON.stringify(['ala']))
            .run();
        await click('join', member('1', 'Ala'));
        expect(await roster()).toEqual(['ala']);
        await click('leave', member('1', 'Ala'));
        expect(await roster()).toEqual([]);
    });

    it('refuses a click after Wednesday 18:00 Warsaw and writes nothing', async () => {
        const { response, followups } = await click('join', member('1', 'Ala'), { now: signupClosesAt(DATE) });
        expect(response.type).toBe(4);
        expect(response.data).toEqual({ content: env.TEXT_SIGNUP_CLOSED_REPLY, flags: MessageFlags.Ephemeral });
        expect(followups).toEqual([]);
        expect(await all('SELECT * FROM discord_accounts')).toEqual([]);
        expect(await roster()).toEqual([]);
    });

    it('also refuses in SQL, so a late in-flight click cannot change the list', async () => {
        const past = '2026-10-14';
        expect(await joinRoster(db, seasonForSession(past), past, 'Ala', signupClosesAt(past))).toBeNull();
        expect(await all('SELECT * FROM lista_cweli')).toEqual([]);
    });

    it('keeps every click when many arrive at once', async () => {
        const clicks = Array.from({ length: 12 }, (_, i) => click('join', member(String(i), `Gracz${i}`)));
        clicks.push(click('join', member('0', 'Gracz0')), click('join', member('0', 'Gracz0')));
        await Promise.all(clicks);
        const names = await roster();
        expect([...names].sort()).toEqual(Array.from({ length: 12 }, (_, i) => `Gracz${i}`).sort());
        expect(await all('SELECT name FROM players')).toHaveLength(12);
        expect(await all('SELECT * FROM discord_accounts WHERE playerId IS NOT NULL')).toHaveLength(12);
    });
});

describe('identity', () => {
    it('linked account: its player name, even after a nick change', async () => {
        const id = await addPlayer('Quarties', '1');
        await addPlayer('Ktoś');
        await click('join', member('1', 'Ktoś'));
        expect(await roster()).toEqual(['Quarties']);
        expect(await accountOf('1')).toEqual({ playerId: id });
    });

    it('unlinked, nick matches a player without an account (any case): links to that player', async () => {
        const id = await addPlayer('Quarties');
        const { followups } = await click('join', member('1', 'quarties'));
        expect(await roster()).toEqual(['Quarties']);
        expect(await accountOf('1')).toEqual({ playerId: id });
        expect(followups[0]).toContain('**Quarties**');
    });

    it('unlinked, no player with that nick: creates the player like the site does, and links it', async () => {
        await click('join', member('1', null, 'Nowy'));
        const players = await all<{ id: number; name: string; friendCode: string | null; hashedProductUserId: string | null; currentRankingId: number }>(
            'SELECT id, name, friendCode, hashedProductUserId, currentRankingId FROM players',
        );
        expect(players).toHaveLength(1);
        expect(players[0]).toMatchObject({ name: 'Nowy', friendCode: null, hashedProductUserId: null });
        const rankings = await all<{ id: number; score: number; reason: string; season: number; gameId: number | null }>(
            'SELECT id, score, reason, season, gameId FROM player_rankings WHERE playerId = ?',
            players[0].id,
        );
        expect(rankings).toEqual([{ id: players[0].currentRankingId, score: 2000, reason: 'initial_value', season: CURRENT_SEASON, gameId: null }]);
        expect(await accountOf('1')).toEqual({ playerId: players[0].id });
        expect(await roster()).toEqual(['Nowy']);
    });

    it('nick of a player linked to another account: no link, nothing written', async () => {
        await addPlayer('Quarties', 'owner');
        const { response, followups } = await click('join', member('2', 'QUARTIES'));
        expect(response.type).toBe(4);
        expect(response.data.flags).toBe(MessageFlags.Ephemeral);
        expect(response.data.content).toContain('Host to sprawdzi');
        expect(followups).toEqual([]);
        expect(await accountOf('2')).toEqual({ playerId: null });
        expect(await roster()).toEqual([]);
    });

    it('A linked to a player, B unlinked with the same nick: B cannot claim or remove A', async () => {
        await addPlayer('Quarties', 'A');
        await click('join', member('A', 'Quarties'));
        expect(await roster()).toEqual(['Quarties']);

        const join = await click('join', member('B', 'Quarties'));
        expect(join.response.type).toBe(4);
        expect(join.response.data.content).not.toContain('Jesteś na liście');
        expect(join.followups).toEqual([]);

        const leave = await click('leave', member('B', 'Quarties'));
        expect(leave.response.type).toBe(4);
        expect(leave.response.data.content).toContain('nikogo nie wypisuję');
        expect(await roster()).toEqual(['Quarties']);
        expect(await accountOf('B')).toEqual({ playerId: null });

        await click('leave', member('A', 'Quarties'));
        expect(await roster()).toEqual([]);
    });

    it('matches Polish letters in another case and writes the player own spelling', async () => {
        const id = await addPlayer('Łoś');
        await click('join', member('1', 'łoś'));
        expect(await accountOf('1')).toEqual({ playerId: id });
        expect(await all('SELECT name FROM players')).toEqual([{ name: 'Łoś' }]);
        expect(await roster()).toEqual(['Łoś']);
    });

    it('escapes Markdown in the confirmation', async () => {
        const { followups } = await click('join', member('1', '_x_'));
        expect(followups).toEqual(['Jesteś na liście na 02.01 jako **\\_x\\_**.']);
    });

    it('never moves an existing link', async () => {
        const mine = await addPlayer('Mój', '1');
        await addPlayer('Wolny');
        await click('join', member('1', 'Wolny'));
        expect(await accountOf('1')).toEqual({ playerId: mine });
        expect(await all('SELECT * FROM discord_accounts')).toHaveLength(1);
    });

    it('leave never creates a player or a link', async () => {
        await addPlayer('Wolny');
        await click('leave', member('1', 'Wolny'));
        await click('leave', member('2', 'Nikt'));
        expect(await all('SELECT * FROM discord_accounts')).toEqual([]);
        expect(await all('SELECT name FROM players')).toEqual([{ name: 'Wolny' }]);
    });

    it('two accounts with the same new nick at once: one player, one link', async () => {
        await Promise.all([click('join', member('1', 'Bliźniak')), click('join', member('2', 'Bliźniak'))]);
        const players = await all<{ id: number }>('SELECT id FROM players');
        expect(players).toHaveLength(1);
        expect(await all('SELECT * FROM player_rankings')).toHaveLength(1);
        const links = await all<{ playerId: number | null }>('SELECT playerId FROM discord_accounts ORDER BY playerId');
        expect(links).toEqual([{ playerId: null }, { playerId: players[0].id }]);
        expect(await roster()).toEqual(['Bliźniak']);
    });

    it('one account double-clicking with a new nick: one player, one ranking row', async () => {
        await Promise.all([click('join', member('1', 'Szybki')), click('join', member('1', 'Szybki')), click('join', member('1', 'Szybki'))]);
        expect(await all('SELECT * FROM players')).toHaveLength(1);
        expect(await all('SELECT * FROM player_rankings')).toHaveLength(1);
        expect(await roster()).toEqual(['Szybki']);
    });
});

describe('closeSignups step', () => {
    function fakeChannel(messages: ChannelMessage[]) {
        const edits: Array<{ id: string; message: SignupMessage }> = [];
        const rest = {
            listMessages: async () => messages,
            editMessage: async (_channel: string, id: string, message: SignupMessage) => {
                edits.push({ id, message });
                const target = messages.find((m) => m.id === id)!;
                target.components = message.components as ChannelMessage['components'];
            },
        } as unknown as SignupRest;
        return { rest, edits };
    }

    const signupMessage = (id: string, date: string, authorId = 'app'): ChannelMessage => ({
        id,
        timestamp: new Date().toISOString(),
        author: { id: authorId, bot: true },
        components: [{ components: [{ custom_id: signupCustomId('join', date) }, { custom_id: signupCustomId('leave', date) }] }],
    });

    it('edits only the bot message for that date, with the list and disabled buttons, once', async () => {
        await click('join', member('1', 'Ala'));
        const { rest, edits } = fakeChannel([
            signupMessage('other-date', '2029-12-26'),
            signupMessage('mine', DATE),
            signupMessage('other-app', DATE, 'staging-app'),
        ]);

        expect(await closeSignupMessages(env, DATE, rest)).toBe(1);
        expect(edits).toHaveLength(1);
        expect(edits[0].id).toBe('mine');
        expect(edits[0].message.content).toContain('1. Ala');
        expect(edits[0].message.content).toMatch(/\*\*Zapisy zamknięte\*\*$/);
        const buttons = (edits[0].message.components[0] as { components: Array<{ disabled: boolean }> }).components;
        expect(buttons.every((b) => b.disabled)).toBe(true);

        // The next tick in the same hour finds the buttons disabled and does nothing.
        expect(await closeSignupMessages(env, DATE, rest)).toBe(0);
    });
});
