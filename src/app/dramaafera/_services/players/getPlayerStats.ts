import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { Teams } from '@/constants/teams';
import type { PlayerStats } from './types';
import { determineTeam } from '@/app/dramaafera/_utils/gameUtils';

// Fetch player statistics across all games
export async function getPlayerStats(playerName: string, seasonId?: number): Promise<PlayerStats | null> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return null;
  }

  const player = await prisma.player.findFirst({
    where: {
      name: playerName,
      ...withoutDeleted
    },
    include: {
      gamePlayerStatistics: {
        where: {
          game: {
            season: seasonId ?? CURRENT_SEASON,
            ...withoutDeleted
          }
        },
        include: {
          roleHistory: {
            orderBy: { order: 'asc' }
          },
          modifiers: true
        }
      }
    }
  });

  if (!player) {
    return null;
  }

  const totalGames = player.gamePlayerStatistics.length;
  const wins = player.gamePlayerStatistics.filter(stat => stat.win).length;
  const losses = totalGames - wins;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const totalPoints = player.gamePlayerStatistics.reduce((sum, stat) => sum + stat.totalPoints, 0);
  const averagePoints = totalGames > 0 ? totalPoints / totalGames : 0;

  const roles: Record<string, number> = {};
  const modifiers: Record<string, number> = {};
  const teamStats = {
    crewmate: { games: 0, wins: 0 },
    impostor: { games: 0, wins: 0 },
    neutral: { games: 0, wins: 0 }
  };

  player.gamePlayerStatistics.forEach(stat => {
    stat.roleHistory.forEach(role => {
      roles[role.roleName] = (roles[role.roleName] || 0) + 1;
    });

    stat.modifiers.forEach(modifier => {
      modifiers[modifier.modifierName] = (modifiers[modifier.modifierName] || 0) + 1;
    });

    const primaryRole = stat.roleHistory.find(role => role.order === 0)?.roleName || '';
    const teamName = determineTeam(primaryRole);
    const team: 'crewmate' | 'impostor' | 'neutral' =
      teamName === Teams.Impostor ? 'impostor' :
      teamName === Teams.Neutral ? 'neutral' : 'crewmate';

    teamStats[team].games++;
    if (stat.win) {
      teamStats[team].wins++;
    }
  });

  const favoriteRole = Object.entries(roles).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';
  const favoriteTeam = Object.entries(teamStats).sort(([, a], [, b]) => b.games - a.games)[0]?.[0] || 'crewmate';

  return {
    nickname: player.name,
    totalGames,
    wins,
    losses,
    winRate,
    totalPoints,
    averagePoints,
    roles,
    modifiers,
    favoriteRole,
    favoriteTeam,
    teamStats
  };
}
