import { loadConfigPair } from './page';

const MIRA = '[Roles]\nNum TownOfUs.Roles.Neutral.SpectreRole = 0\n';
const LEGACY = '<color=#B34D99FF>Aurial</color>\n30\n';

type Reply = { ok: boolean; body?: unknown; text?: string };

/** Routes each URL the loader may call to a canned reply, and records what it asked for. */
function stubFetch(routes: Record<string, Reply>) {
    const calls: string[] = [];
    global.fetch = (async (input: string) => {
        calls.push(input);
        const reply = routes[input];
        if (!reply) throw new Error(`unstubbed fetch: ${input}`);
        return {
            ok: reply.ok,
            json: async () => reply.body,
            text: async () => reply.text ?? '',
        };
    }) as unknown as typeof fetch;
    return calls;
}

const api = (current: string, old: string | null): Reply => ({
    ok: true,
    body: { success: true, data: { current, old } },
});

const SNAPSHOT = {
    '/settings/mira.cfg': { ok: true, text: `${MIRA}# snapshot current\n` },
    '/settings/mira_old.cfg': { ok: true, text: `${MIRA}# snapshot old\n` },
};

afterEach(() => {
    delete (global as { fetch?: unknown }).fetch;
});

describe('loadConfigPair', () => {
    it('uses the uploaded pair once both sides are TOU:Mira configs', async () => {
        const calls = stubFetch({
            '/api/dramaafera/settings': api(`${MIRA}# db current\n`, `${MIRA}# db old\n`),
            ...SNAPSHOT,
        });

        const pair = await loadConfigPair();

        expect(pair.current).toContain('db current');
        expect(pair.old).toContain('db old');
        expect(calls).toEqual(['/api/dramaafera/settings']); // never touched the snapshot
    });

    // The season-opening case: the first .cfg of a season leaves `old` as the previous era's
    // .txt, and diffing a config against that yields nothing. The committed pair is the
    // deliberate "what changed since last season".
    it('falls back to the snapshot while `old` is still a legacy .txt', async () => {
        stubFetch({
            '/api/dramaafera/settings': api(MIRA, LEGACY),
            ...SNAPSHOT,
        });

        const pair = await loadConfigPair();

        expect(pair.current).toContain('snapshot current');
        expect(pair.old).toContain('snapshot old');
    });

    it('falls back when there is no previous version at all', async () => {
        stubFetch({ '/api/dramaafera/settings': api(MIRA, null), ...SNAPSHOT });
        expect((await loadConfigPair()).current).toContain('snapshot current');
    });

    it('falls back when the settings API is unreachable', async () => {
        stubFetch({ '/api/dramaafera/settings': { ok: false }, ...SNAPSHOT });
        expect((await loadConfigPair()).current).toContain('snapshot current');
    });

    it('throws only when the snapshot is missing too', async () => {
        stubFetch({
            '/api/dramaafera/settings': { ok: false },
            '/settings/mira.cfg': { ok: false },
            '/settings/mira_old.cfg': { ok: false },
        });
        await expect(loadConfigPair()).rejects.toThrow('Brak plików cfg Mira');
    });
});
