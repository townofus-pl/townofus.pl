import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';

export interface WeeklyPlayerStats {
  nickname: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  position: number;
  totalPoints: number;
}

export interface WeeklyStatsResult {
  date: string;
  weekRange: { year: number; month: number; day: number };
  players: WeeklyPlayerStats[];
  totalPlayers: number;
}

export async function getWeeklyStats(
  dateStr: string,
  seasonId?: number,
): Promise<WeeklyStatsResult> {
  const empty: WeeklyStatsResult = {
    date: dateStr,
    weekRange: {
      year: parseInt(dateStr.substring(0, 4)),
      month: parseInt(dateStr.substring(4, 6)),
      day: parseInt(dateStr.substring(6, 8)),
    },
    players: [],
    totalPlayers: 0,
  };

  const prisma = await getDatabaseClient();
  if (!prisma) return empty;

  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6));
  const day = parseInt(dateStr.substring(6, 8));

  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  const startOfWeek = new Date(targetDate);
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  endOfWeek.setHours(0, 0, 0, 0);

  const weeklyGames = await prisma.game.findMany({
    where: {
      startTime: {
        gte: startOfWeek,
        lt: endOfWeek,
      },
      ...buildSeasonGameWhere(seasonId),
    },
    include: {
      gamePlayerStatistics: {
        where: { player: withoutDeleted },
        select: {
          player: { select: { name: true } },
          win: true,
          totalPoints: true,
        },
      },
    },
  });

  if (weeklyGames.length === 0) {
    return empty;
  }

  const playerStatsMap = new Map<
    string,
    { gamesPlayed: number; wins: number; totalPoints: number }
  >();

  weeklyGames.forEach((game) => {
    game.gamePlayerStatistics.forEach((stat) => {
      const playerName = stat.player.name;

      if (!playerStatsMap.has(playerName)) {
        playerStatsMap.set(playerName, {
          gamesPlayed: 0,
          wins: 0,
          totalPoints: 0,
        });
      }

      const playerStats = playerStatsMap.get(playerName)!;
      playerStats.gamesPlayed++;
      if (stat.win) {
        playerStats.wins++;
      }
      playerStats.totalPoints += stat.totalPoints;
    });
  });

  const weeklyStats: WeeklyPlayerStats[] = Array.from(
    playerStatsMap.entries(),
  )
    .map(([nickname, stats]) => ({
      nickname,
      gamesPlayed: stats.gamesPlayed,
      wins: stats.wins,
      winRate:
        stats.gamesPlayed > 0
          ? Math.round((stats.wins / stats.gamesPlayed) * 100)
          : 0,
      totalPoints: Math.round(stats.totalPoints * 100) / 100,
      position: 0,
    }))
    .filter((player) => player.gamesPlayed >= 3)
    .sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.totalPoints - a.totalPoints;
    });

  weeklyStats.forEach((player, index) => {
    player.position = index + 1;
  });

  return {
    date: dateStr,
    weekRange: { year, month, day },
    players: weeklyStats,
    totalPlayers: weeklyStats.length,
  };
}
