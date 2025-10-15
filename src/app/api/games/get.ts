import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../_database';
import { GamesQuerySchema } from '../schema/games';
import { createSuccessResponse, createErrorResponse } from '../_utils';
import { formatZodError, withoutDeleted } from '../schema/common';

export async function GET(request: NextRequest, _authContext: { user: { username: string } }) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = GamesQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return createErrorResponse('Invalid query parameters: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const {
      limit,
      offset,
      date,
      startDate,
      endDate,
      player,
      winnerTeam,
      map,
      sort,
      order,
      includePlayers
    } = parseResult.data;

    // Build where clause
    const where: Record<string, unknown> = {
      ...withoutDeleted, // Exclude soft-deleted games
    };

    // Add date filters
    if (date) {
      // Exact date match - convert YYYYMMDD to date range
      const year = parseInt(date.substring(0, 4));
      const month = parseInt(date.substring(4, 6)) - 1; // JS months are 0-indexed
      const day = parseInt(date.substring(6, 8));

      const startOfDay = new Date(year, month, day, 0, 0, 0);
      const endOfDay = new Date(year, month, day, 23, 59, 59);

      where.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else {
      // Date range filters
      if (startDate) {
        let startDateTime: Date;
        if (/^\d{8}$/.test(startDate)) {
          // YYYYMMDD format
          const year = parseInt(startDate.substring(0, 4));
          const month = parseInt(startDate.substring(4, 6)) - 1;
          const day = parseInt(startDate.substring(6, 8));
          startDateTime = new Date(year, month, day, 0, 0, 0);
        } else {
          // ISO format
          startDateTime = new Date(startDate);
        }

        where.startTime = {
          ...where.startTime as object,
          gte: startDateTime
        };
      }

      if (endDate) {
        let endDateTime: Date;
        if (/^\d{8}$/.test(endDate)) {
          // YYYYMMDD format
          const year = parseInt(endDate.substring(0, 4));
          const month = parseInt(endDate.substring(4, 6)) - 1;
          const day = parseInt(endDate.substring(6, 8));
          endDateTime = new Date(year, month, day, 23, 59, 59);
        } else {
          // ISO format
          endDateTime = new Date(endDate);
        }

        where.startTime = {
          ...where.startTime as object,
          lte: endDateTime
        };
      }
    }

    // Add winner team filter
    if (winnerTeam) {
      where.winnerTeam = winnerTeam;
    }

    // Add map filter
    if (map) {
      where.map = {
        contains: map
      };
    }

    // Add player filter - search for games where specific player participated (case-sensitive)
    if (player) {
      where.gamePlayerStatistics = {
        some: {
          player: {
            name: {
              contains: player
            },
            ...withoutDeleted
          }
        }
      };
    }

    // Get total count for pagination
    const total = await prisma.game.count({ where });

    // Build orderBy clause
    const orderBy: Record<string, string> = {};
    if (sort) {
      orderBy[sort] = order;
    } else {
      // Default sort by start time descending (newest first)
      orderBy.startTime = 'desc';
    }

    // Build include clause based on includePlayers flag
    const include: Record<string, unknown> = {};
    if (includePlayers) {
      include.gamePlayerStatistics = {
        where: {
          player: withoutDeleted
        },
        include: {
          player: {
            select: {
              id: true,
              name: true
            }
          },
          roleHistory: {
            orderBy: {
              order: 'asc'
            }
          },
          modifiers: true
        }
      };
    } else {
      include.gamePlayerStatistics = {
        select: {
          id: true
        }
      };
    }

    // Fetch games
    const games = await prisma.game.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
      include
    });

    // Transform games to API response format
    const transformedGames = games.map(game => {
      // Calculate game duration if not stored
      let duration = 'Unknown';
      if (game.startTime && game.endTime) {
        const durationMs = game.endTime.getTime() - game.startTime.getTime();
        const minutes = Math.floor(durationMs / 60000);
        const seconds = Math.floor((durationMs % 60000) / 1000);
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      // Extract date from gameIdentifier or startTime
      let gameDate = 'Unknown';
      if (game.gameIdentifier) {
        // Format: YYYYMMDD_HHMM_NN
        const datePart = game.gameIdentifier.split('_')[0];
        if (datePart && datePart.length === 8) {
          const year = datePart.substring(0, 4);
          const month = datePart.substring(4, 6);
          const day = datePart.substring(6, 8);
          gameDate = `${day}.${month}.${year}`;
        }
      } else if (game.startTime) {
        gameDate = game.startTime.toLocaleDateString('pl-PL');
      }

      // Count players
      const playerCount = game.gamePlayerStatistics?.length || 0;

      // Basic game summary
      const gameResponse: Record<string, unknown> = {
        id: game.id,
        gameIdentifier: game.gameIdentifier,
        date: gameDate,
        startTime: game.startTime,
        endTime: game.endTime,
        duration,
        players: playerCount,
        map: game.map,
        maxTasks: game.maxTasks,
        winner: game.winnerTeam || 'Unknown',
        winCondition: game.winCondition || 'Unknown',
        createdAt: game.createdAt,
        updatedAt: game.updatedAt
      };

      // Add player details if requested
      if (includePlayers && game.gamePlayerStatistics && Array.isArray(game.gamePlayerStatistics)) {
        const validStats = game.gamePlayerStatistics.filter(stat =>
          stat && typeof stat === 'object' && 'playerId' in stat && 'win' in stat
        );

        gameResponse.playerStats = validStats.map(stat => {
          const playerStat = stat as {
            playerId: number;
            win: boolean;
            disconnected: boolean;
            totalPoints: number;
            completedTasks: number;
            survivedRounds: number;
            correctKills: number;
            incorrectKills: number;
            correctGuesses: number;
            incorrectGuesses: number;
            player?: { name: string };
            roleHistory?: Array<{ roleName: string }>;
            modifiers?: Array<{ modifierName: string }>;
          };

          return {
            playerId: playerStat.playerId,
            playerName: playerStat.player?.name || 'Unknown',
            win: playerStat.win,
            disconnected: playerStat.disconnected,
            totalPoints: playerStat.totalPoints,
            completedTasks: playerStat.completedTasks,
            survivedRounds: playerStat.survivedRounds,
            correctKills: playerStat.correctKills,
            incorrectKills: playerStat.incorrectKills,
            correctGuesses: playerStat.correctGuesses,
            incorrectGuesses: playerStat.incorrectGuesses,
            roles: playerStat.roleHistory?.map(role => role.roleName) || [],
            modifiers: playerStat.modifiers?.map(mod => mod.modifierName) || []
          };
        });

        // Extract winner information
        const winners = validStats.filter(stat => (stat as { win: boolean }).win);
        gameResponse.winnerNames = winners.map(w =>
          (w as { player?: { name: string } }).player?.name || 'Unknown'
        );
        gameResponse.winnerCount = winners.length;
      }

      return gameResponse;
    });

    // Calculate pagination metadata
    const hasMore = offset + limit < total;

    // Prepare response
    const responseData = {
      games: transformedGames,
      pagination: {
        total,
        limit,
        offset,
        hasMore
      }
    };

    return createSuccessResponse(responseData, 200);

  } catch (error) {
    console.error('Error fetching games:', error);

    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch games: ' + error.message + ' (' + error.stack || 'Unknown stack' + ')', 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}
