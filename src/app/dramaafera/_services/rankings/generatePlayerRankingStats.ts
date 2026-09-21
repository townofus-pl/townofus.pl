import type { PlayerRankingStats } from './types';
import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

// Generate player ranking statistics
export async function generatePlayerRankingStats(seasonId?: number): Promise<PlayerRankingStats[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const season = seasonId ?? CURRENT_SEASON;

  // Aggregate in SQL, not in JS: this read every stat row in the season (~5k) to return ~55
  // grouped rows. D1 bills on rows read. See #299.
  const rows = await prisma.$queryRaw<Array<{ name: string; played: number; won: number }>>`
    SELECT
      p.name,
      COUNT(*) AS played,
      SUM(CASE WHEN gps.win = 1 THEN 1 ELSE 0 END) AS won
    FROM game_player_statistics gps
    JOIN games g   ON g.id = gps.gameId AND g.season = ${season} AND g.deletedAt IS NULL
    JOIN players p ON p.id = gps.playerId AND p.deletedAt IS NULL
    GROUP BY p.name
  `;

  const rankingStats: PlayerRankingStats[] = rows.map((row) => {
    const gamesPlayed = Number(row.played);
    const wins = Number(row.won);
    return {
      name: row.name,
      gamesPlayed,
      wins,
      winRate: gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0,
    };
  });

  rankingStats.sort((a, b) => {
    if (a.winRate !== b.winRate) {
      return b.winRate - a.winRate;
    }
    return b.gamesPlayed - a.gamesPlayed;
  });

  return rankingStats;
}
