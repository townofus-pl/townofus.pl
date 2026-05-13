import { getDatabaseClient } from '@/app/dramaafera/_services/db';
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

        const players = await prisma.player.findMany({
            where: {
                ...withoutDeleted,
                name: {
                    in: uniquePlayerNames,
                },
            },
            include: {
                currentRanking: true,
            },
        });

        const eloByPlayerName = new Map(
            players.map((player) => [
                player.name,
                player.currentRanking?.score != null
                    ? Math.round(player.currentRanking.score)
                    : null,
            ])
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
