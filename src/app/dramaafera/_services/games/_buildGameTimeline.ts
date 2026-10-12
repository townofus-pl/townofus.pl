import type { UIGameEvent } from './types';
import { convertRoleNameForDisplay, getRoleColor } from '@/app/dramaafera/_utils/gameUtils';
import { getActionAbility, getKillAbility, getVentAbility, findAbilityByKey } from './_actionAbility';

export interface TimelineAction {
  type: string; timestampMs: number; performerRole: string; targetRole: string | null;
  isCorrect: boolean | null; detail: string | null;
  performer: { name: string }; target: { name: string } | null;
}

export function buildGameTimeline(actions: TimelineAction[], season: number) {
  const assigned = new Set<string>();
  const events: UIGameEvent[] = actions
      .filter(action => {
        if (action.type !== 'role_assigned') return true;
        const seen = assigned.has(action.performer.name);
        assigned.add(action.performer.name);
        return seen;
      })
      .filter(action => action.type !== 'modifier_gained' && action.type !== 'modifier_lost')
      .filter(action => action.type !== 'win')
      .map(action => ({
      timestamp: formatActionTimestamp(action.timestampMs),
      type: actionTypeToEventType(action.type),
      player: action.performer.name,
      playerRole: convertRoleNameForDisplay(action.performerRole),
      playerRoleColor: getRoleColor(action.performerRole, season),
      target: action.target?.name,
      targetRole: action.targetRole ? convertRoleNameForDisplay(action.targetRole) : undefined,
      targetRoleColor: action.targetRole ? getRoleColor(action.targetRole, season) : undefined,
      description: describeAction(action.type, action.performer.name, action.target?.name, action.detail),
      actionLabel: getActionLabel(action.type, action.detail),
      actionType: action.type,
      isCorrect: action.isCorrect,
      ability: action.type === 'vent_use'
        ? getVentAbility(action.performerRole, season)
        : action.type === 'time_rewind' ? findAbilityByKey('TimeLordRewind', season)
        : action.type === 'ability_used' ? getActionAbility(action.detail, season) : undefined,
      killAbility: action.type === 'kill' ? getKillAbility(action.performerRole, season, action.detail) : undefined,
    }));


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

  const winAction = actions.find(action => action.type === 'win');
  return { events: groupedEvents, hasTimeline: actions.length > 0,
    endTimestamp: winAction ? formatActionTimestamp(winAction.timestampMs) : undefined };
}

export function formatActionTimestamp(timestampMs: number): string {
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
