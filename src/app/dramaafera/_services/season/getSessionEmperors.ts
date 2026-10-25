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
  const emperors = await getSessionEmperors(seasonId);
  return emperors.at(-1)?.playerId ?? null;
}
