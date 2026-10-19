// The 17:00 step: end the Emperor poll on Discord, then save the final vote counts.
//
// Two phases on every tick of the step, each idempotent:
//   1. Close. Every poll on this environment's channel with a message, `closedAt` NULL and
//      `closesAt` <= now gets End Poll, then `closedAt`. A poll that Discord already ended (by
//      `duration`, or by an earlier tick whose D1 write failed) also gets `closedAt`. From
//      `closesAt` + DISCORD_END_MARGIN_MS, Discord has ended the poll by `duration` for sure, so
//      the poll gets `closedAt` without a call. An open row would block the next poll at 22:00.
//   2. Finalize. Every poll on this channel closed in the last READ_WINDOW_MS with `finalizedAt`
//      NULL: read the message. Only when `poll.results.is_finalized` is true, write `voteCount`
//      of each candidate and `finalizedAt` in one batch. Before that, the next tick reads again.
//      After the window the bot gives up on the result and logs that once.
//
// The channel filter matters: the D1 import copies production polls to staging, and only the
// author of a poll can end or read it.
//
// A 401 or 403 stops the tick at once: the token or the permissions are wrong, and every other
// call would fail the same way. A 429 that the REST client could not wait out also stops the
// tick. The next cron tick tries again. Nothing retries in a loop.

import type { BotEnv } from '../env';
import { createDiscordPollRest, DiscordApiError, type DiscordPollRest, type PollMessage } from './discordApi';
import { MAX_ANSWER_LENGTH } from './messages';
import { toWarsawTime } from '../schedule';
import { toDbTimestamp } from './time';

/** Discord JSON error codes. */
export const UNKNOWN_MESSAGE = 10008;
export const POLL_EXPIRED = 520001;

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

/**
 * `pollDurationHours` rounds up and adds one hour, so Discord ends the poll by `duration` before
 * `closesAt` + 2 h.
 */
export const DISCORD_END_MARGIN_MS = 2 * HOUR_MS;

/** How long after `closedAt` the bot reads the result. Covers the next Wednesday's 17:00 ticks. */
export const READ_WINDOW_MS = 8 * DAY_MS;

export interface ClosePollContext {
    db: D1Database;
    discord: DiscordPollRest;
    channelId: string;
    now: number;
}

export interface CloseTickResult {
    /** Dates of the polls that got `closedAt` on this tick. */
    closed: string[];
    /** Dates of the polls that got their vote counts on this tick. */
    finalized: string[];
    /** Closed, but Discord has no final tally yet. */
    waiting: string[];
    /** Failed for this poll only. The next tick tries again. */
    failed: string[];
    /** Closed more than READ_WINDOW_MS ago without a result. Reported once, then never read. */
    gaveUp: string[];
    /** Why the tick stopped early, or null. */
    stopped: null | 'auth' | 'rateLimited';
}

interface PollRow {
    id: number;
    date: string;
    closesAt: number;
    discordMessageId: string;
}

class StopTick extends Error {
    constructor(readonly reason: 'auth' | 'rateLimited') {
        super(reason);
    }
}

/** Throws StopTick for errors that every later call in this tick would repeat. */
function stopOn(error: unknown): void {
    if (!(error instanceof DiscordApiError)) return;
    if (error.status === 401 || error.status === 403) throw new StopTick('auth');
    if (error.status === 429) throw new StopTick('rateLimited');
}

function log(event: string, date: string, error: unknown): void {
    console.error(JSON.stringify({ event, date, error: String(error) }));
}

export async function closePollTick(ctx: ClosePollContext): Promise<CloseTickResult> {
    const result: CloseTickResult = {
        closed: [],
        finalized: [],
        waiting: [],
        failed: [],
        gaveUp: [],
        stopped: null,
    };
    try {
        await closeDuePolls(ctx, result);
        await finalizeClosedPolls(ctx, result);
        await reportGivenUp(ctx, result);
    } catch (error) {
        if (!(error instanceof StopTick)) throw error;
        result.stopped = error.reason;
    }
    return result;
}

async function closeDuePolls(ctx: ClosePollContext, result: CloseTickResult): Promise<void> {
    const { results: due } = await ctx.db
        .prepare(
            `SELECT "id", "date", "closesAt", "discordMessageId" FROM "emperor_polls"
             WHERE "discordChannelId" = ? AND "discordMessageId" IS NOT NULL
               AND "closedAt" IS NULL AND "deletedAt" IS NULL AND "closesAt" <= ?
             ORDER BY "closesAt"`,
        )
        .bind(ctx.channelId, ctx.now)
        .all<PollRow>();

    for (const poll of due) {
        if (ctx.now >= Number(poll.closesAt) + DISCORD_END_MARGIN_MS) {
            // End Poll failed on every tick so far (5xx, network). Discord has ended it anyway.
            console.warn(JSON.stringify({ event: 'pollClosedWithoutDiscord', date: poll.date }));
        } else {
            try {
                await ctx.discord.expirePoll(ctx.channelId, poll.discordMessageId);
            } catch (error) {
                stopOn(error);
                if (!(await hasEnded(ctx, poll, error))) {
                    log('pollCloseFailed', poll.date, error);
                    result.failed.push(poll.date);
                    continue;
                }
            }
        }
        const update = await ctx.db
            .prepare(`UPDATE "emperor_polls" SET "closedAt" = ?, "updatedAt" = ? WHERE "id" = ? AND "closedAt" IS NULL`)
            .bind(ctx.now, toDbTimestamp(ctx.now), poll.id)
            .run();
        if (update.meta.changes === 1) result.closed.push(poll.date);
    }
}

/** After a failed End Poll: is the poll over anyway? */
async function hasEnded(ctx: ClosePollContext, poll: PollRow, error: unknown): Promise<boolean> {
    if (!(error instanceof DiscordApiError)) return false;
    if (error.code === POLL_EXPIRED) return true;
    // The message is gone, so nothing is left to close. Its result can never be read, see
    // finalizeClosedPolls.
    if (error.code === UNKNOWN_MESSAGE) return true;
    if (error.status !== 400) return false;
    // Another 400 (a code this file does not know): ask the message itself.
    try {
        const expiry = (await ctx.discord.getMessage(ctx.channelId, poll.discordMessageId)).poll?.expiry;
        return expiry != null && Date.parse(expiry) <= ctx.now;
    } catch (readError) {
        stopOn(readError);
        return false;
    }
}

async function finalizeClosedPolls(ctx: ClosePollContext, result: CloseTickResult): Promise<void> {
    const { results: closed } = await ctx.db
        .prepare(
            `SELECT "id", "date", "closesAt", "discordMessageId" FROM "emperor_polls"
             WHERE "discordChannelId" = ? AND "discordMessageId" IS NOT NULL
               AND "closedAt" >= ? AND "finalizedAt" IS NULL AND "deletedAt" IS NULL
             ORDER BY "closesAt"`,
        )
        .bind(ctx.channelId, ctx.now - READ_WINDOW_MS)
        .all<PollRow>();

    for (const poll of closed) {
        let message: PollMessage;
        try {
            message = await ctx.discord.getMessage(ctx.channelId, poll.discordMessageId);
        } catch (error) {
            stopOn(error);
            log('pollReadFailed', poll.date, error);
            result.failed.push(poll.date);
            continue;
        }
        if (!message.poll?.results?.is_finalized) {
            result.waiting.push(poll.date);
            continue;
        }
        const saved = await saveVotes(ctx, poll, message.poll);
        if (saved === 'mismatch') result.failed.push(poll.date);
        if (saved === 'saved') result.finalized.push(poll.date);
    }
}

/**
 * Logs the polls whose read window ended, once each, without a new column. `closedAt` is a
 * Wednesday from 17:00, so it is past the window (8 days) and inside the 7 days after it on
 * exactly one Wednesday. Only the first tick of that Wednesday (17:00-17:09 Warsaw) reports it.
 */
async function reportGivenUp(ctx: ClosePollContext, result: CloseTickResult): Promise<void> {
    const warsaw = toWarsawTime(new Date(ctx.now));
    if (warsaw.hour !== 17 || warsaw.minute >= 10) return;
    const { results } = await ctx.db
        .prepare(
            `SELECT "date" FROM "emperor_polls"
             WHERE "discordChannelId" = ? AND "discordMessageId" IS NOT NULL
               AND "closedAt" < ? AND "closedAt" >= ? AND "finalizedAt" IS NULL AND "deletedAt" IS NULL
             ORDER BY "closesAt"`,
        )
        .bind(ctx.channelId, ctx.now - READ_WINDOW_MS, ctx.now - READ_WINDOW_MS - 7 * DAY_MS)
        .all<{ date: string }>();
    for (const { date } of results) {
        console.error(JSON.stringify({ event: 'pollFinalizeGaveUp', date }));
        result.gaveUp.push(date);
    }
}

/**
 * Discord does not say which answer is which candidate, and the create flow does not store `answer_id`. The
 * create flow sends the answers in candidate `id` order, and Discord returns `poll.answers` in the
 * order it got them. So the n-th answer is the n-th candidate. Its text must be that candidate's
 * nickname (cut to 55 characters, both sides trimmed in case Discord trims), or nothing is
 * written. The votes then come from `answer_counts` by that answer's
 * `answer_id`, never by position.
 */
async function saveVotes(
    ctx: ClosePollContext,
    poll: PollRow,
    discordPoll: NonNullable<PollMessage['poll']>,
): Promise<'saved' | 'mismatch' | 'alreadySaved'> {
    const { results: candidates } = await ctx.db
        .prepare(
            `SELECT "id", "nickname" FROM "emperor_poll_candidates"
             WHERE "pollId" = ? AND "deletedAt" IS NULL ORDER BY "id"`,
        )
        .bind(poll.id)
        .all<{ id: number; nickname: string }>();

    const answers = discordPoll.answers;
    const matches =
        answers.length === candidates.length &&
        answers.every(
            (a, i) => (a.poll_media.text ?? '').trim() === candidates[i].nickname.slice(0, MAX_ANSWER_LENGTH).trim(),
        );
    if (!matches) {
        console.error(
            JSON.stringify({
                event: 'pollAnswerMismatch',
                date: poll.date,
                answers: answers.map((a) => a.poll_media.text),
                candidates: candidates.map((c) => c.nickname),
            }),
        );
        return 'mismatch';
    }

    const counts = new Map(discordPoll.results!.answer_counts.map((c) => [c.id, c.count]));
    const stamp = toDbTimestamp(ctx.now);
    const [pollUpdate] = await ctx.db.batch([
        // First, so a second caller in the same moment finds `finalizedAt` set and writes nothing:
        // the candidate updates below check it.
        ctx.db
            .prepare(`UPDATE "emperor_polls" SET "finalizedAt" = ?, "updatedAt" = ? WHERE "id" = ? AND "finalizedAt" IS NULL`)
            .bind(ctx.now, stamp, poll.id),
        ...answers.map((answer, i) =>
            ctx.db
                .prepare(
                    `UPDATE "emperor_poll_candidates" SET "voteCount" = ?, "updatedAt" = ?
                     WHERE "id" = ? AND (SELECT "finalizedAt" FROM "emperor_polls" WHERE "id" = ?) = ?`,
                )
                .bind(counts.get(answer.answer_id) ?? 0, stamp, candidates[i].id, poll.id, ctx.now),
        ),
    ]);
    return pollUpdate.meta.changes === 1 ? 'saved' : 'alreadySaved';
}

/** The entry point for steps.ts. `now` is the cron's time, so `/__dev/tick?now=` works. */
export async function closePollStep(env: BotEnv, now: number): Promise<void> {
    const ctx = { db: env.DB, discord: createDiscordPollRest(env), channelId: env.DISCORD_CHANNEL_ID, now };
    const result = await closePollTick(ctx);
    console.log(JSON.stringify({ event: 'closePoll', result }));
}
