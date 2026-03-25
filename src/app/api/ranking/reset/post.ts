import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { withoutDeleted } from '../../schema/common';
import { PlayerRankingReason } from '../../_constants/rankingTypes';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { RANKING_CONSTANTS } from '../../_utils/rankingCalculator';

const { START_RATING } = RANKING_CONSTANTS;

export async function POST(
  _request: NextRequest,
  _authContext: { user: { username: string } },
): Promise<Response> {
  try {
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Step 1: soft-delete all current-season ranking entries
    const { count: deletedCount } = await prisma.playerRanking.updateMany({
      where: { season: CURRENT_SEASON, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    // Step 2: fetch all active players
    const players = await prisma.player.findMany({
      where: { ...withoutDeleted },
      select: { id: true },
    });

    // Step 3 + 4: create a fresh SeasonReset entry and update currentRankingId for each player
    let resetCount = 0;
    for (const player of players) {
      const newRanking = await prisma.playerRanking.create({
        data: {
          playerId: player.id,
          score: START_RATING,
          reason: PlayerRankingReason.SeasonReset,
          season: CURRENT_SEASON,
        },
      });

      await prisma.player.update({
        where: { id: player.id },
        data: { currentRankingId: newRanking.id },
      });

      resetCount++;
    }

    return createSuccessResponse({
      deletedRankingEntries: deletedCount,
      playersReset: resetCount,
      season: CURRENT_SEASON,
      newScore: START_RATING,
    });
  } catch (error) {
    console.error('Error resetting season ranking:', error);
    return createErrorResponse('Nie udało się zresetować rankingu sezonu', 500);
  }
}
