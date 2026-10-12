import { filterRankingHistory } from './filterRankingHistory';

const history = [
  { date: new Date('2026-10-10T12:00:00Z'), score: 2100 },
  { date: new Date('2026-10-11T22:00:00Z'), score: 2200 },
  { date: new Date('2026-10-12T12:00:00Z'), score: 2300 },
];

test('includes the entire final day and the previous point as context for both players', () => {
  expect(filterRankingHistory(history, '2026-10-11', '2026-10-11')).toEqual(history.slice(0, 2));
  const otherPlayer = history.map(point => ({ ...point, score: point.score - 100 }));
  expect(filterRankingHistory(otherPlayer, '2026-10-11', '2026-10-11')).toEqual(otherPlayer.slice(0, 2));
});

test('sorts by game date without mutating the source', () => {
  const reversed = [...history].reverse();
  expect(filterRankingHistory(reversed, '', '')).toEqual(history);
  expect(reversed[0]).toEqual(history[2]);
});

test('returns no points for an empty range or a player without history', () => {
  expect(filterRankingHistory(history, '2026-10-15', '')).toEqual([]);
  expect(filterRankingHistory([], '', '')).toEqual([]);
});

 test('uses UTC day boundaries for late evening games regardless of browser timezone', () => {
   const before = { date: new Date('2026-10-10T23:59:59.999Z'), score: 2000 };
   const evening = { date: new Date('2026-10-11T22:30:00Z'), score: 2100 };
   const end = { date: new Date('2026-10-11T23:59:59.999Z'), score: 2200 };
   const next = { date: new Date('2026-10-12T00:00:00Z'), score: 2300 };
   expect(filterRankingHistory([before, evening, end, next], '2026-10-11', '2026-10-11')).toEqual([before, evening, end]);
   expect(filterRankingHistory([evening], '2026-10-12', '')).toEqual([]);
 });
