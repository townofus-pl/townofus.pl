import { getPlayerActionStats } from './getPlayerKillStats';
import { getDatabaseClient } from '../db';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));

it('shares the reads and separates kills, correct guesses and all protects', async () => {
  const action = { type: 'kill', performerId: 1, targetId: 2, performerRole: 'Impostor', detail: null, isCorrect: true, performerName: 'A', targetName: 'B' };
  const query = jest.fn()
    .mockResolvedValueOnce([
      action,
      { ...action, performerRole: 'Prosecutor' },
      { ...action, detail: '{"isGuess":true}' },
      { ...action, detail: '{"isGuess":true}', isCorrect: false },
      { ...action, detail: '{"isGuess":true}', isCorrect: null },
      { ...action, type: 'protect', isCorrect: false },
      { ...action, type: 'protect', isCorrect: null, performerId: 2, targetId: 1, performerName: 'B', targetName: 'A' },
    ])
    .mockResolvedValueOnce([{ kills: 1, protects: 1 }]);
  const findFirst = jest.fn().mockResolvedValue({ id: 1 });
  jest.mocked(getDatabaseClient).mockResolvedValue({ player: { findFirst }, $queryRaw: query } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
  const result = await getPlayerActionStats('A', 4);
  expect(findFirst).toHaveBeenCalledTimes(1);
  expect(query).toHaveBeenCalledTimes(2);
  expect(result.kills.kills).toBe(1);
  expect(result.guesses.kills).toBe(1);
  expect(result.protects.kills).toBe(1);
  expect(result.protects.killed).toBe(1);
  expect(result.guesses.targets).toEqual([{ playerName: 'B', count: 1 }]);
  expect(result.protects.killers).toEqual([{ playerName: 'B', count: 1 }]);
});
