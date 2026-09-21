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
}

interface RankingRow {
  playerId: number;
  playerName: string;
  score: number;
  createdAt: string;
  totalGames: number;
  wins: number;
}

// Raw SQL rather than Prisma: the previous `player.findMany({ include: { gamePlayerStatistics } })`
// blew past D1's 98-param cap on full prod data (Prisma 7 emits `WHERE playerId IN (…)` for the
// relation fetch — P2029).
//
// Two variants, because they have different cheapest forms:
//
//   current season — `players.currentRankingId` already points at the answer, so drive off the
//     310 games and look the score up by primary key. ~10k rows read.
//   past seasons   — `currentRankingId` is season-agnostic and would return the player's rating
//     today, not their rating when that season ended, so the terminal row has to be found with
//     `MAX(id) … GROUP BY playerId`. ~78k rows read, but past seasons are immutable and rarely
//     viewed.
//
// Both drive the aggregate off `games` (small, indexed on `season`) instead of scanning
// `player_rankings` (28k rows and growing O(players × games)). Measured 8.0 ms → 1.62 ms for the
// current season, identical output. See #299.
export async function getRanking(
  seasonId?: number,
  limit = 50,
  offset = 0,
): Promise<RankingResult> {
  const targetSeason = seasonId ?? CURRENT_SEASON;

  const prisma = await getDatabaseClient();
  if (!prisma) return { ranking: [] };

  const rows =
    targetSeason === CURRENT_SEASON
      ? await prisma.$queryRaw<RankingRow[]>`
          SELECT
            t.playerId,
            p.name      AS playerName,
            pr.score,
            pr.createdAt,
            t.totalGames,
            t.wins
          FROM (
            SELECT
              gps.playerId,
              COUNT(*) AS totalGames,
              SUM(CASE WHEN gps.win = 1 THEN 1 ELSE 0 END) AS wins
            FROM games g
            JOIN game_player_statistics gps ON gps.gameId = g.id
            WHERE g.season = ${targetSeason} AND g.deletedAt IS NULL
            GROUP BY gps.playerId
          ) t
          JOIN players p ON p.id = t.playerId AND p.deletedAt IS NULL
          JOIN player_rankings pr ON pr.id = p.currentRankingId AND pr.deletedAt IS NULL
          ORDER BY pr.score DESC
          LIMIT ${limit} OFFSET ${offset}
        `
      : await prisma.$queryRaw<RankingRow[]>`
          SELECT
            t.playerId,
            p.name      AS playerName,
            pr.score,
            pr.createdAt,
            t.totalGames,
            t.wins
          FROM (
            SELECT
              gps.playerId,
              COUNT(*) AS totalGames,
              SUM(CASE WHEN gps.win = 1 THEN 1 ELSE 0 END) AS wins
            FROM games g
            JOIN game_player_statistics gps ON gps.gameId = g.id
            WHERE g.season = ${targetSeason} AND g.deletedAt IS NULL
            GROUP BY gps.playerId
          ) t
          JOIN players p ON p.id = t.playerId AND p.deletedAt IS NULL
          JOIN player_rankings pr ON pr.id = (
            SELECT MAX(id) FROM player_rankings
            WHERE playerId = t.playerId AND season = ${targetSeason} AND deletedAt IS NULL
          )
          ORDER BY pr.score DESC
          LIMIT ${limit} OFFSET ${offset}
        `;

  const ranking: RankingPlayer[] = rows.map((row, index) => {
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

  return { ranking };
}
