import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import type { EmperorPoll } from '@/app/dramaafera/_components/PodsumowanieClient/types';

export interface EmperorPollCandidateRow {
    nickname: string;
    voteCount: number;
    player: { name: string; deletedAt: Date | null } | null;
}

/** `20260923` (the page's URL date) → `2026-09-23` (`emperor_polls.date`). Null if malformed. */
export function toPollDate(date: string): string | null {
    const match = /^(\d{4})(\d{2})(\d{2})$/.exec(date);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

/**
 * Maps a finalized D1 poll to the shape the JSON files have. The question is the text the poll
 * was sent with. The nickname is the player's current name, so a rename after the poll still
 * shows the name the rest of the page uses. The candidate's saved nickname is the fallback when
 * the player row is gone or soft-deleted.
 */
export function mapEmperorPoll(
    date: string,
    question: string,
    candidates: EmperorPollCandidateRow[],
): EmperorPoll {
    const votes = candidates.map((c) => ({
        nickname: c.player && c.player.deletedAt === null ? c.player.name : c.nickname,
        votes: c.voteCount,
    }));
    return {
        date,
        question,
        totalVotes: votes.reduce((sum, v) => sum + v.votes, 0),
        votes,
    };
}

async function getEmperorPollFromDatabase(date: string, seasonId: number): Promise<EmperorPoll | null> {
    const pollDate = toPollDate(date);
    if (!pollDate) return null;

    const prisma = await getDatabaseClient();
    if (!prisma) return null;

    // One poll, at most ten candidates: the nested player select stays far under D1's
    // bound-parameter cap.
    const poll = await prisma.emperorPoll.findFirst({
        where: {
            ...withoutDeleted,
            date: pollDate,
            season: seasonId,
            finalizedAt: { not: null },
        },
        select: {
            question: true,
            candidates: {
                where: withoutDeleted,
                orderBy: { id: 'asc' },
                select: {
                    nickname: true,
                    voteCount: true,
                    player: { select: { name: true, deletedAt: true } },
                },
            },
        },
    });

    return poll ? mapEmperorPoll(date, poll.question, poll.candidates) : null;
}

async function getEmperorPollFromAssets(date: string): Promise<EmperorPoll | null> {
    const { env } = await getCloudflareContext();
    if (!env.ASSETS) return null;
    const response = await env.ASSETS.fetch(
        new Request(`http://localhost/emperor-polls/${date}.json`),
    );
    return response.ok ? ((await response.json()) as EmperorPoll) : null;
}

/**
 * Emperor poll result for a session. A finalized poll in D1 wins. Sessions from before the
 * Discord bot have no D1 row and keep reading `public/emperor-polls/<date>.json`.
 * The poll is optional on the page, so every failure gives null instead of an error.
 */
export async function getEmperorPoll(date: string, seasonId: number): Promise<EmperorPoll | null> {
    try {
        const fromDatabase = await getEmperorPollFromDatabase(date, seasonId);
        if (fromDatabase) return fromDatabase;
    } catch (error) {
        // Sessions from 2026-10-21 have no JSON file, so a silent failure here would hide the
        // poll slide with no trace. Log it, then fall through to the static file.
        console.error('getEmperorPoll: D1 query failed', { date, seasonId }, error);
    }

    try {
        return await getEmperorPollFromAssets(date);
    } catch {
        return null;
    }
}
