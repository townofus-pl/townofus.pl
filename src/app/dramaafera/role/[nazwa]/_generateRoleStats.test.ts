import { generateRoleStats } from './_generateRoleStats';

const player = (nickname: string, roleHistory: string[], win = false, role = roleHistory[0] ?? 'Sheriff') => ({ nickname, roleHistory, role, win });
const game = (...playersData: ReturnType<typeof player>[]) => ({ detailedStats: { playersData } });

test('counts only games started as the target role, even after a later conversion', () => {
    const result = generateRoleStats([game(player('A', ['Sheriff', 'Impostor'], true), player('B', ['Amnesiac', 'Sheriff']))], 'Sheriff', 4);
    expect(result).toMatchObject({ gamesPlayed: 1, totalAppearances: 2, wins: 1, winRate: 100 });
    expect(result.players.map(p => p.name)).toEqual(['A']);
});

test('normalizes IdPart names and display names before comparison', () => {
    const result = generateRoleStats([game(player('A', ['TimeLord']), player('B', ['Time Lord']))], 'Time Lord', 4);
    expect(result.gamesPlayed).toBe(2);
    expect(result.totalAppearances).toBe(2);
});

test('a role only acquired mid-game has appearances but no initial-role games', () => {
    const result = generateRoleStats([game(player('A', ['Amnesiac', 'Sheriff']))], 'Sheriff', 4);
    expect(result).toMatchObject({ gamesPlayed: 0, totalAppearances: 1, wins: 0, winRate: 0 });
});

test('counts one player only once even when they return to the same role', () => {
    const result = generateRoleStats([game(player('A', ['Sheriff', 'Impostor', 'Sheriff']))], 'Sheriff', 4);
    expect(result).toMatchObject({ gamesPlayed: 1, totalAppearances: 1 });
});

test('counts player appearances rather than distinct matches', () => {
    const result = generateRoleStats([game(player('A', ['Sheriff']), player('B', ['Sheriff']))], 'Sheriff', 4);
    expect(result.gamesPlayed).toBe(2);
});

test('falls back to the stored primary role when history is empty', () => {
    expect(generateRoleStats([game(player('A', [], true, 'Sheriff'))], 'Sheriff', 4).gamesPlayed).toBe(1);
});

test('legacy bundled roles are normalized according to their season', () => {
    const games = [game(player('A', ['Plaguebearer']), player('B', ['Pestilence']))];
    expect(generateRoleStats(games, 'Plaguebearer', 3).gamesPlayed).toBe(2);
    expect(generateRoleStats(games, 'Plaguebearer', 4).gamesPlayed).toBe(1);
});
