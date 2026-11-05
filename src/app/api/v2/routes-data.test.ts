/* eslint-disable @typescript-eslint/no-explicit-any */
import { findForbiddenFields } from '@/app/dramaafera/_services/games/_forbiddenFields';
import * as S from './_lib/schemas';
import { GET as sessionsGET } from './sessions/route';
import { GET as sessionGET } from './sessions/[date]/route';
import { GET as gameGET } from './games/[id]/route';
import { GET as eventsGET } from './games/[id]/events/route';
import { GET as playerGET } from './players/[nick]/route';
import { GET as roleGET } from './roles/[name]/route';
import { GET as settingsGET } from './settings/route';
import * as services from '@/app/dramaafera/_services';

// Usługi są podmienione. Dane zawierają pola punktowe i dodatkowe pola, żeby test pokazał,
// że odpowiedź z tras ich nie ma. Każda trasa: status 200, schemat Zod, skan pól zakazanych.
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
jest.mock('@/app/dramaafera/_services/db', () => ({ getDatabaseClient: jest.fn().mockResolvedValue(null) }));
jest.mock('@/app/api/_database', () => ({ chunkedInQuery: async (ids: number[], fn: (chunk: number[]) => Promise<unknown[]>) => fn(ids) }));
jest.mock('@/app/dramaafera/_services/settings', () => ({ getDramaAferaSettings: jest.fn().mockResolvedValue({ current: 'cfg', old: null, secret: 1 }) }));
jest.mock('@/app/dramaafera/_services/gameSessionList', () => ({
  getListaCweliForDisplay: jest.fn().mockResolvedValue([{ id: 1, date: '2026-10-21', displayDate: '21 października 2026', players: [{ name: 'A', eloRanking: 2100 }] }]),
}));
jest.mock('./_lib/gameActions', () => ({
  ...jest.requireActual('./_lib/gameActions'),
  getGameActionRows: jest.fn().mockResolvedValue([]),
  getPlayerActionRows: jest.fn().mockResolvedValue([]),
}));
jest.mock('@/app/dramaafera/_services', () => ({
  getGameDatesLightweight: jest.fn(),
  getSessionOverview: jest.fn(),
  getGameData: jest.fn(),
  getAllGamesData: jest.fn(),
  generateRoleRankingSummary: jest.fn(),
  getAllPlayerNames: jest.fn(),
  getUserProfileStats: jest.fn(),
  getPlayerRankingHistory: jest.fn(),
  getPlayerTopGames: jest.fn(),
  getPlayerVotingStats: jest.fn(),
  getPlayerStars: jest.fn(),
  toPublicGameData: jest.requireActual('@/app/dramaafera/_services/games/_toPublic').toPublicGameData,
}));

const s = jest.mocked(services) as any;
const ALLOWED = ['dap', 'averageDap', 'dapGames'];
const get = async (handler: any, path: string, params?: Record<string, string>) => {
  const response: Response = await handler(new Request(`http://localhost${path}`), { params: Promise.resolve(params ?? {}) });
  return { response, body: (await response.json()) as any };
};
const expectValid = (schema: { safeParse: (v: unknown) => { success: boolean } }, body: unknown) => {
  expect(schema.safeParse(body).success).toBe(true);
  expect(findForbiddenFields(body, ALLOWED)).toEqual([]);
  expect(JSON.stringify(body)).not.toMatch(/totalPoints|initialRolePoints|pointsChange/);
};

const stats = (nickname: string, totalPoints: number) => ({
  playerName: nickname, roleHistory: ['Sheriff'], modifiers: [], win: true, survivedRounds: 3, completedTasks: 2, initialRolePoints: 4, totalPoints,
  correctKills: 1, incorrectKills: 0, correctProsecutes: 0, incorrectProsecutes: 0, correctGuesses: 0, incorrectGuesses: 0,
  correctDeputyShoots: 0, incorrectDeputyShoots: 0, correctJailorExecutes: 0, incorrectJailorExecutes: 0, correctProtects: 0, incorrectProtects: 0,
  correctWardenFortifies: 0, incorrectWardenFortifies: 0, janitorCleans: 0, correctAltruistRevives: 0, incorrectAltruistRevives: 0,
  correctSwaps: 0, incorrectSwaps: 0, correctVotes: 1, incorrectVotes: 0,
});
const player = (nickname: string, totalPoints: number) => ({
  nickname, role: 'Sheriff', roleColor: '#fff', roleHistory: ['Sheriff'], modifiers: [], modifierColors: [], team: 'Crewmate', survived: true,
  tasksCompleted: 2, kills: 1, deaths: 0, totalPoints, win: true, completedTasks: 2, survivedRounds: 3, originalStats: stats(nickname, totalPoints),
});
const game = (isLatestDay: boolean) => ({
  id: '20261021_1106', season: 4, isLatestDay, date: '20261021', gameNumber: 1, startTime: '2026-10-21T11:06:00.000Z', endTime: '2026-10-21T11:16:00.000Z',
  duration: '10:00', map: 'Polus', winner: 'Crewmate', winnerColor: '#fff', winCondition: 'Crewmate won', winnerNames: ['Zed'], winnerColors: {}, players: 3,
  detailedStats: {
    playersData: [player('Zed', 50), player('Ala', 1), player('Bob', 20)],
    events: [{ timestamp: '00:10', type: 'kill', actionType: 'kill', player: 'Zed', target: 'Bob', description: 'x', actionLabel: 'zabił', causeOfDeath: 'Guess', isGuess: true, killAbility: { name: 'Kill', icon: '/k.png' }, playerRoleColor: '#fff' }],
    meetings: [], hasTimeline: false,
  },
});

beforeEach(() => jest.clearAllMocks());

test('GET /sessions', async () => {
  s.getGameDatesLightweight.mockResolvedValue({ dates: [{ date: '20261021', displayDate: '21 października 2026', totalGames: 1, games: [{ id: 1, gameIdentifier: '20261021_1106' }], allPlayerNames: ['A'] }] });
  const { response, body } = await get(sessionsGET, '/api/v2/sessions');
  expect(response.status).toBe(200);
  expectValid(S.SessionsResponseSchema, body);
});

test('GET /sessions/{date}', async () => {
  s.getSessionOverview.mockResolvedValue({
    displayDate: '21 października 2026', crewmateWins: 1, impostorWins: 0, neutralWins: 0, totalPoints: 9,
    games: [{ id: '20261021_1106', date: '20261021', gameNumber: 1, duration: '10:00', players: 1, winner: 'Crewmate', winnerColor: '#fff', winCondition: 'x', map: 'Polus', winnerNames: ['A'], winnerColors: {}, allPlayerNames: ['A'] }],
    players: [{ name: 'A', games: 1, wins: 1, loses: 0, winRatio: 100, results: ['W'] }],
    roles: [{ name: 'Sheriff', displayName: 'Sheriff', color: '#fff', team: 'Crewmate', games: 1, wins: 1, loses: 0, winRatio: 100, results: ['W'] }],
  });
  const { response, body } = await get(sessionGET, '/api/v2/sessions/20261021', { date: '20261021' });
  expect(response.status).toBe(200);
  expectValid(S.SessionResponseSchema, body);
  expect(body.sessionList.players[0]).toEqual({ player: 'A', rating: 2100 });
});

describe('GET /games/{id}: the order of players', () => {
  const names = (body: any) => body.players.map((p: { player: string }) => p.player);

  test('a game from the latest day: alphabetical', async () => {
    s.getGameData.mockResolvedValue(game(true));
    const { response, body } = await get(gameGET, '/api/v2/games/20261021_1106', { id: '20261021_1106' });
    expect(response.status).toBe(200);
    expectValid(S.GameResponseSchema, body);
    expect(names(body)).toEqual(['Ala', 'Bob', 'Zed']);
  });

  test('an older game: the standard order', async () => {
    s.getGameData.mockResolvedValue(game(false));
    const { body } = await get(gameGET, '/api/v2/games/20261021_1106', { id: '20261021_1106' });
    expectValid(S.GameResponseSchema, body);
    expect(names(body)).toEqual(['Zed', 'Bob', 'Ala']);
  });

  test('a game with no flag takes the safe order', async () => {
    const unknown = game(true) as any;
    delete unknown.isLatestDay;
    s.getGameData.mockResolvedValue(unknown);
    expect(names((await get(gameGET, '/api/v2/games/x', { id: 'x' })).body)).toEqual(['Ala', 'Bob', 'Zed']);
  });

  test('a game of another season gives 404 with season, and 200 without it', async () => {
    s.getGameData.mockResolvedValue(game(false));
    expect((await get(gameGET, '/api/v2/games/x?season=3', { id: 'x' })).response.status).toBe(404);
    expect((await get(gameGET, '/api/v2/games/x', { id: 'x' })).response.status).toBe(200);
  });

  test('a game with no timeline has null votes and actions', async () => {
    s.getGameData.mockResolvedValue(game(false));
    const { body } = await get(gameGET, '/api/v2/games/x', { id: 'x' });
    expect(body.players.every((p: any) => p.actions === null && p.counters.votes === null)).toBe(true);
  });
});

test('GET /games/{id}/events keeps the kill fields and merges the ability', async () => {
  s.getGameData.mockResolvedValue(game(false));
  const { response, body } = await get(eventsGET, '/api/v2/games/x/events', { id: 'x' });
  expect(response.status).toBe(200);
  expectValid(S.GameEventsResponseSchema, body);
  expect(body.events[0]).toMatchObject({ type: 'kill', causeOfDeath: 'Guess', isGuess: true, ability: { name: 'Kill', icon: '/k.png' } });
  expect(body.events[0]).not.toHaveProperty('description');
  s.getGameData.mockResolvedValue(null);
  expect((await get(eventsGET, '/api/v2/games/none/events', { id: 'none' })).response.status).toBe(404);
});

test('GET /players/{nick}', async () => {
  const columns = { correctKills: 3, incorrectKills: 1, correctVotes: 2, incorrectVotes: 1 };
  s.getAllPlayerNames.mockResolvedValue(['Malkiz']);
  s.getUserProfileStats.mockResolvedValue({
    name: 'Malkiz', gamesPlayed: 2, wins: 1, winRate: 50, impostorGames: 0, crewmateGames: 2, neutralGames: 0, totalTasks: 4, maxTasks: 10, survivedRounds: 5, totalRounds: 6,
    ...columns, totalPoints: 77,
    roleColumns: { Sheriff: { gamesPlayed: 2, gameIds: [1, 2], columns } },
  });
  s.getPlayerRankingHistory.mockResolvedValue([{ date: new Date('2026-10-21T20:00:00Z'), score: 2050, reason: 'game_result', gameIdentifier: '20261021_1106' }]);
  s.getPlayerTopGames.mockResolvedValue({ best: [{ gameIdentifier: '20261021_1106', date: new Date('2026-10-21T11:06:00Z'), map: 'Polus', duration: '10:00', role: 'Sheriff', roleColor: '#fff', team: 'Crewmate', win: true, totalPoints: 5 }], hasMore: false });
  s.getPlayerVotingStats.mockResolvedValue({ totalVotesCast: 1, totalVotesReceived: 1, timesVotedOut: 0, totalMeetings: 2, skipVotes: 0, skipRate: 0, bandwagonFactor: 50, votingTargets: [{ playerName: 'B', voteCount: 1, percentage: 100 }], votedByPlayers: [] });
  s.getPlayerStars.mockResolvedValue(1);
  const { response, body } = await get(playerGET, '/api/v2/players/malkiz', { nick: 'malkiz' });
  expect(response.status).toBe(200);
  expectValid(S.PlayerResponseSchema, body);
  expect(body.name).toBe('Malkiz');
  expect(body.stats.counters.kills.standard).toBeUndefined();
  expect(body.stats.counters.kills.types.standard).toEqual({ correct: 3, incorrect: 1 });
  expect(body.roleBreakdown.Sheriff.counters.votes).toEqual({ correct: 2, incorrect: 1 });
  s.getAllPlayerNames.mockResolvedValue([]);
  expect((await get(playerGET, '/api/v2/players/nobody', { nick: 'nobody' })).response.status).toBe(404);
});

test('GET /roles/{name}', async () => {
  s.generateRoleRankingSummary.mockResolvedValue([{ name: 'Sheriff', displayName: 'Sheriff', color: '#fff', team: 'Crewmate', gamesPlayed: 4, wins: 1, winRate: 25, dapGames: 3, totalPoints: 12, averagePoints: 4 }]);
  s.getAllGamesData.mockResolvedValue([{ id: '20261021_1106', date: '20261021', startTime: '2026-10-21T11:06:00Z', duration: '10:00', map: 'Polus', detailedStats: { playersData: [player('Zed', 50)] } }]);
  const { response, body } = await get(roleGET, '/api/v2/roles/sheriff', { name: 'sheriff' });
  expect(response.status).toBe(200);
  expectValid(S.RoleResponseSchema, body);
  expect(body.role).toMatchObject({ dap: 12, averageDap: 4, winRate: 25, totalAppearances: 1 });
  expect(body.topPerformances[0]).toMatchObject({ player: 'Zed', gameId: '20261021_1106' });
});

test('GET /settings drops fields that are not in the schema', async () => {
  const { response, body } = await get(settingsGET, '/api/v2/settings');
  expect(response.status).toBe(200);
  expectValid(S.SettingsResponseSchema, body);
  expect(body).toEqual({ current: 'cfg', old: null });
});
