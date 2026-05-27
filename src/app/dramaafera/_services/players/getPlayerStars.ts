import { getDatabaseClient } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

/**
 * Pobierz liczbę gwiazdek gracza (dni, w których miał najwięcej punktów).
 * Gwiazdka z ostatniej sesji pojawia się dopiero po pojawieniu się gry z nowej daty.
 *
 * Implementation note: previously this used `game.findMany` with a nested
 * `gamePlayerStatistics` include, which on Prisma 7 emits `WHERE gameId IN (…N)`
 * for the relation fetch — with a full-season dataset that exceeds D1's 98
 * bound-parameter cap (P2029). We fetch games and stats in chunks separately
 * and stitch in JS.
 */
export async function getPlayerStars(nick: string, seasonId?: number): Promise<number> {
  const prisma = await getDatabaseClient();
  if (!prisma) return 0;

  const player = await prisma.player.findFirst({
    where: { name: nick, ...withoutDeleted },
    select: { id: true },
  });
  if (!player) return 0;

  const allGames = await prisma.game.findMany({
    where: {
      ...withoutDeleted,
      season: seasonId ?? CURRENT_SEASON,
    },
    select: { id: true, startTime: true },
    orderBy: { startTime: 'asc' },
  });

  if (allGames.length === 0) return 0;

  const gameIds = allGames.map((g) => g.id);
  const stats = await chunkedInQuery(gameIds, (chunk) =>
    prisma.gamePlayerStatistics.findMany({
      where: { gameId: { in: chunk }, player: withoutDeleted },
      select: { gameId: true, playerId: true, totalPoints: true },
    }),
  );

  const statsByGameId = new Map<number, { playerId: number; totalPoints: number }[]>();
  stats.forEach((s) => {
    const list = statsByGameId.get(s.gameId) ?? [];
    list.push({ playerId: s.playerId, totalPoints: s.totalPoints });
    statsByGameId.set(s.gameId, list);
  });

  const gamesByDate = new Map<string, typeof allGames>();
  allGames.forEach((game) => {
    const dateKey = game.startTime.toISOString().split('T')[0];
    if (!gamesByDate.has(dateKey)) {
      gamesByDate.set(dateKey, []);
    }
    gamesByDate.get(dateKey)!.push(game);
  });

  const allDates = Array.from(gamesByDate.keys()).sort();

  // Need at least one closed date (i.e. a more recent date must exist) to award a star.
  if (allDates.length <= 1) {
    return 0;
  }

  let stars = 0;
  for (let i = 0; i < allDates.length - 1; i++) {
    const dateKey = allDates[i];
    const gamesOnDate = gamesByDate.get(dateKey)!;

    const playerPoints = new Map<number, number>();
    gamesOnDate.forEach((game) => {
      const gameStats = statsByGameId.get(game.id) ?? [];
      gameStats.forEach((stat) => {
        const currentPoints = playerPoints.get(stat.playerId) || 0;
        playerPoints.set(stat.playerId, currentPoints + stat.totalPoints);
      });
    });

    if (playerPoints.size === 0) continue;

    const maxPoints = Math.max(...playerPoints.values());
    const playersWithMaxPoints = Array.from(playerPoints.entries())
      .filter(([, points]) => points === maxPoints)
      .map(([playerId]) => playerId);

    if (playersWithMaxPoints.length === 1 && playersWithMaxPoints[0] === player.id) {
      stars++;
    }
  }

  return stars;
}
