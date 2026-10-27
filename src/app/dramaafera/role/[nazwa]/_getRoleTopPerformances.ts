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
    totalPoints: number;
}

export function getRoleTopPerformances(games: PerformanceGame[], roleName: string, displayName: (name: string) => string): RolePerformance[] {
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
        .sort((a, b) => b.totalPoints - a.totalPoints || b.startTime.localeCompare(a.startTime) || a.gameId.localeCompare(b.gameId) || a.playerName.localeCompare(b.playerName, 'pl'));
}
