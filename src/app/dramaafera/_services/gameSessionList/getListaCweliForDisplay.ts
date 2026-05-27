import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import type { ListaCweliDisplayEntry } from './types';

/**
 * Fetches lista cweli entries for display, enriched with current ELO ranking.
 * Players are sorted by ELO descending, then alphabetically.
 * Returns empty array gracefully on build-time or DB error.
 */
export async function getListaCweliForDisplay(seasonId: number): Promise<ListaCweliDisplayEntry[]> {
    const prisma = await getDatabaseClient();
    if (!prisma) return [];

    try {
        const lists = await prisma.listaCweli.findMany({
            where: {
                season: seasonId,
                ...withoutDeleted,
            },
            orderBy: {
                date: 'desc',
            },
        });

        if (lists.length === 0) return [];

        const uniquePlayerNames = Array.from(
            new Set(
                lists.flatMap((list) => JSON.parse(list.playerNames) as string[])
            )
        );

        // Chunked: `name: { in: uniquePlayerNames }` + `include: currentRanking`
        // emits two IN-clauses (player names + currentRanking ids) — sum can
        // exceed D1's 98 bound-parameter cap on Prisma 7 once a list of lists
        // accumulates many unique names.
        const players = await chunkedInQuery(uniquePlayerNames, (chunk) =>
            prisma.player.findMany({
                where: { ...withoutDeleted, name: { in: chunk } },
                select: { id: true, name: true, currentRankingId: true },
            }),
        );

        const currentRankingIds = players
            .map((p) => p.currentRankingId)
            .filter((id): id is number => id !== null);
        const rankings = await chunkedInQuery(currentRankingIds, (chunk) =>
            prisma.playerRanking.findMany({
                where: { id: { in: chunk } },
                select: { id: true, score: true },
            }),
        );
        const scoreByRankingId = new Map(rankings.map((r) => [r.id, r.score]));

        const eloByPlayerName = new Map(
            players.map((player) => {
                const score = player.currentRankingId !== null
                    ? scoreByRankingId.get(player.currentRankingId)
                    : null;
                return [player.name, score != null ? Math.round(score) : null];
            })
        );

        return lists.map((list) => {
            const playerNames = JSON.parse(list.playerNames) as string[];
            const dateObj = new Date(list.date);
            const sortedPlayers = playerNames
                .map((name) => ({
                    name,
                    eloRanking: eloByPlayerName.get(name) ?? null,
                }))
                .sort((a, b) => {
                    const eloA = a.eloRanking ?? 2000;
                    const eloB = b.eloRanking ?? 2000;
                    if (eloA !== eloB) return eloB - eloA;
                    return a.name.localeCompare(b.name, 'pl-PL');
                });

            return {
                id: list.id,
                date: dateObj.toISOString().split('T')[0],
                displayDate: dateObj.toLocaleDateString('pl-PL', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                }),
                players: sortedPlayers,
            };
        });
    } catch (error) {
        console.error('Error fetching Lista Cweli:', error);
        return [];
    }
}
