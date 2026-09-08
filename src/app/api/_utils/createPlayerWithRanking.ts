import type { PrismaClient } from '@prisma/client';
import { PlayerRankingReason } from '../_constants/rankingTypes';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

/**
 * Creates a brand-new Player plus its initial PlayerRanking (score 2000,
 * InitialValue, CURRENT_SEASON) and points currentRankingId at it. Three
 * sequential awaits — D1 has no interactive transactions.
 */
export async function createPlayerWithRanking(prisma: PrismaClient, name: string) {
  const player = await prisma.player.create({
    data: { name: name.trim() },
    select: { id: true, name: true, createdAt: true, updatedAt: true, currentRankingId: true },
  });

  const initialRanking = await prisma.playerRanking.create({
    data: {
      playerId: player.id,
      score: 2000.0,
      reason: PlayerRankingReason.InitialValue,
      season: CURRENT_SEASON,
    },
  });

  return prisma.player.update({
    where: { id: player.id },
    data: { currentRankingId: initialRanking.id },
    select: { id: true, name: true, createdAt: true, updatedAt: true, currentRankingId: true },
  });
}
