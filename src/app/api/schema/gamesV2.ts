/**
 * v2 ingest payload — a faithful mirror of the mod's `game_data.schema.json` (schemaVersion
 * `2.0.0`), which is the contract. When the two disagree, the mod's file wins: it is generated
 * from the type that actually serialises the match.
 *
 * Source: `dramaafera-stats-mod/DramaAferaStats.Core/Export/game_data.schema.json`.
 *
 * Everything is `.strict()` because the mod's schema sets `additionalProperties: false`
 * throughout. An unknown key means the mod moved and we did not — a loud rejection is the signal
 * that this file needs updating, which is the same reasoning the role allow-list uses (#295).
 */
import { z } from 'zod';

/** In-match player id. Joins `actions[*].performer.playerId` to a key in `players`. */
const PlayerIdSchema = z.number().int().min(0).max(255);

export const V2PlayerSchema = z
    .object({
        name: z.string().min(1),
        playerId: PlayerIdSchema,
        friendCode: z.string().nullish(),
        hashedProductUserId: z.string().nullish(),
        // Includes mid-match conversions and ghost roles. An Imitator stays ["Imitator"]; its
        // copies live in imitatorRoles. A revive re-enters, e.g. ["Seer","CrewmateGhost","Seer"].
        roleHistory: z.array(z.string()),
        imitatorRoles: z.array(z.string()),
        modifiersHistory: z.array(z.string()),
        win: z.boolean(),
        disconnected: z.boolean(),
    })
    .strict();

const V2PerformerSchema = z
    .object({
        playerId: PlayerIdSchema,
        role: z.string().min(1), // role held at the moment of the action
        imitatedRole: z.string().optional(), // present only while an Imitator wears a copy
    })
    .strict();

const V2TargetSchema = z
    .object({
        playerId: PlayerIdSchema,
        role: z.string(),
    })
    .strict();

/**
 * Locked on mod #22. `kill` vs `death` is load-bearing, not cosmetic: counters bucket on this
 * field, so an unscored mechanical death emitted as `kill` would inflate a kill count.
 */
export const V2_ACTION_TYPES = [
    'role_assigned', 'kill', 'death', 'protect', 'revive', 'swap', 'janitor_clean',
    'task_completed', 'round_survived', 'win', 'role_changed', 'vote', 'knight', 'douse',
    'infect', 'bite', 'modifier_gained', 'modifier_lost', 'time_rewind', 'body_reported',
    'emergency_button', 'ability_used', 'vent_use', 'sabotage_started', 'sabotage_fixed',
    'disconnect',
] as const;

/** The five types where correctness is always a real question, so a verdict is mandatory. */
const CORRECTNESS_REQUIRED = new Set<string>(['kill', 'protect', 'revive', 'knight', 'vote']);
/** `swap` may carry a verdict; nobody outside these six may carry one at all. */
const CORRECTNESS_ALLOWED = new Set<string>([...CORRECTNESS_REQUIRED, 'swap']);

export const V2ActionSchema = z
    .object({
        type: z.enum(V2_ACTION_TYPES),
        pointsChange: z.number(), // C# float — expect 0.30000001. Sum wide, never equality-compare.
        timestampMs: z.number().int().min(0), // since intro end; the only ordering authority (#63)
        performer: V2PerformerSchema,
        target: V2TargetSchema.nullable(),
        target2: V2TargetSchema.optional(), // swap only: the Swapper's second target

        // Three-valued where present. See the superRefine below for which types may carry it.
        isCorrect: z.boolean().nullish(),

        isGuess: z.boolean().optional(), // kill only
        causeOfDeath: z.string().optional(), // kill/death only; raw TOU-Mira key, locale-independent
        modifier: z.string().optional(), // modifier_gained / modifier_lost
        system: z.string().optional(), // sabotage_started / sabotage_fixed; SystemTypes enum name
        entryVent: z.number().int().optional(), // vent_use; ids are per-map, resolve against mapName
        exitVent: z.number().int().optional(), // vent_use; absent for a trip that never ended
        ability: z.string().optional(), // ability_used; open vocabulary — never enum-constrain it
        taskType: z.string().optional(), // task_completed; TaskTypes enum name
        room: z.string().optional(), // task_completed; absent for a task with no fixed location
        platter: z.enum(['Empty', 'Salmon', 'Cake', 'Burger', 'Turkey']).optional(), // ChefServe only
    })
    .strict()
    .superRefine((action, ctx) => {
        // `undefined` and `null` are different facts here and must not collapse. On `swap`, an
        // absent field means the rule declined to score; a present null means the mod could not
        // classify. Anywhere else a verdict is meaningless and its presence is a contract breach.
        const hasVerdict = action.isCorrect !== undefined;

        if (CORRECTNESS_REQUIRED.has(action.type) && !hasVerdict) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['isCorrect'],
                message: `isCorrect is required on "${action.type}"`,
            });
        }

        if (hasVerdict && !CORRECTNESS_ALLOWED.has(action.type)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['isCorrect'],
                message: `isCorrect must be absent on "${action.type}"`,
            });
        }
    });

export const V2MeetingSchema = z
    .object({
        meetingNumber: z.number().int().min(1),
        timestampMs: z.number().int().min(0),
        endTimestampMs: z.number().int().min(0).optional(),
        deathsSinceLastMeeting: z.array(z.string()),
        // voterName -> [targetName]. The votes as originally cast, before any role could rewrite
        // them. A revealed Mayor appears with three entries because the game really casts three.
        votes: z.record(z.string(), z.array(z.string())),
        skipVotes: z.array(z.string()),
        noVotes: z.array(z.string()),
        blackmailedPlayers: z.array(z.string()),
        jailedPlayers: z.array(z.string()),
        swappedPlayers: z.array(z.string()).max(2), // at most one swap per meeting takes effect
        wasTie: z.boolean(),
        wasBlessed: z.boolean(),
        exiledPlayer: z.string().nullable(),
    })
    .strict();

export const V2GamePayloadSchema = z
    .object({
        $schema: z.string().optional(), // present in on-disk captures, absent over the wire
        schemaVersion: z.literal('2.0.0'),
        // The build that scored this match, e.g. "1.0.0+910decf…". Carries the git commit, so it
        // names the exact points table — scoring lives in the mod (#285).
        modVersion: z.string().min(1),
        gameStart: z.string().datetime({ offset: true }),
        gameEnd: z.string().datetime({ offset: true }),
        mapName: z.string().min(1),
        playerCount: z.number().int().min(1),
        maxTasks: z.number().int().min(0),
        abnormalEnd: z.boolean(),
        winningFaction: z.string(), // TOU-Mira's own result, colour markup stripped
        // Keyed by display name, while actions key by playerId — the two join through
        // `players[name].playerId`, not through the record key.
        players: z.record(z.string(), V2PlayerSchema),
        actions: z.array(V2ActionSchema),
        meetings: z.array(V2MeetingSchema),
    })
    .strict();

export type V2GamePayload = z.infer<typeof V2GamePayloadSchema>;
export type V2Player = z.infer<typeof V2PlayerSchema>;
export type V2Action = z.infer<typeof V2ActionSchema>;
export type V2Meeting = z.infer<typeof V2MeetingSchema>;
export type V2ActionType = (typeof V2_ACTION_TYPES)[number];
