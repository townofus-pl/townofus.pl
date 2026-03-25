import { Teams } from '@/constants/teams';
import type { RoleRankingStats } from './types';
import {
  convertRoleNameForDisplay,
  getRoleColor,
  determineTeam,
} from '@/app/dramaafera/_utils/gameUtils';
import { getAllGamesData } from '../games/getAllGamesData';

// Generate role ranking statistics
export async function generateRoleRankingStats(seasonId?: number): Promise<RoleRankingStats[]> {
  const allGames = await getAllGamesData(seasonId);
  const roleStats = new Map<string, {
    gamesPlayed: number;
    wins: number;
    totalPoints: number;
    players: Map<string, { gamesPlayed: number; wins: number; totalPoints: number }>;
  }>();

  allGames.forEach(game => {
    game.detailedStats.playersData.forEach(player => {
      const roleName = player.role;
      const playerName = player.nickname;

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
      roleData.totalPoints += player.totalPoints;
      if (player.win) {
        roleData.wins += 1;
      }

      if (!roleData.players.has(playerName)) {
        roleData.players.set(playerName, { gamesPlayed: 0, wins: 0, totalPoints: 0 });
      }
      const playerRoleData = roleData.players.get(playerName)!;
      playerRoleData.gamesPlayed += 1;
      playerRoleData.totalPoints += player.totalPoints;
      if (player.win) {
        playerRoleData.wins += 1;
      }
    });
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
