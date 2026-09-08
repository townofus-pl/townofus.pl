import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';
import type { PlayerPickerData } from './types';

function sortByLastGameDesc<T extends { name: string; lastGameDate: string | null }>(entries: T[]): T[] {
  return entries.sort((a, b) => {
    if (a.lastGameDate === b.lastGameDate) return a.name.localeCompare(b.name, 'pl-PL');
    if (a.lastGameDate === null) return 1;
    if (b.lastGameDate === null) return -1;
    return b.lastGameDate.localeCompare(a.lastGameDate);
  });
}

/**
 * Data for the Lista Cweli player picker: players with a game this season,
 * and every other player in the DB for the Add-player dialog's multi-select.
 * Both are sorted by most recent game first, never-played last.
 */
export async function getListaCweliPlayerPickerData(seasonId: number): Promise<PlayerPickerData> {
  const prisma = await getDatabaseClient();
  if (!prisma) return { seasonPlayers: [], otherPlayers: [] };

  try {
    const allPlayers = await prisma.player.findMany({
      where: { ...withoutDeleted },
      select: { id: true, name: true },
    });

    const seasonPlayerIds = new Set(
      (
        await prisma.player.findMany({
          where: {
            ...withoutDeleted,
            gamePlayerStatistics: { some: { game: { season: seasonId, ...withoutDeleted } } },
          },
          select: { id: true },
        })
      ).map((p) => p.id)
    );

    const withLastGameDate = await Promise.all(
      allPlayers.map(async (player) => {
        const lastGame = await prisma.gamePlayerStatistics.findFirst({
          where: { playerId: player.id, game: { ...withoutDeleted } },
          include: { game: { select: { startTime: true } } },
          orderBy: { game: { startTime: 'desc' } },
        });
        return {
          id: player.id,
          name: player.name,
          lastGameDate: lastGame ? lastGame.game.startTime.toISOString() : null,
        };
      })
    );

    const seasonPlayers = sortByLastGameDesc(
      withLastGameDate.filter((p) => seasonPlayerIds.has(p.id)).map(({ name, lastGameDate }) => ({ name, lastGameDate }))
    );
    const otherPlayers = sortByLastGameDesc(
      withLastGameDate.filter((p) => !seasonPlayerIds.has(p.id)).map(({ name, lastGameDate }) => ({ name, lastGameDate }))
    );

    return { seasonPlayers, otherPlayers };
  } catch (error) {
    console.error('Error fetching Lista Cweli player picker data:', error);
    return { seasonPlayers: [], otherPlayers: [] };
  }
}
