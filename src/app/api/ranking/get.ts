import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../_database';
import { createSuccessResponse, createErrorResponse } from '../_utils';
import { withoutDeleted } from '../schema/common';

export async function GET(request: NextRequest) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Get all players with their current ranking
    const players = await prisma.player.findMany({
      where: withoutDeleted,
      include: {
        currentRanking: true,
        gamePlayerStatistics: {
          where: { game: withoutDeleted },
          select: { win: true }
        }
      },
      orderBy: {
        currentRanking: {
          score: 'desc'
        }
      },
      skip: offset,
      take: limit
    });

    // Calculate additional stats for each player
    const rankingData = players.map((player, index) => {
      const totalGames = player.gamePlayerStatistics.length;
      const wins = player.gamePlayerStatistics.filter(stat => stat.win).length;
      const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

      return {
        rank: offset + index + 1,
        playerId: player.id,
        playerName: player.name,
        currentRating: player.currentRanking?.score || 2000,
        totalGames,
        wins,
        losses: totalGames - wins,
        winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
        lastUpdated: player.currentRanking?.createdAt || player.createdAt
      };
    });

    // Get total count for pagination
    const totalPlayers = await prisma.player.count({
      where: withoutDeleted
    });

    return createSuccessResponse({
      ranking: rankingData,
      pagination: {
        total: totalPlayers,
        limit,
        offset,
        hasMore: offset + limit < totalPlayers
      }
    });

  } catch (error) {
    console.error('Ranking fetch error:', error);
    return createErrorResponse('Failed to fetch ranking', 500);
  }
}