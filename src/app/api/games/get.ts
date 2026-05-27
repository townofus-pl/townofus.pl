import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient, chunkedInQuery } from '../_database';
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

    // Fetch games (no nested include).
    // Note: a nested `gamePlayerStatistics` include with `roleHistory` /
    // `modifiers` / `player` blows past D1's 98 bound-parameter cap on Prisma
    // 7 once `limit > ~6`. Fetch related rows in chunks separately when
    // `includePlayers=true`; otherwise just count stat ids per game.
    const games = await prisma.game.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    });

    const gameIds = games.map((g) => g.id);
    type StatRow = {
      id: number;
      gameId: number;
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
    };
    const rawStats: StatRow[] = await chunkedInQuery(gameIds, (chunk) =>
      prisma.gamePlayerStatistics.findMany({
        where: { gameId: { in: chunk }, player: withoutDeleted },
        select: {
          id: true,
          gameId: true,
          playerId: true,
          win: true,
          disconnected: true,
          totalPoints: true,
          completedTasks: true,
          survivedRounds: true,
          correctKills: true,
          incorrectKills: true,
          correctGuesses: true,
          incorrectGuesses: true,
        },
      }),
    );

    const statCountByGameId = new Map<number, number>();
    rawStats.forEach((s) => statCountByGameId.set(s.gameId, (statCountByGameId.get(s.gameId) ?? 0) + 1));

    // Per-game stat groupings (only populated when includePlayers=true)
    const statsByGameId = new Map<number, StatRow[]>();
    let playerNameById = new Map<number, string>();
    const rolesByStatId = new Map<number, string[]>();
    const modifiersByStatId = new Map<number, string[]>();
    if (includePlayers && rawStats.length > 0) {
      rawStats.forEach((s) => {
        const list = statsByGameId.get(s.gameId) ?? [];
        list.push(s);
        statsByGameId.set(s.gameId, list);
      });

      const statIds = rawStats.map((s) => s.id);
      const uniquePlayerIds = Array.from(new Set(rawStats.map((s) => s.playerId)));

      const [players, roles, modifiers] = await Promise.all([
        chunkedInQuery(uniquePlayerIds, (chunk) =>
          prisma.player.findMany({
            where: { id: { in: chunk } },
            select: { id: true, name: true },
          }),
        ),
        chunkedInQuery(statIds, (chunk) =>
          prisma.playerRole.findMany({
            where: { gamePlayerStatisticsId: { in: chunk } },
            orderBy: { order: 'asc' },
            select: { gamePlayerStatisticsId: true, roleName: true },
          }),
        ),
        chunkedInQuery(statIds, (chunk) =>
          prisma.playerModifier.findMany({
            where: { gamePlayerStatisticsId: { in: chunk } },
            select: { gamePlayerStatisticsId: true, modifierName: true },
          }),
        ),
      ]);

      playerNameById = new Map(players.map((p) => [p.id, p.name]));
      roles.forEach((r) => {
        const list = rolesByStatId.get(r.gamePlayerStatisticsId) ?? [];
        list.push(r.roleName);
        rolesByStatId.set(r.gamePlayerStatisticsId, list);
      });
      modifiers.forEach((m) => {
        const list = modifiersByStatId.get(m.gamePlayerStatisticsId) ?? [];
        list.push(m.modifierName);
        modifiersByStatId.set(m.gamePlayerStatisticsId, list);
      });
    }

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

      // Count players (always available — stat ids are fetched regardless)
      const playerCount = statCountByGameId.get(game.id) ?? 0;

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
        updatedAt: game.updatedAt,
      };

      // Add player details if requested
      if (includePlayers) {
        const stats = statsByGameId.get(game.id) ?? [];

        gameResponse.playerStats = stats.map((stat) => ({
          playerId: stat.playerId,
          playerName: playerNameById.get(stat.playerId) ?? 'Unknown',
          win: stat.win,
          disconnected: stat.disconnected,
          totalPoints: stat.totalPoints,
          completedTasks: stat.completedTasks,
          survivedRounds: stat.survivedRounds,
          correctKills: stat.correctKills,
          incorrectKills: stat.incorrectKills,
          correctGuesses: stat.correctGuesses,
          incorrectGuesses: stat.incorrectGuesses,
          roles: rolesByStatId.get(stat.id) ?? [],
          modifiers: modifiersByStatId.get(stat.id) ?? [],
        }));

        const winners = stats.filter((s) => s.win);
        gameResponse.winnerNames = winners.map((w) => playerNameById.get(w.playerId) ?? 'Unknown');
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
      // recursively get full message from error and cause
        const createErrorMessage = (err: Error): string => {
          let errorMessage = err.message + ' (' + err.stack || 'Unknown stack trace' + ')';
          if (!err.cause){
              return errorMessage;
          }
          if (err.cause instanceof Error) {
            errorMessage += ` | ${createErrorMessage(err.cause)})`;
          } else {
            errorMessage += ` | ${err.cause.toString()})`;
          }

          return errorMessage;
      };

      return createErrorResponse('Failed to fetch games: ' + createErrorMessage(error), 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}
