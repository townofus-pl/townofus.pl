import { getGamesListByDate } from '../games/getGamesList';
import { getGameData } from '../games/getGameData';
import { normalizeRoleName, getRoleColor, determineTeam, formatDisplayDate } from '@/app/dramaafera/_utils/gameUtils';

export interface SessionPlayer {
  name: string;
  avatar: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: Array<'W' | 'L' | null>;
}

export interface SessionRole {
  name: string;
  displayName: string;
  color: string;
  team: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: Array<'W' | 'L' | null>;
}

export interface SessionSummary {
  date: string;
  displayDate: string;
  players: SessionPlayer[];
  roles: SessionRole[];
  games: Awaited<ReturnType<typeof getGamesListByDate>>;
  detailedGames: Array<Awaited<ReturnType<typeof getGameData>>>;
  crewmateWins: number;
  impostorWins: number;
  neutralWins: number;
}

export async function getSessionSummaryByDate(
  date: string,
  seasonId?: number,
): Promise<SessionSummary> {
  const empty: SessionSummary = {
    date,
    displayDate: formatDisplayDate(date),
    players: [],
    roles: [],
    games: [],
    detailedGames: [],
    crewmateWins: 0,
    impostorWins: 0,
    neutralWins: 0,
  };

  const games = await getGamesListByDate(date, seasonId);
  if (!games || games.length === 0) return empty;

  const displayDate = formatDisplayDate(date);
  const reversedGames = [...games].reverse();
  const detailedGames = await Promise.all(
    reversedGames.map((game) => getGameData(game.id)),
  );

  // Player stats
  const playerMap = new Map<string, SessionPlayer>();
  detailedGames.forEach((game, gameIdx) => {
    if (!game?.detailedStats?.playersData) return;
    game.detailedStats.playersData.forEach((player) => {
      if (!playerMap.has(player.nickname)) {
        playerMap.set(player.nickname, {
          name: player.nickname,
          avatar: `/images/avatars/${player.nickname}.png`,
          games: 0,
          wins: 0,
          loses: 0,
          winRatio: 0,
          results: Array(games.length).fill(null) as Array<'W' | 'L' | null>,
        });
      }
      const stats = playerMap.get(player.nickname)!;
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
  detailedGames.forEach((game, gameIdx) => {
    if (!game?.detailedStats?.playersData) return;
    game.detailedStats.playersData.forEach((player) => {
      // Use the initial role (index 0) for per-role session stats.
      // Intentional: we track what role a player *started* as, not their final role
      // after a potential transformation (e.g. Plaguebearer → Pestilence).
      // Consistent with generateRoleRankingStats which uses player.role (also initial/primary).
      const roleName =
        player.roleHistory && player.roleHistory.length > 0
          ? player.roleHistory[0]
          : player.role || 'Unknown';

      if (!roleMap.has(roleName)) {
        roleMap.set(roleName, {
          name: roleName,
          displayName: normalizeRoleName(roleName),
          color: getRoleColor(roleName),
          team: determineTeam([roleName]),
          games: 0,
          wins: 0,
          loses: 0,
          winRatio: 0,
          results: Array(games.length).fill(null) as Array<'W' | 'L' | null>,
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
  detailedGames.forEach((game) => {
    if (!game) return;
    if (game.winner === 'Crewmate') crewmateWins++;
    else if (game.winner === 'Impostor') impostorWins++;
    else neutralWins++;
  });

  return {
    date,
    displayDate,
    players,
    roles,
    games: reversedGames,
    detailedGames,
    crewmateWins,
    impostorWins,
    neutralWins,
  };
}
