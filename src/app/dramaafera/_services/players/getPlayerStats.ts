import { getDatabaseClient } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { Teams } from '@/constants/teams';
import type { PlayerStats } from './types';
import { determineTeam } from '@/app/dramaafera/_utils/gameUtils';

// Fetch player statistics across all games of the given season.
// Implementation note: see getUserProfileStats — same chunked pattern to stay
// under D1's 98 bound-parameter cap.
export async function getPlayerStats(playerName: string, seasonId?: number): Promise<PlayerStats | null> {
  const prisma = await getDatabaseClient();
  if (!prisma) return null;

  const player = await prisma.player.findFirst({
    where: { name: playerName, ...withoutDeleted },
    select: { id: true, name: true },
  });
  if (!player) return null;

  const season = seasonId ?? CURRENT_SEASON;

  const stats = await prisma.gamePlayerStatistics.findMany({
    where: {
      playerId: player.id,
      game: { season, ...withoutDeleted },
    },
    select: { id: true, win: true, totalPoints: true },
  });

  const statIds = stats.map((s) => s.id);

  const [roles, modifiers] = await Promise.all([
    chunkedInQuery(statIds, (chunk) =>
      prisma.playerRole.findMany({
        where: { gamePlayerStatisticsId: { in: chunk } },
        orderBy: { order: 'asc' },
        select: { gamePlayerStatisticsId: true, roleName: true, order: true },
      }),
    ),
    chunkedInQuery(statIds, (chunk) =>
      prisma.playerModifier.findMany({
        where: { gamePlayerStatisticsId: { in: chunk } },
        select: { gamePlayerStatisticsId: true, modifierName: true },
      }),
    ),
  ]);

  const rolesByStatId = new Map<number, { roleName: string; order: number }[]>();
  roles.forEach((r) => {
    const list = rolesByStatId.get(r.gamePlayerStatisticsId) ?? [];
    list.push({ roleName: r.roleName, order: r.order });
    rolesByStatId.set(r.gamePlayerStatisticsId, list);
  });

  const modifiersByStatId = new Map<number, string[]>();
  modifiers.forEach((m) => {
    const list = modifiersByStatId.get(m.gamePlayerStatisticsId) ?? [];
    list.push(m.modifierName);
    modifiersByStatId.set(m.gamePlayerStatisticsId, list);
  });

  const totalGames = stats.length;
  const wins = stats.filter((s) => s.win).length;
  const losses = totalGames - wins;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const totalPoints = stats.reduce((sum, stat) => sum + stat.totalPoints, 0);
  const averagePoints = totalGames > 0 ? totalPoints / totalGames : 0;

  const rolesCount: Record<string, number> = {};
  const modifiersCount: Record<string, number> = {};
  const teamStats = {
    crewmate: { games: 0, wins: 0 },
    impostor: { games: 0, wins: 0 },
    neutral: { games: 0, wins: 0 },
  };

  stats.forEach((stat) => {
    const statRoles = rolesByStatId.get(stat.id) ?? [];
    statRoles.forEach((role) => {
      rolesCount[role.roleName] = (rolesCount[role.roleName] || 0) + 1;
    });

    const statModifiers = modifiersByStatId.get(stat.id) ?? [];
    statModifiers.forEach((modifierName) => {
      modifiersCount[modifierName] = (modifiersCount[modifierName] || 0) + 1;
    });

    const primaryRole = statRoles.find((role) => role.order === 0)?.roleName || '';
    const teamName = determineTeam(primaryRole);
    const team: 'crewmate' | 'impostor' | 'neutral' =
      teamName === Teams.Impostor ? 'impostor' :
      teamName === Teams.Neutral ? 'neutral' : 'crewmate';

    teamStats[team].games++;
    if (stat.win) {
      teamStats[team].wins++;
    }
  });

  const favoriteRole = Object.entries(rolesCount).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';
  const favoriteTeam = Object.entries(teamStats).sort(([, a], [, b]) => b.games - a.games)[0]?.[0] || 'crewmate';

  return {
    nickname: player.name,
    totalGames,
    wins,
    losses,
    winRate,
    totalPoints,
    averagePoints,
    roles: rolesCount,
    modifiers: modifiersCount,
    favoriteRole,
    favoriteTeam,
    teamStats,
  };
}
