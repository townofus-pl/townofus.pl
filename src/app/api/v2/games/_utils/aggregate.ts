/**
 * Turns a v2 payload's `actions[]` into the per-player counters `game_player_statistics` holds.
 *
 * `docs/v2-role-counter-mapping.md` is the spec; this file is that table as code. Pure — no
 * database, no Prisma, no `getCloudflareContext`. #305 does the writing.
 *
 * Ground rule, from #285: **the mod scores, the server sums.** `totalPoints` is the plain sum of
 * every action's `pointsChange`. No win bonus is added (the `win` action already carries it) and
 * the disconnect clamp arrives already applied. The counters are for display only — the ranking
 * reads `totalPoints` alone.
 */
import { isKnownRole, normalizeRoleName, FIRST_MIRA_SEASON } from '@/app/dramaafera/_utils/gameUtils';
import type { V2Action, V2GamePayload } from '@/app/api/schema/gamesV2';

/** The 22 numeric counters on `game_player_statistics`, frozen at this set (#295). */
export interface CounterSet {
    initialRolePoints: number;
    correctKills: number;
    incorrectKills: number;
    correctProsecutes: number;
    incorrectProsecutes: number;
    correctGuesses: number;
    incorrectGuesses: number;
    correctDeputyShoots: number;
    incorrectDeputyShoots: number;
    correctJailorExecutes: number;
    incorrectJailorExecutes: number;
    correctProtects: number;
    incorrectProtects: number;
    correctWardenFortifies: number;
    incorrectWardenFortifies: number;
    janitorCleans: number;
    completedTasks: number;
    survivedRounds: number;
    correctAltruistRevives: number;
    incorrectAltruistRevives: number;
    correctSwaps: number;
    incorrectSwaps: number;
}

export interface AggregatedPlayer extends CounterSet {
    name: string;
    playerId: number;
    friendCode: string | null;
    hashedProductUserId: string | null;
    roleHistory: string[];
    imitatorRoles: string[];
    modifiers: string[];
    /** From `players[*]`, never from the presence of a `win` / `disconnect` action. */
    win: boolean;
    disconnected: boolean;
    totalPoints: number;
}

export class PayloadRejected extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'PayloadRejected';
    }
}

function emptyCounters(): CounterSet {
    return {
        initialRolePoints: 0,
        correctKills: 0, incorrectKills: 0,
        correctProsecutes: 0, incorrectProsecutes: 0,
        correctGuesses: 0, incorrectGuesses: 0,
        correctDeputyShoots: 0, incorrectDeputyShoots: 0,
        correctJailorExecutes: 0, incorrectJailorExecutes: 0,
        correctProtects: 0, incorrectProtects: 0,
        correctWardenFortifies: 0, incorrectWardenFortifies: 0,
        janitorCleans: 0, completedTasks: 0, survivedRounds: 0,
        correctAltruistRevives: 0, incorrectAltruistRevives: 0,
        correctSwaps: 0, incorrectSwaps: 0,
    };
}

type Pair = { correct: keyof CounterSet; incorrect: keyof CounterSet };
type Flat = keyof CounterSet;

/**
 * Closed role sets, checked before bucketing. Only the abilities no modifier can grant appear
 * here.
 *
 * `kill` is deliberately absent: Crewpostor grants a kill to any Crewmate role and Double Shot
 * grants a guess to any role at all, so any role-set for `kill` would reject legitimate games.
 * The unknown-role check below still covers the case this table exists for — a role TOU-Mira
 * added that we have not seen.
 *
 * Entries are registry names, and the performer is resolved to one before it is looked up: the
 * mod sends `ICustomRole.IdPart` since mod #83, which is `TimeLord`, not `Time Lord`.
 */
const CLOSED_ROLE_SETS: Record<string, readonly string[]> = {
    protect: ['Medic', 'Mirrorcaster', 'Oracle', 'Warden'],
    knight: ['Monarch'],
    revive: ['Altruist', 'Time Lord'],
    swap: ['Swapper'],
    janitor_clean: ['Janitor'],
};

/**
 * A death marker rather than a role someone played — the same test as the mod's
 * `RoleHistoryView.IsDeathMarker`. Earlier builds appended one to `imitatorRoles` when the
 * Imitator died, so `["Sheriff","CrewmateGhost"]` reached the database for a single copy.
 */
export function isDeathMarker(role: string): boolean {
    return role.endsWith('Ghost') || role.endsWith('Afterlife');
}

/**
 * Which counter an action feeds, from `type` + the performer's role at the time.
 *
 * `role` is the registry name, never the raw payload string: comparing the raw string is how
 * `TimeLord` came to be rejected against a literal `Time Lord`.
 *
 * Returns `null` for the types stored in `game_actions` for the timeline and deliberately not
 * aggregated (`death`, `vote`, `vent_use`, `ability_used`, `win`, `disconnect`, …).
 */
function bucketFor(action: V2Action, role: string): Pair | { flat: Flat } | null {
    switch (action.type) {
        case 'kill':
            // A guess first: Double Shot can put a guess in any role's hands, so the flag beats
            // the role. A self-targeting misguess is still the guesser's kill, scored as incorrect.
            if (action.isGuess) return { correct: 'correctGuesses', incorrect: 'incorrectGuesses' };
            if (role === 'Deputy') return { correct: 'correctDeputyShoots', incorrect: 'incorrectDeputyShoots' };
            if (role === 'Jailor') return { correct: 'correctJailorExecutes', incorrect: 'incorrectJailorExecutes' };
            if (role === 'Prosecutor') return { correct: 'correctProsecutes', incorrect: 'incorrectProsecutes' };
            return { correct: 'correctKills', incorrect: 'incorrectKills' };

        case 'protect':
            return role === 'Warden'
                ? { correct: 'correctWardenFortifies', incorrect: 'incorrectWardenFortifies' }
                : { correct: 'correctProtects', incorrect: 'incorrectProtects' };

        // The Monarch's knighting shares the protect counters — same shape of act, same column.
        case 'knight':
            return { correct: 'correctProtects', incorrect: 'incorrectProtects' };

        case 'revive':
            return { correct: 'correctAltruistRevives', incorrect: 'incorrectAltruistRevives' };

        case 'swap':
            return { correct: 'correctSwaps', incorrect: 'incorrectSwaps' };

        case 'janitor_clean':
            return { flat: 'janitorCleans' };
        case 'task_completed':
            return { flat: 'completedTasks' };
        case 'round_survived':
            return { flat: 'survivedRounds' };

        default:
            return null;
    }
}

/**
 * Sums a payload into one row per player.
 *
 * @throws {PayloadRejected} on an unknown role, a role that cannot perform the action, or an
 * action whose performer is not in `players`. Rejecting is the point: TOU-Mira is never
 * auto-updated, so a surprise here means a deliberate version bump moved something and this file
 * needs to follow — not that a game should be silently mis-scored.
 */
export function aggregatePayload(
    payload: V2GamePayload,
    season: number = FIRST_MIRA_SEASON,
): AggregatedPlayer[] {
    const byPlayerId = new Map<number, AggregatedPlayer>();

    const requireKnownRole = (roleName: string, where: string): void => {
        if (!isKnownRole(roleName, season)) {
            throw new PayloadRejected(
                `Unknown role "${roleName}" (${where}). Add it to src/mira/roles and re-run ` +
                    `npm run db:generate, or check the mod version that produced this payload.`,
            );
        }
    };

    for (const player of Object.values(payload.players)) {
        // Copies only: a death marker here is the Imitator dying, which roleHistory already says.
        const imitatorRoles = player.imitatorRoles.filter((r) => !isDeathMarker(r));

        player.roleHistory.forEach((r) => requireKnownRole(r, `${player.name} roleHistory`));
        imitatorRoles.forEach((r) => requireKnownRole(r, `${player.name} imitatorRoles`));

        byPlayerId.set(player.playerId, {
            ...emptyCounters(),
            name: player.name,
            playerId: player.playerId,
            friendCode: player.friendCode ?? null,
            hashedProductUserId: player.hashedProductUserId ?? null,
            roleHistory: player.roleHistory,
            imitatorRoles,
            modifiers: player.modifiersHistory,
            win: player.win,
            disconnected: player.disconnected,
            totalPoints: 0,
        });
    }

    for (const action of payload.actions) {
        const actor = byPlayerId.get(action.performer.playerId);
        if (!actor) {
            throw new PayloadRejected(
                `Action "${action.type}" at ${action.timestampMs}ms names playerId ` +
                    `${action.performer.playerId}, who is not in players[].`,
            );
        }

        requireKnownRole(action.performer.role, `${action.type} performer`);
        if (action.target) requireKnownRole(action.target.role, `${action.type} target`);
        if (action.performer.imitatedRole) {
            requireKnownRole(action.performer.imitatedRole, `${action.type} imitatedRole`);
        }

        // Known by now, so this is the registry's spelling — every role comparison below uses it.
        const role = normalizeRoleName(action.performer.role, season);

        const allowed = CLOSED_ROLE_SETS[action.type];
        if (allowed && !allowed.includes(role)) {
            throw new PayloadRejected(
                `"${action.performer.role}" cannot perform "${action.type}" ` +
                    `(expected one of ${allowed.join(', ')}). If TOU-Mira granted it, update ` +
                    `CLOSED_ROLE_SETS in aggregate.ts and docs/v2-role-counter-mapping.md.`,
            );
        }

        // The mod scores; we only add up. Every action contributes, including the ones that feed
        // no counter — `win` carries the bonus and `disconnect` carries the clamp.
        actor.totalPoints += action.pointsChange;

        // Exactly once per player, and it carries its own points rather than a count.
        if (action.type === 'role_assigned') {
            actor.initialRolePoints = action.pointsChange;
            continue;
        }

        const bucket = bucketFor(action, role);
        if (!bucket) continue;

        if ('flat' in bucket) {
            actor[bucket.flat] += 1;
            continue;
        }

        // Three-valued, and `undefined` is a fourth case that must not collapse into `null`: on
        // `swap` an absent verdict means the rule declined to score, a present null means the mod
        // could not classify. Both feed neither counter, but they are different facts (mod #67).
        if (action.isCorrect === true) actor[bucket.correct] += 1;
        else if (action.isCorrect === false) actor[bucket.incorrect] += 1;
    }

    return [...byPlayerId.values()];
}
