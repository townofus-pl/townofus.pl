import { getDatabaseClient } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { getRankingSnapshots, buildRankPositionMap } from './_rankingHelpers';
import { formatDisplayDate } from '@/app/dramaafera/_utils/gameUtils';

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

  const displayDate = formatDisplayDate(date);

  // Per-day host page — typically ~10 games and a couple hundred stats. The
  // include + nested player select would otherwise emit `WHERE playerId IN (…)`
  // for the relation fetch and risk D1's 98-param cap on busy nights.
  const games = await prisma.game.findMany({
    where: {
      ...withoutDeleted,
      gameIdentifier: { startsWith: date },
      season: seasonId ?? CURRENT_SEASON,
    },
    select: { id: true },
    orderBy: { startTime: 'asc' },
  });

  if (games.length === 0) return null;

  const gameIds = games.map((g) => g.id);

  const rawStats = await chunkedInQuery(gameIds, (chunk) =>
    prisma.gamePlayerStatistics.findMany({
      where: { gameId: { in: chunk }, player: withoutDeleted },
      select: { playerId: true, totalPoints: true },
    }),
  );

  const uniquePlayerIds = Array.from(new Set(rawStats.map((s) => s.playerId)));
  const dbPlayers = await chunkedInQuery(uniquePlayerIds, (chunk) =>
    prisma.player.findMany({
      where: { id: { in: chunk } },
      select: { id: true, name: true },
    }),
  );
  const playerNameById = new Map(dbPlayers.map((p) => [p.id, p.name]));

  const firstGameDb = games[0];
  const lastGameDb = games[games.length - 1];

  const { before: rankingBeforeMap, after: rankingAfterMap } =
    await getRankingSnapshots(firstGameDb.id, lastGameDb.id, seasonId);

  const playerMap = new Map<string, HostPlayerInfo>();
  rawStats.forEach((playerStat) => {
    const playerName = playerNameById.get(playerStat.playerId);
    if (!playerName) return;
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
