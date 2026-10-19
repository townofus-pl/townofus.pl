// Creating the Emperor poll and the signup message, shared by the cron and `/ankieta`.
//
// Order, so two callers can never send two polls for one date:
//   1. One D1 batch inserts the `emperor_polls` row and its candidates. `date` is unique, and the
//      insert is skipped while any poll on this environment's channel is open. Only the caller
//      whose insert went through sends the poll.
//   2. POST the poll message (with a nonce), then save `discordMessageId`.
//   3. POST the signup message.
//
// Repair, by a later call that holds the lease on `updatedAt` (SEND_LEASE_MS since the last write):
//   - A row without `discordMessageId` whose close time has passed is closed, never sent late.
//   - A row without `discordMessageId`: if the bot's own poll is already in the channel (the
//     reply got lost, or the D1 write failed), adopt its ID. Otherwise send the poll again.
//   - The signup message for the target Wednesday is missing from the channel: send it.

import { getSeasonForDate } from '../../../../src/app/dramaafera/_constants/seasons';
import type { BotEnv } from '../env';
import { findSignupMessages } from '../signup/close';
import { renderSignupMessage } from '../signup/message';
import { type Candidate, type GameDay, isDayQuiet, loadGameDay, pickCandidates } from './candidates';
import { createDiscordRest, type DiscordRest } from './discordApi';
import { pollMessage } from './messages';
import { nextWednesday, parseDbTimestamp, pollClosesAt, pollDurationHours, toDbTimestamp } from './time';

/** How long a caller owns a row after its last write before another caller may repair it. */
export const SEND_LEASE_MS = 5 * 60 * 1000;

/** How far back the search for the bot's own poll reads the channel history. */
const OWN_POLL_PAGES = 3;
/** Clock slack between the Worker and Discord when comparing the row's `createdAt` to a message. */
const CLOCK_SLACK_MS = 60_000;

export type PollOutcome =
    | { kind: 'created'; date: string; signupSent: boolean }
    /** The poll was already there. `signupSent`: this call sent the missing signup message. */
    | { kind: 'exists'; date: string; signupSent: boolean }
    /** A row without a message, claimed by another caller in the last SEND_LEASE_MS. */
    | { kind: 'pending'; date: string }
    /** Another poll on this channel is still open. */
    | { kind: 'blocked'; date: string }
    | { kind: 'noGames'; date: string }
    | { kind: 'sendFailed'; date: string };

export interface PollContext {
    db: D1Database;
    discord: DiscordRest;
    env: Pick<
        BotEnv,
        'DISCORD_APPLICATION_ID' | 'DISCORD_CHANNEL_ID' | 'TEXT_POLL_QUESTION' | 'TEXT_SIGNUP' | 'TEXT_SIGNUP_CLOSED'
    >;
    now: number;
}

interface PollRow {
    id: number;
    date: string;
    question: string;
    closesAt: number;
    discordChannelId: string | null;
    discordMessageId: string | null;
    closedAt: number | null;
    createdAt: string;
}

const POLL_COLUMNS = `"id", "date", "question", "closesAt", "discordChannelId", "discordMessageId", "closedAt", "createdAt"`;

/** Creates the poll for `day`, or reports why not. Repairs an existing poll for that date. */
export async function ensurePoll(ctx: PollContext, day: GameDay): Promise<PollOutcome> {
    const { db, env, now } = ctx;
    const date = day.date;
    const candidates = pickCandidates(day.players);
    if (candidates.length === 0) return { kind: 'noGames', date };

    // A stale unsent row would block the open-poll check below forever.
    await closeStaleUnsentPolls(ctx);

    const stamp = toDbTimestamp(now);
    const values = candidates.map(() => '(?, ?)').join(', ');
    const [pollInsert] = await db.batch([
        db
            .prepare(
                `INSERT INTO "emperor_polls"
                    ("date", "season", "question", "closesAt", "discordChannelId", "createdAt", "updatedAt")
                 SELECT ?1, ?2, ?3, ?4, ?5, ?6, ?6
                 WHERE NOT EXISTS (
                     SELECT 1 FROM "emperor_polls"
                     WHERE "discordChannelId" = ?5 AND "closedAt" IS NULL AND "deletedAt" IS NULL)
                 ON CONFLICT ("date") DO NOTHING`,
            )
            .bind(
                date,
                getSeasonForDate(new Date(`${date}T00:00:00Z`)),
                env.TEXT_POLL_QUESTION,
                pollClosesAt(date),
                env.DISCORD_CHANNEL_ID,
                stamp,
            ),
        // Runs in the same transaction. Inserts only into a poll that has no candidates yet, so a
        // skipped poll insert above leaves an existing poll's list as it was.
        db
            .prepare(
                `INSERT INTO "emperor_poll_candidates"
                    ("pollId", "playerId", "nickname", "voteCount", "createdAt", "updatedAt")
                 SELECT p."id", v.column1, v.column2, 0, ?, ?
                 FROM "emperor_polls" p, (VALUES ${values}) v
                 WHERE p."date" = ?
                   AND NOT EXISTS (SELECT 1 FROM "emperor_poll_candidates" c WHERE c."pollId" = p."id")`,
            )
            .bind(stamp, stamp, ...candidates.flatMap((c) => [c.playerId, c.nickname]), date),
    ]);

    const row = await db.prepare(`SELECT ${POLL_COLUMNS} FROM "emperor_polls" WHERE "date" = ?`).bind(date).first<PollRow>();

    if (!row) return { kind: 'blocked', date };
    if (pollInsert.meta.changes === 1) return sendNewPoll(ctx, row);
    if (row.discordChannelId !== env.DISCORD_CHANNEL_ID || row.closedAt !== null) {
        return { kind: 'exists', date, signupSent: false };
    }
    return repairPoll(ctx, row);
}

/** Cron: closes stale unsent rows, then repairs every open unsent row on this channel. */
export async function resendUnsentPolls(ctx: PollContext): Promise<PollOutcome[]> {
    await closeStaleUnsentPolls(ctx);
    const { results } = await ctx.db
        .prepare(
            `SELECT ${POLL_COLUMNS} FROM "emperor_polls"
             WHERE "discordChannelId" = ? AND "discordMessageId" IS NULL
               AND "closedAt" IS NULL AND "deletedAt" IS NULL`,
        )
        .bind(ctx.env.DISCORD_CHANNEL_ID)
        .all<PollRow>();
    const outcomes: PollOutcome[] = [];
    for (const row of results) outcomes.push(await repairPoll(ctx, row));
    return outcomes;
}

/**
 * A row that never got its message and whose close time has passed. Sending it now would post a
 * poll that ends at once and signups for a session that already happened. Close it instead.
 */
async function closeStaleUnsentPolls(ctx: PollContext): Promise<void> {
    const stamp = toDbTimestamp(ctx.now);
    const result = await ctx.db
        .prepare(
            `UPDATE "emperor_polls" SET "closedAt" = ?, "updatedAt" = ?
             WHERE "discordChannelId" = ? AND "discordMessageId" IS NULL
               AND "closedAt" IS NULL AND "deletedAt" IS NULL AND "closesAt" <= ?`,
        )
        .bind(ctx.now, stamp, ctx.env.DISCORD_CHANNEL_ID, ctx.now)
        .run();
    if (result.meta.changes > 0) {
        console.warn(JSON.stringify({ event: 'stalePollClosed', count: result.meta.changes }));
    }
}

async function repairPoll(ctx: PollContext, row: PollRow): Promise<PollOutcome> {
    const { db, now } = ctx;
    // The insert and every claim write `updatedAt`. Only a caller that finds it older than the
    // lease may act, so two callers never repair the same row at once.
    const claim = await db
        .prepare(
            `UPDATE "emperor_polls" SET "updatedAt" = ?
             WHERE "id" = ? AND "closedAt" IS NULL AND "updatedAt" <= ?`,
        )
        .bind(toDbTimestamp(now), row.id, toDbTimestamp(now - SEND_LEASE_MS))
        .run();
    if (claim.meta.changes !== 1) {
        return row.discordMessageId === null
            ? { kind: 'pending', date: row.date }
            : { kind: 'exists', date: row.date, signupSent: false };
    }

    if (row.discordMessageId !== null) {
        return { kind: 'exists', date: row.date, signupSent: await ensureSignupMessage(ctx, row) };
    }

    const adopted = await findOwnPoll(ctx, parseDbTimestamp(row.createdAt) - CLOCK_SLACK_MS);
    if (adopted) {
        await saveMessageId(ctx, row.id, adopted);
        console.warn(JSON.stringify({ event: 'pollAdopted', date: row.date, messageId: adopted }));
    } else if (!(await postPoll(ctx, row))) {
        return { kind: 'sendFailed', date: row.date };
    }
    return { kind: 'created', date: row.date, signupSent: await ensureSignupMessage(ctx, row) };
}

async function sendNewPoll(ctx: PollContext, row: PollRow): Promise<PollOutcome> {
    if (!(await postPoll(ctx, row))) return { kind: 'sendFailed', date: row.date };
    return { kind: 'created', date: row.date, signupSent: await postSignupMessage(ctx, row) };
}

/** Sends the poll and saves its message ID. `false` when Discord refused it. */
async function postPoll(ctx: PollContext, row: PollRow): Promise<boolean> {
    const { db, discord, env, now } = ctx;
    const { results: candidates } = await db
        .prepare(
            `SELECT "playerId", "nickname" FROM "emperor_poll_candidates"
             WHERE "pollId" = ? AND "deletedAt" IS NULL ORDER BY "id"`,
        )
        .bind(row.id)
        .all<Candidate>();

    let messageId: string;
    try {
        const body = pollMessage(row.question, candidates, pollDurationHours(now, Number(row.closesAt)), `poll-${row.id}`);
        messageId = (await discord.createMessage(env.DISCORD_CHANNEL_ID, body)).id;
    } catch (error) {
        console.error(JSON.stringify({ event: 'pollSendFailed', date: row.date, error: String(error) }));
        return false;
    }
    await saveMessageId(ctx, row.id, messageId);
    return true;
}

async function saveMessageId(ctx: PollContext, pollId: number, messageId: string): Promise<void> {
    await ctx.db
        .prepare(`UPDATE "emperor_polls" SET "discordMessageId" = ?, "updatedAt" = ? WHERE "id" = ?`)
        .bind(messageId, toDbTimestamp(ctx.now), pollId)
        .run();
}

/**
 * The bot's own poll in the channel, posted after `sinceMs`. A bot reads the `poll` of its own
 * messages without the MESSAGE_CONTENT intent. While this row is open no other poll of the bot
 * can be newer on this channel (the open-poll rule), so the newest one is this row's.
 */
async function findOwnPoll(ctx: PollContext, sinceMs: number): Promise<string | null> {
    let before: string | undefined;
    for (let page = 0; page < OWN_POLL_PAGES; page++) {
        const messages = await ctx.discord.listMessages(ctx.env.DISCORD_CHANNEL_ID, before);
        for (const message of messages) {
            if (Date.parse(message.timestamp) < sinceMs) return null;
            if (message.author?.id === ctx.env.DISCORD_APPLICATION_ID && message.poll) return message.id;
        }
        if (messages.length < 100) return null;
        before = messages[messages.length - 1].id;
    }
    return null;
}

/** Sends the signup message when the channel does not have it. `true` when this call sent it. */
async function ensureSignupMessage(ctx: PollContext, row: PollRow): Promise<boolean> {
    try {
        const { discord, env } = ctx;
        const found = await findSignupMessages(
            discord,
            env.DISCORD_CHANNEL_ID,
            env.DISCORD_APPLICATION_ID,
            nextWednesday(row.date),
        );
        if (found.length > 0) return false;
    } catch (error) {
        console.error(JSON.stringify({ event: 'signupLookupFailed', date: row.date, error: String(error) }));
        return false;
    }
    return postSignupMessage(ctx, row);
}

async function postSignupMessage(ctx: PollContext, row: PollRow): Promise<boolean> {
    const wednesday = nextWednesday(row.date);
    try {
        await ctx.discord.createMessage(ctx.env.DISCORD_CHANNEL_ID, {
            ...renderSignupMessage(ctx.env, wednesday, [], false),
            nonce: `signup-${row.id}`,
            enforce_nonce: true,
        });
        return true;
    } catch (error) {
        console.error(JSON.stringify({ event: 'signupSendFailed', date: row.date, error: String(error) }));
        return false;
    }
}

/** Cron step from Wednesday 22:00: repair stuck rows, then create today's poll once the games are over. */
export async function createPollTick(ctx: PollContext, date: string): Promise<PollOutcome | null> {
    const resent = (await resendUnsentPolls(ctx)).find((outcome) => outcome.date === date);
    if (resent) return resent;
    const day = await loadGameDay(ctx.db, date);
    if (!isDayQuiet(day, ctx.now)) return null;
    return ensurePoll(ctx, day);
}

/** The entry point for steps.ts. */
export async function createPollStep(env: BotEnv, date: string): Promise<void> {
    const ctx = { db: env.DB, discord: createDiscordRest(env), env, now: Date.now() };
    const outcome = await createPollTick(ctx, date);
    console.log(JSON.stringify({ event: 'createPoll', date, outcome }));
}
