// Winner calculation logic for game results.

import { Teams } from '@/constants/teams';
import { determineTeam, convertRoleNameForDisplay, getRoleColor, getTeamColor } from '@/app/dramaafera/_utils/gameUtils';

// Minimal shape needed by calculateWinnerFromStats
export interface GameStatWithWin {
  win: boolean;
  modifiers?: Array<{ modifierName: string }>;
  roleHistory: Array<{ roleName: string; order: number }>;
}

export function calculateWinnerFromStats(gameStats: GameStatWithWin[]): { winner: string; winnerColor: string; winCondition: string } {
  const winners = gameStats.filter(stat => stat.win);

  if (winners.length === 0) {
    return { winner: 'Nieznany', winnerColor: '#808080', winCondition: 'Brak zwycięzcy' };
  }

  // Check for Lovers special case first.
  // NOTE: The `winners.length > 1` guard is intentional — if only one Lover survives,
  // they are classified by their base role (e.g. Crewmate/Impostor), not as Zakochani.
  // This matches the game's own win logic: a solo surviving Lover does not trigger
  // the Lovers win condition.
  const allHaveLoverModifier = winners.length > 1 && winners.every(stat =>
    stat.modifiers && stat.modifiers.some((mod) => mod.modifierName.toLowerCase() === 'lover')
  );
  if (allHaveLoverModifier) {
    return { winner: 'Zakochani', winnerColor: '#FF69B4', winCondition: 'Wygrali Zakochani' };
  }

  // PRIORITY 1: Impostors
  const impostorWinners = winners.filter(stat => {
    if (!stat.roleHistory || stat.roleHistory.length === 0) return false;
    const finalRole = [...stat.roleHistory].sort((a, b) => a.order - b.order)[stat.roleHistory.length - 1]?.roleName || '';
    return determineTeam(finalRole) === Teams.Impostor;
  });
  if (impostorWinners.length > 0) {
    return { winner: 'Impostor', winnerColor: getTeamColor('Impostor'), winCondition: 'Wygrali Impostorzy' };
  }

  // PRIORITY 2: Crewmates
  const crewmateWinners = winners.filter(stat => {
    if (!stat.roleHistory || stat.roleHistory.length === 0) return false;
    const finalRole = [...stat.roleHistory].sort((a, b) => a.order - b.order)[stat.roleHistory.length - 1]?.roleName || '';
    return determineTeam(finalRole) === Teams.Crewmate;
  });
  if (crewmateWinners.length > 0) {
    return { winner: 'Crewmate', winnerColor: getTeamColor('Crewmate'), winCondition: 'Wygrali Crewmates' };
  }

  // PRIORITY 3: Neutrals
  const neutralWinners = winners.filter(stat => {
    if (!stat.roleHistory || stat.roleHistory.length === 0) return false;
    const finalRole = [...stat.roleHistory].sort((a, b) => a.order - b.order)[stat.roleHistory.length - 1]?.roleName || '';
    return determineTeam(finalRole) === Teams.Neutral;
  });
  if (neutralWinners.length > 0) {
    const firstNeutral = neutralWinners[0];
    if (!firstNeutral.roleHistory || firstNeutral.roleHistory.length === 0) {
      return { winner: 'Neutral', winnerColor: getTeamColor('Neutral'), winCondition: 'Wygrał Neutral' };
    }
    const finalRole = [...firstNeutral.roleHistory].sort((a, b) => a.order - b.order)[firstNeutral.roleHistory.length - 1]?.roleName || 'Neutral';
    const displayRoleName = convertRoleNameForDisplay(finalRole);
    const roleColor = getRoleColor(displayRoleName);
    return { winner: displayRoleName, winnerColor: roleColor, winCondition: `Wygrał ${displayRoleName}` };
  }

  return { winner: 'Nieznany', winnerColor: '#808080', winCondition: 'Nieznany zwycięzca' };
}
