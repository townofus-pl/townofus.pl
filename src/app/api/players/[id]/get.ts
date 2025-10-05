import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';

import { IdParamSchema } from '../../schema/base';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { formatZodError, withoutDeleted } from '../../schema/common';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, authContext: { user: { username: string } }, routeContext: RouteContext) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse and validate route parameters
    const { id } = await routeContext.params;
    const parseResult = IdParamSchema.safeParse({ id });
    
    if (!parseResult.success) {
      return createErrorResponse('Invalid player ID: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const playerId = parseInt(id, 10);

    // Fetch player with comprehensive statistics
    const player = await prisma.player.findFirst({
      where: {
        id: playerId,
        ...withoutDeleted
      },
      include: {
        gamePlayerStatistics: {
          where: {
            game: withoutDeleted // Only include stats from non-deleted games
          },
          select: {
            win: true,
            totalPoints: true,
            completedTasks: true,
            correctKills: true,
            incorrectKills: true,
            correctGuesses: true,
            incorrectGuesses: true,
            survivedRounds: true,
            game: {
              select: {
                id: true,
                gameIdentifier: true,
                startTime: true,
                winnerTeam: true
              }
            }
          }
        },
        currentRanking: {
          select: {
            score: true,
            createdAt: true
          }
        },
        rankingHistory: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10, // Last 10 ranking changes
          select: {
            score: true,
            reason: true,
            createdAt: true,
            game: {
              select: {
                gameIdentifier: true,
                startTime: true
              }
            }
          }
        }
      }
    });

    if (!player) {
      return createErrorResponse('Player not found', 404);
    }

    // Calculate comprehensive statistics
    const gameStats = player.gamePlayerStatistics || [];
    const totalGames = gameStats.length;
    const wins = gameStats.filter(stat => stat.win).length;
    const losses = totalGames - wins;
    const winRate = totalGames > 0 ? wins / totalGames : 0;
    
    // Calculate point statistics
    const totalPoints = gameStats.reduce((sum: number, stat) => sum + stat.totalPoints, 0);
    const averagePoints = totalGames > 0 ? totalPoints / totalGames : 0;
    const bestGamePoints = gameStats.length > 0 ? Math.max(...gameStats.map(stat => stat.totalPoints)) : 0;
    const worstGamePoints = gameStats.length > 0 ? Math.min(...gameStats.map(stat => stat.totalPoints)) : 0;
    
    // Calculate gameplay statistics
    const totalTasks = gameStats.reduce((sum: number, stat) => sum + stat.completedTasks, 0);
    const averageTasks = totalGames > 0 ? totalTasks / totalGames : 0;
    const totalKills = gameStats.reduce((sum: number, stat) => sum + stat.correctKills + stat.incorrectKills, 0);
    const correctKills = gameStats.reduce((sum: number, stat) => sum + stat.correctKills, 0);
    const killAccuracy = totalKills > 0 ? correctKills / totalKills : 0;
    const totalGuesses = gameStats.reduce((sum: number, stat) => sum + stat.correctGuesses + stat.incorrectGuesses, 0);
    const correctGuesses = gameStats.reduce((sum: number, stat) => sum + stat.correctGuesses, 0);
    const guessAccuracy = totalGuesses > 0 ? correctGuesses / totalGuesses : 0;
    const totalSurvivedRounds = gameStats.reduce((sum: number, stat) => sum + stat.survivedRounds, 0);
    const averageSurvivedRounds = totalGames > 0 ? totalSurvivedRounds / totalGames : 0;
    
    // Get current ranking
    const currentRanking = player.currentRanking?.score || 2000; // Default to 2000 if no ranking
    
    // Build response with detailed stats
    const playerWithStats = {
      id: player.id,
      name: player.name,
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
      currentRankingId: player.currentRankingId,
      stats: {
        totalGames,
        wins,
        losses,
        winRate,
        totalPoints,
        averagePoints,
        bestGamePoints,
        worstGamePoints,
        currentRanking,
        gameplay: {
          totalTasks,
          averageTasks,
          totalKills,
          correctKills,
          killAccuracy,
          totalGuesses,
          correctGuesses,
          guessAccuracy,
          averageSurvivedRounds
        },
        recentGames: gameStats
          .sort((a, b) => new Date(b.game.startTime).getTime() - new Date(a.game.startTime).getTime())
          .slice(0, 5) // Last 5 games
          .map((stat) => ({
            gameIdentifier: stat.game.gameIdentifier,
            startTime: stat.game.startTime,
            win: stat.win,
            points: stat.totalPoints,
            winnerTeam: stat.game.winnerTeam
          })),
        rankingHistory: player.rankingHistory
      }
    };

    return createSuccessResponse(playerWithStats, 200);

  } catch (error) {
    console.error('Error fetching player:', error);
    
    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch player: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}