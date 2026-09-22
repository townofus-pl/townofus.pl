import { aggregatePayload, PayloadRejected } from './aggregate';
import type { V2Action, V2GamePayload, V2Player } from '@/app/api/schema/gamesV2';

const player = (over: Partial<V2Player> & Pick<V2Player, 'name' | 'playerId'>): V2Player => ({
    friendCode: null,
    hashedProductUserId: null,
    roleHistory: ['Sheriff'],
    imitatorRoles: [],
    modifiersHistory: [],
    win: false,
    disconnected: false,
    ...over,
});

let clock = 0;
const act = (over: Partial<V2Action> & Pick<V2Action, 'type'>): V2Action =>
    ({
        pointsChange: 0,
        timestampMs: (clock += 100),
        performer: { playerId: 1, role: 'Sheriff' },
        target: { playerId: 2, role: 'Impostor' },
        ...over,
    }) as V2Action;

const payloadOf = (players: V2Player[], actions: V2Action[]): V2GamePayload =>
    ({
        schemaVersion: '2.0.0',
        modVersion: '1.0.0+910decf',
        gameStart: '2026-09-06T18:05:12.3456789Z',
        gameEnd: '2026-09-06T18:21:40.0000000Z',
        mapName: 'Polus',
        playerCount: players.length,
        maxTasks: 9,
        abnormalEnd: false,
        winningFaction: 'Crewmate Win',
        players: Object.fromEntries(players.map((p) => [p.name, p])),
        actions,
        meetings: [],
    }) as V2GamePayload;

const one = (players: V2Player[], actions: V2Action[]) => aggregatePayload(payloadOf(players, actions))[0];

const sheriff = player({ name: 'ziomson', playerId: 1 });
const victim = player({ name: 'svzki', playerId: 2, roleHistory: ['Bomber'] });

describe('totalPoints — the mod scores, the server sums', () => {
    it('is the plain sum of every pointsChange, counter-bearing or not', () => {
        const row = one(
            [sheriff, victim],
            [
                act({ type: 'role_assigned', pointsChange: 3, target: null }),
                act({ type: 'kill', pointsChange: 2, isCorrect: true }),
                act({ type: 'vent_use', pointsChange: 0, target: null }),
                act({ type: 'win', pointsChange: 5, target: null }),
            ],
        );
        expect(row.totalPoints).toBe(10);
    });

    it('adds no win bonus of its own — the win action already carries it', () => {
        const row = one([sheriff, victim], [act({ type: 'win', pointsChange: 5, target: null })]);
        expect(row.totalPoints).toBe(5);
    });

    it('takes the disconnect clamp as it arrives, already applied and negative', () => {
        const row = one(
            [sheriff, victim],
            [
                act({ type: 'kill', pointsChange: 2, isCorrect: true }),
                act({ type: 'disconnect', pointsChange: -7.5, target: null }),
            ],
        );
        expect(row.totalPoints).toBeCloseTo(-5.5, 6);
    });

    it('reads win and disconnected from players[], not from action presence', () => {
        const row = one([player({ ...sheriff, win: true, disconnected: true }), victim], []);
        expect(row.win).toBe(true);
        expect(row.disconnected).toBe(true);
    });
});

describe('counter routing', () => {
    const killBy = (role: string, over: Partial<V2Action> = {}) =>
        one(
            [player({ ...sheriff, roleHistory: [role] }), victim],
            [act({ type: 'kill', isCorrect: true, performer: { playerId: 1, role }, ...over })],
        );

    it('splits kills by the performer role', () => {
        expect(killBy('Deputy').correctDeputyShoots).toBe(1);
        expect(killBy('Jailor').correctJailorExecutes).toBe(1);
        expect(killBy('Prosecutor').correctProsecutes).toBe(1);
        expect(killBy('Sheriff').correctKills).toBe(1);
    });

    it('lets isGuess beat the role, because Double Shot can reach any role', () => {
        const row = killBy('Deputy', { isGuess: true });
        expect(row.correctGuesses).toBe(1);
        expect(row.correctDeputyShoots).toBe(0);
    });

    it('sends Warden to fortifies and every other protector to protects', () => {
        const warden = one(
            [player({ ...sheriff, roleHistory: ['Warden'] }), victim],
            [act({ type: 'protect', isCorrect: true, performer: { playerId: 1, role: 'Warden' } })],
        );
        expect(warden.correctWardenFortifies).toBe(1);
        expect(warden.correctProtects).toBe(0);

        const oracle = one(
            [player({ ...sheriff, roleHistory: ['Oracle'] }), victim],
            [act({ type: 'protect', isCorrect: false, performer: { playerId: 1, role: 'Oracle' } })],
        );
        expect(oracle.incorrectProtects).toBe(1);
    });

    it("shares the protect counters with the Monarch's knight", () => {
        const row = one(
            [player({ ...sheriff, roleHistory: ['Monarch'] }), victim],
            [act({ type: 'knight', isCorrect: true, performer: { playerId: 1, role: 'Monarch' } })],
        );
        expect(row.correctProtects).toBe(1);
    });

    it('counts the flat types once each and ignores their verdictless-ness', () => {
        const row = one(
            [player({ ...sheriff, roleHistory: ['Janitor'] }), victim],
            [
                act({ type: 'janitor_clean', performer: { playerId: 1, role: 'Janitor' } }),
                act({ type: 'task_completed', performer: { playerId: 1, role: 'Janitor' }, target: null }),
                act({ type: 'round_survived', performer: { playerId: 1, role: 'Janitor' }, target: null }),
                act({ type: 'round_survived', performer: { playerId: 1, role: 'Janitor' }, target: null }),
            ],
        );
        expect(row.janitorCleans).toBe(1);
        expect(row.completedTasks).toBe(1);
        expect(row.survivedRounds).toBe(2);
    });

    it('takes initialRolePoints from role_assigned as points, not as a count', () => {
        const row = one(
            [sheriff, victim],
            [act({ type: 'role_assigned', pointsChange: 3, target: null })],
        );
        expect(row.initialRolePoints).toBe(3);
    });

    it('feeds no counter for a timeline-only type', () => {
        const row = one(
            [sheriff, victim],
            [act({ type: 'death', pointsChange: 0, causeOfDeath: 'Heartbreak' })],
        );
        expect(row.correctKills).toBe(0);
        expect(row.incorrectKills).toBe(0);
    });
});

describe('isCorrect is three-valued, and absent is a fourth case', () => {
    it('sends null to neither counter', () => {
        const row = one([sheriff, victim], [act({ type: 'kill', isCorrect: null })]);
        expect(row.correctKills).toBe(0);
        expect(row.incorrectKills).toBe(0);
    });

    it('sends an absent verdict on swap to neither counter', () => {
        const row = one(
            [player({ ...sheriff, roleHistory: ['Swapper'] }), victim],
            [act({ type: 'swap', performer: { playerId: 1, role: 'Swapper' } })],
        );
        expect(row.correctSwaps).toBe(0);
        expect(row.incorrectSwaps).toBe(0);
    });
});

describe('rejection', () => {
    it('rejects a role in neither registry', () => {
        expect(() =>
            aggregatePayload(payloadOf([player({ ...sheriff, roleHistory: ['Necromancer'] })], [])),
        ).toThrow(PayloadRejected);
    });

    it('accepts the five vanilla names that live in neither registry', () => {
        for (const role of ['Crewmate', 'Impostor', 'CrewmateGhost', 'ImpostorGhost', 'Neutral Ghost']) {
            expect(() =>
                aggregatePayload(payloadOf([player({ ...sheriff, roleHistory: [role] })], [])),
            ).not.toThrow();
        }
    });

    it('rejects a role that cannot perform the action', () => {
        expect(() =>
            aggregatePayload(
                payloadOf(
                    [sheriff, victim],
                    [act({ type: 'swap', isCorrect: true, performer: { playerId: 1, role: 'Sheriff' } })],
                ),
            ),
        ).toThrow(/cannot perform "swap"/);
    });

    it('rejects an action whose performer is not in players[]', () => {
        expect(() =>
            aggregatePayload(
                payloadOf([sheriff], [act({ type: 'kill', isCorrect: true, performer: { playerId: 9, role: 'Sheriff' } })]),
            ),
        ).toThrow(/not in players/);
    });
});
