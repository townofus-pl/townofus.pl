import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { RANKING_CONSTANTS } from '@/app/api/_utils/rankingCalculator';

const { START_RATING } = RANKING_CONSTANTS;

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

export async function getRanking(
  seasonId?: number,
  limit = 50,
  offset = 0,
): Promise<RankingResult> {
  const targetSeason = seasonId ?? CURRENT_SEASON;

  const prisma = await getDatabaseClient();
  if (!prisma) return { ranking: [], total: 0 };

  // Aktualny sezon: używamy currentRankingId gracza (szybka ścieżka).
  // Filtrujemy tylko graczy, których currentRanking należy do bieżącego sezonu —
  // przed pierwszą grą sezonu ranking jest pusty (reset jeszcze nie nastąpił).
  if (targetSeason === CURRENT_SEASON) {
    const players = await prisma.player.findMany({
      where: {
        ...withoutDeleted,
        currentRanking: { season: targetSeason, deletedAt: null },
        gamePlayerStatistics: { some: { game: { ...withoutDeleted, season: targetSeason } } },
      },
      include: {
        currentRanking: true,
        gamePlayerStatistics: {
          where: { game: { ...withoutDeleted, season: targetSeason } },
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
        currentRating: (player.currentRanking && player.currentRanking.season === targetSeason)
          ? player.currentRanking.score
          : START_RATING,
        totalGames,
        wins,
        losses: totalGames - wins,
        winRate: Math.round(winRate * 100) / 100,
        lastUpdated: (player.currentRanking?.createdAt ?? player.createdAt).toISOString(),
      };
    });

    const total = await prisma.player.count({
      where: {
        ...withoutDeleted,
        currentRanking: { season: targetSeason, deletedAt: null },
        gamePlayerStatistics: { some: { game: { ...withoutDeleted, season: targetSeason } } },
      },
    });

    return { ranking, total };
  }

  // Miniony sezon: pobieramy najnowszy wpis rankingowy per gracz via raw SQL
  // (MAX(id) per playerId — unikamy take: N, które przy wielu wpisach per gracz
  //  ucinałoby graczy z wyższymi playerId).
  // Sortowanie, filtrowanie graczy bez gier, paginacja i COUNT wykonywane są w SQL —
  // unikamy ładowania całego rankingu do pamięci i sortowania O(n log n) w JS.
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
