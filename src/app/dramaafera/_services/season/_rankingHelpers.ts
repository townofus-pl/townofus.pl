import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

// Internal helper: get ranking snapshots before/after a session.
//
// NOTE: This implementation intentionally differs from getRankingTableAtSession in
// getRankingAfterSession.ts. This version covers ALL players using COALESCE(…, 2000)
// so that even players who have never played a game still appear (needed for top-sigmas
// and host-info ranking-change displays). getRankingAfterSession only covers players who
// already have at least one ranking row, using an INNER JOIN — which is what the
// session ranking table needs (no phantom 2000-rated entries for absent players).
export async function getRankingSnapshots(
  firstGameDbId: number,
  lastGameDbId: number,
  seasonId?: number,
): Promise<{ before: Map<string, number>; after: Map<string, number> }> {
  const prisma = await getDatabaseClient();
  if (!prisma) {
    return { before: new Map(), after: new Map() };
  }

  const season = seasonId ?? CURRENT_SEASON;

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

  return { before, after };
}

// Internal helper: convert a score map to a rank-position map (1-based, highest score = rank 1)
export function buildRankPositionMap(scoreMap: Map<string, number>): Map<string, number> {
  const sorted = Array.from(scoreMap.entries()).sort((a, b) => b[1] - a[1]);
  return new Map(sorted.map(([name], index) => [name, index + 1]));
}
