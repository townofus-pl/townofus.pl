import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';
import type { ListaCweliDisplayEntry } from './types';

/**
 * Fetches lista cweli entries for display, enriched with the ELO each player held
 * **in that list's own season**.
 *
 * Deliberately not `players.currentRankingId`: that column is season-agnostic and points at a
 * player's latest ranking row in any season. The moment a new season is reset it points at that
 * season's 2000-point row, so every earlier season's list would render as 69 players tied on
 * 2000 and sort alphabetically. Measured before the fix: one distinct ELO across the whole
 * roster, against a real season-3 finish of ziomson 2746.7 / Cleopatrie 2644.7. See #309.
 *
 * `getRanking.ts` documents and defends against the same trap.
 *
 * Players sorted by ELO descending, then alphabetically. Returns an empty array gracefully on
 * build-time or DB error.
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

        // One statement, two bound parameters, no IN clause — so no D1 parameter-cap concern
        // however many names accumulate across the season's lists. Returns the terminal ranking
        // row per player *within this season*.
        const seasonScores = await prisma.$queryRaw<Array<{ name: string; score: number }>>`
            WITH latest AS (
                SELECT playerId, MAX(id) AS id
                FROM player_rankings
                WHERE season = ${seasonId} AND deletedAt IS NULL
                GROUP BY playerId
            )
            SELECT p.name, r.score
            FROM latest l
            JOIN player_rankings r ON r.id = l.id
            JOIN players p ON p.id = r.playerId AND p.deletedAt IS NULL
        `;

        const eloByPlayerName = new Map(
            seasonScores.map((row) => [row.name, Math.round(Number(row.score))]),
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
