import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import type { GameSummary, DateWithGames } from './types';
import {
  formatDuration,
  formatDisplayDate,
  extractDateFromGameId,
  convertRoleNameForDisplay,
  getRoleColor,
} from '@/app/dramaafera/_utils/gameUtils';
import { calculateWinnerFromStats } from './winCalculator';

// Fetch all games summary
export async function getGamesList(seasonId?: number): Promise<GameSummary[]> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return [];
  }

  const dbGames = await prisma.game.findMany({
    where: buildSeasonGameWhere(seasonId),
    include: {
      gamePlayerStatistics: {
        include: {
          player: true,
          roleHistory: {
            orderBy: { order: 'asc' }
          }
        }
      }
    },
    orderBy: { startTime: 'desc' }
  });

  const games = dbGames.map(game => {
    const playerNames = game.gamePlayerStatistics.map(stat => stat.player.name);
    const winners = game.gamePlayerStatistics.filter(stat => stat.win);
    const winnerNames = winners.map(winner => winner.player.name);

    // Determine winner colors based on roles
    const winnerColors: Record<string, string> = {};
    winners.forEach(winner => {
      const roleHistory = winner.roleHistory.sort((a, b) => a.order - b.order);
      const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
      const displayRoleName = convertRoleNameForDisplay(finalRole);
      winnerColors[winner.player.name] = getRoleColor(displayRoleName);
    });

    const winnerInfo = calculateWinnerFromStats(game.gamePlayerStatistics);

    return {
      id: game.gameIdentifier,
      date: extractDateFromGameId(game.gameIdentifier),
      gameNumber: 0, // Will be computed after all games are fetched
      duration: formatDuration(game.startTime, game.endTime),
      players: game.gamePlayerStatistics.length,
      winner: winnerInfo.winner,
      winnerColor: winnerInfo.winnerColor,
      winCondition: winnerInfo.winCondition,
      map: game.map || 'Unknown',
      winnerNames,
      winnerColors,
      allPlayerNames: playerNames
    };
  });

  // Compute game numbers for each date
  const gamesByDate = new Map<string, GameSummary[]>();
  games.forEach(game => {
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

// Fetch games by specific date
export async function getGamesListByDate(date: string, seasonId?: number): Promise<GameSummary[]> {
  const allGames = await getGamesList(seasonId);
  return allGames
    .filter(game => extractDateFromGameId(game.id) === date)
    .sort((a, b) => b.id.localeCompare(a.id));
}

// Fetch list of dates with games
export async function getGameDatesList(seasonId?: number): Promise<DateWithGames[]> {
  const games = await getGamesList(seasonId);

  if (games.length === 0) {
    return [];
  }

  const dateGroups = new Map<string, GameSummary[]>();
  games.forEach(game => {
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
    totalGames: gamesForDate.length
  }));

  return datesWithGames.sort((a, b) => b.date.localeCompare(a.date));
}
