import type { UIGameData, UIPlayerData } from '@/app/dramaafera/_services/games/types';

type PerformanceGame = Pick<UIGameData, 'id' | 'date' | 'startTime' | 'duration' | 'map'> & {
    detailedStats: { playersData: Pick<UIPlayerData, 'nickname' | 'role' | 'roleHistory' | 'totalPoints' | 'win'>[] };
};

export interface RolePerformance {
    gameId: string;
    date: string;
    startTime: string;
    duration: string;
    map: string;
    playerName: string;
    win: boolean;
}

export function getRoleTopPerformances(games: PerformanceGame[], roleName: string, displayName: (name: string) => string): RolePerformance[] {
    // Kolejność ustalamy po stronie serwera. Do przeglądarki idzie sama lista
    // w tej kolejności, bez pola punktowego.
    return games.flatMap(game => game.detailedStats.playersData
        .filter(player => displayName(player.roleHistory?.[0] ?? player.role) === roleName)
        .map(player => ({
            gameId: game.id,
            date: game.date,
            startTime: game.startTime,
            duration: game.duration,
            map: game.map,
            playerName: player.nickname,
            win: player.win,
            totalPoints: player.totalPoints,
        })))
        .sort((a, b) => b.totalPoints - a.totalPoints || b.startTime.localeCompare(a.startTime) || a.gameId.localeCompare(b.gameId) || a.playerName.localeCompare(b.playerName, 'pl'))
        .map(({ gameId, date, startTime, duration, map, playerName, win }) => ({ gameId, date, startTime, duration, map, playerName, win }));
}
