import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { getRankingSnapshots, buildRankPositionMap } from './_rankingHelpers';

interface HostPlayerInfo {
  name: string;
  avatar: string;
  totalPoints: number;
  games: number;
}

export interface HostRankingChange {
  name: string;
  avatar: string;
  rankBefore: number;
  rankAfter: number;
  change: number;
  ratingBefore: number;
  ratingAfter: number;
}

export interface HostInfoResult {
  players: HostPlayerInfo[];
  rankingChanges: HostRankingChange[];
  totalGames: number;
  displayDate: string;
}

export async function getHostInfo(
  date: string,
  seasonId?: number,
): Promise<HostInfoResult | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  const polishMonths = [
    '',
    'stycznia',
    'lutego',
    'marca',
    'kwietnia',
    'maja',
    'czerwca',
    'lipca',
    'sierpnia',
    'września',
    'października',
    'listopada',
    'grudnia',
  ];
  const year = date.substring(0, 4);
  const month = date.substring(4, 6);
  const day = date.substring(6, 8);
  const displayDate = `${parseInt(day)} ${polishMonths[parseInt(month)]} ${year}`;

  const games = await prisma.game.findMany({
    where: {
      ...withoutDeleted,
      gameIdentifier: { startsWith: date },
      season: seasonId ?? CURRENT_SEASON,
    },
    include: {
      gamePlayerStatistics: {
        include: {
          player: { select: { id: true, name: true } },
          roleHistory: true,
          modifiers: true,
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  if (games.length === 0) return null;

  const firstGameDb = games[0];
  const lastGameDb = games[games.length - 1];

  const { before: rankingBeforeMap, after: rankingAfterMap } =
    await getRankingSnapshots(firstGameDb.id, lastGameDb.id, seasonId);

  const playerMap = new Map<string, HostPlayerInfo>();
  games.forEach((game) => {
    game.gamePlayerStatistics.forEach((playerStat) => {
      const playerName = playerStat.player.name;
      if (!playerMap.has(playerName)) {
        playerMap.set(playerName, {
          name: playerName,
          avatar: `/images/avatars/${playerName}.png`,
          totalPoints: 0,
          games: 0,
        });
      }
      const stats = playerMap.get(playerName)!;
      stats.totalPoints += playerStat.totalPoints;
      stats.games++;
    });
  });

  const rankPositionBefore = buildRankPositionMap(rankingBeforeMap);
  const rankPositionAfter = buildRankPositionMap(rankingAfterMap);

  const rankingChanges: HostRankingChange[] = Array.from(playerMap.keys())
    .map((playerName) => {
      const rankBefore = rankPositionBefore.get(playerName) ?? 0;
      const rankAfter = rankPositionAfter.get(playerName) ?? 0;
      const ratingBefore = rankingBeforeMap.get(playerName) ?? 2000;
      const ratingAfter = rankingAfterMap.get(playerName) ?? 2000;

      return {
        name: playerName,
        avatar: `/images/avatars/${playerName}.png`,
        rankBefore,
        rankAfter,
        change: rankBefore - rankAfter,
        ratingBefore,
        ratingAfter,
      };
    })
    .filter((p) => p.rankBefore > 0 && p.rankAfter > 0)
    .sort(
      (a, b) =>
        b.ratingAfter - b.ratingBefore - (a.ratingAfter - a.ratingBefore),
    );

  const players = Array.from(playerMap.values()).sort(
    (a, b) => b.totalPoints - a.totalPoints,
  );

  return {
    players,
    rankingChanges,
    totalGames: games.length,
    displayDate,
  };
}
