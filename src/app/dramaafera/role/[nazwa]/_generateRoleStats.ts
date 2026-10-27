import type { UIPlayerData } from '@/app/dramaafera/_services/games/types';
import { normalizeRoleName } from '@/app/dramaafera/_utils/gameUtils';

type RoleOverviewGame = { detailedStats: { playersData: Pick<UIPlayerData, 'nickname' | 'role' | 'roleHistory' | 'win'>[] } };

/** Counts player appearances, as the role ranking does, rather than distinct game ids. */
export function generateRoleStats(games: RoleOverviewGame[], targetRole: string, seasonId: number) {
    const target = normalizeRoleName(targetRole, seasonId);
    let gamesPlayed = 0;
    let totalAppearances = 0;
    let wins = 0;
    const byPlayer = new Map<string, { games: number; wins: number }>();
    for (const game of games) {
        for (const player of game.detailedStats.playersData) {
            const history = (player.roleHistory?.length ? player.roleHistory : [player.role])
                .map(role => normalizeRoleName(role, seasonId));
            if (history.includes(target)) totalAppearances++;
            if (history[0] !== target) continue;
            gamesPlayed++;
            if (player.win) wins++;
            const own = byPlayer.get(player.nickname) ?? { games: 0, wins: 0 };
            own.games++;
            if (player.win) own.wins++;
            byPlayer.set(player.nickname, own);
        }
    }
    const players = Array.from(byPlayer, ([name, own]) => ({
        name,
        gamesWithRole: own.games,
        winsWithRole: own.wins,
        winRateWithRole: Number((own.wins / own.games * 100).toFixed(1)),
    })).sort((a, b) => b.winRateWithRole - a.winRateWithRole || b.gamesWithRole - a.gamesWithRole || a.name.localeCompare(b.name, 'pl'));
    return { gamesPlayed, totalAppearances, wins, winRate: gamesPlayed ? Number((wins / gamesPlayed * 100).toFixed(1)) : 0, players };
}
