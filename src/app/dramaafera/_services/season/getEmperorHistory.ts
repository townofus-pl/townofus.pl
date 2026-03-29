import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';

export interface EmperorEntry {
  nickname: string;
  count: number;
  dates: string[];
  isLatest: boolean;
}

export async function getEmperorHistory(
  seasonId?: number,
): Promise<EmperorEntry[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const allGames = await prisma.game.findMany({
    where: buildSeasonGameWhere(seasonId),
    select: {
      id: true,
      startTime: true,
      gamePlayerStatistics: {
        where: { player: withoutDeleted },
        select: {
          playerId: true,
          totalPoints: true,
          player: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  // Group by date (YYYY-MM-DD)
  const gamesByDate = new Map<string, typeof allGames>();
  allGames.forEach((game) => {
    const dateKey = game.startTime.toISOString().split('T')[0];
    if (!gamesByDate.has(dateKey)) {
      gamesByDate.set(dateKey, []);
    }
    gamesByDate.get(dateKey)!.push(game);
  });

  const allDates = Array.from(gamesByDate.keys()).sort();

  if (allDates.length === 0) return [];

  const emperorsByDate: Array<{ date: string; nickname: string }> = [];

  // Include all dates in the current season to show emperor history for the open season
  for (let i = 0; i < allDates.length; i++) {
    const dateKey = allDates[i];
    const gamesOnDate = gamesByDate.get(dateKey)!;

    const playerPoints = new Map<string, { playerId: number; points: number }>();
    gamesOnDate.forEach((game) => {
      game.gamePlayerStatistics.forEach((stat) => {
        const nickname = stat.player.name;
        const current = playerPoints.get(nickname);
        if (current) {
          current.points += stat.totalPoints;
        } else {
          playerPoints.set(nickname, {
            playerId: stat.playerId,
            points: stat.totalPoints,
          });
        }
      });
    });

    if (playerPoints.size === 0) continue;

    const maxPoints = Math.max(
      ...Array.from(playerPoints.values()).map((p) => p.points),
    );
    const playersWithMaxPoints = Array.from(playerPoints.entries())
      .filter(([, data]) => data.points === maxPoints)
      .map(([nickname]) => nickname);

    if (playersWithMaxPoints.length === 1) {
      emperorsByDate.push({ date: dateKey, nickname: playersWithMaxPoints[0] });
    }
  }

  const emperorMap = new Map<string, { count: number; dates: string[] }>();
  emperorsByDate.forEach(({ date, nickname }) => {
    const existing = emperorMap.get(nickname);
    if (existing) {
      existing.count++;
      existing.dates.push(date);
    } else {
      emperorMap.set(nickname, { count: 1, dates: [date] });
    }
  });

  const latestEmperor =
    emperorsByDate.length > 0
      ? emperorsByDate[emperorsByDate.length - 1].nickname
      : null;

  return Array.from(emperorMap.entries())
    .map(([nickname, data]) => ({
      nickname,
      count: data.count,
      dates: data.dates,
      isLatest: nickname === latestEmperor,
    }))
    .sort((a, b) => b.count - a.count);
}
