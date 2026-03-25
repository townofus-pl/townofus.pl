import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { getGamesListByDate } from '../games/getGamesList';
import { getRankingSnapshots, buildRankPositionMap } from './_rankingHelpers';

export interface PlayerRankingChange {
  nickname: string;
  rankBefore: number;
  rankAfter: number;
  ratingBefore: number;
  ratingAfter: number;
  change: number;
  ratingChange: number;
}

export interface TopSigmasResult {
  topGainers: PlayerRankingChange[];
  topLosers: PlayerRankingChange[];
  all: PlayerRankingChange[];
}

export async function getTopSigmas(
  date: string,
  seasonId?: number,
): Promise<TopSigmasResult | null> {
  const games = await getGamesListByDate(date, seasonId);
  if (!games || games.length === 0) return null;

  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  const sortedGames = [...games].sort((a, b) => a.id.localeCompare(b.id));
  const firstGameIdentifier = sortedGames[0]?.id;
  const lastGameIdentifier = sortedGames[sortedGames.length - 1]?.id;

  const firstGameDb = await prisma.game.findFirst({
    where: { gameIdentifier: firstGameIdentifier, ...withoutDeleted },
  });
  const lastGameDb = await prisma.game.findFirst({
    where: { gameIdentifier: lastGameIdentifier, ...withoutDeleted },
  });

  if (!firstGameDb || !lastGameDb) return null;

  const { before: rankingBeforeMap, after: rankingAfterMap } =
    await getRankingSnapshots(firstGameDb.id, lastGameDb.id, seasonId);

  const rankPositionBefore = buildRankPositionMap(rankingBeforeMap);
  const rankPositionAfter = buildRankPositionMap(rankingAfterMap);

  const allPlayerNames = new Set<string>();
  for (const game of games) {
    for (const playerName of game.allPlayerNames) {
      allPlayerNames.add(playerName);
    }
  }

  const rankingChanges: PlayerRankingChange[] = Array.from(allPlayerNames)
    .map((playerName) => {
      const rankBefore = rankPositionBefore.get(playerName) ?? 0;
      const rankAfter = rankPositionAfter.get(playerName) ?? 0;
      const ratingBefore = rankingBeforeMap.get(playerName) ?? 2000;
      const ratingAfter = rankingAfterMap.get(playerName) ?? 2000;

      return {
        nickname: playerName,
        rankBefore,
        rankAfter,
        ratingBefore,
        ratingAfter,
        change: rankBefore - rankAfter,
        ratingChange: ratingAfter - ratingBefore,
      };
    })
    .filter((p) => p.rankBefore > 0 && p.rankAfter > 0)
    .sort((a, b) => b.ratingChange - a.ratingChange);

  return {
    topGainers: rankingChanges.slice(0, 3),
    topLosers: rankingChanges.slice(-3).reverse(),
    all: rankingChanges,
  };
}
