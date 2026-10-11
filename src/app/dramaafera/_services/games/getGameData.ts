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
import { countVotes } from './_countVotes';
import { getActionAbility, getKillAbility, getVentAbility } from './_actionAbility';

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
              target: true,
              voter: true
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
      gameEvents: {
        where: { ...withoutDeleted },
        orderBy: { timestamp: 'asc' }
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

  // Build events data. v2 stores the authoritative timeline in game_actions.timestampMs;
  // v1 games keep the legacy HH:MM:SS values in game_events.timestamp.
  const legacyEvents: UIGameEvent[] = game.gameEvents.map(event => ({
    timestamp: event.timestamp.toString(),
    type: (event.eventType || 'other') as UIGameEvent['type'],
    player: 'Nieznany',
    target: undefined,
    description: event.description
  }));
  const events: UIGameEvent[] = game.gameActions.length > 0
    ? game.gameActions
      .filter(action => action.type !== 'role_assigned' || action.timestampMs >= 3000)
      .filter(action => action.type !== 'modifier_gained' && action.type !== 'modifier_lost')
      .filter(action => action.type !== 'win')
      .map(action => ({
      timestamp: formatActionTimestamp(action.timestampMs),
      type: actionTypeToEventType(action.type),
      player: action.performer.name,
      playerRole: convertRoleNameForDisplay(action.performerRole),
      playerRoleColor: getRoleColor(action.performerRole, game.season),
      target: action.target?.name,
      targetRole: action.targetRole ? convertRoleNameForDisplay(action.targetRole) : undefined,
      targetRoleColor: action.targetRole ? getRoleColor(action.targetRole, game.season) : undefined,
      description: describeAction(action.type, action.performer.name, action.target?.name, action.detail),
      actionLabel: getActionLabel(action.type, action.detail),
      actionType: action.type,
      isCorrect: action.isCorrect,
      ability: action.type === 'vent_use'
        ? getVentAbility(action.performerRole, game.season)
        : action.type === 'time_rewind' ? getActionAbility(JSON.stringify({ ability: 'TimeLordRewind' }), game.season)
        : action.type === 'ability_used' ? getActionAbility(action.detail, game.season) : undefined,
      killAbility: action.type === 'kill' ? getKillAbility(action.performerRole, game.season, action.detail) : undefined,
    }))
    : legacyEvents;

  const survivalGroups = new Map<string, UIGameEvent>();
  const groupedEvents = events.filter(event => {
    if (event.actionType !== 'round_survived') return true;
    const survivor = { name: event.player, role: event.playerRole, color: event.playerRoleColor };
    const group = survivalGroups.get(event.timestamp);
    if (group) {
      group.survivors?.push(survivor);
      return false;
    }
    event.survivors = [survivor];
    survivalGroups.set(event.timestamp, event);
    return true;
  });

  const winnerInfo = calculateWinnerFromStats(game.gamePlayerStatistics, game.season);
  const winAction = game.gameActions.find(action => action.type === 'win');

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
      events: groupedEvents,
      endTimestamp: winAction ? formatActionTimestamp(winAction.timestampMs) : undefined,
    }
  };
}

function formatActionTimestamp(timestampMs: number): string {
  const totalSeconds = Math.floor(timestampMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function actionTypeToEventType(type: string): UIGameEvent['type'] {
  if (type === 'kill' || type === 'death') return 'kill';
  if (type === 'vote' || type === 'knight') return 'vote';
  if (type === 'task_completed') return 'task';
  if (type === 'sabotage_started') return 'sabotage';
  if (type === 'sabotage_fixed') return 'fix';
  if (type === 'vent_use') return 'vent';
  if (type === 'emergency_button' || type === 'body_reported') return 'meeting';
  return 'other';
}

function describeAction(type: string, performer: string, target?: string, detail?: string | null): string {
  const label = getActionLabel(type, detail);
  return target ? `${performer} ${label}: ${target}` : `${performer} ${label}`;
}

function getActionLabel(type: string, detail?: string | null): string {
  if ((type === 'sabotage_started' || type === 'sabotage_fixed') && detail) {
    try {
      const parsed: unknown = JSON.parse(detail);
      if (parsed && typeof parsed === 'object' && 'system' in parsed && typeof parsed.system === 'string') {
        const systems: Record<string, string> = {
          Electrical: 'światła',
          Reactor: 'reaktor',
          Laboratory: 'reaktor',
          HeliSabotage: 'reaktor',
          Comms: 'commsy',
          LifeSupp: 'tlen',
          Doors: 'drzwi',
          MushroomMixupSabotage: 'grzyby',
        };
        const system = systems[parsed.system] ?? parsed.system;
        const label = type === 'sabotage_started' ? 'rozpoczął sabotaż' : 'naprawił sabotaż';
        return `${label} (${system})`;
      }
    } catch {
      // Keep the generic label for malformed historical details.
    }
  }
  if (type === 'ability_used' && detail) {
    try {
      const parsed: unknown = JSON.parse(detail);
      if (parsed && typeof parsed === 'object' && 'ability' in parsed &&
          typeof parsed.ability === 'string' && parsed.ability.trim()) {
        return `użył zdolności „${parsed.ability.trim()}”`;
      }
    } catch {
      // Keep the generic label when historical details cannot be read.
    }
  }
  const actionLabels: Record<string, string> = {
    ability_used: 'użył zdolności',
    role_assigned: 'otrzymał rolę',
    protect: 'ochronił gracza',
    revive: 'wskrzesił gracza',
    swap: 'zamienił głosy',
    janitor_clean: 'usunął ciało',
    infect: 'zaraził gracza',
    bite: 'ugryzł gracza',
    modifier_gained: 'otrzymał modyfikator',
    modifier_lost: 'stracił modyfikator',
    time_rewind: 'cofnął czas',
    body_reported: 'zgłosił ciało',
    death: 'zginął',
    disconnect: 'rozłączył się',
    douse: 'oblał paliwem gracza',
    emergency_button: 'zwołał spotkanie',
    kill: 'zabił',
    knight: 'pasował gracza na rycerza',
    role_changed: 'zmienił rolę',
    round_survived: 'przetrwał rundę',
    sabotage_fixed: 'naprawił sabotaż',
    sabotage_started: 'rozpoczął sabotaż',
    task_completed: 'ukończył zadanie',
    vent_use: 'użył wentylacji',
    vote: 'oddał głos na',
    win: 'wygrał',
  };
  return actionLabels[type] ?? type;
}
