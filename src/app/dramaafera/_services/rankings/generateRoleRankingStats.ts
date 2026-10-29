import { isInRoleReviewWindow, compareReviewBoundary, toReviewTime, type RoleReviewBoundary, type RoleReviewWindow } from '@/app/dramaafera/_utils/roleReview';
import { Teams } from '@/constants/teams';
import type { RoleRankingStats, RoleRankingSummary } from './types';
import { Prisma } from '@prisma/client';
import { convertRoleNameForDisplay, normalizeRoleName, getRoleColor, determineTeam } from '@/app/dramaafera/_utils/gameUtils';
import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { PlayerRankingReason } from '@/app/api/_constants/rankingTypes';
import { calculateRoleStrength, ROLE_STRENGTH_TARGET_DAP } from '@/app/dramaafera/_utils/roleStrength';

interface RoleRankingRow {
  roleName: string;
  playerName: string | null;
  win: boolean | number;
  totalPoints: number;
  includeDap: number;
  playerId: number;
  gameId: number;
  activePlayer: number;
  startTime: string | Date;
}

interface RankingRow {
  playerId: number;
  gameId: number | null;
  score: number;
  reason: string | null;
}

interface RoleRankingOptions {
  excludeLatestDay?: boolean;
  lastGamesPerRole?: number;
  roleWindows?: Record<string, RoleReviewWindow>;
  reviewThrough?: RoleReviewBoundary;
}

// Two bounded reads: no nested relation fetches, per-appearance history scans or IN lists.
export async function generateRoleRankingStats(seasonId?: number, dateFrom?: Date, dateTo?: Date, includePlayers = true, { excludeLatestDay = false, lastGamesPerRole, roleWindows, reviewThrough }: RoleRankingOptions = {}): Promise<RoleRankingStats[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];
  const season = seasonId ?? CURRENT_SEASON;
  // Compare the stored timestamp directly so a narrow date range can use startTime's index.
  // Date-only bounds also cover both ISO T and SQLite space-separated timestamps.
  const from = dateFrom ? Prisma.sql`AND g.startTime >= ${dateFrom.toISOString().slice(0, 10)}` : Prisma.empty;
  const end = dateTo ? new Date(dateTo) : null;
  end?.setUTCDate(end.getUTCDate() + 1);
  const to = end ? Prisma.sql`AND g.startTime < ${end.toISOString().slice(0, 10)}` : Prisma.empty;
  const playerName = includePlayers ? Prisma.sql`p.name` : Prisma.sql`NULL`;
  // Only the role table delays DAP. Existing API/host callers include every day.
  const dapEligibility = excludeLatestDay
    ? Prisma.sql`CASE WHEN SUBSTR(g.startTime, 1, 10) < (SELECT date FROM latest_day) THEN 1 ELSE 0 END`
    : Prisma.sql`1`;
  const latestDay = excludeLatestDay ? Prisma.sql`WITH latest_day AS (
      SELECT MAX(SUBSTR(startTime, 1, 10)) AS date
      FROM games WHERE season = ${season} AND deletedAt IS NULL
    )` : Prisma.empty;
  const appearanceOrder = lastGamesPerRole === undefined ? Prisma.empty : Prisma.sql`ORDER BY julianday(g.startTime) DESC, g.id DESC, gps.id DESC`;
  const [stats, rankings] = await Promise.all([
    prisma.$queryRaw<RoleRankingRow[]>`
    ${latestDay}
    SELECT ${playerName} AS playerName, gps.playerId, gps.gameId, g.startTime, gps.win, gps.totalPoints,
           CASE WHEN p.deletedAt IS NULL AND p.name <> '' THEN 1 ELSE 0 END AS activePlayer,
           COALESCE((SELECT r.roleName FROM player_roles r
                     WHERE r.gamePlayerStatisticsId = gps.id
                     ORDER BY r."order" ASC LIMIT 1), 'Nieznana rola') AS roleName,
           ${dapEligibility} AS includeDap
    FROM games g
    JOIN game_player_statistics gps ON gps.gameId = g.id
    JOIN players p ON p.id = gps.playerId
    WHERE g.season = ${season} AND g.deletedAt IS NULL ${from} ${to}
    ${appearanceOrder}
  `,
    // IDs follow write order even when multiple rankings have the same timestamp.
    // Read the whole season so date filters retain preceding rankings, resets and corrections.
    prisma.$queryRaw<RankingRow[]>`
      SELECT playerId, gameId, score, reason FROM player_rankings
      WHERE season = ${season} AND deletedAt IS NULL ORDER BY id ASC
    `,
  ]);

  const previousByAppearance = new Map<string, number>();
  const latestByPlayer = new Map<number, number>();
  for (const ranking of rankings) {
    const previous = latestByPlayer.get(ranking.playerId);
    if (ranking.gameId !== null && ranking.reason === PlayerRankingReason.GameResult && previous !== undefined) {
      previousByAppearance.set(`${ranking.gameId}:${ranking.playerId}`, previous);
    }
    latestByPlayer.set(ranking.playerId, ranking.score);
  }

  // Include every original participant in the lobby average, even if their profile was
  // deleted later. Missing history invalidates the whole lobby, never just its denominator.
  const lobbies = new Map<number, { sum: number; count: number; complete: boolean }>();
  for (const stat of stats) {
    const lobby = lobbies.get(stat.gameId) ?? { sum: 0, count: 0, complete: true };
    const previous = previousByAppearance.get(`${stat.gameId}:${stat.playerId}`);
    lobby.count += 1;
    if (previous !== undefined && Number.isFinite(previous) && previous > 0) lobby.sum += previous;
    else lobby.complete = false;
    lobbies.set(stat.gameId, lobby);
  }

  const roleStats = new Map<string, {
    gamesPlayed: number;
    wins: number;
    totalPoints: number;
    dapGames: number;
    totalDeviation: number;
    strengthGames: number;
    strengthPlayers: Set<number>;
    players: Map<string, { gamesPlayed: number; wins: number; totalPoints: number; dapGames: number }>;
  }>();

  stats.forEach(stat => {
    if (!stat.activePlayer) return;
    // Select appearances only after computing full-lobby expectations.
    // Public counts use appearances whose DAP has already been released.
    if (lastGamesPerRole !== undefined && !stat.includeDap) return;
    // Primary role = first entry in ascending order
    const roleName = normalizeRoleName(stat.roleName, season);
    const boundary = (roleWindows || reviewThrough) ? { time: toReviewTime(stat.startTime), gameId: stat.gameId } : null;
    if (reviewThrough && boundary && compareReviewBoundary(boundary, reviewThrough) > 0) return;
    const window = roleWindows?.[roleName];
    if (window && boundary && !isInRoleReviewWindow(boundary, window)) return;
    const playerName = stat.playerName;
    if (includePlayers && !playerName) return;
    if (lastGamesPerRole !== undefined && (roleStats.get(roleName)?.gamesPlayed ?? 0) >= lastGamesPerRole) return;

    if (!roleStats.has(roleName)) {
      roleStats.set(roleName, {
        gamesPlayed: 0,
        wins: 0,
        totalPoints: 0,
        dapGames: 0,
        totalDeviation: 0,
        strengthGames: 0,
        strengthPlayers: new Set(),
        players: new Map()
      });
    }

    const roleData = roleStats.get(roleName)!;
    roleData.gamesPlayed += 1;
    const includeDap = Boolean(stat.includeDap);
    if (includeDap) {
      roleData.totalPoints += stat.totalPoints;
      roleData.dapGames += 1;
      const lobby = lobbies.get(stat.gameId)!;
      const previous = previousByAppearance.get(`${stat.gameId}:${stat.playerId}`);
      if (lobby.complete && previous !== undefined) {
        const expectedDap = ROLE_STRENGTH_TARGET_DAP * previous / (lobby.sum / lobby.count);
        roleData.totalDeviation += stat.totalPoints - expectedDap;
        roleData.strengthGames += 1;
        roleData.strengthPlayers.add(stat.playerId);
      }
    }
    if (stat.win) {
      roleData.wins += 1;
    }

    if (!includePlayers || !playerName) return;
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
      dapGames: data.dapGames,
      totalPoints: data.totalPoints,
      averagePoints,
      strength: calculateRoleStrength(data.totalDeviation, data.strengthGames),
      strengthGames: data.strengthGames,
      strengthPlayers: data.strengthPlayers.size,
      players
    };
  });

  roleRankingStats.sort((a, b) => b.gamesPlayed - a.gamesPlayed);
  return roleRankingStats;
}

/** Lightweight table response; per-player breakdowns remain available to existing callers. */
export async function generateRoleRankingSummary(seasonId?: number, dateFrom?: Date, dateTo?: Date, { excludeLatestDay = true, lastGamesPerRole }: RoleRankingOptions = {}): Promise<RoleRankingSummary[]> {
  const roles = await generateRoleRankingStats(seasonId, dateFrom, dateTo, false, { excludeLatestDay, lastGamesPerRole });
  return roles.map(({ players: _players, ...role }) => role);
}
