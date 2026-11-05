import { normalizeRoleName, getRoleColor, determineTeam } from '@/app/dramaafera/_utils/gameUtils';
import type { SessionPlayer, SessionRole } from './getSessionSummaryByDate';

/** Jedna gra sesji w kolejności od najstarszej: zwycięzca i gracze z wynikiem oraz rolą początkową. */
export interface SessionEntry {
  winner: string;
  players: Array<{ name: string; win: boolean; initialRole: string }>;
}

/**
 * Czyste podsumowanie sesji: wyniki graczy i ról oraz liczba wygranych drużyn.
 * Rolą roli jest rola początkowa, tak jak w tabeli ról. `null` w `entries` to gra, której nie wczytano.
 */
export function summarizeSession(entries: Array<SessionEntry | null>, gameCount: number, season: number) {
  // Player stats
  const playerMap = new Map<string, SessionPlayer>();
  entries.forEach((game, gameIdx) => {
    if (!game) return;
    game.players.forEach((player) => {
      if (!playerMap.has(player.name)) {
        playerMap.set(player.name, {
          name: player.name,
          avatar: `/images/avatars/${player.name}.png`,
          games: 0,
          wins: 0,
          loses: 0,
          winRatio: 0,
          results: Array(gameCount).fill(null) as Array<'W' | 'L' | null>,
        });
      }
      const stats = playerMap.get(player.name)!;
      stats.games++;
      if (player.win) {
        stats.wins++;
        stats.results[gameIdx] = 'W';
      } else {
        stats.loses++;
        stats.results[gameIdx] = 'L';
      }
    });
  });

  const players: SessionPlayer[] = Array.from(playerMap.values())
    .map((p) => ({
      ...p,
      winRatio: p.games > 0 ? Math.round((p.wins / p.games) * 10000) / 100 : 0,
    }))
    .sort((a, b) => {
      if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.name.localeCompare(b.name);
    });

  // Role stats
  const roleMap = new Map<string, SessionRole>();
  entries.forEach((game, gameIdx) => {
    if (!game) return;
    game.players.forEach((player) => {
      // Use the initial role (index 0) for per-role session stats.
      // Intentional: we track what role a player *started* as, not their final role
      // after a potential transformation (e.g. Plaguebearer → Pestilence).
      // Consistent with generateRoleRankingStats which uses player.role (also initial/primary).
      const roleName = player.initialRole || 'Unknown';

      if (!roleMap.has(roleName)) {
        roleMap.set(roleName, {
          name: roleName,
          displayName: normalizeRoleName(roleName, season),
          color: getRoleColor(roleName, season),
          team: determineTeam([roleName], season),
          games: 0,
          wins: 0,
          loses: 0,
          winRatio: 0,
          results: Array(gameCount).fill(null) as Array<'W' | 'L' | null>,
        });
      }
      const stats = roleMap.get(roleName)!;
      stats.games++;
      if (player.win) {
        stats.wins++;
        stats.results[gameIdx] = 'W';
      } else {
        stats.loses++;
        stats.results[gameIdx] = 'L';
      }
    });
  });

  const roles: SessionRole[] = Array.from(roleMap.values())
    .map((r) => ({
      ...r,
      winRatio:
        r.games > 0 ? Math.round((r.wins / r.games) * 10000) / 100 : 0,
    }))
    .sort((a, b) => {
      if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.displayName.localeCompare(b.displayName);
    });

  // Win counts
  let crewmateWins = 0;
  let impostorWins = 0;
  let neutralWins = 0;
  entries.forEach((game) => {
    if (!game) return;
    if (game.winner === 'Crewmate') crewmateWins++;
    else if (game.winner === 'Impostor') impostorWins++;
    else neutralWins++;
  });

  return { players, roles, crewmateWins, impostorWins, neutralWins };
}
