import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

/** Unique session winners, oldest first. The newest date stays open in the
 * current season; every date is closed once the season has ended. Ties award
 * no star and leave the previous emperor in place. Shared by all three views. */
export async function getSessionEmperors(seasonId = CURRENT_SEASON) {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  return prisma.$queryRaw<{ date: string; playerId: number }[]>`
    WITH latest_date AS (
      SELECT MAX(SUBSTR(startTime, 1, 10)) AS date FROM games
      WHERE season = ${seasonId} AND deletedAt IS NULL
    ), session_points AS (
      SELECT SUBSTR(g.startTime, 1, 10) AS date, gps.playerId,
             SUM(gps.totalPoints) AS points
      FROM games g
      JOIN game_player_statistics gps ON gps.gameId = g.id
      WHERE g.season = ${seasonId} AND g.deletedAt IS NULL
        AND gps.playerId NOT IN (SELECT id FROM players WHERE deletedAt IS NOT NULL)
        AND (${seasonId < CURRENT_SEASON ? 1 : 0} = 1
          OR SUBSTR(g.startTime, 1, 10) < (SELECT date FROM latest_date))
      GROUP BY SUBSTR(g.startTime, 1, 10), gps.playerId
    ), ranked AS (
      SELECT date, playerId, RANK() OVER (PARTITION BY date ORDER BY points DESC) AS place
      FROM session_points
    )
    SELECT date, MAX(playerId) AS playerId FROM ranked
    WHERE place = 1
    GROUP BY date HAVING COUNT(*) = 1
    ORDER BY date ASC
  `;
}

export async function getLatestEmperorId(seasonId = CURRENT_SEASON): Promise<number | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  // The crown needs only the latest unique winner, not every season's point sums.
  // Read the small games table once, then aggregate sessions newest-first until
  // a unique winner is found. Ties and sessions without active players fall back.
  const dates = await prisma.$queryRaw<{ date: string }[]>`
    SELECT DISTINCT SUBSTR(startTime, 1, 10) AS date FROM games
    WHERE season = ${seasonId} AND deletedAt IS NULL
    ORDER BY date DESC
  `;
  const closedDates = seasonId < CURRENT_SEASON ? dates : dates.slice(1);
  // Bound round trips for long runs of ties; the full-history path remains the
  // fallback when checking a few recent sessions does not resolve the crown.
  const recentDates = closedDates.slice(0, 3);
  for (const { date } of recentDates) {
    const nextDay = new Date(`${date}T00:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    const end = nextDay.toISOString().slice(0, 10);
    const leaders = await prisma.$queryRaw<{ playerId: number; points: number }[]>`
      SELECT gps.playerId, SUM(gps.totalPoints) AS points
      FROM games g
      JOIN game_player_statistics gps ON gps.gameId = g.id
      WHERE g.season = ${seasonId} AND g.deletedAt IS NULL
        AND g.startTime >= ${date} AND g.startTime < ${end}
        AND gps.playerId NOT IN (SELECT id FROM players WHERE deletedAt IS NOT NULL)
      GROUP BY gps.playerId
      ORDER BY points DESC
      LIMIT 2
    `;
    if (leaders.length === 1 || (leaders.length === 2 && leaders[0].points !== leaders[1].points)) {
      return leaders[0].playerId;
    }
  }
  if (closedDates.length > recentDates.length) {
    return (await getSessionEmperors(seasonId)).at(-1)?.playerId ?? null;
  }
  return null;
}
