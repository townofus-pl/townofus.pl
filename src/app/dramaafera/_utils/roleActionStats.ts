import { addActionCounters, emptyCounters, type CounterSet } from '@/app/api/v2/games/_utils/aggregate';
import type { V2ActionType } from '@/app/api/schema/gamesV2';
import type { UIGameData, UIPlayerData } from '@/app/dramaafera/_services/games/types';
import { addGame, type RoleBreakdown } from '@/app/dramaafera/_utils/statsBreakdown';
import { normalizeRoleName } from '@/app/dramaafera/_utils/gameUtils';

export interface RoleStatAction {
    gameId: string;
    playerName: string;
    performerRole: string;
    type: V2ActionType;
    isCorrect: boolean | number | null;
    detail: string | null;
}

type Counters = CounterSet & { correctVotes?: number; incorrectVotes?: number };
export type RoleStatsGame = Pick<UIGameData, 'id' | 'hasActionData' | 'maxTasks'> & {
    detailedStats: { playersData: Pick<UIPlayerData, 'nickname' | 'role' | 'roleHistory' | 'originalStats' | 'win'>[] };
};

/** Action-time attribution; v1 counters are safe only if the role never changed. */
export function buildRoleActionStats(games: RoleStatsGame[], actions: RoleStatAction[], targetRole: string, seasonId: number) {
    const target = normalizeRoleName(targetRole, seasonId);
    const matches = (role: string) => normalizeRoleName(role, seasonId) === target;
    const byGame = new Map<string, Map<string, Counters>>();
    for (const action of actions) {
        if (!matches(action.performerRole)) continue;
        let detail: { isGuess?: unknown; weight?: unknown } = {};
        try { detail = action.detail ? JSON.parse(action.detail) ?? {} : {}; } catch { /* Older malformed detail has no flags. */ }
        const players = byGame.get(action.gameId) ?? new Map<string, Counters>();
        const counters = players.get(action.playerName) ?? { ...emptyCounters(), correctVotes: 0, incorrectVotes: 0 };
        const verdict = action.isCorrect === null ? null : action.isCorrect === true || action.isCorrect === 1;
        const counts = { ...emptyCounters(), ...counters };
        addActionCounters(counts, { type: action.type, isGuess: detail.isGuess === true, isCorrect: verdict }, normalizeRoleName(action.performerRole, seasonId));
        Object.assign(counters, counts);
        if (action.type === 'vote' && verdict !== null) {
            const weight = typeof detail.weight === 'number' && Number.isInteger(detail.weight) && detail.weight >= 1 ? detail.weight : 1;
            if (verdict) counters.correctVotes = (counters.correctVotes ?? 0) + weight;
            else counters.incorrectVotes = (counters.incorrectVotes ?? 0) + weight;
        }
        players.set(action.playerName, counters);
        byGame.set(action.gameId, players);
    }

    const byPlayer: RoleBreakdown = {};
    const totals = emptyCounters();
    let maxTasks = 0;
    let totalRounds = 0;
    let skippedLegacyGames = 0;
    for (const game of games) {
        let skipped = false;
        for (const player of game.detailedStats.playersData) {
            const history = player.roleHistory?.length ? player.roleHistory : [player.role];
            const actionCounters = byGame.get(game.id)?.get(player.nickname);
            if (!actionCounters && !history.some(matches)) continue;
            let counters: Counters;
            if (game.hasActionData) {
                counters = actionCounters ?? { ...emptyCounters() };
            } else {
                if (!history.every(matches)) { skipped = true; continue; }
                counters = { ...player.originalStats, survivedRounds: player.originalStats.survivedRounds ?? 0 };
            }
            addGame(byPlayer, player.nickname, counters, seasonId, false, target);
            for (const key of Object.keys(totals) as (keyof typeof totals)[]) {
                totals[key] += counters[key];
            }
            if (counters.completedTasks > 0) maxTasks += game.maxTasks ?? 0;
            // Profile convention: survived rounds plus one for a lost game.
            // After a conversion, the loss belongs only to the last living role.
            const livingHistory = history.filter(role => !role.endsWith('Ghost') && !role.endsWith('Afterlife'));
            const finalRole = livingHistory[livingHistory.length - 1] ?? player.role;
            totalRounds += counters.survivedRounds + (!player.win && matches(finalRole) ? 1 : 0);
        }
        if (skipped) skippedLegacyGames++;
    }
    return {
        byPlayer, skippedLegacyGames,
        totalCorrectKills: totals.correctKills,
        totalIncorrectKills: totals.incorrectKills,
        totalTasks: totals.completedTasks, maxTasks: games.some(game => game.hasActionData) ? 0 : maxTasks,
        correctGuesses: totals.correctGuesses, incorrectGuesses: totals.incorrectGuesses,
        correctProsecutes: totals.correctProsecutes, incorrectProsecutes: totals.incorrectProsecutes,
        correctDeputyShoots: totals.correctDeputyShoots, incorrectDeputyShoots: totals.incorrectDeputyShoots,
        correctJailorExecutes: totals.correctJailorExecutes, incorrectJailorExecutes: totals.incorrectJailorExecutes,
        correctProtects: totals.correctProtects, incorrectProtects: totals.incorrectProtects,
        correctWardenFortifies: totals.correctWardenFortifies, incorrectWardenFortifies: totals.incorrectWardenFortifies,
        janitorCleans: totals.janitorCleans,
        survivedRounds: totals.survivedRounds, totalRounds,
        correctAltruistRevives: totals.correctAltruistRevives, incorrectAltruistRevives: totals.incorrectAltruistRevives,
        correctSwaps: totals.correctSwaps, incorrectSwaps: totals.incorrectSwaps,
    };
}
