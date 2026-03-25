import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { RANKING_CONSTANTS } from '../../_utils/rankingCalculator';
import { PlayerRankingReason } from '../../_constants/rankingTypes';
import { withoutDeleted } from '../../schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

export async function POST(
  _request: NextRequest,
  _authContext: { user: { username: string } },
): Promise<Response> {
  try {
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    const targetSeason = CURRENT_SEASON;

    // Pobierz wszystkich aktywnych graczy z ich aktualnym rankingiem
    const allPlayers = await prisma.player.findMany({
      where: withoutDeleted,
      include: {
        currentRanking: true,
      },
    });

    // Option B guard: pomiń gracza jeśli currentRanking jest już season_reset dla bieżącego sezonu
    const playersToReset = allPlayers.filter(
      (player) =>
        !(
          player.currentRanking?.season === targetSeason &&
          player.currentRanking?.reason === PlayerRankingReason.SeasonReset
        ),
    );

    if (playersToReset.length === 0) {
      return createSuccessResponse({
        message: 'Wszyscy gracze mają już wpis season_reset dla bieżącego sezonu. Brak zmian.',
        resetCount: 0,
        targetSeason,
        players: [],
      });
    }

    // Utwórz wpisy season_reset dla każdego gracza
    const resetResults: Array<{ playerName: string; oldSeason: number | null }> = [];

    for (const player of playersToReset) {
      const resetRanking = await prisma.playerRanking.create({
        data: {
          playerId: player.id,
          score: RANKING_CONSTANTS.START_RATING,
          reason: PlayerRankingReason.SeasonReset,
          gameId: null,
          season: targetSeason,
        },
      });

      await prisma.player.update({
        where: { id: player.id },
        data: { currentRankingId: resetRanking.id },
      });

      resetResults.push({
        playerName: player.name,
        oldSeason: player.currentRanking?.season ?? null,
      });

      console.log(
        `🔄 Season reset for ${player.name}: S${player.currentRanking?.season ?? 'none'} → S${targetSeason}`,
      );
    }

    console.log(
      `✅ Season reset complete: ${resetResults.length} players reset to S${targetSeason}`,
    );

    return createSuccessResponse({
      message: `Zresetowano ranking ${resetResults.length} graczy do sezonu ${targetSeason}.`,
      resetCount: resetResults.length,
      targetSeason,
      players: resetResults,
    });
  } catch (error) {
    console.error('❌ Season reset failed:', error);
    return createErrorResponse('Nie udało się zresetować rankingu sezonu.', 500);
  }
}
