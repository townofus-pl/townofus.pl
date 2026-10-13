import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import type { UIPlayerData, UIGameData, UIMeetingData } from './types';
import {
  formatDuration,
  extractDateFromGameId,
  convertRoleNameForDisplay,
  getRoleColor,
} from '@/app/dramaafera/_utils/gameUtils';
import { calculateWinnerFromStats } from './winCalculator';
import { buildPlayerStats } from './_buildPlayerStats';
import { countVotes } from './_countVotes';
import { getDeathsDuringMeetings } from './_meetingDeaths';
import { buildGameTimeline } from './_buildGameTimeline';

// Fetch detailed game data
// Player relations are selected down to `name` on purpose. Identity columns
// (`friendCode`, `hashedProductUserId`) must never reach a response body — see #287 — and a
// bare `player: true` would pull them in silently the moment they are added. Only
// `.player.name` is read anywhere downstream.
export async function getGameData(gameId: string): Promise<UIGameData | null> {
  const prisma = await getDatabaseClient();

  if (!prisma) {
    return null;
  }

  const game = await prisma.game.findFirst({
    where: {
      gameIdentifier: gameId,
      ...withoutDeleted
    },
    include: {
      gamePlayerStatistics: {
        where: { player: withoutDeleted },
        include: {
          player: { select: { name: true } },
          roleHistory: {
            orderBy: { order: 'asc' }
          },
          modifiers: true
        }
      },
      meetings: {
        where: { ...withoutDeleted },
        include: {
          meetingVotes: {
            where: { target: withoutDeleted, voter: withoutDeleted },
            include: {
              target: { select: { name: true } },
              voter: { select: { name: true } }
            }
          },
          skipVotes: {
            where: { player: withoutDeleted },
            include: {
              player: { select: { name: true } }
            }
          },
          noVotes: {
            where: { player: withoutDeleted },
            include: {
              player: { select: { name: true } }
            }
          },
          blackmailedPlayers: {
            where: { player: withoutDeleted },
            include: {
              player: { select: { name: true } }
            }
          },
          jailedPlayers: {
            where: { player: withoutDeleted },
            include: {
              player: { select: { name: true } }
            }
          }
        },
        orderBy: { meetingNumber: 'asc' }
      },
      // v2 timeline and vote counters; v1 games have no actions.
      gameActions: {
        where: { ...withoutDeleted },
        orderBy: [{ timestampMs: 'asc' }, { id: 'asc' }],
        select: {
          type: true,
          timestampMs: true,
          performerRole: true,
          targetRole: true,
          isCorrect: true,
          detail: true,
          performer: { select: { name: true } },
          target: { select: { name: true } },
        },
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
    const roleHistory = [...winner.roleHistory].sort((a, b) => a.order - b.order);
    const finalRole = roleHistory[roleHistory.length - 1]?.roleName || '';
    const displayRoleName = convertRoleNameForDisplay(finalRole);
    winnerColors[winner.player.name] = getRoleColor(displayRoleName, game.season);
  });

  const votes = countVotes(game.gameActions.filter(action => action.type === 'vote'));
  const playersData: UIPlayerData[] = game.gamePlayerStatistics.map(stat => {
    const player = buildPlayerStats(stat, {
      useDisconnectedForDeaths: true,
      maxTasks: game.maxTasks,
      meetingsUndefined: true,
      season: game.season,
    });
    const own = votes.get(player.nickname);
    if (own) {
      player.originalStats.correctVotes = own.correct;
      player.originalStats.incorrectVotes = own.incorrect;
    }
    return player;
  });

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
      exiledPlayer: game.gameActions.length > 0 ? meeting.exiledPlayer : undefined,
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

  const meetingDeaths = getDeathsDuringMeetings(meetings, game.gameActions);
  meetings.forEach(meeting => { meeting.deathsDuringMeeting = meetingDeaths.get(meeting.meetingNumber) ?? []; });
  const timeline = buildGameTimeline(game.gameActions, game.season);

  const winnerInfo = calculateWinnerFromStats(game.gamePlayerStatistics, game.season);

  return {
    id: game.gameIdentifier,
    date: extractDateFromGameId(game.gameIdentifier),
    gameNumber: 1,
    startTime: game.startTime.toISOString(),
    endTime: game.endTime.toISOString(),
    duration: formatDuration(game.startTime, game.endTime),
    map: game.map || 'Nieznana mapa',
    winner: winnerInfo.winner,
    winnerColor: winnerInfo.winnerColor,
    // Prefer the stored DB value; fall back to the stat-derived value if absent
    winCondition: game.winCondition || winnerInfo.winCondition,
    winnerNames,
    winnerColors,
    players: game.gamePlayerStatistics.length,
    maxTasks: game.maxTasks || undefined,
    detailedStats: {
      playersData,
      meetings,
      ...timeline,
    }
  };
}
