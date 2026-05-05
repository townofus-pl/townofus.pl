'use server';

import { getGameDatesLightweight } from '@/app/dramaafera/_services';
import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';

/**
 * Get combined list of game dates and Lista Cweli entries
 * Returns dates sorted by date descending (newest first)
 */
export async function getCombinedGameDatesAndLists(seasonId: number) {
  const prisma = await getDatabaseClient();
  if (!prisma) {
    const { dates } = await getGameDatesLightweight(false, seasonId);
    return { dates, listaCweli: [] };
  }

  try {
    // Get game dates
    const { dates } = await getGameDatesLightweight(false, seasonId);

    // Get Lista Cweli entries
    const lists = await prisma.gameSessionList.findMany({
      where: {
        season: seasonId,
        ...withoutDeleted,
      },
      orderBy: {
        date: 'desc',
      },
    });

    const listaCweli = lists.map((list) => {
      const players = JSON.parse(list.playerNames) as string[];
      const dateObj = new Date(list.date);
      const dateStr = dateObj.toISOString().split('T')[0];

      return {
        id: list.id,
        date: dateStr,
        dateKey: dateObj.toISOString().split('T')[0].replace(/-/g, ''),
        displayDate: dateObj.toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        playerCount: players.length,
        players: players.map((name) => ({
          name,
        })),
      };
    });

    return { dates, listaCweli };
  } catch (error) {
    console.error('Error fetching combined dates:', error);
    const { dates } = await getGameDatesLightweight(false, seasonId);
    return { dates, listaCweli: [] };
  }
}
