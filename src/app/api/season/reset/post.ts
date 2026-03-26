import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient, batchStatements } from '../../_database';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { RANKING_CONSTANTS } from '../../_utils/rankingCalculator';
import { PlayerRankingReason } from '../../_constants/rankingTypes';
import { withoutDeleted } from '../../schema/common';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';

const ResetRequestSchema = z.object({
  seasonId: z.number().int().positive(),
});

export async function POST(
  request: NextRequest,
  _authContext: { user: { username: string } },
): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = ResetRequestSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(
        'Nieprawidłowe dane: ' + parsed.error.issues.map((i) => i.message).join(', '),
        400,
      );
    }
    const { seasonId } = parsed.data;

    if (!getSeasonById(seasonId)) {
      return createErrorResponse(`Sezon ${seasonId} nie istnieje.`, 400);
    }

    const targetSeason = seasonId;

    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Guard: jeśli istnieją już gry lub wpisy rankingowe (inne niż season_reset)
    // dla docelowego sezonu, reset mógłby przekłamać historię — zwracamy 409.
    const [existingGame, existingRankingEntry] = await Promise.all([
      prisma.game.findFirst({
        where: { season: targetSeason, deletedAt: null },
        select: { id: true },
      }),
      prisma.playerRanking.findFirst({
        where: {
          season: targetSeason,
          deletedAt: null,
          OR: [
            { reason: { not: PlayerRankingReason.SeasonReset } },
            { reason: null },
          ],
        },
        select: { id: true },
      }),
    ]);

    if (existingGame ?? existingRankingEntry) {
      return createErrorResponse(
        `Sezon ${targetSeason} zawiera już gry lub wpisy rankingowe. Reset jest niedozwolony po rozpoczęciu sezonu.`,
        409,
      );
    }

    // Pobierz wszystkich aktywnych graczy z ich aktualnym rankingiem
    const allPlayers = await prisma.player.findMany({
      where: withoutDeleted,
      include: {
        currentRanking: true,
      },
    });

    // Option B guard: pomiń gracza jeśli currentRanking jest już season_reset dla docelowego sezonu
    const playersToReset = allPlayers.filter(
      (player) =>
        !(
          player.currentRanking?.season === targetSeason &&
          player.currentRanking?.reason === PlayerRankingReason.SeasonReset
        ),
    );

    if (playersToReset.length === 0) {
      return createSuccessResponse({
        message: 'Wszyscy gracze mają już wpis season_reset dla docelowego sezonu. Brak zmian.',
        resetCount: 0,
        targetSeason,
        players: [],
      });
    }

    // Batch 1: wstaw wpisy season_reset atomowo dla wszystkich graczy
    const insertStatements = playersToReset.map((player) =>
      env.DB.prepare(
        'INSERT INTO "player_rankings" ("playerId", "score", "reason", "gameId", "season", "createdAt") VALUES (?, ?, ?, NULL, ?, CURRENT_TIMESTAMP)',
      ).bind(player.id, RANKING_CONSTANTS.START_RATING, PlayerRankingReason.SeasonReset, targetSeason),
    );
    await batchStatements(env.DB, insertStatements);

    // Batch 2: zaktualizuj currentRankingId używając subquery do świeżo wstawionych wierszy
    const updateStatements = playersToReset.map((player) =>
      env.DB.prepare(
        'UPDATE "players" SET "currentRankingId" = (SELECT MAX("id") FROM "player_rankings" WHERE "playerId" = ? AND "season" = ? AND "reason" = ? AND "deletedAt" IS NULL) WHERE "id" = ?',
      ).bind(player.id, targetSeason, PlayerRankingReason.SeasonReset, player.id),
    );
    await batchStatements(env.DB, updateStatements);

    const resetResults = playersToReset.map((player) => ({
      playerName: player.name,
      oldSeason: player.currentRanking?.season ?? null,
    }));

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
