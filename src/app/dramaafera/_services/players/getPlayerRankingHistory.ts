import { getDatabaseClient } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import type { RankingHistoryPoint } from './types';

// Get player ranking history from database.
// Implementation note: heavy players accumulate hundreds of ranking rows; a
// nested `include: { game }` would emit `WHERE id IN (…N gameIds)` for the
// relation fetch and trip D1's 98-param cap. Fetch separately and stitch.
export async function getPlayerRankingHistory(playerName: string, seasonId?: number): Promise<RankingHistoryPoint[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const player = await prisma.player.findFirst({
    where: { name: playerName, ...withoutDeleted },
    select: { id: true },
  });
  if (!player) return [];

  const rankings = await prisma.playerRanking.findMany({
    where: {
      playerId: player.id,
      season: seasonId ?? CURRENT_SEASON,
      ...withoutDeleted,
    },
    select: {
      score: true,
      reason: true,
      gameId: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (rankings.length === 0) return [];

  const uniqueGameIds = Array.from(
    new Set(rankings.map((r) => r.gameId).filter((id): id is number => id !== null)),
  );

  const games = await chunkedInQuery(uniqueGameIds, (chunk) =>
    prisma.game.findMany({
      where: { id: { in: chunk } },
      select: { id: true, gameIdentifier: true, startTime: true },
    }),
  );
  const gameById = new Map(games.map((g) => [g.id, g]));

  return rankings.map((ranking) => {
    const game = ranking.gameId != null ? gameById.get(ranking.gameId) : undefined;
    return {
      date: game?.startTime ?? ranking.createdAt,
      score: ranking.score,
      reason: ranking.reason || undefined,
      gameId: ranking.gameId || undefined,
      gameIdentifier: game?.gameIdentifier || undefined,
    };
  });
}
