import { getDatabaseClient } from '../db';
import { PlayerRankingReason } from '@/app/api/_constants/rankingTypes';

/** Latest season ratings include players with absence-only ranking entries. */
export async function getRankingComparisonPlayers(season: number): Promise<string[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) throw new Error('Nie udało się połączyć z bazą danych');
  const players = await prisma.$queryRaw<{ name: string; score: number }[]>`
    SELECT name, score FROM (
      SELECT p.name, (
        SELECT pr.score FROM player_rankings pr
        WHERE pr.playerId = p.id AND pr.season = ${season} AND pr.deletedAt IS NULL
          AND pr.reason <> ${PlayerRankingReason.SeasonReset}
        ORDER BY pr.createdAt DESC, pr.id DESC LIMIT 1
      ) AS score
      FROM players p WHERE p.deletedAt IS NULL
    ) WHERE score IS NOT NULL ORDER BY score DESC, name ASC
  `;
  return players.map(player => player.name);
}
