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
    await getRankingSnapshots(firstGameDb.id, lastGameDb.id, seasonId, {
      onlySeasonActivePlayers: true,
    });

  const targetSeason = seasonId ?? firstGameDb.season;
  const [seasonResetRows, priorSeasonGameRankingRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT pr.id
      FROM player_rankings pr
      WHERE pr.season = ${targetSeason}
        AND pr.deletedAt IS NULL
        AND pr.reason = 'season_reset'
      LIMIT 1
    `,
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT pr.id
      FROM player_rankings pr
      WHERE pr.season = ${targetSeason}
        AND pr.deletedAt IS NULL
        AND pr.gameId IS NOT NULL
        AND pr.gameId < ${firstGameDb.id}
      LIMIT 1
    `,
  ]);

  // Jeśli sesja jest pierwszą po season_reset (brak jakichkolwiek wpisów gry wcześniej),
  // pozycja "przed" jest semantycznie bezwartościowa — pokazujemy tylko pozycję po sesji.
  const isFirstSessionAfterSeasonReset =
    seasonResetRows.length > 0 && priorSeasonGameRankingRows.length === 0;

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
      const rankAfter = rankPositionAfter.get(playerName) ?? 0;
      const rankBefore = isFirstSessionAfterSeasonReset
        ? rankAfter
        : (rankPositionBefore.get(playerName) ?? 0);
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
