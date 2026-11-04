import { toPublicGameData, sortPlayersStandard } from './_toPublic';
import { findForbiddenFields } from './_forbiddenFields';
import type { UIGameData, UIPlayerData } from './types';

function player(nickname: string, totalPoints: number): UIPlayerData {
  return {
    nickname, role: 'Sheriff', roleColor: '#fff', roleHistory: ['Sheriff'], modifiers: [], modifierColors: [],
    team: 'Crewmate', survived: true, tasksCompleted: 1, kills: 0, deaths: 0, totalPoints, win: true,
    correctKills: 2, incorrectKills: 0, correctProsecutes: 0, incorrectProsecutes: 0, correctGuesses: 0, incorrectGuesses: 0,
    correctDeputyShoots: 0, incorrectDeputyShoots: 0, correctJailorExecutes: 0, incorrectJailorExecutes: 0,
    correctProtects: 0, incorrectProtects: 0, correctWardenFortifies: 0, incorrectWardenFortifies: 0,
    janitorCleans: 0, completedTasks: 1, survivedRounds: 3, correctAltruistRevives: 0, incorrectAltruistRevives: 0,
    correctSwaps: 0, incorrectSwaps: 0,
    originalStats: {
      playerName: nickname, roleHistory: ['Sheriff'], modifiers: [], win: true, initialRolePoints: 7, totalPoints,
      correctKills: 2, incorrectKills: 0, correctProsecutes: 0, incorrectProsecutes: 0, correctGuesses: 0, incorrectGuesses: 0,
      correctDeputyShoots: 0, incorrectDeputyShoots: 0, correctJailorExecutes: 0, incorrectJailorExecutes: 0,
      correctProtects: 0, incorrectProtects: 0, correctWardenFortifies: 0, incorrectWardenFortifies: 0,
      janitorCleans: 0, completedTasks: 1, survivedRounds: 3, correctAltruistRevives: 0, incorrectAltruistRevives: 0,
      correctSwaps: 0, incorrectSwaps: 0,
    },
  };
}

const game = (players: UIPlayerData[]): UIGameData => ({
  id: 'g', date: '20261021', gameNumber: 1, startTime: '', endTime: '', duration: '10:00', map: 'Polus',
  winner: 'Crewmate', winnerColor: '#fff', winCondition: '', winnerNames: [], winnerColors: {}, players: players.length,
  detailedStats: { playersData: players, events: [], meetings: [] },
});

describe('toPublicGameData', () => {
  const full = game([player('A', 5), player('B', 12), player('C', 8)]);

  test('the internal game has point fields, so the scan is meaningful', () => {
    expect(findForbiddenFields(full).length).toBeGreaterThan(0);
  });

  test('the public game has no point field at any depth', () => {
    expect(findForbiddenFields(toPublicGameData(full))).toEqual([]);
    expect(JSON.stringify(toPublicGameData(full))).not.toMatch(/totalPoints|initialRolePoints/);
  });

  test('keeps the counters that the tables read', () => {
    const [p] = toPublicGameData(full).detailedStats.playersData;
    expect(p.originalStats.correctKills).toBe(2);
    expect(p.originalStats.survivedRounds).toBe(3);
  });

  test('standard order is applied on the server and keeps the input order for ties', () => {
    const tied = game([player('A', 5), player('B', 12), player('C', 5)]);
    expect(sortPlayersStandard(tied.detailedStats.playersData).map(p => p.nickname)).toEqual(['B', 'A', 'C']);
    expect(toPublicGameData(tied, { standardOrder: true }).detailedStats.playersData.map(p => p.nickname)).toEqual(['B', 'A', 'C']);
    expect(toPublicGameData(tied).detailedStats.playersData.map(p => p.nickname)).toEqual(['A', 'B', 'C']);
  });
});

describe('findForbiddenFields', () => {
  test('finds nested keys and honours the allow list', () => {
    const body = { a: [{ b: { pointsChange: 1, dap: 2 } }] };
    expect(findForbiddenFields(body)).toEqual(['$.a[0].b.pointsChange', '$.a[0].b.dap']);
    expect(findForbiddenFields(body, ['dap'])).toEqual(['$.a[0].b.pointsChange']);
  });
});
