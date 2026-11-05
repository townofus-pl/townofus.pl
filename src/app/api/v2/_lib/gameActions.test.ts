import { buildPlayerActionStats, getPlayerActionRows, playerSubtypes, type PlayerActionRow } from './gameActions';
import { getDatabaseClient } from '@/app/dramaafera/_services/db';

jest.mock('@/app/dramaafera/_services/db', () => ({ getDatabaseClient: jest.fn() }));
jest.mock('@/app/api/_database', () => ({ chunkedInQuery: async (ids: number[], fn: (chunk: number[]) => Promise<unknown[]>) => fn(ids) }));

const row = (gameId: number, type: string, performerRole: string, isCorrect: boolean | null, detail: unknown = null): PlayerActionRow => ({
  gameId, type, performerRole, isCorrect, detail: detail ? JSON.stringify(detail) : null, performer: { name: 'A' },
});

const rows = [
  row(1, 'protect', 'Medic', true), row(1, 'protect', 'Medic', false),
  row(2, 'protect', 'Mirrorcaster', true),
  row(1, 'kill', 'Vigilante', true, { isGuess: true, guessedRole: 'Sheriff' }),
  row(2, 'kill', 'Assassin', false, { isGuess: true, guessedModifier: 'Bait' }),
  row(2, 'kill', 'Impostor', true),
];

test('subtypes of a role are computed from the games of that role only', () => {
  const first = playerSubtypes(rows, new Set([1]), 4);
  expect(first.protectTypes.medic).toEqual({ correct: 1, incorrect: 1 });
  expect(first.protectTypes.mirrorcaster).toEqual({ correct: 0, incorrect: 0 });
  expect(first.guessTypes.roles).toEqual({ correct: 1, incorrect: 0 });
  expect(first.guessTypes.modifiers).toEqual({ correct: 0, incorrect: 0 });
  const second = playerSubtypes(rows, new Set([2]), 4);
  expect(second.protectTypes.mirrorcaster).toEqual({ correct: 1, incorrect: 0 });
  expect(second.guessTypes.modifiers).toEqual({ correct: 0, incorrect: 1 });
});

test('a plain kill is not a guess', () => {
  expect(buildPlayerActionStats([row(1, 'kill', 'Impostor', true)], 4).get('A')?.guessTypes.roles).toEqual({ correct: 0, incorrect: 0 });
});

test('the query is limited to the player, to the given games and to protect and kill', async () => {
  const findMany = jest.fn().mockResolvedValue([]);
  jest.mocked(getDatabaseClient).mockResolvedValue({
    player: { findFirst: jest.fn().mockResolvedValue({ id: 9 }) },
    gameAction: { findMany },
  } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
  await getPlayerActionRows('A', [1, 2, 3]);
  expect(findMany).toHaveBeenCalledTimes(1);
  expect(findMany.mock.calls[0][0].where).toMatchObject({ gameId: { in: [1, 2, 3] }, type: { in: ['protect', 'kill'] }, performerId: 9 });
  expect(await getPlayerActionRows('A', [])).toEqual([]);
  expect(findMany).toHaveBeenCalledTimes(1);
});
