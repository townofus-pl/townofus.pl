import { summarizeSession } from './summarizeSession';

jest.mock('@/app/dramaafera/_utils/gameUtils', () => ({
  normalizeRoleName: (name: string) => name,
  getRoleColor: () => '#fff',
  determineTeam: () => 'Crewmate',
}));

const entries = [
  { winner: 'Crewmate', players: [{ name: 'A', win: true, initialRole: 'Sheriff' }, { name: 'B', win: false, initialRole: 'Impostor' }] },
  { winner: 'Impostor', players: [{ name: 'A', win: false, initialRole: 'Medic' }, { name: 'B', win: true, initialRole: 'Impostor' }] },
  null,
];

test('counts wins per player and per initial role, keeps a slot for each game', () => {
  const result = summarizeSession(entries, 3, 4);
  const a = result.players.find((p) => p.name === 'A')!;
  expect(a).toMatchObject({ games: 2, wins: 1, loses: 1, winRatio: 50, results: ['W', 'L', null] });
  const impostor = result.roles.find((r) => r.name === 'Impostor')!;
  expect(impostor).toMatchObject({ games: 2, wins: 1, results: ['L', 'W', null] });
  expect(result).toMatchObject({ crewmateWins: 1, impostorWins: 1, neutralWins: 0 });
});
