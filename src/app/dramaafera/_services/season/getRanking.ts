import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

export interface RankingPlayer {
  rank: number;
  playerId: number;
  playerName: string;
  currentRating: number;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  lastUpdated: Date;
}

export interface RankingResult {
  ranking: RankingPlayer[];
  total: number;
}

export async function getRanking(
  seasonId?: number,
  limit = 50,
  offset = 0,
): Promise<RankingResult> {
  // TODO: past-season ranking support — deferred to a later phase
  if ((seasonId ?? CURRENT_SEASON) !== CURRENT_SEASON) {
    return { ranking: [], total: 0 };
  }

  const prisma = await getDatabaseClient();
  if (!prisma) return { ranking: [], total: 0 };

  const players = await prisma.player.findMany({
    where: withoutDeleted,
    include: {
      currentRanking: true,
      gamePlayerStatistics: {
        where: { game: withoutDeleted },
        select: { win: true },
      },
    },
    orderBy: {
      currentRanking: {
        score: 'desc',
      },
    },
    skip: offset,
    take: limit,
  });

  const ranking: RankingPlayer[] = players.map((player, index) => {
    const totalGames = player.gamePlayerStatistics.length;
    const wins = player.gamePlayerStatistics.filter((stat) => stat.win).length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      rank: offset + index + 1,
      playerId: player.id,
      playerName: player.name,
      currentRating: player.currentRanking?.score ?? 2000,
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: Math.round(winRate * 100) / 100,
      lastUpdated: player.currentRanking?.createdAt ?? player.createdAt,
    };
  });

  const total = await prisma.player.count({ where: withoutDeleted });

  return { ranking, total };
}
