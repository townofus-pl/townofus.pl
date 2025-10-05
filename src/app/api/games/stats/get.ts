import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { formatZodError, withoutDeleted } from '../../schema/common';
import { z } from 'zod';

// Query schema for stats endpoint
const StatsQuerySchema = z.object({
  type: z.enum(['players', 'roles', 'daily']).default('players'),
  date: z.string().optional(), // For daily stats - YYYYMMDD format
  startDate: z.string().optional(), // For date range - YYYYMMDD format
  endDate: z.string().optional(), // For date range - YYYYMMDD format
  player: z.string().optional(), // For specific player stats
  minGames: z.coerce.number().min(1).default(1), // Minimum games played to include in results
  sort: z.enum(['name', 'gamesPlayed', 'wins', 'winRate', 'totalPoints', 'averagePoints']).default('winRate'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

export async function GET(request: NextRequest, _authContext: { user: { username: string } }) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = StatsQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return createErrorResponse('Invalid query parameters: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const { type, date, startDate, endDate, player, minGames, sort, order, limit, offset } = parseResult.data;

    // Build date filter for games
    const gameWhere: Record<string, unknown> = {
      ...withoutDeleted
    };

    if (date) {
      // Specific date
      const year = parseInt(date.substring(0, 4));
      const month = parseInt(date.substring(4, 6)) - 1;
      const day = parseInt(date.substring(6, 8));
      
      const startOfDay = new Date(year, month, day, 0, 0, 0);
      const endOfDay = new Date(year, month, day, 23, 59, 59);
      
      gameWhere.startTime = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (startDate || endDate) {
      // Date range
      if (startDate) {
        const year = parseInt(startDate.substring(0, 4));
        const month = parseInt(startDate.substring(4, 6)) - 1;
        const day = parseInt(startDate.substring(6, 8));
        const startOfDay = new Date(year, month, day, 0, 0, 0);
        
        gameWhere.startTime = {
          ...(gameWhere.startTime as object || {}),
          gte: startOfDay
        };
      }
      
      if (endDate) {
        const year = parseInt(endDate.substring(0, 4));
        const month = parseInt(endDate.substring(4, 6)) - 1;
        const day = parseInt(endDate.substring(6, 8));
        const endOfDay = new Date(year, month, day, 23, 59, 59);
        
        gameWhere.startTime = {
          ...(gameWhere.startTime as object || {}),
          lte: endOfDay
        };
      }
    }

    if (type === 'players') {
      // Player statistics
      const playerWhere: Record<string, unknown> = {
        ...withoutDeleted
      };

      if (player) {
        playerWhere.name = {
          contains: player
        };
      }

      // Get player statistics with aggregated data
      const playersWithStats = await prisma.player.findMany({
        where: {
          ...playerWhere,
          gamePlayerStatistics: {
            some: {
              game: gameWhere
            }
          }
        },
        include: {
          gamePlayerStatistics: {
            where: {
              game: gameWhere
            },
            include: {
              game: {
                select: {
                  id: true,
                  startTime: true,
                  gameIdentifier: true
                }
              }
            }
          },
          currentRanking: {
            select: {
              score: true
            }
          }
        }
      });

      // Calculate statistics for each player
      const playerStats = playersWithStats.map(player => {
        const gameStats = player.gamePlayerStatistics;
        const totalGames = gameStats.length;
        
        if (totalGames < minGames) return null;

        const wins = gameStats.filter(stat => stat.win).length;
        const losses = totalGames - wins;
        const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 10000) / 100 : 0;
        
        const totalPoints = gameStats.reduce((sum, stat) => sum + stat.totalPoints, 0);
        const averagePoints = totalGames > 0 ? Math.round((totalPoints / totalGames) * 100) / 100 : 0;
        
        const totalTasks = gameStats.reduce((sum, stat) => sum + stat.completedTasks, 0);
        const averageTasks = totalGames > 0 ? Math.round((totalTasks / totalGames) * 100) / 100 : 0;
        
        const totalKills = gameStats.reduce((sum, stat) => sum + stat.correctKills + stat.incorrectKills, 0);
        const correctKills = gameStats.reduce((sum, stat) => sum + stat.correctKills, 0);
        const killAccuracy = totalKills > 0 ? Math.round((correctKills / totalKills) * 10000) / 100 : 0;
        
        const totalGuesses = gameStats.reduce((sum, stat) => sum + stat.correctGuesses + stat.incorrectGuesses, 0);
        const correctGuesses = gameStats.reduce((sum, stat) => sum + stat.correctGuesses, 0);
        const guessAccuracy = totalGuesses > 0 ? Math.round((correctGuesses / totalGuesses) * 10000) / 100 : 0;

        return {
          playerId: player.id,
          playerName: player.name,
          gamesPlayed: totalGames,
          wins,
          losses,
          winRate,
          totalPoints,
          averagePoints,
          totalTasks,
          averageTasks,
          totalKills,
          correctKills,
          killAccuracy,
          totalGuesses,
          correctGuesses,
          guessAccuracy,
          currentRanking: player.currentRanking?.score || null,
          
          // Detailed stats
          correctProsecutes: gameStats.reduce((sum, stat) => sum + stat.correctProsecutes, 0),
          incorrectProsecutes: gameStats.reduce((sum, stat) => sum + stat.incorrectProsecutes, 0),
          correctDeputyShoots: gameStats.reduce((sum, stat) => sum + stat.correctDeputyShoots, 0),
          incorrectDeputyShoots: gameStats.reduce((sum, stat) => sum + stat.incorrectDeputyShoots, 0),
          correctJailorExecutes: gameStats.reduce((sum, stat) => sum + stat.correctJailorExecutes, 0),
          incorrectJailorExecutes: gameStats.reduce((sum, stat) => sum + stat.incorrectJailorExecutes, 0),
          correctMedicShields: gameStats.reduce((sum, stat) => sum + stat.correctMedicShields, 0),
          incorrectMedicShields: gameStats.reduce((sum, stat) => stat.incorrectMedicShields, 0),
          correctWardenFortifies: gameStats.reduce((sum, stat) => sum + stat.correctWardenFortifies, 0),
          incorrectWardenFortifies: gameStats.reduce((sum, stat) => sum + stat.incorrectWardenFortifies, 0),
          correctAltruistRevives: gameStats.reduce((sum, stat) => sum + stat.correctAltruistRevives, 0),
          incorrectAltruistRevives: gameStats.reduce((sum, stat) => sum + stat.incorrectAltruistRevives, 0),
          correctSwaps: gameStats.reduce((sum, stat) => sum + stat.correctSwaps, 0),
          incorrectSwaps: gameStats.reduce((sum, stat) => sum + stat.incorrectSwaps, 0),
          janitorCleans: gameStats.reduce((sum, stat) => sum + stat.janitorCleans, 0),
          survivedRounds: gameStats.reduce((sum, stat) => sum + stat.survivedRounds, 0)
        };
      }).filter(Boolean); // Remove null entries (players with < minGames)

      // Sort results
      playerStats.sort((a, b) => {
        const aVal = a![sort as keyof typeof a] as number;
        const bVal = b![sort as keyof typeof b] as number;
        
        if (order === 'desc') {
          return (bVal || 0) - (aVal || 0);
        } else {
          return (aVal || 0) - (bVal || 0);
        }
      });

      // Apply pagination
      const total = playerStats.length;
      const paginatedStats = playerStats.slice(offset, offset + limit);

      return createSuccessResponse({
        type: 'players',
        players: paginatedStats,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        filters: {
          date,
          startDate,
          endDate,
          player,
          minGames
        }
      }, 200);

    } else if (type === 'roles') {
      // NOTE: Using raw SQL here because this query involves:
      // 1. Complex JOINs across multiple tables (games, game_player_statistics, player_roles)
      // 2. Conditional aggregations with CASE statements for win/loss calculations
      // 3. SQLite-specific DATE() functions for date filtering
      // 4. HAVING clauses with aggregated conditions
      // 5. Dynamic ORDER BY and date filtering that would be very complex in Prisma
      // Standard Prisma aggregations don't support this level of complexity efficiently.
      const roleStats = await prisma.$queryRaw<Array<{
        roleName: string;
        gamesPlayed: number;
        wins: number;
        losses: number;
        winRate: number;
        totalPoints: number;
        averagePoints: number;
      }>>`
        SELECT 
          pr.roleName,
          COUNT(DISTINCT gps.id) as gamesPlayed,
          SUM(CASE WHEN gps.win = 1 THEN 1 ELSE 0 END) as wins,
          COUNT(DISTINCT gps.id) - SUM(CASE WHEN gps.win = 1 THEN 1 ELSE 0 END) as losses,
          ROUND(
            CASE 
              WHEN COUNT(DISTINCT gps.id) > 0 
              THEN (SUM(CASE WHEN gps.win = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT gps.id))
              ELSE 0 
            END, 2
          ) as winRate,
          SUM(gps.totalPoints) as totalPoints,
          ROUND(
            CASE 
              WHEN COUNT(DISTINCT gps.id) > 0 
              THEN (SUM(gps.totalPoints) / COUNT(DISTINCT gps.id))
              ELSE 0 
            END, 2
          ) as averagePoints
        FROM games g
        INNER JOIN game_player_statistics gps ON g.id = gps.gameId
        INNER JOIN player_roles pr ON gps.id = pr.gamePlayerStatisticsId AND pr."order" = 0
        WHERE g.deletedAt IS NULL 
          AND gps.player IN (SELECT id FROM players WHERE deletedAt IS NULL)
          ${date ? `AND DATE(g.startTime) = DATE('${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}')` : ''}
          ${startDate ? `AND g.startTime >= DATE('${startDate.substring(0,4)}-${startDate.substring(4,6)}-${startDate.substring(6,8)}')` : ''}
          ${endDate ? `AND g.startTime <= DATE('${endDate.substring(0,4)}-${endDate.substring(4,6)}-${endDate.substring(6,8)}')` : ''}
        GROUP BY pr.roleName
        HAVING COUNT(DISTINCT gps.id) >= ${minGames}
        ORDER BY ${sort === 'name' ? 'pr.roleName' : sort} ${order.toUpperCase()}
        LIMIT ${limit} OFFSET ${offset}
      `;

      // NOTE: Using raw SQL for count query to match the exact same filtering logic
      // as the main role statistics query above. Keeping consistency with date filtering.
      const totalRoles = await prisma.$queryRaw<[{count: number}]>`
        SELECT COUNT(DISTINCT pr.roleName) as count
        FROM games g
        INNER JOIN game_player_statistics gps ON g.id = gps.gameId
        INNER JOIN player_roles pr ON gps.id = pr.gamePlayerStatisticsId AND pr."order" = 0
        WHERE g.deletedAt IS NULL 
          AND gps.player IN (SELECT id FROM players WHERE deletedAt IS NULL)
          ${date ? `AND DATE(g.startTime) = DATE('${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}')` : ''}
          ${startDate ? `AND g.startTime >= DATE('${startDate.substring(0,4)}-${startDate.substring(4,6)}-${startDate.substring(6,8)}')` : ''}
          ${endDate ? `AND g.startTime <= DATE('${endDate.substring(0,4)}-${endDate.substring(4,6)}-${endDate.substring(6,8)}')` : ''}
        GROUP BY pr.roleName
        HAVING COUNT(DISTINCT gps.id) >= ${minGames}
      `;

      const total = totalRoles[0]?.count || 0;

      return createSuccessResponse({
        type: 'roles',
        roles: roleStats,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        filters: {
          date,
          startDate,
          endDate,
          minGames
        }
      }, 200);

    } else if (type === 'daily') {
      // NOTE: Using raw SQL here because this query involves:
      // 1. SQLite-specific DATE() function for grouping by date
      // 2. Complex conditional aggregations with CASE statements for team wins
      // 3. Subquery for counting unique players per day
      // 4. Time-based calculations for average duration
      // Standard Prisma groupBy doesn't support SQLite DATE() functions or this complexity.
      const dailyStats = await prisma.$queryRaw<Array<{
        gameDate: string;
        totalGames: number;
        crewmateWins: number;
        impostorWins: number;
        neutralWins: number;
        uniquePlayers: number;
        averageDurationMinutes: number;
      }>>`
        SELECT 
          DATE(g.startTime) as gameDate,
          COUNT(*) as totalGames,
          SUM(CASE WHEN g.winnerTeam = 'Crewmate' THEN 1 ELSE 0 END) as crewmateWins,
          SUM(CASE WHEN g.winnerTeam = 'Impostor' THEN 1 ELSE 0 END) as impostorWins,
          SUM(CASE WHEN g.winnerTeam = 'Neutral' THEN 1 ELSE 0 END) as neutralWins,
          COUNT(DISTINCT gps.playerId) as uniquePlayers,
          AVG(CAST(JULIANDAY(g.endTime) - JULIANDAY(g.startTime) AS REAL) * 24 * 60) as averageDurationMinutes
        FROM games g
        LEFT JOIN game_player_statistics gps ON g.id = gps.gameId
        WHERE g.deletedAt IS NULL
          ${date ? `AND DATE(g.startTime) = DATE('${date.substring(0,4)}-${date.substring(4,6)}-${date.substring(6,8)}')` : ''}
          ${startDate ? `AND g.startTime >= DATE('${startDate.substring(0,4)}-${startDate.substring(4,6)}-${startDate.substring(6,8)}')` : ''}
          ${endDate ? `AND g.startTime <= DATE('${endDate.substring(0,4)}-${endDate.substring(4,6)}-${endDate.substring(6,8)}')` : ''}
        GROUP BY DATE(g.startTime)
        ORDER BY gameDate ${order.toUpperCase()}
        LIMIT ${limit} OFFSET ${offset}
      `;

      return createSuccessResponse({
        type: 'daily',
        dailyStats,
        pagination: {
          total: dailyStats.length,
          limit,
          offset,
          hasMore: false // For daily stats, we return all matching days
        },
        filters: {
          date,
          startDate,
          endDate
        }
      }, 200);
    }

    return createErrorResponse('Invalid statistics type', 400);

  } catch (error) {
    console.error('Error fetching game statistics:', error);
    
    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch game statistics: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}