import { notFound } from 'next/navigation';
import {
    getWeeklyStats,
    getTopSigmas,
    getPlayerRankingHistory,
    getEmperorHistory,
    getRankingAfterSession,
    getSessionSummaryByDate,
} from '@/app/dramaafera/_services';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import PodsumowanieClient from '@/app/dramaafera/_components/PodsumowanieClient';
import type { EmperorPoll, SigmaPlayer, RankingHistoryPoint } from '@/app/dramaafera/_components/PodsumowanieClient';
import type { RankingHistoryPoint as ServiceRankingHistoryPoint } from '@/app/dramaafera/_services/players/types';

// Compute per-game ranking changes for a player from their ranking history
function computeRankingChanges(
    history: ServiceRankingHistoryPoint[],
    date: string,
): Record<string, number> {
    const sorted = [...history].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const changes: Record<string, number> = {};
    let lastRealEntry: ServiceRankingHistoryPoint | null = null;
    for (const current of sorted) {
        const isSkippable =
            current.reason === 'initial_value' || current.reason === 'base_value';
        if (current.gameIdentifier?.startsWith(date) && !isSkippable) {
            const change = lastRealEntry ? current.score - lastRealEntry.score : 0;
            changes[current.gameIdentifier] = change;
        }
        if (!isSkippable) {
            lastRealEntry = current;
        }
    }
    return changes;
}

// Map service RankingHistoryPoint to client RankingHistoryPoint
function mapRankingHistory(points: ServiceRankingHistoryPoint[]): RankingHistoryPoint[] {
    return points.map(p => ({
        dateString: p.date instanceof Date ? p.date.toISOString() : new Date(p.date).toISOString(),
        rating: p.score,
        position: 0,
    }));
}

interface PodsumowaniePageContentProps {
    date: string;
    seasonId: number;
}

export async function PodsumowaniePageContent({ date, seasonId }: PodsumowaniePageContentProps) {
    // Fetch all data in parallel
    const [weeklyStatsResult, topSigmasResult, emperorHistoryData, rankingAfterSessionData, sessionSummary] =
        await Promise.all([
            getWeeklyStats(date, seasonId),
            getTopSigmas(date, seasonId),
            getEmperorHistory(seasonId),
            getRankingAfterSession(date, seasonId),
            getSessionSummaryByDate(date, seasonId),
        ]);

    const weeklyStats = weeklyStatsResult.players;

    if (weeklyStats.length === 0) {
        notFound();
    }

    // Extract top sigmas and cwele from the result (getTopSigmas already returns 3)
    const topSigmas: SigmaPlayer[] = topSigmasResult?.topGainers ?? [];
    const topCwele: SigmaPlayer[] = topSigmasResult?.topLosers ?? [];

    // Fetch ranking history for sigmas and cwele in parallel
    const allHistoryNicknames = [
        ...topSigmas.map(s => s.nickname),
        ...topCwele.map(c => c.nickname),
    ];
    const uniqueNicknames = [...new Set(allHistoryNicknames)];
    const historyResults = await Promise.all(
        uniqueNicknames.map(async (nickname) => ({
            nickname,
            history: await getPlayerRankingHistory(nickname, seasonId),
        })),
    );

    const sigmaRankingHistory: Record<string, RankingHistoryPoint[]> = {};
    const cwelRankingHistory: Record<string, RankingHistoryPoint[]> = {};
    for (const { nickname, history } of historyResults) {
        const mapped = mapRankingHistory(history);
        if (topSigmas.some(s => s.nickname === nickname)) {
            sigmaRankingHistory[nickname] = mapped;
        }
        if (topCwele.some(c => c.nickname === nickname)) {
            cwelRankingHistory[nickname] = mapped;
        }
    }

    // Emperor poll from static file
    let emperorPoll: EmperorPoll | null = null;
    try {
        const { env } = await getCloudflareContext();
        if (env.ASSETS) {
            const response = await env.ASSETS.fetch(
                new Request(`http://localhost/emperor-polls/${date}.json`),
            );
            if (response.ok) {
                emperorPoll = (await response.json()) as EmperorPoll;
            }
        }
    } catch {
        // Emperor poll is optional
    }

    // Get detailedGames as topPlayerGames (filter out nulls)
    const topPlayerGames = sessionSummary.detailedGames.filter(
        (g): g is NonNullable<typeof g> => g !== null,
    );

    // Ranking after session
    const rankingAfterSession = rankingAfterSessionData ?? [];

    // Pre-compute ranking changes cache for all relevant players
    const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
    const top3Nicknames = sortedStats.slice(0, 3).map(p => p.nickname);
    const top1Sigma = topSigmas[0]?.nickname;
    const top1Cwel = topCwele[0]?.nickname;

    const cacheNicknames = [...new Set([
        ...top3Nicknames,
        ...(top1Sigma ? [top1Sigma] : []),
        ...(top1Cwel ? [top1Cwel] : []),
    ])];

    const cacheHistories = await Promise.all(
        cacheNicknames.map(async (nickname) => {
            // Reuse already-fetched history if available
            const existing = historyResults.find(h => h.nickname === nickname);
            const history = existing ? existing.history : await getPlayerRankingHistory(nickname, seasonId);
            return { nickname, changes: computeRankingChanges(history, date) };
        }),
    );

    const playerRankingChangesCache: Record<string, Record<string, number>> = {};
    for (const { nickname, changes } of cacheHistories) {
        playerRankingChangesCache[nickname] = changes;
    }

    return (
        <PodsumowanieClient
            date={date}
            weeklyStats={weeklyStats}
            emperorPoll={emperorPoll}
            topSigmas={topSigmas}
            sigmaRankingHistory={sigmaRankingHistory}
            topCwele={topCwele}
            cwelRankingHistory={cwelRankingHistory}
            emperorHistory={emperorHistoryData}
            rankingAfterSession={rankingAfterSession}
            topPlayerGames={topPlayerGames}
            playerRankingChangesCache={playerRankingChangesCache}
        />
    );
}
