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
    const lists = await prisma.listaCweli.findMany({
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
    const list = await prisma.listaCweli.findFirst({
      where: { id: listId, ...withoutDeleted },
    });

    if (!list) {
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
      result = await prisma.listaCweli.update({
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
      const existingForDate = await prisma.listaCweli.findFirst({
        where: {
          season: seasonId,
          date: normalizedDate,
        },
      });

      if (existingForDate) {
        result = await prisma.listaCweli.update({
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
        result = await prisma.listaCweli.create({
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
    await prisma.listaCweli.update({
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
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const result = await prisma.listaCweli.updateMany({
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
    // Batch fetch all players at once
    const players = await prisma.player.findMany({
      where: { name: { in: playerNames }, ...withoutDeleted },
      select: { id: true, name: true },
    });

    const playerIdToName = new Map(players.map((p) => [p.id, p.name]));

    const stats: Record<string, { lastGameDate: Date | null; secondLastGameDate: Date | null; gameCount: number }> = {};

    // Initialize all players with empty stats
    for (const playerName of playerNames) {
      stats[playerName] = { lastGameDate: null, secondLastGameDate: null, gameCount: 0 };
    }

    if (players.length === 0) return stats;

    // Fetch the last 2 game dates for each player using relation filter (avoids D1 IN clause variable limit)
    // We query per-player but only fetch 2 rows each — much cheaper than fetching all games
    await Promise.all(
      players.map(async (player) => {
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
          take: 2,
        });

        const name = playerIdToName.get(player.id)!;
        stats[name] = {
          lastGameDate: games[0]?.game.startTime ?? null,
          secondLastGameDate: games[1]?.game.startTime ?? null,
          gameCount: games.length, // NOTE: with take:2 this is at most 2; use a count query if exact count needed
        };
      })
    );

    return stats;
  } catch (error) {
    console.error('Error fetching player game stats:', error);
    return {};
  }
}
