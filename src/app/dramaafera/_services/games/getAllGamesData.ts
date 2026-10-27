import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import type { UIPlayerData, UIGameData, UIGameEvent, UIMeetingData } from './types';
import {
  formatDuration,
  extractDateFromGameId,
  convertRoleNameForDisplay,
  getRoleColor,
} from '@/app/dramaafera/_utils/gameUtils';
import { calculateWinnerFromStats } from './winCalculator';
import { buildPlayerStats, type StatWithRolesAndModifiers } from './_buildPlayerStats';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { Prisma } from '@prisma/client';
import { getRoleAliases } from '@/app/dramaafera/_utils/roleAliases';

// Get all games data (equivalent to getAllGamesData from converter)
//
// Implementation note: We fetch games, stats, players, roleHistory and modifiers
// in separate chunked queries instead of a single `findMany({ include: ... })`.
// Prisma 7's query-plan executor only chunks one `IN (…)` fragment per query and
// Cloudflare D1 caps bound parameters at 98 — a nested `include` over the full
// season (~473 games × ~15 stats/game) blows past that limit (P2029).
// See `chunkedInQuery` and `MAX_BIND_VALUES` comments for context.
// roleName is for role-profile summaries only: each game's playersData contains
// only participants who held that role; game-wide winner/player totals are partial.
export async function getAllGamesData(seasonId?: number, roleName?: string): Promise<UIGameData[]> {
  const season = seasonId ?? CURRENT_SEASON;
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return [];
  }

  // A role page needs only players who held that role, not every player in the season.
  // The IN subquery uses player_roles(roleName) without binding thousands of stat ids.
  const roleStats = roleName ? await prisma.$queryRaw<{ id: number; gameId: number }[]>`
    SELECT s.id, s.gameId FROM game_player_statistics s
    JOIN games g ON g.id = s.gameId AND g.deletedAt IS NULL AND g.season = ${season}
    JOIN players p ON p.id = s.playerId AND p.deletedAt IS NULL
    WHERE s.id IN (SELECT gamePlayerStatisticsId FROM player_roles
                   WHERE roleName IN (${Prisma.join(getRoleAliases(roleName, season))}))
  ` : null;

  // Step 1: games (no relations)
  const games = roleStats ? await chunkedInQuery(Array.from(new Set(roleStats.map(stat => stat.gameId))), chunk =>
    prisma.game.findMany({ where: { ...buildSeasonGameWhere(season), id: { in: chunk } } }),
  ) : await prisma.game.findMany({
    where: buildSeasonGameWhere(seasonId),
    orderBy: { startTime: 'desc' },
  });

  if (games.length === 0) {
    return [];
  }

  const gameIds = games.map((g) => g.id);

  // Step 2: gamePlayerStatistics for those games (filtered to non-deleted players)
  const rawStats = roleStats ? await chunkedInQuery(roleStats.map(stat => stat.id), chunk =>
    prisma.gamePlayerStatistics.findMany({ where: { id: { in: chunk }, player: withoutDeleted } }),
  ) : await chunkedInQuery(gameIds, (chunk) =>
    prisma.gamePlayerStatistics.findMany({
      where: { gameId: { in: chunk }, player: withoutDeleted },
    }),
  );

  const statIds = rawStats.map((s) => s.id);
  const uniquePlayerIds = Array.from(new Set(rawStats.map((s) => s.playerId)));

  // Step 3a: players (deduped)
  const players = await chunkedInQuery(uniquePlayerIds, (chunk) =>
    prisma.player.findMany({
      where: { id: { in: chunk }, ...withoutDeleted },
      select: { id: true, name: true },
    }),
  );
  const playerById = new Map(players.map((p) => [p.id, p]));

  // Step 3b: roleHistory by stat id
  const allRoleHistory = await chunkedInQuery(statIds, (chunk) =>
    prisma.playerRole.findMany({
      where: { gamePlayerStatisticsId: { in: chunk } },
      orderBy: { order: 'asc' },
      select: { gamePlayerStatisticsId: true, roleName: true, order: true },
    }),
  );
  const roleHistoryByStatId = new Map<number, { roleName: string; order: number }[]>();
  allRoleHistory.forEach((rh) => {
    const list = roleHistoryByStatId.get(rh.gamePlayerStatisticsId) ?? [];
    list.push({ roleName: rh.roleName, order: rh.order });
    roleHistoryByStatId.set(rh.gamePlayerStatisticsId, list);
  });

  // Step 3c: modifiers by stat id
  const allModifiers = roleName ? [] : await chunkedInQuery(statIds, (chunk) =>
    prisma.playerModifier.findMany({
      where: { gamePlayerStatisticsId: { in: chunk } },
      select: { gamePlayerStatisticsId: true, modifierName: true },
    }),
  );
  const modifiersByStatId = new Map<number, { modifierName: string }[]>();
  allModifiers.forEach((m) => {
    const list = modifiersByStatId.get(m.gamePlayerStatisticsId) ?? [];
    list.push({ modifierName: m.modifierName });
    modifiersByStatId.set(m.gamePlayerStatisticsId, list);
  });

  // Step 4: stitch stats with their relations and group by gameId
  const statsByGameId = new Map<number, StatWithRolesAndModifiers[]>();
  rawStats.forEach((stat) => {
    const stitched: StatWithRolesAndModifiers = {
      ...stat,
      player: playerById.get(stat.playerId) ?? null,
      roleHistory: roleHistoryByStatId.get(stat.id) ?? [],
      modifiers: modifiersByStatId.get(stat.id) ?? [],
    };
    const list = statsByGameId.get(stat.gameId) ?? [];
    list.push(stitched);
    statsByGameId.set(stat.gameId, list);
  });

  const result = games.map((game) => {
    const gameStats = statsByGameId.get(game.id) ?? [];
    const duration = formatDuration(game.startTime || new Date(), game.endTime || new Date());
    const gameDate = extractDateFromGameId(game.gameIdentifier || '');

    const playersData: UIPlayerData[] = gameStats.map((stat) =>
      buildPlayerStats(stat, {
        useDisconnectedForDeaths: false,
        maxTasks: game.maxTasks,
        meetingsUndefined: false,
        season,
      }),
    );

    // Winner info from raw DB stats (same path as getGamesList / getGameData)
    const winnerInfo = calculateWinnerFromStats(gameStats, season);

    const winners = gameStats.filter((s) => s.win);
    const winnerNames = winners.map((w) => {
      const stat = playersData.find((p) => p.nickname === (w.player?.name || 'Nieznany'));
      return stat?.nickname ?? (w.player?.name || 'Nieznany');
    });
    const winnerColors: Record<string, string> = {};
    winners.forEach((w) => {
      const roleHistory = [...w.roleHistory].sort((a, b) => a.order - b.order);
      const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
      winnerColors[w.player?.name || 'Nieznany'] = getRoleColor(convertRoleNameForDisplay(finalRole), season);
    });

    const events: UIGameEvent[] = [];
    const meetings: UIMeetingData[] = [];

    return {
      hasActionData: game.modVersion !== null,
      id: game.gameIdentifier || String(game.id),
      date: gameDate,
      gameNumber: 0, // computed below
      startTime: game.startTime?.toISOString() || '',
      endTime: game.endTime?.toISOString() || '',
      duration,
      map: game.map || 'Nieznana mapa',
      winner: winnerInfo.winner,
      winnerColor: winnerInfo.winnerColor,
      winCondition: game.winCondition || winnerInfo.winCondition,
      winnerNames,
      winnerColors,
      players: playersData.length,
      maxTasks: game.maxTasks || undefined,
      detailedStats: {
        playersData,
        events,
        meetings,
        gameSettings: null,
      },
    };
  });

  // Compute per-date game numbers (1-based, ordered ascending by gameIdentifier)
  const gamesByDate = new Map<string, typeof result>();
  result.forEach((game) => {
    const date = extractDateFromGameId(game.id);
    if (!gamesByDate.has(date)) gamesByDate.set(date, []);
    gamesByDate.get(date)!.push(game);
  });
  gamesByDate.forEach((gamesForDate) => {
    gamesForDate.sort((a, b) => a.id.localeCompare(b.id));
    gamesForDate.forEach((game, index) => {
      game.gameNumber = index + 1;
    });
  });

  return result;
}
