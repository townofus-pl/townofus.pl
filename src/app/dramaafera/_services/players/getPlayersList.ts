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

/**
 * Every player the league has ever recorded, regardless of season.
 *
 * Used to resolve a URL slug back to a nick. Deliberately not season-filtered: a profile URL
 * must still resolve for a player who has not played in the season being viewed, otherwise the
 * page cannot tell "this nick does not exist" from "this player sat out this season" — and a
 * freshly reset season has no players at all. See #310.
 */
export async function getAllPlayerNames(): Promise<string[]> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return [];
  }

  try {
    const players = await prisma.player.findMany({
      where: { ...withoutDeleted },
      select: { name: true },
      distinct: ['name'],
    });

    return players.map((p) => p.name);
  } catch (error) {
    console.error('Error fetching all player names:', error);
    return [];
  }
}
