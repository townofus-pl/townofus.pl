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
          AND pr2.deletedAt IS NULL
        ORDER BY pr2.gameId DESC, pr2.createdAt DESC
        LIMIT 1
      )
    ORDER BY pr1.score DESC
  `;

  // Pobierz ranking po ostatniej grze dla graczy aktywnych w sezonie.
  // Używamy tej samej zasady co na stronie rankingu: gracz musi mieć
  // co najmniej jedną statystykę gry w sezonie (tu: do końca tej sesji).
  const playersAfterQuery = await prisma.$queryRaw<
    Array<{ playerId: number; playerName: string; score: number }>
  >`
    SELECT
      pr1.playerId,
      p.name as playerName,
      pr1.score
    FROM player_rankings pr1
    INNER JOIN players p ON pr1.playerId = p.id
    WHERE (pr1.gameId <= ${lastGameDbId} OR pr1.gameId IS NULL)
      AND pr1.season = ${season}
      AND pr1.deletedAt IS NULL
      AND p.deletedAt IS NULL
      AND EXISTS (
        SELECT 1
        FROM game_player_statistics gps
        INNER JOIN games g ON g.id = gps.gameId
        WHERE gps.playerId = pr1.playerId
          AND g.season = ${season}
          AND g.deletedAt IS NULL
          AND g.id <= ${lastGameDbId}
      )
      AND pr1.id = (
        SELECT pr2.id
        FROM player_rankings pr2
        WHERE pr2.playerId = pr1.playerId
          AND (pr2.gameId <= ${lastGameDbId} OR pr2.gameId IS NULL)
          AND pr2.season = ${season}
          AND pr2.deletedAt IS NULL
        ORDER BY pr2.gameId DESC, pr2.createdAt DESC
        LIMIT 1
      )
    ORDER BY pr1.score DESC
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

  // Fetch both boundary games in a single query (only 2 values — safe for D1 variable limit)
  const boundaryGames = await prisma.game.findMany({
    where: {
      gameIdentifier: { in: [firstGameIdentifier, lastGameIdentifier] },
      ...withoutDeleted,
    },
  });

  const firstGameDb = boundaryGames.find(g => g.gameIdentifier === firstGameIdentifier);
  const lastGameDb = boundaryGames.find(g => g.gameIdentifier === lastGameIdentifier);

  if (!firstGameDb || !lastGameDb) return null;

  return getRankingTableAtSession(firstGameDb.id, lastGameDb.id, seasonId);
}
