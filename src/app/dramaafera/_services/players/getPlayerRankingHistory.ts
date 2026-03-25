import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import type { RankingHistoryPoint } from './types';

// Get player ranking history from database
export async function getPlayerRankingHistory(playerName: string, seasonId?: number): Promise<RankingHistoryPoint[]> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return [];
  }

  try {
    const player = await prisma.player.findFirst({
      where: {
        name: playerName,
        ...withoutDeleted
      }
    });

    if (!player) {
      return [];
    }

    const rankings = await prisma.playerRanking.findMany({
      where: {
        playerId: player.id,
        season: seasonId ?? CURRENT_SEASON,
        ...withoutDeleted
      },
      include: {
        game: {
          select: {
            gameIdentifier: true,
            startTime: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return rankings.map(ranking => ({
      date: ranking.game?.startTime || ranking.createdAt,
      score: ranking.score,
      reason: ranking.reason || undefined,
      gameId: ranking.gameId || undefined,
      gameIdentifier: ranking.game?.gameIdentifier || undefined
    }));

  } catch (error) {
    console.error('Error fetching player ranking history:', error);
    return [];
  }
}
