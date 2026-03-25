import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

/**
 * Pobierz liczbę gwiazdek gracza (dni, w których miał najwięcej punktów)
 * Gwiazdka z ostatniej sesji pojawia się dopiero po pojawieniu się gry z nowej daty
 */
export async function getPlayerStars(nick: string, seasonId?: number): Promise<number> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return 0;
  }

  const player = await prisma.player.findFirst({
    where: {
      name: nick,
      ...withoutDeleted
    }
  });

  if (!player) {
    return 0;
  }

  const allGames = await prisma.game.findMany({
    where: {
      ...withoutDeleted,
      season: seasonId ?? CURRENT_SEASON
    },
    select: {
      id: true,
      startTime: true,
      gamePlayerStatistics: {
        where: { player: withoutDeleted },
        select: {
          playerId: true,
          totalPoints: true
        }
      }
    },
    orderBy: {
      startTime: 'asc'
    }
  });

  const gamesByDate = new Map<string, typeof allGames>();
  allGames.forEach(game => {
    const dateKey = game.startTime.toISOString().split('T')[0];
    if (!gamesByDate.has(dateKey)) {
      gamesByDate.set(dateKey, []);
    }
    gamesByDate.get(dateKey)!.push(game);
  });

  const allDates = Array.from(gamesByDate.keys()).sort();

  if (allDates.length <= 1) {
    return 0;
  }

  let stars = 0;
  for (let i = 0; i < allDates.length - 1; i++) {
    const dateKey = allDates[i];
    const gamesOnDate = gamesByDate.get(dateKey)!;

    const playerPoints = new Map<number, number>();
    gamesOnDate.forEach(game => {
      game.gamePlayerStatistics.forEach(stat => {
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
