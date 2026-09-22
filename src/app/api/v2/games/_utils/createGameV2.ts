/**
 * Persists a validated v2 payload. One atomic D1 `batch()` for every core write.
 *
 * v1's `createGame.ts` is ~100 sequential non-transactional writes, so a mid-loop failure leaves
 * a half-ingested game behind with no way to tell. Everything here goes in or nothing does.
 *
 * Auto-increment ids cannot be threaded between statements in a batch, so child rows resolve
 * their parent through a subquery on a unique key — `games.gameIdentifier`,
 * `game_player_statistics(gameId, playerId)`, `meetings(gameId, meetingNumber)`. That is why the
 * duplicate check is load-bearing: the subqueries assume exactly one match.
 */
import type { PrismaClient } from '@prisma/client';
import { batchStatements } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { calculateRankingForGame } from '@/app/api/_utils/rankingCalculator';
import { getSeasonForDate } from '@/app/dramaafera/_constants/seasons';
import { determineTeam } from '@/app/dramaafera/_utils/gameUtils';
import { Teams } from '@/constants/teams';
import type { V2Action, V2GamePayload } from '@/app/api/schema/gamesV2';
import { aggregatePayload, PayloadRejected, type AggregatedPlayer } from './aggregate';

export class IngestRejected extends Error {
    constructor(
        message: string,
        readonly status: 409 | 422,
    ) {
        super(message);
        this.name = 'IngestRejected';
    }
}

export interface CreateGameV2Result {
    gameId: number;
    gameIdentifier: string;
    playersCreated: number;
    actionsCreated: number;
    meetingsCreated: number;
    statementsExecuted: number;
    rankingCalculated: boolean;
    rankingError?: string;
}

/**
 * The 735 v1 games store Polish wall-clock time labelled `+00:00` — `20260916_2159` sits next to
 * `2026-09-16T21:59:26.000+00:00` for a game played at 21:59 in Poland. The v2 payload sends
 * genuine UTC from `DateTime.UtcNow`, which is two hours earlier in summer.
 *
 * Storing that raw would shift every v2 game two hours against its v1 neighbours and, for
 * anything played after 22:00 local, move it to the previous day — breaking `historia-gier/[date]`
 * grouping, the session summary and `extractDateFromGameId`. So we convert to Warsaw wall clock
 * and keep v1's convention rather than fixing the convention under 735 rows of history.
 */
function toWarsawWallClock(isoUtc: string): Date {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Warsaw',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    }).formatToParts(new Date(isoUtc));

    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)!.value;
    // `hour: '2-digit'` with hour12:false renders midnight as 24 in some ICU builds.
    const hour = get('hour') === '24' ? '00' : get('hour');
    return new Date(`${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}.000Z`);
}

/** The format Prisma's SQLite driver writes, so reads stay byte-identical to v1 rows. */
function toPrismaDateTime(date: Date): string {
    return date.toISOString().replace('Z', '+00:00');
}

function gameIdentifierFor(startTime: Date): string {
    const iso = startTime.toISOString();
    return `${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}_${iso.slice(11, 13)}${iso.slice(14, 16)}`;
}

function chunk<T>(items: readonly T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
    return out;
}

/** The sparse, type-specific fields, collapsed into one JSON column. See #286. */
function detailFor(action: V2Action): string | null {
    const detail: Record<string, unknown> = {};
    if (action.isGuess !== undefined) detail.isGuess = action.isGuess;
    if (action.causeOfDeath !== undefined) detail.causeOfDeath = action.causeOfDeath;
    if (action.modifier !== undefined) detail.modifier = action.modifier;
    if (action.system !== undefined) detail.system = action.system;
    if (action.entryVent !== undefined) detail.entryVent = action.entryVent;
    if (action.exitVent !== undefined) detail.exitVent = action.exitVent;
    if (action.ability !== undefined) detail.ability = action.ability;
    if (action.taskType !== undefined) detail.taskType = action.taskType;
    if (action.room !== undefined) detail.room = action.room;
    if (action.platter !== undefined) detail.platter = action.platter;
    if (action.performer.imitatedRole !== undefined) detail.imitatedRole = action.performer.imitatedRole;
    if (action.target2 !== undefined) detail.target2 = action.target2;
    return Object.keys(detail).length > 0 ? JSON.stringify(detail) : null;
}

/**
 * Resolves every payload player to a database id, creating and reconciling as it goes.
 *
 * The ladder (mod #11): hash match wins and renames in place · otherwise fall back to the name ·
 * a name held by someone with a *different* non-null hash is a collision and rejects · a name
 * with no hash yet gets one backfilled · an unseen name is created.
 */
async function resolvePlayers(
    prisma: PrismaClient,
    payload: V2GamePayload,
): Promise<Map<number, number>> {
    const players = Object.values(payload.players);
    const names = players.map((p) => p.name);
    const hashes = players.map((p) => p.hashedProductUserId).filter((h): h is string => !!h);

    const existing = await prisma.player.findMany({
        where: {
            OR: [{ name: { in: names } }, ...(hashes.length ? [{ hashedProductUserId: { in: hashes } }] : [])],
            ...withoutDeleted,
        },
        select: { id: true, name: true, hashedProductUserId: true },
    });

    const byHash = new Map(existing.filter((p) => p.hashedProductUserId).map((p) => [p.hashedProductUserId!, p]));
    const byName = new Map(existing.map((p) => [p.name, p]));

    // Two passes on purpose. A collision on the twelfth player must not leave the first eleven
    // created or renamed: the core writes are atomic, and a rejection that half-populates the
    // players table would undo that guarantee from outside the batch. Nothing below writes.
    type Plan =
        | { kind: 'rename'; id: number }
        | { kind: 'backfill'; id: number }
        | { kind: 'reuse'; id: number }
        | { kind: 'create' };

    const plans: Array<{ player: (typeof players)[number]; hash: string | null; plan: Plan }> = [];

    for (const player of players) {
        const hash = player.hashedProductUserId ?? null;
        const matchedByHash = hash ? byHash.get(hash) : undefined;

        if (matchedByHash) {
            if (matchedByHash.name === player.name) {
                plans.push({ player, hash, plan: { kind: 'reuse', id: matchedByHash.id } });
                continue;
            }
            const squatter = byName.get(player.name);
            if (squatter && squatter.id !== matchedByHash.id) {
                throw new IngestRejected(
                    `"${player.name}" is already held by player ${squatter.id}, but this payload's ` +
                        `hashedProductUserId belongs to player ${matchedByHash.id} ("${matchedByHash.name}"). ` +
                        `Two accounts cannot share a name — resolve it by hand.`,
                    422,
                );
            }
            // The account is the same person; the display name moved.
            plans.push({ player, hash, plan: { kind: 'rename', id: matchedByHash.id } });
            continue;
        }

        const matchedByName = byName.get(player.name);
        if (matchedByName) {
            if (hash && matchedByName.hashedProductUserId && matchedByName.hashedProductUserId !== hash) {
                throw new IngestRejected(
                    `"${player.name}" already belongs to a different account ` +
                        `(stored hash ${matchedByName.hashedProductUserId}, payload ${hash}).`,
                    422,
                );
            }
            plans.push({
                player,
                hash,
                plan: hash && !matchedByName.hashedProductUserId
                    ? { kind: 'backfill', id: matchedByName.id } // first sighting of this identity
                    : { kind: 'reuse', id: matchedByName.id },
            });
            continue;
        }

        plans.push({ player, hash, plan: { kind: 'create' } });
    }

    const dbIdByPlayerId = new Map<number, number>();

    for (const { player, hash, plan } of plans) {
        if (plan.kind === 'reuse') {
            dbIdByPlayerId.set(player.playerId, plan.id);
        } else if (plan.kind === 'rename') {
            await prisma.player.update({
                where: { id: plan.id },
                data: { name: player.name, friendCode: player.friendCode ?? undefined },
            });
            dbIdByPlayerId.set(player.playerId, plan.id);
        } else if (plan.kind === 'backfill') {
            await prisma.player.update({
                where: { id: plan.id },
                data: { hashedProductUserId: hash, friendCode: player.friendCode ?? undefined },
            });
            dbIdByPlayerId.set(player.playerId, plan.id);
        } else {
            const created = await prisma.player.create({
                data: { name: player.name, friendCode: player.friendCode ?? null, hashedProductUserId: hash },
                select: { id: true },
            });
            dbIdByPlayerId.set(player.playerId, created.id);
        }
    }

    return dbIdByPlayerId;
}

function winnerTeamOf(rows: AggregatedPlayer[], season: number): string {
    // Same priority as v1's createGame and calculateWinnerFromStats, so the API and the UI agree:
    // the FINAL role in roleHistory decides, so a Traitor wins with the team they ended on.
    const teams = rows
        .filter((r) => r.win)
        .map((r) => determineTeam(r.roleHistory, season, { strict: true }));

    if (teams.includes(Teams.Impostor)) return Teams.Impostor;
    if (teams.includes(Teams.Crewmate)) return Teams.Crewmate;
    return Teams.Neutral;
}

export async function createGameV2(
    prisma: PrismaClient,
    db: D1Database,
    payload: V2GamePayload,
): Promise<CreateGameV2Result> {
    if (payload.abnormalEnd) {
        throw new IngestRejected(
            'Payload is marked abnormalEnd — the match had no normal end, so its scoring is not trustworthy.',
            422,
        );
    }

    const startTime = toWarsawWallClock(payload.gameStart);
    const endTime = toWarsawWallClock(payload.gameEnd);
    const season = getSeasonForDate(startTime);
    const gameIdentifier = gameIdentifierFor(startTime);

    const duplicate = await prisma.game.findUnique({ where: { gameIdentifier }, select: { id: true } });
    if (duplicate) {
        // Core writes are one atomic batch, so a duplicate always means *already fully stored* —
        // never a partial ingest waiting to be completed.
        throw new IngestRejected(`Game ${gameIdentifier} already exists and is fully stored.`, 409);
    }

    let rows: AggregatedPlayer[];
    try {
        rows = aggregatePayload(payload, season);
    } catch (error) {
        if (error instanceof PayloadRejected) throw new IngestRejected(error.message, 422);
        throw error;
    }

    const winners = rows.filter((r) => r.win);
    if (winners.length === 0) {
        throw new IngestRejected('No player is marked as a winner.', 422);
    }
    if (winners.length === rows.length) {
        throw new IngestRejected('Every player is marked as a winner, which no win condition produces.', 422);
    }

    const dbIdByPlayerId = await resolvePlayers(prisma, payload);
    const dbIdByName = new Map(rows.map((r) => [r.name, dbIdByPlayerId.get(r.playerId)!]));

    const gid = `(SELECT "id" FROM "games" WHERE "gameIdentifier" = ?)`;
    const statsId = `(SELECT "id" FROM "game_player_statistics" WHERE "gameId" = ${gid} AND "playerId" = ?)`;
    const meetingId = `(SELECT "id" FROM "meetings" WHERE "gameId" = ${gid} AND "meetingNumber" = ?)`;

    const statements: D1PreparedStatement[] = [
        db
            .prepare(
                `INSERT INTO "games" ("gameIdentifier", "startTime", "endTime", "map", "maxTasks",
                    "winnerTeam", "winCondition", "season", "modVersion", "winningFaction",
                    "createdAt", "updatedAt")
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            )
            .bind(
                gameIdentifier,
                toPrismaDateTime(startTime),
                toPrismaDateTime(endTime),
                payload.mapName,
                payload.maxTasks,
                winnerTeamOf(rows, season),
                // winCondition gets the mod's own string too. It is the authoritative result —
                // deriving "Jester victory" server-side would mean reimplementing win-condition
                // priority (#286) — and it is the field the game-detail page already reads.
                payload.winningFaction,
                season,
                payload.modVersion,
                payload.winningFaction,
            ),
        // Lista Cweli for the day is a pre-session list; the first game of the day settles it.
        // v1 does this too — dropping it here would silently split the behaviour by era.
        db
            .prepare(
                `UPDATE "lista_cweli" SET "deletedAt" = CURRENT_TIMESTAMP
                 WHERE "season" = ? AND "deletedAt" IS NULL AND date("date") = ?`,
            )
            .bind(season, startTime.toISOString().slice(0, 10)),
    ];

    for (const row of rows) {
        statements.push(
            db
                .prepare(
                    `INSERT INTO "game_player_statistics" ("gameId", "playerId", "win", "disconnected",
                        "initialRolePoints", "correctKills", "incorrectKills", "correctProsecutes",
                        "incorrectProsecutes", "correctGuesses", "incorrectGuesses", "correctDeputyShoots",
                        "incorrectDeputyShoots", "correctJailorExecutes", "incorrectJailorExecutes",
                        "correctProtects", "incorrectProtects", "correctWardenFortifies",
                        "incorrectWardenFortifies", "janitorCleans", "completedTasks", "survivedRounds",
                        "correctAltruistRevives", "incorrectAltruistRevives", "correctSwaps",
                        "incorrectSwaps", "totalPoints", "imitatorRoles")
                     VALUES (${gid}, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                )
                .bind(
                    gameIdentifier,
                    dbIdByName.get(row.name)!,
                    row.win ? 1 : 0,
                    row.disconnected ? 1 : 0,
                    row.initialRolePoints,
                    row.correctKills, row.incorrectKills,
                    row.correctProsecutes, row.incorrectProsecutes,
                    row.correctGuesses, row.incorrectGuesses,
                    row.correctDeputyShoots, row.incorrectDeputyShoots,
                    row.correctJailorExecutes, row.incorrectJailorExecutes,
                    row.correctProtects, row.incorrectProtects,
                    row.correctWardenFortifies, row.incorrectWardenFortifies,
                    row.janitorCleans, row.completedTasks, row.survivedRounds,
                    row.correctAltruistRevives, row.incorrectAltruistRevives,
                    row.correctSwaps, row.incorrectSwaps,
                    row.totalPoints,
                    row.imitatorRoles.length > 0 ? JSON.stringify(row.imitatorRoles) : null,
                ),
        );
    }

    // 4 bound parameters per row; 20 rows keeps a statement at 80, under D1's ~98 cap.
    const roleRows = rows.flatMap((row) =>
        row.roleHistory.map((roleName, order) => [gameIdentifier, dbIdByName.get(row.name)!, roleName, order]),
    );
    for (const group of chunk(roleRows, 20)) {
        statements.push(
            db
                .prepare(
                    `INSERT INTO "player_roles" ("gamePlayerStatisticsId", "roleName", "order") VALUES ` +
                        group.map(() => `(${statsId}, ?, ?)`).join(', '),
                )
                .bind(...group.flat()),
        );
    }

    const modifierRows = rows.flatMap((row) =>
        row.modifiers.map((modifierName) => [gameIdentifier, dbIdByName.get(row.name)!, modifierName]),
    );
    for (const group of chunk(modifierRows, 30)) {
        statements.push(
            db
                .prepare(
                    `INSERT INTO "player_modifiers" ("gamePlayerStatisticsId", "modifierName") VALUES ` +
                        group.map(() => `(${statsId}, ?)`).join(', '),
                )
                .bind(...group.flat()),
        );
    }

    for (const meeting of payload.meetings) {
        statements.push(
            db
                .prepare(
                    `INSERT INTO "meetings" ("gameId", "meetingNumber", "deathsSinceLastMeeting",
                        "wasTie", "wasBlessed", "exiledPlayer")
                     VALUES (${gid}, ?, ?, ?, ?, ?)`,
                )
                .bind(
                    gameIdentifier,
                    meeting.meetingNumber,
                    JSON.stringify(meeting.deathsSinceLastMeeting),
                    meeting.wasTie ? 1 : 0,
                    meeting.wasBlessed ? 1 : 0,
                    meeting.exiledPlayer,
                ),
        );

        // The payload keys votes by voter; the table stores (target, voter). A revealed Mayor
        // legitimately appears three times, so duplicates here are data, not noise.
        const voteRows = Object.entries(meeting.votes).flatMap(([voter, targets]) =>
            targets
                .filter((target) => dbIdByName.has(target) && dbIdByName.has(voter))
                .map((target) => [
                    gameIdentifier, meeting.meetingNumber,
                    dbIdByName.get(target)!, dbIdByName.get(voter)!,
                ]),
        );
        for (const group of chunk(voteRows, 20)) {
            statements.push(
                db
                    .prepare(
                        `INSERT INTO "meeting_votes" ("meetingId", "targetId", "voterId") VALUES ` +
                            group.map(() => `(${meetingId}, ?, ?)`).join(', '),
                    )
                    .bind(...group.flat()),
            );
        }

        const rosterTables = [
            ['meeting_skip_votes', meeting.skipVotes],
            ['meeting_no_votes', meeting.noVotes],
            ['meeting_blackmailed_players', meeting.blackmailedPlayers],
            ['meeting_jailed_players', meeting.jailedPlayers],
        ] as const;

        for (const [table, roster] of rosterTables) {
            const memberRows = roster
                .filter((name) => dbIdByName.has(name))
                .map((name) => [gameIdentifier, meeting.meetingNumber, dbIdByName.get(name)!]);
            for (const group of chunk(memberRows, 30)) {
                statements.push(
                    db
                        .prepare(
                            `INSERT INTO "${table}" ("meetingId", "playerId") VALUES ` +
                                group.map(() => `(${meetingId}, ?)`).join(', '),
                        )
                        .bind(...group.flat()),
                );
            }
        }
    }

    // 10 bound parameters per row; 9 rows is 90, under D1's ~98 cap. ~39 statements for a
    // 346-action match, which is what #286 sized this against.
    const actionRows = payload.actions.map((action) => [
        gameIdentifier,
        action.type,
        action.timestampMs,
        action.pointsChange,
        dbIdByPlayerId.get(action.performer.playerId)!,
        action.performer.role,
        action.target ? (dbIdByPlayerId.get(action.target.playerId) ?? null) : null,
        action.target ? action.target.role : null,
        action.isCorrect === undefined || action.isCorrect === null ? null : action.isCorrect ? 1 : 0,
        detailFor(action),
    ]);
    for (const group of chunk(actionRows, 9)) {
        statements.push(
            db
                .prepare(
                    `INSERT INTO "game_actions" ("gameId", "type", "timestampMs", "pointsChange",
                        "performerId", "performerRole", "targetId", "targetRole", "isCorrect", "detail")
                     VALUES ` + group.map(() => `(${gid}, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).join(', '),
                )
                .bind(...group.flat()),
        );
    }

    await batchStatements(db, statements);

    const game = await prisma.game.findUniqueOrThrow({
        where: { gameIdentifier },
        select: { id: true },
    });

    // Ranking is a derived read of totalPoints and can be recomputed; a failure here must not
    // undo an ingested game. Same contract as v1.
    let rankingCalculated = false;
    let rankingError: string | undefined;
    try {
        await calculateRankingForGame(prisma, game.id);
        rankingCalculated = true;
    } catch (error) {
        rankingError = error instanceof Error ? error.message : 'Unknown ranking error';
        console.warn(`Failed to calculate ranking for ${gameIdentifier}:`, error);
    }

    return {
        gameId: game.id,
        gameIdentifier,
        playersCreated: rows.length,
        actionsCreated: payload.actions.length,
        meetingsCreated: payload.meetings.length,
        statementsExecuted: statements.length,
        rankingCalculated,
        rankingError,
    };
}
