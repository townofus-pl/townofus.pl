import { Teams } from '@/constants/teams';
import type { RoleRankingStats } from './types';
import { Prisma } from '@prisma/client';
import { convertRoleNameForDisplay, normalizeRoleName, getRoleColor, determineTeam } from '@/app/dramaafera/_utils/gameUtils';
import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

interface RoleRankingRow {
  roleName: string;
  playerName: string;
  win: boolean | number;
  totalPoints: number;
  includeDap: number;
}

// One bounded statement: no full-season nested relation fetches or IN parameter lists.
export async function generateRoleRankingStats(seasonId?: number, dateFrom?: Date, dateTo?: Date): Promise<RoleRankingStats[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];
  const season = seasonId ?? CURRENT_SEASON;
  const from = dateFrom ? Prisma.sql`AND SUBSTR(g.startTime, 1, 10) >= ${dateFrom.toISOString().slice(0, 10)}` : Prisma.empty;
  const to = dateTo ? Prisma.sql`AND SUBSTR(g.startTime, 1, 10) <= ${dateTo.toISOString().slice(0, 10)}` : Prisma.empty;
  const stats = await prisma.$queryRaw<RoleRankingRow[]>`
    WITH latest_day AS (
      SELECT MAX(SUBSTR(startTime, 1, 10)) AS date
      FROM games WHERE season = ${season} AND deletedAt IS NULL
    )
    SELECT p.name AS playerName, gps.win, gps.totalPoints,
           COALESCE((SELECT r.roleName FROM player_roles r
                     WHERE r.gamePlayerStatisticsId = gps.id
                     ORDER BY r."order" ASC LIMIT 1), 'Nieznana rola') AS roleName,
           CASE WHEN SUBSTR(g.startTime, 1, 10) < (SELECT date FROM latest_day) THEN 1 ELSE 0 END AS includeDap
    FROM games g
    JOIN game_player_statistics gps ON gps.gameId = g.id
    JOIN players p ON p.id = gps.playerId AND p.deletedAt IS NULL
    WHERE g.season = ${season} AND g.deletedAt IS NULL ${from} ${to}
  `;

  const roleStats = new Map<string, {
    gamesPlayed: number;
    wins: number;
    totalPoints: number;
    dapGames: number;
    players: Map<string, { gamesPlayed: number; wins: number; totalPoints: number; dapGames: number }>;
  }>();

  stats.forEach(stat => {
    // Primary role = first entry in ascending order
    const roleName = normalizeRoleName(stat.roleName, season);
    const playerName = stat.playerName;
    if (!playerName) return;

    if (!roleStats.has(roleName)) {
      roleStats.set(roleName, {
        gamesPlayed: 0,
        wins: 0,
        totalPoints: 0,
        dapGames: 0,
        players: new Map()
      });
    }

    const roleData = roleStats.get(roleName)!;
    roleData.gamesPlayed += 1;
    const includeDap = Boolean(stat.includeDap);
    if (includeDap) {
      roleData.totalPoints += stat.totalPoints;
      roleData.dapGames += 1;
    }
    if (stat.win) {
      roleData.wins += 1;
    }

    if (!roleData.players.has(playerName)) {
      roleData.players.set(playerName, { gamesPlayed: 0, wins: 0, totalPoints: 0, dapGames: 0 });
    }
    const playerRoleData = roleData.players.get(playerName)!;
    playerRoleData.gamesPlayed += 1;
    if (includeDap) {
      playerRoleData.totalPoints += stat.totalPoints;
      playerRoleData.dapGames += 1;
    }
    if (stat.win) {
      playerRoleData.wins += 1;
    }
  });

  const roleRankingStats: RoleRankingStats[] = Array.from(roleStats.entries()).map(([roleName, data]) => {
    const winRate = data.gamesPlayed > 0 ? Math.round((data.wins / data.gamesPlayed) * 100) : 0;
    const averagePoints = data.dapGames > 0 ? data.totalPoints / data.dapGames : 0;

    const displayRoleName = convertRoleNameForDisplay(roleName);
    const roleColor = getRoleColor(displayRoleName, season);
    const roleTeam = determineTeam(roleName, season);
    const teamName = roleTeam === Teams.Impostor ? 'Impostor' :
                    roleTeam === Teams.Neutral ? 'Neutral' : 'Crewmate';

    const players = Array.from(data.players.entries()).map(([playerName, playerData]) => ({
      playerName,
      gamesPlayed: playerData.gamesPlayed,
      wins: playerData.wins,
      winRate: playerData.gamesPlayed > 0 ? Math.round((playerData.wins / playerData.gamesPlayed) * 100) : 0,
      averagePoints: playerData.dapGames > 0 ? playerData.totalPoints / playerData.dapGames : 0
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
      totalPoints: data.totalPoints,
      averagePoints,
      players
    };
  });

  roleRankingStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  return roleRankingStats;
}
