import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

// Internal helper: get ranking snapshots before/after a session.
//
// NOTE: By default this implementation covers ALL players using COALESCE(…, 2000)
// so that even players who have never played a game can appear.
// Callers may opt into season-active filtering to match /ranking behavior.
//
// `isFirstSessionAfterSeasonReset` travels with the snapshots because it is a fact about them,
// not about any one caller. On the first session of a reset season every `before` score is 2000,
// so `buildRankPositionMap` sorts an all-tie map and hands out 1..N in whatever order SQLite
// returned — a "rank change" computed from that is noise. The probe used to live inside
// getTopSigmas, which is why getHostInfo shipped that noise. See #315.
export async function getRankingSnapshots(
  firstGameDbId: number,
  lastGameDbId: number,
  seasonId?: number,
  options?: { onlySeasonActivePlayers?: boolean },
): Promise<{
  before: Map<string, number>;
  after: Map<string, number>;
  isFirstSessionAfterSeasonReset: boolean;
}> {
  const prisma = await getDatabaseClient();
  if (!prisma) {
    return { before: new Map(), after: new Map(), isFirstSessionAfterSeasonReset: false };
  }

  const season = seasonId ?? CURRENT_SEASON;
  const onlySeasonActivePlayers = options?.onlySeasonActivePlayers === true;

  const beforeQuery = await prisma.$queryRaw<
    Array<{ playerId: number; playerName: string; score: number }>
  >`
    SELECT DISTINCT
      p.id as playerId,
      p.name as playerName,
      COALESCE(
        (SELECT pr.score
         FROM player_rankings pr
         WHERE pr.playerId = p.id
           AND pr.deletedAt IS NULL
           AND pr.season = ${season}
           AND (pr.gameId IS NULL OR pr.gameId < ${firstGameDbId})
         ORDER BY pr.createdAt DESC
         LIMIT 1),
        2000
      ) as score
    FROM players p
    WHERE p.deletedAt IS NULL
  `;

  const afterQuery = await prisma.$queryRaw<
    Array<{ playerId: number; playerName: string; score: number }>
  >`
    SELECT DISTINCT
      p.id as playerId,
      p.name as playerName,
      COALESCE(
        (SELECT pr.score
         FROM player_rankings pr
         WHERE pr.playerId = p.id
           AND pr.deletedAt IS NULL
           AND pr.season = ${season}
           AND (pr.gameId IS NULL OR pr.gameId <= ${lastGameDbId})
         ORDER BY pr.createdAt DESC
         LIMIT 1),
        2000
      ) as score
    FROM players p
    WHERE p.deletedAt IS NULL
  `;

  const before = new Map<string, number>(
    beforeQuery.map((r) => [r.playerName, Number(r.score)]),
  );
  const after = new Map<string, number>(
    afterQuery.map((r) => [r.playerName, Number(r.score)]),
  );

  // The season has been reset and no game in it produced a ranking row before this session.
  const [seasonResetRows, priorSeasonGameRankingRows] = await Promise.all([
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT pr.id FROM player_rankings pr
      WHERE pr.season = ${season} AND pr.deletedAt IS NULL AND pr.reason = 'season_reset'
      LIMIT 1
    `,
    prisma.$queryRaw<Array<{ id: number }>>`
      SELECT pr.id FROM player_rankings pr
      WHERE pr.season = ${season} AND pr.deletedAt IS NULL
        AND pr.gameId IS NOT NULL AND pr.gameId < ${firstGameDbId}
      LIMIT 1
    `,
  ]);
  const isFirstSessionAfterSeasonReset =
    seasonResetRows.length > 0 && priorSeasonGameRankingRows.length === 0;

  if (!onlySeasonActivePlayers) {
    return { before, after, isFirstSessionAfterSeasonReset };
  }

  // Mirror /ranking eligibility: include only players with a ranking row in the season
  // and at least one game stat in that season.
  //
  // Two EXISTS rather than two INNER JOINs + DISTINCT: the joins produced the full cross product
  // of a player's ranking rows and their game stats before collapsing it, which measured 857 ms
  // and ~10M rows read to return 52 names. EXISTS short-circuits on the first match.
  // Measured 857 ms -> 1.28 ms, identical output. See #299.
  const seasonActiveRows = await prisma.$queryRaw<Array<{ playerName: string }>>`
    SELECT p.name AS playerName
    FROM players p
    WHERE p.deletedAt IS NULL
      AND EXISTS (
        SELECT 1 FROM player_rankings pr
        WHERE pr.playerId = p.id
          AND pr.season = ${season}
          AND pr.deletedAt IS NULL
      )
      AND EXISTS (
        SELECT 1 FROM game_player_statistics gps
        INNER JOIN games g ON g.id = gps.gameId
        WHERE gps.playerId = p.id
          AND g.season = ${season}
          AND g.deletedAt IS NULL
      )
  `;

  const seasonActiveNames = new Set(seasonActiveRows.map((r) => r.playerName));
  const filteredBefore = new Map(
    Array.from(before.entries()).filter(([name]) => seasonActiveNames.has(name)),
  );
  const filteredAfter = new Map(
    Array.from(after.entries()).filter(([name]) => seasonActiveNames.has(name)),
  );

  return { before: filteredBefore, after: filteredAfter, isFirstSessionAfterSeasonReset };
}

// Internal helper: convert a score map to a rank-position map (1-based, highest score = rank 1)
export function buildRankPositionMap(scoreMap: Map<string, number>): Map<string, number> {
  const sorted = Array.from(scoreMap.entries()).sort((a, b) => b[1] - a[1]);
  return new Map(sorted.map(([name], index) => [name, index + 1]));
}
