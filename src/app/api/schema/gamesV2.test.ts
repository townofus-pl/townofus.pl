import { V2ActionSchema, V2GamePayloadSchema } from './gamesV2';

const performer = { playerId: 1, role: 'Sheriff' };
const target = { playerId: 2, role: 'Impostor' };
const action = (over: Record<string, unknown>) => ({
    type: 'kill',
    pointsChange: 2,
    timestampMs: 1234,
    performer,
    target,
    isCorrect: true,
    ...over,
});

describe('V2ActionSchema — the isCorrect rule', () => {
    it.each(['kill', 'protect', 'revive', 'knight', 'vote'])('requires a verdict on %s', (type) => {
        expect(V2ActionSchema.safeParse(action({ type, isCorrect: null })).success).toBe(true);
        const { isCorrect, ...without } = action({ type });
        expect(V2ActionSchema.safeParse(without).success).toBe(false);
    });

    it('lets swap carry a verdict or omit it — those are different facts', () => {
        expect(V2ActionSchema.safeParse(action({ type: 'swap', isCorrect: false })).success).toBe(true);
        const { isCorrect, ...without } = action({ type: 'swap' });
        expect(V2ActionSchema.safeParse(without).success).toBe(true);
    });

    it('rejects a verdict on a type where correctness is meaningless', () => {
        expect(V2ActionSchema.safeParse(action({ type: 'vent_use' })).success).toBe(false);
        const { isCorrect, ...without } = action({ type: 'vent_use' });
        expect(V2ActionSchema.safeParse(without).success).toBe(true);
    });

    it('keeps null and absent distinguishable after parsing', () => {
        const parsed = V2ActionSchema.parse(action({ isCorrect: null }));
        expect(parsed.isCorrect).toBeNull();
        const { isCorrect, ...without } = action({ type: 'swap' });
        expect(V2ActionSchema.parse(without)).not.toHaveProperty('isCorrect');
    });

    it('rejects an unknown key rather than dropping it', () => {
        expect(V2ActionSchema.safeParse(action({ subtype: 'guess' })).success).toBe(false);
    });
});

describe('V2GamePayloadSchema', () => {
    const payload = {
        schemaVersion: '2.0.0',
        modVersion: '1.0.0+910decf',
        // C#'s ToString("o") emits seven fractional digits.
        gameStart: '2026-09-06T18:05:12.3456789Z',
        gameEnd: '2026-09-06T18:21:40.0000000Z',
        mapName: 'Polus',
        playerCount: 2,
        maxTasks: 9,
        abnormalEnd: false,
        winningFaction: 'Juggernaut Win',
        players: {
            ziomson: {
                name: 'ziomson',
                playerId: 1,
                friendCode: null,
                hashedProductUserId: null,
                roleHistory: ['Sheriff'],
                imitatorRoles: [],
                modifiersHistory: [],
                win: true,
                disconnected: false,
            },
        },
        actions: [action({})],
        meetings: [
            {
                meetingNumber: 1,
                timestampMs: 5000,
                deathsSinceLastMeeting: [],
                votes: { ziomson: ['svzki'] },
                skipVotes: [],
                noVotes: [],
                blackmailedPlayers: [],
                jailedPlayers: [],
                swappedPlayers: [],
                wasTie: false,
                wasBlessed: false,
                exiledPlayer: null,
            },
        ],
    };

    it('accepts a payload shaped like the mod writes one', () => {
        const result = V2GamePayloadSchema.safeParse(payload);
        expect(result.success).toBe(true);
    });

    it('accepts a null target — a self-targeting or untargeted action', () => {
        expect(
            V2GamePayloadSchema.safeParse({ ...payload, actions: [action({ target: null })] }).success,
        ).toBe(true);
    });

    it('rejects a schemaVersion it was not written against', () => {
        expect(V2GamePayloadSchema.safeParse({ ...payload, schemaVersion: '2.1.0' }).success).toBe(false);
    });
});
