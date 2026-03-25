import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { getGamesListByDate } from '../games/getGamesList';

export interface SessionRankingPlayer {
  nickname: string;
  rating: number;
  position: number;
  ratingChange: number;
}

async function getRankingTableAtSession(
  firstGameDbId: number,
  lastGameDbId: number,
  seasonId?: number,
): Promise<SessionRankingPlayer[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const season = seasonId ?? CURRENT_SEASON;

  // Pobierz ranking przed pierwszą grą
  // NOTE: (pr.gameId < firstGameDbId OR pr.gameId IS NULL) intentionally includes
  // season_reset entries (which have gameId = NULL). This is by design — a season_reset
  // row represents the player's starting rating for the season. SQLite sorts NULLs last
  // in DESC order, so if a player has both game entries and a season_reset entry before
  // firstGameDbId, the most recent game entry wins (higher gameId takes precedence).
  const playersBeforeQuery = await prisma.$queryRaw<
    Array<{ playerId: number; playerName: string; score: number }>
  >`
    SELECT
      pr1.playerId,
      p.name as playerName,
      pr1.score
    FROM player_rankings pr1
    INNER JOIN players p ON pr1.playerId = p.id
    WHERE (pr1.gameId < ${firstGameDbId} OR pr1.gameId IS NULL)
      AND pr1.season = ${season}
      AND pr1.deletedAt IS NULL
      AND p.deletedAt IS NULL
      AND pr1.id = (
        SELECT pr2.id
        FROM player_rankings pr2
        WHERE pr2.playerId = pr1.playerId
          AND (pr2.gameId < ${firstGameDbId} OR pr2.gameId IS NULL)
          AND pr2.season = ${season}
        ORDER BY pr2.gameId DESC, pr2.createdAt DESC
        LIMIT 1
      )
    ORDER BY pr1.score DESC
  `;

  // Pobierz ranking po ostatniej grze
  const playersAfterQuery = await prisma.$queryRaw<
    Array<{ playerId: number; playerName: string; score: number }>
  >`
    SELECT
      pr.playerId,
      p.name as playerName,
      pr.score
    FROM player_rankings pr
    INNER JOIN players p ON pr.playerId = p.id
    WHERE pr.gameId = ${lastGameDbId}
      AND pr.season = ${season}
      AND pr.deletedAt IS NULL
      AND p.deletedAt IS NULL
    ORDER BY pr.score DESC
  `;

  const beforeMap = new Map<number, number>();
  playersBeforeQuery.forEach((p) => {
    beforeMap.set(p.playerId, Number(p.score));
  });

  return playersAfterQuery.map((player, index) => {
    const ratingBefore = beforeMap.get(player.playerId) ?? Number(player.score);
    const ratingChange = Number(player.score) - ratingBefore;

    return {
      nickname: player.playerName,
      rating: Math.round(Number(player.score)),
      position: index + 1,
      ratingChange: Math.round(ratingChange),
    };
  });
}

export async function getRankingAfterSession(
  date: string,
  seasonId?: number,
): Promise<SessionRankingPlayer[] | null> {
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

  return getRankingTableAtSession(firstGameDb.id, lastGameDb.id, seasonId);
}
