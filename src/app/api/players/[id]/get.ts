import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient, chunkedInQuery } from '../../_database';

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

    // Fetch player (no relation include — heavy players accumulate hundreds
    // of stats and the nested `game: { select }` would emit `WHERE id IN (…
    // many gameIds)` for the relation fetch and trip D1's 98 bound-parameter
    // cap on Prisma 7).
    const player = await prisma.player.findFirst({
      where: { id: playerId, ...withoutDeleted },
      select: { id: true, name: true, createdAt: true, updatedAt: true, currentRankingId: true },
    });

    if (!player) {
      return createErrorResponse('Player not found', 404);
    }

    // Stats (no nested game relation — fetched separately)
    const rawStats = await prisma.gamePlayerStatistics.findMany({
      where: { playerId: player.id, game: withoutDeleted },
      select: {
        gameId: true,
        win: true,
        totalPoints: true,
        completedTasks: true,
        correctKills: true,
        incorrectKills: true,
        correctGuesses: true,
        incorrectGuesses: true,
        survivedRounds: true,
      },
    });

    const uniqueGameIds = Array.from(new Set(rawStats.map((s) => s.gameId)));
    const games = await chunkedInQuery(uniqueGameIds, (chunk) =>
      prisma.game.findMany({
        where: { id: { in: chunk } },
        select: { id: true, gameIdentifier: true, startTime: true, winnerTeam: true },
      }),
    );
    const gameById = new Map(games.map((g) => [g.id, g]));

    const gameStats = rawStats.map((s) => ({
      ...s,
      game: gameById.get(s.gameId) ?? {
        id: s.gameId,
        gameIdentifier: '',
        startTime: new Date(0),
        winnerTeam: null as string | null,
      },
    }));

    // Current ranking score
    const currentRankingObj = player.currentRankingId !== null
      ? await prisma.playerRanking.findUnique({
          where: { id: player.currentRankingId },
          select: { score: true, createdAt: true },
        })
      : null;

    // Last 10 ranking changes
    const rankingHistoryRows = await prisma.playerRanking.findMany({
      where: { playerId: player.id, ...withoutDeleted },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { score: true, reason: true, createdAt: true, gameId: true },
    });
    const historyGameIds = Array.from(
      new Set(rankingHistoryRows.map((r) => r.gameId).filter((id): id is number => id !== null)),
    );
    const historyGames = await chunkedInQuery(historyGameIds, (chunk) =>
      prisma.game.findMany({
        where: { id: { in: chunk } },
        select: { id: true, gameIdentifier: true, startTime: true },
      }),
    );
    const historyGameById = new Map(historyGames.map((g) => [g.id, g]));
    const rankingHistory = rankingHistoryRows.map((r) => ({
      score: r.score,
      reason: r.reason,
      createdAt: r.createdAt,
      game: r.gameId !== null
        ? historyGameById.get(r.gameId) ?? null
        : null,
    }));
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
    const currentRanking = currentRankingObj?.score || 2000; // Default to 2000 if no ranking
    
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
            winnerTeam: stat.game.winnerTeam,
          })),
        rankingHistory,
      },
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