import { buildRoleActionStats, type RoleStatAction, type RoleStatsGame } from './roleActionStats';
import { emptyCounters } from '@/app/api/v2/games/_utils/aggregate';

type RoleStatsPlayer = RoleStatsGame['detailedStats']['playersData'][number];
const player = (name: string, history: string[], kills = 99): RoleStatsPlayer => ({
    nickname: name, role: history[0], roleHistory: history, win: true,
    originalStats: { ...emptyCounters(), correctKills: kills, playerName: name, roleHistory: history, modifiers: [], win: true, totalPoints: 0 },
});
const game = (players: RoleStatsPlayer[], hasActionData = true): RoleStatsGame => ({
    id: 'game', hasActionData, maxTasks: 10, detailedStats: { playersData: players },
});
const action = (role: string, type: RoleStatAction['type'], isCorrect: RoleStatAction['isCorrect'] = true, detail: string | null = null): RoleStatAction => ({
    gameId: 'game', playerName: 'A', performerRole: role, type, isCorrect, detail,
});

test('splits actions at role changes instead of reusing whole-game counters', () => {
    const result = buildRoleActionStats([game([player('A', ['Amnesiac', 'Sheriff'])])], [
        action('Amnesiac', 'kill'), action('Sheriff', 'kill'), action('Sheriff', 'kill', false),
    ], 'Sheriff', 4);
    expect(result.byPlayer.A.categories.kills).toEqual({ correct: 1, incorrect: 1 });
    expect(result.totalCorrectKills).toBe(1);
    expect(result.byPlayer.A.games).toBe(1);
});

test('does not credit later-role actions to the starting role', () => {
    const result = buildRoleActionStats([game([player('A', ['Sheriff', 'Impostor'])])], [action('Impostor', 'kill')], 'Sheriff', 4);
    expect(result.totalCorrectKills).toBe(0);
});

test('uses action role for guesses, knighting, verdicts and weighted votes', () => {
    const result = buildRoleActionStats([game([player('A', ['Monarch'])])], [
        action('Monarch', 'knight'), action('Monarch', 'kill', false, '{"isGuess":true}'),
        action('Monarch', 'vote', 1, '{"weight":3}'), action('Monarch', 'protect', null),
    ], 'Monarch', 4);
    expect(result.byPlayer.A.categories.other.correct).toBe(1);
    expect(result.byPlayer.A.categories.protects.correct).toBe(0);
    expect(result.byPlayer.A.categories.guesses.incorrect).toBe(1);
    expect(result.byPlayer.A.categories.votes.correct).toBe(3);
});

test('legacy games use counters only when the role is unambiguous', () => {
    const result = buildRoleActionStats([game([player('A', ['Sheriff', 'Impostor']), player('B', ['Sheriff'], 2)], false)], [], 'Sheriff', 3);
    expect(result.byPlayer.A).toBeUndefined();
    expect(result.byPlayer.B.categories.kills.correct).toBe(2);
    expect(result.skippedLegacyGames).toBe(1);
});

test('normalizes role aliases and ignores unknown verdicts', () => {
    const result = buildRoleActionStats([game([player('A', ['TimeLord'])])], [
        action('TimeLord', 'revive', null), action('TimeLord', 'revive', true),
    ], 'Time Lord', 4);
    expect(result.byPlayer.A.categories.other).toEqual({ correct: 1, incorrect: 0 });
});

test('round denominator follows the profile rule for a loss in the selected role', () => {
    const losing = { ...player('A', ['Amnesiac', 'Sheriff']), win: false };
    const result = buildRoleActionStats([game([losing])], [
        action('Amnesiac', 'round_survived'),
        action('Sheriff', 'round_survived'), action('Sheriff', 'round_survived'),
    ], 'Sheriff', 4);
    expect(result.survivedRounds).toBe(2);
    expect(result.totalRounds).toBe(3);
});

test('does not charge a later-role loss to the earlier role', () => {
    const losing = { ...player('A', ['Sheriff', 'Impostor']), win: false };
    const result = buildRoleActionStats([game([losing])], [
        action('Sheriff', 'round_survived'), action('Impostor', 'round_survived'),
    ], 'Sheriff', 4);
    expect(result.survivedRounds).toBe(1);
    expect(result.totalRounds).toBe(1);
});
