import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import type { UIPlayerData, UIGameData, UIGameEvent, UIMeetingData } from './types';
import {
  formatDuration,
  extractDateFromGameId,
  convertRoleNameForDisplay,
  getRoleColor,
} from '@/app/dramaafera/_utils/gameUtils';
import { calculateWinnerFromStats } from './winCalculator';
import { buildPlayerStats } from './_buildPlayerStats';

// Fetch detailed game data
export async function getGameData(gameId: string): Promise<UIGameData | null> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return null;
  }

  const game = await prisma.game.findUnique({
    where: {
      gameIdentifier: gameId,
      ...withoutDeleted
    },
    include: {
      gamePlayerStatistics: {
        include: {
          player: true,
          roleHistory: {
            orderBy: { order: 'asc' }
          },
          modifiers: true
        }
      },
      meetings: {
        include: {
          meetingVotes: {
            include: {
              target: true,
              voter: true
            }
          },
          skipVotes: {
            include: {
              player: true
            }
          },
          noVotes: {
            include: {
              player: true
            }
          },
          blackmailedPlayers: {
            include: {
              player: true
            }
          },
          jailedPlayers: {
            include: {
              player: true
            }
          }
        },
        orderBy: { meetingNumber: 'asc' }
      },
      gameEvents: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });

  if (!game) {
    return null;
  }

  const winners = game.gamePlayerStatistics.filter(stat => stat.win);
  const winnerNames = winners.map(winner => winner.player.name);
  const winnerColors: Record<string, string> = {};
  winners.forEach(winner => {
    const roleHistory = winner.roleHistory.sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
    const displayRoleName = convertRoleNameForDisplay(finalRole);
    winnerColors[winner.player.name] = getRoleColor(displayRoleName);
  });

  const playersData: UIPlayerData[] = game.gamePlayerStatistics.map(stat =>
    buildPlayerStats(stat, {
      useDisconnectedForDeaths: true,
      maxTasks: game.maxTasks,
      meetingsUndefined: true,
    })
  );

  // Build meetings data
  const meetings: UIMeetingData[] = game.meetings.map(meeting => {
    const votes: Record<string, string[]> = {};
    meeting.meetingVotes.forEach(vote => {
      const targetName = vote.target.name;
      const voterName = vote.voter.name;
      if (!votes[targetName]) {
        votes[targetName] = [];
      }
      votes[targetName].push(voterName);
    });

    const deathsSinceLastMeeting = JSON.parse(meeting.deathsSinceLastMeeting || '[]');

    return {
      meetingNumber: meeting.meetingNumber,
      deathsSinceLastMeeting,
      votes,
      skipVotes: meeting.skipVotes.map(vote => vote.player.name),
      noVotes: meeting.noVotes.map(vote => vote.player.name),
      blackmailedPlayers: meeting.blackmailedPlayers.map(player => player.player.name),
      jailedPlayers: meeting.jailedPlayers.map(player => player.player.name),
      wasTie: meeting.wasTie,
      wasBlessed: meeting.wasBlessed
    };
  });

  // Build events data
  const events: UIGameEvent[] = game.gameEvents.map(event => ({
    timestamp: event.timestamp.toString(),
    type: (event.eventType || 'other') as UIGameEvent['type'],
    player: 'Unknown',
    target: undefined,
    description: event.description
  }));

  return {
    id: game.gameIdentifier,
    date: extractDateFromGameId(game.gameIdentifier),
    gameNumber: 1,
    startTime: game.startTime.toISOString(),
    endTime: game.endTime.toISOString(),
    duration: formatDuration(game.startTime, game.endTime),
    map: game.map || 'Unknown',
    ...calculateWinnerFromStats(game.gamePlayerStatistics),
    winnerNames,
    winnerColors,
    players: game.gamePlayerStatistics.length,
    maxTasks: game.maxTasks || undefined,
    detailedStats: {
      playersData,
      meetings,
      events
    }
  };
}
