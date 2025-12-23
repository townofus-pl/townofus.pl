import { NextRequest } from 'next/server';
import { getGamesListByDate, getGameData, normalizeRoleName, getRoleColor, determineTeam, formatDisplayDate } from '../../../dramaafera/_services/gameDataService';
import { createSuccessResponse, createErrorResponse } from '../../_utils';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');

    if (!date) {
      return createErrorResponse('Missing date parameter', 400);
    }

    // Pobierz wszystkie gry z danego dnia
    const games = await getGamesListByDate(date);
    
    if (!games || games.length === 0) {
      return createSuccessResponse({
        date,
        displayDate: formatDisplayDate(date),
        players: [],
        roles: [],
        games: [],
        detailedGames: [],
        crewmateWins: 0,
        impostorWins: 0,
        neutralWins: 0
      });
    }

    const displayDate = formatDisplayDate(date);

    // Pobierz szczegółowe dane każdej gry (w odwrotnej kolejności)
    const reversedGames = [...games].reverse();
    const detailedGames = await Promise.all(
      reversedGames.map(async (game) => await getGameData(game.id))
    );

    // Zbierz statystyki graczy
    const playerMap = new Map();
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
            results: Array(games.length).fill(null)
          });
        }
        const stats = playerMap.get(player.nickname);
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

    const players = Array.from(playerMap.values()).map((p) => ({
      ...p,
      winRatio: p.games > 0 ? Math.round((p.wins / p.games) * 10000) / 100 : 0
    })).sort((a, b) => {
      if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.name.localeCompare(b.name);
    });

    // Zbierz statystyki ról
    const roleMap = new Map();
    detailedGames.forEach((game, gameIdx) => {
      if (!game?.detailedStats?.playersData) return;
      game.detailedStats.playersData.forEach((player) => {
        const roleName = player.roleHistory && player.roleHistory.length > 0 
          ? player.roleHistory[0] 
          : player.role || 'Unknown';
        
        if (!roleMap.has(roleName)) {
          const displayName = normalizeRoleName(roleName);
          const color = getRoleColor(roleName);
          const team = determineTeam([roleName]);
          
          roleMap.set(roleName, {
            name: roleName,
            displayName: displayName,
            color: color,
            team: team,
            games: 0,
            wins: 0,
            loses: 0,
            winRatio: 0,
            results: Array(games.length).fill(null)
          });
        }
        const stats = roleMap.get(roleName);
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

    const roles = Array.from(roleMap.values()).map((r) => ({
      ...r,
      winRatio: r.games > 0 ? Math.round((r.wins / r.games) * 10000) / 100 : 0
    })).sort((a, b) => {
      if (b.winRatio !== a.winRatio) return b.winRatio - a.winRatio;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.displayName.localeCompare(b.displayName);
    });

    // Statystyki zwycięstw
    let crewmateWins = 0;
    let impostorWins = 0;
    let neutralWins = 0;
    detailedGames.forEach((game) => {
      if (!game) return;
      if (game.winner === 'Crewmate') crewmateWins++;
      else if (game.winner === 'Impostor') impostorWins++;
      else neutralWins++;
    });

    return createSuccessResponse({
      date,
      displayDate,
      players,
      roles,
      games: reversedGames,
      detailedGames,
      crewmateWins,
      impostorWins,
      neutralWins
    });

  } catch (error) {
    console.error('Error fetching results by date:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch results',
      500
    );
  }
}
