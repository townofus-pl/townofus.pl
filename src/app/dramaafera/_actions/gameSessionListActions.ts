'use server';

import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import type { GameSessionListEntry, GameSessionListSummary } from '@/app/dramaafera/_services/gameSessionList/types';

/**
 * Get all saved game session lists for the current season
 */
export async function getGameSessionLists(seasonId?: number): Promise<GameSessionListSummary[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const season = seasonId ?? CURRENT_SEASON;

  try {
    const lists = await prisma.gameSessionList.findMany({
      where: {
        season,
        ...withoutDeleted,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return lists.map((list) => {
      const players = JSON.parse(list.playerNames) as string[];
      const dateObj = new Date(list.date);
      
      return {
        id: list.id,
        date: dateObj.toISOString().split('T')[0],
        dateFormatted: dateObj.toLocaleDateString('pl-PL', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        playerCount: players.length,
        players: players.map((name) => ({
          name,
          hasAvatar: isPlayerAvatarExists(name),
        })),
      };
    });
  } catch (error) {
    console.error('Error fetching game session lists:', error);
    return [];
  }
}

/**
 * Get a specific game session list by ID
 */
export async function getGameSessionListById(listId: number): Promise<GameSessionListEntry | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  try {
    const list = await prisma.gameSessionList.findUnique({
      where: { id: listId },
    });

    if (!list || list.deletedAt) {
      return null;
    }

    return {
      id: list.id,
      season: list.season,
      date: new Date(list.date),
      playerNames: JSON.parse(list.playerNames),
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    };
  } catch (error) {
    console.error('Error fetching game session list:', error);
    return null;
  }
}

/**
 * Save or update a game session list
 */
export async function saveGameSessionList(
  seasonId: number,
  date: Date,
  playerNames: string[],
  listIdToUpdate?: number
): Promise<GameSessionListEntry | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  try {
    const playerNamesJson = JSON.stringify(playerNames);
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    let result;
    if (listIdToUpdate) {
      // Update existing
      result = await prisma.gameSessionList.update({
        where: { id: listIdToUpdate },
        data: {
          date: normalizedDate,
          playerNames: playerNamesJson,
          deletedAt: null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Reuse existing row for the same season/date (including soft-deleted)
      // to avoid unique constraint collisions on (season, date).
      const existingForDate = await prisma.gameSessionList.findFirst({
        where: {
          season: seasonId,
          date: normalizedDate,
        },
      });

      if (existingForDate) {
        result = await prisma.gameSessionList.update({
          where: { id: existingForDate.id },
          data: {
            date: normalizedDate,
            playerNames: playerNamesJson,
            deletedAt: null,
            updatedAt: new Date(),
          },
        });
      } else {
        // Create new
        result = await prisma.gameSessionList.create({
          data: {
            season: seasonId,
            date: normalizedDate,
            playerNames: playerNamesJson,
          },
        });
      }
    }

    return {
      id: result.id,
      season: result.season,
      date: new Date(result.date),
      playerNames: JSON.parse(result.playerNames),
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  } catch (error) {
    console.error('Error saving game session list:', error);
    return null;
  }
}

/**
 * Delete a game session list
 */
export async function deleteGameSessionList(listId: number): Promise<boolean> {
  const prisma = await getDatabaseClient();
  if (!prisma) return false;

  try {
    await prisma.gameSessionList.update({
      where: { id: listId },
      data: {
        deletedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error('Error deleting game session list:', error);
    return false;
  }
}

/**
 * Delete game session list when first game is added for that date
 * Called from game creation logic
 */
export async function deleteGameSessionListByDate(seasonId: number, date: Date): Promise<boolean> {
  const prisma = await getDatabaseClient();
  if (!prisma) return false;

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await prisma.gameSessionList.updateMany({
      where: {
        season: seasonId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return result.count > 0;
  } catch (error) {
    console.error('Error deleting game session list by date:', error);
    return false;
  }
}

/**
 * Get game statistics for all players to support sorting
 */
export async function getPlayerGameStats(
  seasonId: number,
  playerNames: string[]
): Promise<Record<string, { lastGameDate: Date | null; secondLastGameDate: Date | null; gameCount: number }>> {
  const prisma = await getDatabaseClient();
  if (!prisma) return {};

  try {
    const stats: Record<string, { lastGameDate: Date | null; secondLastGameDate: Date | null; gameCount: number }> = {};

    for (const playerName of playerNames) {
      // Find player by name
      const player = await prisma.player.findFirst({
        where: { name: playerName, ...withoutDeleted },
      });

      if (!player) {
        stats[playerName] = { lastGameDate: null, secondLastGameDate: null, gameCount: 0 };
        continue;
      }

      // Get all games for this player in the season
      const games = await prisma.gamePlayerStatistics.findMany({
        where: {
          playerId: player.id,
          game: {
            season: seasonId,
            ...withoutDeleted,
          },
        },
        include: {
          game: {
            select: { startTime: true },
          },
        },
        orderBy: {
          game: { startTime: 'desc' },
        },
      });

      const gameCount = games.length;
      const lastGameDate = games[0]?.game.startTime || null;
      const secondLastGameDate = games[1]?.game.startTime || null;

      stats[playerName] = {
        lastGameDate,
        secondLastGameDate,
        gameCount,
      };
    }

    return stats;
  } catch (error) {
    console.error('Error fetching player game stats:', error);
    return {};
  }
}

/**
 * Helper: Check if avatar exists for a player
 * Avatars are stored in /public/images/avatars/{name}.png
 */
function isPlayerAvatarExists(_playerName: string): boolean {
  // This is a helper that will check against known avatars
  // In practice, we'll handle this in the component by checking against the list of available avatars
  return true; // Placeholder - will be checked in component
}

/**
 * Get list of available player avatars from filesystem
 * Returns array of player names that have avatars
 */
export async function getAvailablePlayerAvatars(): Promise<string[]> {
  // This would typically read from /public/images/avatars
  // For now, return empty - will be populated by component scanning the avatars folder
  return [];
}
