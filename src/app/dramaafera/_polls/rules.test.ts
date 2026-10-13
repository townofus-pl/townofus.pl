import { pollDeadline, selectCandidates, parsePollContext } from './rules';

describe('termin ankiety w Warszawie', () => {
    test.each([
        ['2026-10-13T12:00:00Z', '2026-10-14T15:00:00Z'],
        ['2026-10-14T14:59:59Z', '2026-10-14T15:00:00Z'],
        ['2026-10-14T15:00:00Z', '2026-10-21T15:00:00Z'],
        ['2026-10-22T10:00:00Z', '2026-10-28T16:00:00Z'],
        ['2026-03-26T10:00:00Z', '2026-04-01T15:00:00Z'],
        ['2026-12-31T20:00:00Z', '2027-01-06T16:00:00Z'],
    ])('%s → %s', (start, end) => {
        expect(pollDeadline(Date.parse(start))).toBe(Date.parse(end));
    });
});

test('remis na granicy top 10 obejmuje wszystkich remisujących', () => {
    const players = Array.from({ length: 13 }, (_, i) => ({ playerId: i + 1, nickname: `Gracz ${i}`, totalPoints: i < 9 ? 100 - i : i < 12 ? 20 : 19 }));
    expect(selectCandidates(players.reverse())).toHaveLength(12);
    expect(selectCandidates(players.slice(0, 3))).toHaveLength(3);
    expect(selectCandidates([])).toEqual([]);
});

test('daty nie normalizują nieistniejących dni', () => {
    expect(() => parsePollContext('20260230', '4')).toThrow();
    expect(parsePollContext('20261013', '4')).toEqual({ date: '20261013', season: 4 });
});
