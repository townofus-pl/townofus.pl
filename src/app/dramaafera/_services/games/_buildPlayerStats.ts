import type { UIPlayerData } from './types';
import {
  convertRoleNameForDisplay,
  getRoleColor,
  getModifierColor,
  determineTeam,
} from '@/app/dramaafera/_utils/gameUtils';
import { Teams } from '@/constants/teams';

export type StatWithRolesAndModifiers = {
  win: boolean;
  disconnected: boolean;
  completedTasks: number;
  survivedRounds: number;
  totalPoints: number;
  correctKills: number;
  incorrectKills: number;
  correctProsecutes: number;
  incorrectProsecutes: number;
  correctGuesses: number;
  incorrectGuesses: number;
  correctDeputyShoots: number;
  incorrectDeputyShoots: number;
  correctJailorExecutes: number;
  incorrectJailorExecutes: number;
  correctMedicShields: number;
  incorrectMedicShields: number;
  correctWardenFortifies: number;
  incorrectWardenFortifies: number;
  janitorCleans: number;
  correctAltruistRevives: number;
  incorrectAltruistRevives: number;
  correctSwaps: number;
  incorrectSwaps: number;
  initialRolePoints: number | null;
  roleHistory: Array<{ roleName: string; order: number }>;
  modifiers: Array<{ modifierName: string }>;
  player: { name: string } | null | undefined;
};

export type BuildPlayerStatsOptions = {
  /** Set to true (getGameData) to use disconnected for deaths; false/absent (getAllGamesData) → 0 */
  useDisconnectedForDeaths?: boolean;
  /** Pass the game's maxTasks as-is (undefined keeps undefined; 0 is treated as undefined/no limit due to `|| undefined`) */
  maxTasks?: number | null;
  /** Set to true (getGameData) to leave meetings as undefined; false/absent → 0 */
  meetingsUndefined?: boolean;
};

export function buildPlayerStats(stat: StatWithRolesAndModifiers, opts: BuildPlayerStatsOptions = {}): UIPlayerData {
  const roleHistorySorted = [...stat.roleHistory].sort((a, b) => a.order - b.order);
  const roleHistoryNames = roleHistorySorted.map(r => r.roleName);
  const primaryRole = roleHistorySorted[0]?.roleName || 'Unknown';
  const finalRole = roleHistorySorted[roleHistorySorted.length - 1]?.roleName || 'Unknown';
  const displayRoleName = convertRoleNameForDisplay(finalRole);

  const modifierNames = stat.modifiers
    .map(m => m.modifierName)
    .filter(m => m && m.trim() !== '');

  const team = determineTeam(roleHistoryNames);
  const teamStr = team === Teams.Impostor ? 'Impostor' : team === Teams.Neutral ? 'Neutral' : 'Crewmate';

  const playerName = stat.player?.name || 'Unknown';

  return {
    nickname: playerName,
    role: primaryRole,
    roleColor: getRoleColor(displayRoleName),
    roleHistory: roleHistoryNames,
    modifiers: modifierNames,
    modifierColors: modifierNames.map(getModifierColor),
    team: teamStr,
    survived: !stat.disconnected,
    tasksCompleted: stat.completedTasks,
    totalTasks: opts.maxTasks != null ? opts.maxTasks || undefined : undefined,
    kills: stat.correctKills + stat.incorrectKills,
    deaths: opts.useDisconnectedForDeaths ? (stat.disconnected ? 1 : 0) : 0,
    meetings: opts.meetingsUndefined ? undefined : 0,
    win: stat.win,
    totalPoints: stat.totalPoints,
    correctKills: stat.correctKills,
    incorrectKills: stat.incorrectKills,
    correctProsecutes: stat.correctProsecutes,
    incorrectProsecutes: stat.incorrectProsecutes,
    correctGuesses: stat.correctGuesses,
    incorrectGuesses: stat.incorrectGuesses,
    correctDeputyShoots: stat.correctDeputyShoots,
    incorrectDeputyShoots: stat.incorrectDeputyShoots,
    correctJailorExecutes: stat.correctJailorExecutes,
    incorrectJailorExecutes: stat.incorrectJailorExecutes,
    correctMedicShields: stat.correctMedicShields,
    incorrectMedicShields: stat.incorrectMedicShields,
    correctWardenFortifies: stat.correctWardenFortifies,
    incorrectWardenFortifies: stat.incorrectWardenFortifies,
    janitorCleans: stat.janitorCleans,
    completedTasks: stat.completedTasks,
    survivedRounds: stat.survivedRounds,
    correctAltruistRevives: stat.correctAltruistRevives,
    incorrectAltruistRevives: stat.incorrectAltruistRevives,
    correctSwaps: stat.correctSwaps,
    incorrectSwaps: stat.incorrectSwaps,
    originalStats: {
      playerName,
      roleHistory: roleHistoryNames,
      modifiers: modifierNames,
      win: stat.win,
      disconnected: stat.disconnected,
      initialRolePoints: stat.initialRolePoints || 0,
      correctKills: stat.correctKills,
      incorrectKills: stat.incorrectKills,
      correctProsecutes: stat.correctProsecutes,
      incorrectProsecutes: stat.incorrectProsecutes,
      correctGuesses: stat.correctGuesses,
      incorrectGuesses: stat.incorrectGuesses,
      correctDeputyShoots: stat.correctDeputyShoots,
      incorrectDeputyShoots: stat.incorrectDeputyShoots,
      correctJailorExecutes: stat.correctJailorExecutes,
      incorrectJailorExecutes: stat.incorrectJailorExecutes,
      correctMedicShields: stat.correctMedicShields,
      incorrectMedicShields: stat.incorrectMedicShields,
      correctWardenFortifies: stat.correctWardenFortifies,
      incorrectWardenFortifies: stat.incorrectWardenFortifies,
      janitorCleans: stat.janitorCleans,
      completedTasks: stat.completedTasks,
      survivedRounds: stat.survivedRounds,
      correctAltruistRevives: stat.correctAltruistRevives,
      incorrectAltruistRevives: stat.incorrectAltruistRevives,
      correctSwaps: stat.correctSwaps,
      incorrectSwaps: stat.incorrectSwaps,
      totalPoints: stat.totalPoints,
    },
  };
}
