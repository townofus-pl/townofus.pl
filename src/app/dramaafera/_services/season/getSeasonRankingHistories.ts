import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import type { RankingHistoryPoint } from '../players/types';

export interface SeasonRankingHistory {
  playerName: string;
  data: RankingHistoryPoint[];
}

interface RankingHistoryRow {
  playerName: string;
  date: Date;
  score: number;
  reason: string | null;
  gameId: number | null;
  gameIdentifier: string | null;
}

export async function getSeasonRankingHistories(seasonId?: number): Promise<SeasonRankingHistory[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const rows = await prisma.$queryRaw<RankingHistoryRow[]>`
    SELECT
      p.name AS playerName,
      COALESCE(g.startTime, pr.createdAt) AS date,
      pr.score,
      pr.reason,
      pr.gameId,
      g.gameIdentifier
    FROM player_rankings pr
    JOIN players p ON p.id = pr.playerId AND p.deletedAt IS NULL
    LEFT JOIN games g ON g.id = pr.gameId
    WHERE pr.season = ${seasonId ?? CURRENT_SEASON} AND pr.deletedAt IS NULL
    ORDER BY date ASC, pr.id ASC
  `;

  const byPlayer = new Map<string, RankingHistoryPoint[]>();
  for (const row of rows) {
    const data = byPlayer.get(row.playerName) ?? [];
    data.push({
      date: row.date,
      score: row.score,
      reason: row.reason ?? undefined,
      gameId: row.gameId ?? undefined,
      gameIdentifier: row.gameIdentifier ?? undefined,
    });
    byPlayer.set(row.playerName, data);
  }

  return Array.from(byPlayer, ([playerName, data]) => ({ playerName, data }));
}
