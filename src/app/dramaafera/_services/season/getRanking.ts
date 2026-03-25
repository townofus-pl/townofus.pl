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
      where: { ...withoutDeleted, currentRanking: { season: targetSeason } },
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
      where: { ...withoutDeleted, currentRanking: { season: targetSeason } },
    });

    return { ranking, total };
  }

  // Miniony sezon: currentRankingId wskazuje na bieżący sezon, więc szukamy
  // ostatniego wpisu PlayerRanking dla danego sezonu per gracz
  const rankingRows = await prisma.playerRanking.findMany({
    where: {
      season: targetSeason,
      deletedAt: null,
      player: withoutDeleted,
    },
    orderBy: [{ playerId: 'asc' }, { createdAt: 'desc' }],
    select: {
      playerId: true,
      score: true,
      createdAt: true,
      player: { select: { id: true, name: true } },
    },
  });

  // Deduplikacja: zachowaj tylko najnowszy wpis per gracz
  // (wyniki posortowane po playerId ASC, createdAt DESC — pierwszy = najnowszy)
  const seenPlayerIds = new Set<number>();
  const latestPerPlayer = rankingRows.filter((row) => {
    if (seenPlayerIds.has(row.playerId)) return false;
    seenPlayerIds.add(row.playerId);
    return true;
  });

  if (latestPerPlayer.length === 0) {
    return { ranking: [], total: 0 };
  }

  // Pobierz statystyki wygranych/przegranych dla graczy z tego sezonu
  // Używamy filtra relacji zamiast IN clause (ograniczenie D1)
  const playersWithStats = await prisma.player.findMany({
    where: {
      ...withoutDeleted,
      rankingHistory: { some: { season: targetSeason, deletedAt: null } },
    },
    select: {
      id: true,
      gamePlayerStatistics: {
        where: { game: { ...withoutDeleted, season: targetSeason } },
        select: { win: true },
      },
    },
  });

  const statsMap = new Map(
    playersWithStats.map((p) => [
      p.id,
      {
        totalGames: p.gamePlayerStatistics.length,
        wins: p.gamePlayerStatistics.filter((s) => s.win).length,
      },
    ]),
  );

  // Złóż wyniki, posortuj po wyniku malejąco, paginuj w kodzie
  const entries: RankingPlayer[] = latestPerPlayer.map((row) => {
    const stats = statsMap.get(row.playerId) ?? { totalGames: 0, wins: 0 };
    const winRate = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;

    return {
      rank: 0, // zostanie przypisany po sortowaniu
      playerId: row.playerId,
      playerName: row.player.name,
      currentRating: row.score,
      totalGames: stats.totalGames,
      wins: stats.wins,
      losses: stats.totalGames - stats.wins,
      winRate: Math.round(winRate * 100) / 100,
      lastUpdated: row.createdAt.toISOString(),
    };
  });

  entries.sort((a, b) => b.currentRating - a.currentRating);

  const total = entries.length;
  const paginated = entries.slice(offset, offset + limit);
  paginated.forEach((p, i) => {
    p.rank = offset + i + 1;
  });

  return { ranking: paginated, total };
}
