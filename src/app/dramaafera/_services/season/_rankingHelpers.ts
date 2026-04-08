import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

// Internal helper: get ranking snapshots before/after a session.
//
// NOTE: By default this implementation covers ALL players using COALESCE(…, 2000)
// so that even players who have never played a game can appear.
// Callers may opt into season-active filtering to match /ranking behavior.
export async function getRankingSnapshots(
  firstGameDbId: number,
  lastGameDbId: number,
  seasonId?: number,
  options?: { onlySeasonActivePlayers?: boolean },
): Promise<{ before: Map<string, number>; after: Map<string, number> }> {
  const prisma = await getDatabaseClient();
  if (!prisma) {
    return { before: new Map(), after: new Map() };
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

  if (!onlySeasonActivePlayers) {
    return { before, after };
  }

  // Mirror /ranking eligibility: include only players with a ranking row in the season
  // and at least one game stat in that season.
  const seasonActiveRows = await prisma.$queryRaw<Array<{ playerName: string }>>`
    SELECT DISTINCT p.name AS playerName
    FROM players p
    INNER JOIN player_rankings pr
      ON pr.playerId = p.id
      AND pr.season = ${season}
      AND pr.deletedAt IS NULL
    INNER JOIN game_player_statistics gps
      ON gps.playerId = p.id
    INNER JOIN games g
      ON g.id = gps.gameId
      AND g.season = ${season}
      AND g.deletedAt IS NULL
    WHERE p.deletedAt IS NULL
  `;

  const seasonActiveNames = new Set(seasonActiveRows.map((r) => r.playerName));
  const filteredBefore = new Map(
    Array.from(before.entries()).filter(([name]) => seasonActiveNames.has(name)),
  );
  const filteredAfter = new Map(
    Array.from(after.entries()).filter(([name]) => seasonActiveNames.has(name)),
  );

  return { before: filteredBefore, after: filteredAfter };
}

// Internal helper: convert a score map to a rank-position map (1-based, highest score = rank 1)
export function buildRankPositionMap(scoreMap: Map<string, number>): Map<string, number> {
  const sorted = Array.from(scoreMap.entries()).sort((a, b) => b[1] - a[1]);
  return new Map(sorted.map(([name], index) => [name, index + 1]));
}
