import 'server-only';
import { database } from '../_accounts/server';
import { readPoll } from './storage';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { EmperorPoll } from '../_components/PodsumowanieClient/types';
export { createPoll, previewCandidates, readPoll } from './storage';

export async function summaryPoll(date: string, season: number) {
    const poll = await readPoll(await database(), date, season);
    if (!poll) return null;
    return { date, question: 'Kto zostanie Emperorem?', totalVotes: poll.totalVotes,
        votes: poll.candidates.map(c => ({ nickname: c.nickname, votes: c.votes })) };
}

export async function loadSummaryPoll(date: string, season: number): Promise<EmperorPoll | null> {
    const current = await summaryPoll(date, season);
    if (current) return current;
    try {
        const { env } = await getCloudflareContext();
        if (!env.ASSETS) return null;
        const response = await env.ASSETS.fetch(new Request(`http://localhost/emperor-polls/${date}.json`));
        if (!response.ok) return null;
        return await response.json() as EmperorPoll;
    } catch {
        // Historical polls are optional; database failures above still surface.
        return null;
    }
}
