import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

// Get list of all players from database
export async function getPlayersList(seasonId?: number): Promise<string[]> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return [];
  }

  try {
    const players = await prisma.player.findMany({
      where: {
        ...withoutDeleted,
        gamePlayerStatistics: {
          some: {
            game: {
              season: seasonId ?? CURRENT_SEASON,
              ...withoutDeleted
            }
          }
        }
      },
      select: {
        name: true
      },
      distinct: ['name']
    });

    return players.map(p => p.name);
  } catch (error) {
    console.error('Error fetching players list:', error);
    return [];
  }
}
