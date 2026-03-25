import { getDatabaseClient, buildSeasonGameWhere } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import type { UIPlayerData, UIGameData, UIGameEvent, UIMeetingData } from './types';
import {
  formatDuration,
  formatDisplayDate,
  extractDateFromGameId,
  convertRoleNameForDisplay,
  getRoleColor,
} from '@/app/dramaafera/_utils/gameUtils';
import { calculateWinnerFromStats } from './winCalculator';
import { buildPlayerStats } from './_buildPlayerStats';

// Get all games data (equivalent to getAllGamesData from converter)
export async function getAllGamesData(seasonId?: number): Promise<UIGameData[]> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return [];
  }

  const games = await prisma.game.findMany({
    where: buildSeasonGameWhere(seasonId),
    include: {
      gamePlayerStatistics: {
        where: {
          player: withoutDeleted
        },
        include: {
          player: {
            select: {
              id: true,
              name: true
            }
          },
          roleHistory: {
            orderBy: {
              order: 'asc'
            }
          },
          modifiers: true
        }
      },
    },
    orderBy: {
      startTime: 'desc'
    }
  });

  return games.map(game => {
    const duration = formatDuration(game.startTime || new Date(), game.endTime || new Date());
    const gameDate = extractDateFromGameId(game.gameIdentifier || '');
    const displayDate = formatDisplayDate(gameDate);

    const playersData: UIPlayerData[] = (game.gamePlayerStatistics || []).map(stat =>
      buildPlayerStats(stat, {
        useDisconnectedForDeaths: false,
        maxTasks: game.maxTasks,
        meetingsUndefined: false,
      })
    );

    // Winner info from raw DB stats (same path as getGamesList / getGameData)
    const winnerInfo = calculateWinnerFromStats(game.gamePlayerStatistics);

    const winners = game.gamePlayerStatistics.filter(s => s.win);
    const winnerNames = winners.map(w => {
      const stat = playersData.find(p => p.nickname === (w.player?.name || 'Unknown'));
      return stat?.nickname ?? (w.player?.name || 'Unknown');
    });
    const winnerColors: Record<string, string> = {};
    winners.forEach(w => {
      const roleHistory = [...w.roleHistory].sort((a, b) => a.order - b.order);
      const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
      winnerColors[w.player?.name || 'Unknown'] = getRoleColor(convertRoleNameForDisplay(finalRole));
    });

    const events: UIGameEvent[] = [];
    const meetings: UIMeetingData[] = [];

    return {
      id: game.gameIdentifier || String(game.id),
      date: displayDate,
      gameNumber: 0,
      startTime: game.startTime?.toISOString() || '',
      endTime: game.endTime?.toISOString() || '',
      duration,
      map: game.map || 'Unknown',
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
        gameSettings: null
      }
    };
  });
}
