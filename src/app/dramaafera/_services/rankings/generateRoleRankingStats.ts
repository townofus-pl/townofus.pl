import { Teams } from '@/constants/teams';
import type { RoleRankingStats } from './types';
import {
  convertRoleNameForDisplay,
  getRoleColor,
  determineTeam,
} from '@/app/dramaafera/_utils/gameUtils';
import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

// Generate role ranking statistics
export async function generateRoleRankingStats(seasonId?: number): Promise<RoleRankingStats[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const season = seasonId ?? CURRENT_SEASON;

  const stats = await prisma.gamePlayerStatistics.findMany({
    where: {
      player: withoutDeleted,
      game: {
        ...withoutDeleted,
        season,
      },
    },
    select: {
      win: true,
      totalPoints: true,
      player: {
        select: { name: true },
      },
      roleHistory: {
        orderBy: { order: 'asc' },
        select: { roleName: true, order: true },
      },
    },
  });

  const roleStats = new Map<string, {
    gamesPlayed: number;
    wins: number;
    totalPoints: number;
    players: Map<string, { gamesPlayed: number; wins: number; totalPoints: number }>;
  }>();

  stats.forEach(stat => {
    // Primary role = first entry in ascending order
    const roleName = stat.roleHistory[0]?.roleName ?? 'Nieznana rola';
    const playerName = stat.player?.name;
    if (!playerName) return;

    if (!roleStats.has(roleName)) {
      roleStats.set(roleName, {
        gamesPlayed: 0,
        wins: 0,
        totalPoints: 0,
        players: new Map()
      });
    }

    const roleData = roleStats.get(roleName)!;
    roleData.gamesPlayed += 1;
    roleData.totalPoints += stat.totalPoints;
    if (stat.win) {
      roleData.wins += 1;
    }

    if (!roleData.players.has(playerName)) {
      roleData.players.set(playerName, { gamesPlayed: 0, wins: 0, totalPoints: 0 });
    }
    const playerRoleData = roleData.players.get(playerName)!;
    playerRoleData.gamesPlayed += 1;
    playerRoleData.totalPoints += stat.totalPoints;
    if (stat.win) {
      playerRoleData.wins += 1;
    }
  });

  const roleRankingStats: RoleRankingStats[] = Array.from(roleStats.entries()).map(([roleName, data]) => {
    const winRate = data.gamesPlayed > 0 ? Math.round((data.wins / data.gamesPlayed) * 100) : 0;
    const averagePoints = data.gamesPlayed > 0 ? Math.round(data.totalPoints / data.gamesPlayed) : 0;

    const displayRoleName = convertRoleNameForDisplay(roleName);
    const roleColor = getRoleColor(displayRoleName);
    const roleTeam = determineTeam(roleName);
    const teamName = roleTeam === Teams.Impostor ? 'Impostor' :
                    roleTeam === Teams.Neutral ? 'Neutral' : 'Crewmate';

    const players = Array.from(data.players.entries()).map(([playerName, playerData]) => ({
      playerName,
      gamesPlayed: playerData.gamesPlayed,
      wins: playerData.wins,
      winRate: playerData.gamesPlayed > 0 ? Math.round((playerData.wins / playerData.gamesPlayed) * 100) : 0,
      averagePoints: playerData.gamesPlayed > 0 ? Math.round(playerData.totalPoints / playerData.gamesPlayed) : 0
    }));

    players.sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return b.gamesPlayed - a.gamesPlayed;
      }
      return b.winRate - a.winRate;
    });

    return {
      name: roleName,
      displayName: displayRoleName,
      color: roleColor,
      team: teamName,
      gamesPlayed: data.gamesPlayed,
      wins: data.wins,
      winRate,
      averagePoints,
      players
    };
  });

  roleRankingStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  return roleRankingStats;
}
