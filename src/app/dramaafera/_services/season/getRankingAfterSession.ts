import { buildSeasonGameWhere, getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

export interface SessionRankingPlayer {
  nickname: string;
  rating: number;
  position: number;
  ratingChange: number;
}

async function getRankingTableAtSession(
  prisma: NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>,
  firstGame: { id: number; startTime: Date },
  lastGame: { id: number; startTime: Date },
  season: number,
  preciseRating: boolean,
): Promise<SessionRankingPlayer[]> {
  const firstTime = firstGame.startTime.toISOString();
  const lastTime = lastGame.startTime.toISOString();
  // A late import can have a greater id than a game from a later session.
  // Keep game-less season resets as the fallback, after all eligible game rows.
  const playersBeforeQuery = await prisma.$queryRaw<
    Array<{ playerId: number; playerName: string; score: number }>
  >`
    WITH latest AS (
      SELECT
        pr.playerId,
        pr.score,
        ROW_NUMBER() OVER (
          PARTITION BY pr.playerId
          ORDER BY julianday(g.startTime) DESC, pr.gameId DESC, pr.createdAt DESC, pr.id DESC
        ) AS rn
      FROM player_rankings pr
      LEFT JOIN games g ON g.id = pr.gameId AND g.deletedAt IS NULL AND g.season = pr.season
      WHERE (pr.gameId IS NULL OR (julianday(g.startTime), g.id) < (julianday(${firstTime}), ${firstGame.id}))
        AND pr.season = ${season}
        AND pr.deletedAt IS NULL
    )
    SELECT l.playerId, p.name as playerName, l.score
    FROM latest l
    INNER JOIN players p ON p.id = l.playerId AND p.deletedAt IS NULL
    WHERE l.rn = 1
    ORDER BY l.score DESC
  `;

  // Pobierz ranking po ostatniej grze dla graczy aktywnych w sezonie.
  // Używamy tej samej zasady co na stronie rankingu: gracz musi mieć
  // co najmniej jedną statystykę gry w sezonie (tu: do końca tej sesji).
  const playersAfterQuery = await prisma.$queryRaw<
    Array<{ playerId: number; playerName: string; score: number }>
  >`
    WITH latest AS (
      SELECT
        pr.playerId,
        pr.score,
        ROW_NUMBER() OVER (
          PARTITION BY pr.playerId
          ORDER BY julianday(g.startTime) DESC, pr.gameId DESC, pr.createdAt DESC, pr.id DESC
        ) AS rn
      FROM player_rankings pr
      LEFT JOIN games g ON g.id = pr.gameId AND g.deletedAt IS NULL AND g.season = pr.season
      WHERE (pr.gameId IS NULL OR (julianday(g.startTime), g.id) <= (julianday(${lastTime}), ${lastGame.id}))
        AND pr.season = ${season}
        AND pr.deletedAt IS NULL
    )
    SELECT l.playerId, p.name as playerName, l.score
    FROM latest l
    INNER JOIN players p ON p.id = l.playerId AND p.deletedAt IS NULL
    WHERE l.rn = 1
      AND EXISTS (
        SELECT 1
        FROM game_player_statistics gps
        INNER JOIN games g ON g.id = gps.gameId
        WHERE gps.playerId = l.playerId
          AND g.season = ${season}
          AND g.deletedAt IS NULL
          AND (julianday(g.startTime), g.id) <= (julianday(${lastTime}), ${lastGame.id})
      )
    ORDER BY l.score DESC
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
      rating: preciseRating ? Number(player.score) : Math.round(Number(player.score)),
      position: index + 1,
      ratingChange: Math.round(ratingChange),
    };
  });
}

export async function getRankingAfterSession(
  date: string,
  seasonId?: number,
  { preciseRating = false }: { preciseRating?: boolean } = {},
): Promise<SessionRankingPlayer[] | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  const season = seasonId ?? CURRENT_SEASON;
  const games = await prisma.game.findMany({
    where: {
      ...buildSeasonGameWhere(season),
      gameIdentifier: { startsWith: date },
    },
    select: { id: true, startTime: true },
  });
  games.sort((a, b) => a.startTime.getTime() - b.startTime.getTime() || a.id - b.id);
  const first = games[0];
  const last = games.at(-1);
  return first && last ? getRankingTableAtSession(prisma, first, last, season, preciseRating) : null;
}
