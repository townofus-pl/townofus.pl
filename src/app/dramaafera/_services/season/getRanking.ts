import { getDatabaseClient } from '../db';
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
  lastUpdated: string;
}

export interface RankingResult {
  ranking: RankingPlayer[];
  total: number;
}

// Single raw-SQL implementation for both current and past seasons.
//
// Why raw SQL: the previous Prisma-based current-season branch used
// `player.findMany({ include: { gamePlayerStatistics: { ... } } })` which, with
// full prod data, blows past D1's 98-param cap (Prisma 7's query-plan executor
// emits `WHERE playerId IN (…)` for the relation fetch — P2029). A single
// JOINed query is both safer and faster.
//
// `pr.id IN (SELECT MAX(id) ... GROUP BY playerId)` returns the most recent
// ranking per player for the given season — for current season this is
// equivalent to `player.currentRankingId`, for past seasons this picks the
// terminal ranking. `HAVING COUNT(gps.id) > 0` excludes players with no games
// played in the target season, matching the previous behaviour.
export async function getRanking(
  seasonId?: number,
  limit = 50,
  offset = 0,
): Promise<RankingResult> {
  const targetSeason = seasonId ?? CURRENT_SEASON;

  const prisma = await getDatabaseClient();
  if (!prisma) return { ranking: [], total: 0 };

  const [latestPerPlayer, countResult] = await Promise.all([
    prisma.$queryRaw<
      Array<{
        playerId: number;
        playerName: string;
        score: number;
        createdAt: string;
        totalGames: number;
        wins: number;
      }>
    >`
      SELECT
        pr.playerId,
        p.name        AS playerName,
        pr.score,
        pr.createdAt,
        COUNT(gps.id) AS totalGames,
        SUM(CASE WHEN gps.win = 1 THEN 1 ELSE 0 END) AS wins
      FROM player_rankings pr
      JOIN players p ON p.id = pr.playerId AND p.deletedAt IS NULL
      JOIN game_player_statistics gps ON gps.playerId = pr.playerId
      JOIN games g ON g.id = gps.gameId AND g.season = ${targetSeason} AND g.deletedAt IS NULL
      WHERE pr.id IN (
        SELECT MAX(id)
        FROM player_rankings
        WHERE season = ${targetSeason}
          AND deletedAt IS NULL
        GROUP BY playerId
      )
      GROUP BY pr.playerId, p.name, pr.score, pr.createdAt
      HAVING COUNT(gps.id) > 0
      ORDER BY pr.score DESC
      LIMIT ${limit} OFFSET ${offset}
    `,
    prisma.$queryRaw<Array<{ total: number }>>`
      SELECT COUNT(*) AS total
      FROM (
        SELECT pr.playerId
        FROM player_rankings pr
        JOIN players p ON p.id = pr.playerId AND p.deletedAt IS NULL
        JOIN game_player_statistics gps ON gps.playerId = pr.playerId
        JOIN games g ON g.id = gps.gameId AND g.season = ${targetSeason} AND g.deletedAt IS NULL
        WHERE pr.id IN (
          SELECT MAX(id)
          FROM player_rankings
          WHERE season = ${targetSeason}
            AND deletedAt IS NULL
          GROUP BY playerId
        )
        GROUP BY pr.playerId
        HAVING COUNT(gps.id) > 0
      )
    `,
  ]);

  if (latestPerPlayer.length === 0) {
    return { ranking: [], total: 0 };
  }

  const total = Number(countResult[0]?.total ?? 0);

  const ranking: RankingPlayer[] = latestPerPlayer.map((row, index) => {
    const totalGames = Number(row.totalGames);
    const wins = Number(row.wins);
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

    return {
      rank: offset + index + 1,
      playerId: row.playerId,
      playerName: row.playerName,
      currentRating: row.score,
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: Math.round(winRate * 100) / 100,
      lastUpdated: new Date(row.createdAt).toISOString(),
    };
  });

  return { ranking, total };
}
