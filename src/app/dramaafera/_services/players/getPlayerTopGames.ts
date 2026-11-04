import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import type { PlayerTopGame } from './types';
import { getLatestGameDay } from '../games/getLatestGameDay';
import {
  formatDuration,
  convertRoleNameForDisplay,
  getRoleColor,
  determineTeam,
} from '@/app/dramaafera/_utils/gameUtils';

// Get player's best games
export async function getPlayerTopGames(playerName: string, limit: number = 3, seasonId?: number, offset: number = 0): Promise<{ best: PlayerTopGame[]; hasMore: boolean }> {
    const season = seasonId ?? CURRENT_SEASON;
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return { best: [], hasMore: false };
  }

  const player = await prisma.player.findFirst({
    where: {
      name: playerName,
      ...withoutDeleted
    }
  });

  if (!player) {
    return { best: [], hasMore: false };
  }

  // Gry z ostatniego dnia z grami w sezonie nie wchodzą na tę listę (ta sama granica co opóźnione DAP).
  const latestDay = await getLatestGameDay(season);

  const playerGames = await prisma.gamePlayerStatistics.findMany({
    where: {
      playerId: player.id,
      ...(latestDay && latestDay.gameIds.length > 0 ? { gameId: { notIn: latestDay.gameIds } } : {}),
      game: {
        ...withoutDeleted,
        season: seasonId ?? CURRENT_SEASON
      }
    },
    include: {
      game: {
        select: {
          gameIdentifier: true,
          startTime: true,
          endTime: true,
          map: true
        }
      },
      roleHistory: {
        orderBy: { order: 'asc' },
        take: 1
      }
    },
    // Kolejność po wartości punktowej zostaje na serwerze, a pole nie idzie do wyniku.
    orderBy: [{ totalPoints: 'desc' }, { id: 'asc' }],
    skip: offset,
    take: limit + 1
  });

  const mapGame = (stat: typeof playerGames[0]): PlayerTopGame => {
    const roleName = stat.roleHistory[0]?.roleName || 'Unknown';
    const displayRoleName = convertRoleNameForDisplay(roleName);
    const roleColor = getRoleColor(displayRoleName, season);
    const team = determineTeam(roleName, season);

    return {
      gameIdentifier: stat.game.gameIdentifier,
      date: stat.game.startTime,
      map: stat.game.map,
      duration: formatDuration(stat.game.startTime, stat.game.endTime),
      role: displayRoleName,
      roleColor,
      team,
      win: stat.win,
    };
  };

  return { best: playerGames.slice(0, limit).map(mapGame), hasMore: playerGames.length > limit };
}
