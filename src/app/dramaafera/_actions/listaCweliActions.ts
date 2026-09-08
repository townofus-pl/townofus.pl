'use server';

import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { createPlayerWithRanking } from '@/app/api/_utils';
import { findSimilarPlayerName } from '@/app/dramaafera/_utils/textMatch';
import { getListaCweliPlayerPickerData } from '@/app/dramaafera/_services/gameSessionList/getListaCweliPlayerPicker';
import type {
  GameSessionListEntry,
  GameSessionListSummary,
  PlayerPickerData,
} from '@/app/dramaafera/_services/gameSessionList/types';

/**
 * Data for the Lista Cweli player picker (main list + Add-player dialog).
 */
export async function getPlayerPickerData(seasonId: number): Promise<PlayerPickerData> {
  return getListaCweliPlayerPickerData(seasonId);
}

/**
 * Flags brand-new player names that look like typos of an existing player
 * (exact match after folding case/diacritics, or Levenshtein distance <= 1).
 */
export async function checkNewPlayerNames(
  candidateNames: string[]
): Promise<Array<{ candidate: string; similarTo: string | null }>> {
  const prisma = await getDatabaseClient();
  if (!prisma) return candidateNames.map((candidate) => ({ candidate, similarTo: null }));

  const existingNames = (
    await prisma.player.findMany({ where: { ...withoutDeleted }, select: { name: true } })
  ).map((p) => p.name);

  return candidateNames.map((candidate) => ({
    candidate,
    similarTo: findSimilarPlayerName(candidate, existingNames),
  }));
}

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
 * Save or update a game session list. `newPlayerNames` (a subset of
 * `playerNames`) are brand-new names picked in the Add-player dialog that
 * don't have a Player row yet — they're created here, on save, never
 * eagerly on Add (Player.name is @unique, so an abandoned draft must not
 * leave a stray row behind).
 */
export async function saveGameSessionList(
  seasonId: number,
  date: Date,
  playerNames: string[],
  listIdToUpdate?: number,
  newPlayerNames: string[] = []
): Promise<GameSessionListEntry | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  try {
    for (const name of newPlayerNames) {
      const existing = await prisma.player.findFirst({ where: { name, ...withoutDeleted } });
      if (!existing) {
        await createPlayerWithRanking(prisma, name);
      }
    }

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
