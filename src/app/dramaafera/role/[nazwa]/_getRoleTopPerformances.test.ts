import { getRoleTopPerformances } from './_getRoleTopPerformances';

const player = (nickname: string, role: string, totalPoints: number, roleHistory?: string[]) => ({ nickname, role, totalPoints, roleHistory, win: true });
const game = (id: string, playersData: ReturnType<typeof player>[]) => ({
    id, date: '20261025', startTime: '2026-10-25T20:00:00Z', map: 'Polus', duration: '10:00', detailedStats: { playersData },
});

test('ranks individual performances across games and players by points', () => {
    const result = getRoleTopPerformances([
        game('a', [player('A', 'Sheriff', 5), player('B', 'Sheriff', 12)]),
        game('b', [player('C', 'Sheriff', 8)]),
    ], 'Sheriff', name => name);
    expect(result.map(row => row.playerName)).toEqual(['B', 'C', 'A']);
    expect(result[0]).toMatchObject({ gameId: 'a', date: '20261025', win: true });
});

test('matches the initial role, including players who changed roles', () => {
    const result = getRoleTopPerformances([game('a', [
        player('A', 'Impostor', 10, ['Sheriff', 'Impostor']),
        player('B', 'Sheriff', 20, ['Amnesiac', 'Sheriff']),
        player('C', 'Sheriff', 5),
    ])], 'Sheriff', name => name);
    expect(result.map(row => row.playerName)).toEqual(['A', 'C']);
});

test('normalizes names and resolves tied points deterministically', () => {
    const result = getRoleTopPerformances([game('b', [player('B', 'sheriff', 5)]), game('a', [player('A', 'sheriff', 5)])], 'Sheriff', () => 'Sheriff');
    expect(result.map(row => row.gameId)).toEqual(['a', 'b']);
});

test('has no performances for a role absent from the season', () => {
    expect(getRoleTopPerformances([game('a', [player('A', 'Sheriff', 5)])], 'Medic', name => name)).toEqual([]);
});

test('keeps the order but sends no point field to the browser', () => {
    const result = getRoleTopPerformances([game('a', [player('A', 'Sheriff', 5), player('B', 'Sheriff', 12)])], 'Sheriff', name => name);
    expect(result.map(row => row.playerName)).toEqual(['B', 'A']);
    expect(JSON.stringify(result)).not.toContain('totalPoints');
});

test('leaves out games from the latest day', () => {
    const old = { ...game('old', [player('A', 'Sheriff', 1)]), startTime: '2026-10-07T20:00:00Z' };
    const latest = { ...game('new', [player('B', 'Sheriff', 99)]), startTime: '2026-10-21T20:00:00Z' };
    const result = getRoleTopPerformances([old, latest], 'Sheriff', name => name, '2026-10-21');
    expect(result.map(row => row.gameId)).toEqual(['old']);
    expect(JSON.stringify(result)).not.toContain('totalPoints');
    expect(getRoleTopPerformances([old, latest], 'Sheriff', name => name)).toHaveLength(2);
});
