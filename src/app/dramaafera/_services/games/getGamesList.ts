import type { PrismaClient } from '@prisma/client';
import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import type { GameSummary, DateWithGames } from './types';
import {
  formatDuration,
  formatDisplayDate,
  extractDateFromGameId,
  convertRoleNameForDisplay,
  getRoleColor,
} from '@/app/dramaafera/_utils/gameUtils';
import { calculateWinnerFromStats } from './winCalculator';

type SummaryStat = {
  id: number;
  gameId: number;
  win: boolean;
  playerName: string;
  roleHistory: { roleName: string; order: number }[];
  modifiers: { modifierName: string }[];
};

// Fetch gamePlayerStatistics for the given game IDs in chunks, plus the
// player/roleHistory/modifier relations they reference. Returns a map keyed by
// gameId so callers can stitch summaries per game. Chunked to stay under
// Cloudflare D1's 98 bound-parameter cap (see `chunkedInQuery`).
async function fetchStatsByGameIds(
  prisma: PrismaClient,
  gameIds: readonly number[],
): Promise<Map<number, SummaryStat[]>> {
  const statsByGameId = new Map<number, SummaryStat[]>();
  if (gameIds.length === 0) return statsByGameId;

  const rawStats = await chunkedInQuery(gameIds, (chunk) =>
    prisma.gamePlayerStatistics.findMany({
      where: { gameId: { in: chunk }, player: withoutDeleted },
      select: { id: true, gameId: true, playerId: true, win: true },
    }),
  );
  if (rawStats.length === 0) return statsByGameId;

  const statIds = rawStats.map((s) => s.id);
  const uniquePlayerIds = Array.from(new Set(rawStats.map((s) => s.playerId)));

  const players = await chunkedInQuery(uniquePlayerIds, (chunk) =>
    prisma.player.findMany({
      where: { id: { in: chunk } },
      select: { id: true, name: true },
    }),
  );
  const playerNameById = new Map(players.map((p) => [p.id, p.name]));

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

  const allModifiers = await chunkedInQuery(statIds, (chunk) =>
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

  rawStats.forEach((stat) => {
    const list = statsByGameId.get(stat.gameId) ?? [];
    list.push({
      id: stat.id,
      gameId: stat.gameId,
      win: stat.win,
      playerName: playerNameById.get(stat.playerId) ?? 'Nieznany',
      roleHistory: roleHistoryByStatId.get(stat.id) ?? [],
      modifiers: modifiersByStatId.get(stat.id) ?? [],
    });
    statsByGameId.set(stat.gameId, list);
  });

  return statsByGameId;
}

type GameLike = {
  id: number;
  gameIdentifier: string;
  startTime: Date;
  endTime: Date;
  map: string | null;
};

function buildGameSummary(game: GameLike, stats: SummaryStat[]): GameSummary {
  const playerNames = stats.map((s) => s.playerName);
  const winners = stats.filter((s) => s.win);
  const winnerNames = winners.map((w) => w.playerName);

  const winnerColors: Record<string, string> = {};
  winners.forEach((winner) => {
    const roleHistory = [...winner.roleHistory].sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
    winnerColors[winner.playerName] = getRoleColor(convertRoleNameForDisplay(finalRole));
  });

  const winnerInfo = calculateWinnerFromStats(stats);

  return {
    id: game.gameIdentifier,
    date: extractDateFromGameId(game.gameIdentifier),
    gameNumber: 0, // assigned by caller
    duration: formatDuration(game.startTime, game.endTime),
    players: stats.length,
    winner: winnerInfo.winner,
    winnerColor: winnerInfo.winnerColor,
    winCondition: winnerInfo.winCondition,
    map: game.map || 'Nieznana mapa',
    winnerNames,
    winnerColors,
    allPlayerNames: playerNames,
  };
}

// Fetch all games summary
export async function getGamesList(seasonId?: number): Promise<GameSummary[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const dbGames = await prisma.game.findMany({
    where: buildSeasonGameWhere(seasonId),
    select: { id: true, gameIdentifier: true, startTime: true, endTime: true, map: true },
    orderBy: { startTime: 'desc' },
  });

  if (dbGames.length === 0) return [];

  const statsByGameId = await fetchStatsByGameIds(
    prisma,
    dbGames.map((g) => g.id),
  );

  const games = dbGames.map((game) => buildGameSummary(game, statsByGameId.get(game.id) ?? []));

  // Compute game numbers for each date
  const gamesByDate = new Map<string, GameSummary[]>();
  games.forEach((game) => {
    const date = game.date;
    if (!gamesByDate.has(date)) {
      gamesByDate.set(date, []);
    }
    gamesByDate.get(date)!.push(game);
  });
  gamesByDate.forEach((gamesForDate) => {
    gamesForDate.sort((a, b) => a.id.localeCompare(b.id));
    gamesForDate.forEach((game, index) => {
      game.gameNumber = index + 1;
    });
  });

  return games;
}

// Fetch games by specific date — direct DB query to avoid loading all games
export async function getGamesListByDate(date: string, seasonId?: number): Promise<GameSummary[]> {
  const prisma = await getDatabaseClient();
  if (!prisma) return [];

  const dbGames = await prisma.game.findMany({
    where: {
      ...buildSeasonGameWhere(seasonId),
      gameIdentifier: { startsWith: date },
    },
    select: { id: true, gameIdentifier: true, startTime: true, endTime: true, map: true },
    orderBy: { gameIdentifier: 'desc' },
  });

  if (dbGames.length === 0) return [];

  const statsByGameId = await fetchStatsByGameIds(
    prisma,
    dbGames.map((g) => g.id),
  );

  const games = dbGames.map((game) => buildGameSummary(game, statsByGameId.get(game.id) ?? []));

  // Assign chronological game numbers (1 = oldest) independent of display order
  const sorted = [...games].sort((a, b) => a.id.localeCompare(b.id));
  sorted.forEach((game, index) => {
    game.gameNumber = index + 1;
  });

  return games;
}

// Fetch list of dates with games
export async function getGameDatesList(seasonId?: number): Promise<DateWithGames[]> {
  const games = await getGamesList(seasonId);

  if (games.length === 0) {
    return [];
  }

  const dateGroups = new Map<string, GameSummary[]>();
  games.forEach((game) => {
    const date = extractDateFromGameId(game.id);
    if (!dateGroups.has(date)) {
      dateGroups.set(date, []);
    }
    dateGroups.get(date)!.push(game);
  });

  const datesWithGames: DateWithGames[] = Array.from(dateGroups.entries()).map(([date, gamesForDate]) => ({
    date,
    displayDate: formatDisplayDate(date),
    games: gamesForDate.sort((a, b) => b.id.localeCompare(a.id)),
    totalGames: gamesForDate.length,
  }));

  return datesWithGames.sort((a, b) => b.date.localeCompare(a.date));
}
