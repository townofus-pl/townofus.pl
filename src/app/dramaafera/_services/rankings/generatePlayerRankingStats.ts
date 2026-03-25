import type { PlayerRankingStats } from './types';
import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

// Generate player ranking statistics
export async function generatePlayerRankingStats(seasonId?: number): Promise<PlayerRankingStats[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const season = seasonId ?? CURRENT_SEASON;

  const stats = await prisma.gamePlayerStatistics.findMany({
    where: {
      player: withoutDeleted,
      game: {
        ...withoutDeleted,
        season,
      },
    },
    select: {
      win: true,
      player: {
        select: { name: true },
      },
    },
  });

  const playerStats = new Map<string, { played: number; won: number }>();

  stats.forEach(stat => {
    const playerName = stat.player?.name;
    if (!playerName) return;
    if (!playerStats.has(playerName)) {
      playerStats.set(playerName, { played: 0, won: 0 });
    }
    const entry = playerStats.get(playerName)!;
    entry.played += 1;
    if (stat.win) {
      entry.won += 1;
    }
  });

  const rankingStats: PlayerRankingStats[] = Array.from(playerStats.entries()).map(([playerName, s]) => ({
    name: playerName,
    gamesPlayed: s.played,
    wins: s.won,
    winRate: s.played > 0 ? Math.round((s.won / s.played) * 100) : 0,
  }));

  rankingStats.sort((a, b) => {
    if (a.winRate !== b.winRate) {
      return b.winRate - a.winRate;
    }
    return b.gamesPlayed - a.gamesPlayed;
  });

  return rankingStats;
}
