/* eslint-disable @typescript-eslint/no-explicit-any */
import { findForbiddenFields } from '@/app/dramaafera/_services/games/_forbiddenFields';
import { RankingResponseSchema, RolesResponseSchema, GamesResponseSchema, SeasonsResponseSchema } from './_lib/schemas';
import { getRanking, getLatestEmperorId, generateRoleRankingSummary, getGamesPage } from '@/app/dramaafera/_services';
import { GET as seasonsGET } from './seasons/route';
import { GET as rankingGET } from './ranking/route';
import { GET as rolesGET } from './roles/route';
import { GET as gamesGET, POST as gamesPOST, OPTIONS as gamesOPTIONS } from './games/route';

// Trasy są wywoływane jak w Next.js: `Request` w, `Response` out. Usługi są podmienione,
// więc test sprawdza kształt odpowiedzi, schemat Zod, pola zakazane i logowanie.
jest.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: jest.fn().mockResolvedValue({ env: { API_USERNAME: 'user', API_PASSWORD: 'pass' } }),
}));
jest.mock('./games/post', () => ({ POST: jest.fn().mockResolvedValue(new Response('{}', { status: 200 })) }));
jest.mock('@/app/dramaafera/_services/db', () => ({ getDatabaseClient: jest.fn().mockResolvedValue(null) }));
jest.mock('@/app/dramaafera/_services', () => ({
  getRanking: jest.fn(),
  getLatestEmperorId: jest.fn(),
  generateRoleRankingSummary: jest.fn(),
  getGamesPage: jest.fn(),
}));

const call = (handler: (r: Request) => Promise<Response> | Response, path: string, init?: RequestInit) =>
  Promise.resolve(handler(new Request(`http://localhost${path}`, init)));
const ALLOWED = ['dap', 'averageDap', 'dapGames'];

beforeEach(() => jest.clearAllMocks());

test('GET /seasons gives 200, a valid body and no season 1', async () => {
  const response = await call(seasonsGET, '/api/v2/seasons');
  expect(response.status).toBe(200);
  const body = (await response.json()) as any;
  expect(SeasonsResponseSchema.safeParse(body).success).toBe(true);
  expect(body.seasons.map((s: { id: number }) => s.id)).not.toContain(1);
  expect(response.headers.get('access-control-allow-origin')).toBe('*');
});

test('GET /ranking passes the schema, keeps only delayed dap and drops fields the service leaks', async () => {
  jest.mocked(getRanking).mockResolvedValue({
    ranking: [{ rank: 1, playerId: 7, playerName: 'Gracz', currentRating: 2100, dap: 12.5, totalGames: 3, wins: 2, losses: 1, winRate: 66.67, lastUpdated: '2026-10-21T20:00:00.000Z', totalPoints: 999 } as never],
  });
  jest.mocked(getLatestEmperorId).mockResolvedValue(7);
  const response = await call(rankingGET, '/api/v2/ranking');
  const body = (await response.json()) as any;
  expect(response.status).toBe(200);
  expect(RankingResponseSchema.safeParse(body).success).toBe(true);
  expect(body.emperor).toBe('Gracz');
  expect(body.players[0]).toMatchObject({ player: 'Gracz', dap: 12.5, gamesPlayed: 3 });
  expect(JSON.stringify(body)).not.toContain('totalPoints');
  expect(JSON.stringify(body)).not.toContain('playerId');
  expect(findForbiddenFields(body, ALLOWED)).toEqual([]);
});

test('GET /roles renames the delayed values and passes the schema', async () => {
  jest.mocked(generateRoleRankingSummary).mockResolvedValue([
    { name: 'Sheriff', displayName: 'Sheriff', color: '#fff', team: 'Crewmate', gamesPlayed: 8, wins: 3, winRate: 38, dapGames: 6, totalPoints: 20, averagePoints: 3.3333 },
  ]);
  const response = await call(rolesGET, '/api/v2/roles');
  const body = (await response.json()) as any;
  expect(RolesResponseSchema.safeParse(body).success).toBe(true);
  expect(body.roles[0]).toMatchObject({ dap: 20, averageDap: 3.3333, winRate: 37.5 });
  expect(findForbiddenFields(body, ALLOWED)).toEqual([]);
  expect(generateRoleRankingSummary).toHaveBeenCalledWith(4, undefined, undefined, { excludeLatestDay: true });
});

test('season=1 gives 404 and a bad season gives 400', async () => {
  expect((await call(rankingGET, '/api/v2/ranking?season=1')).status).toBe(404);
  expect((await call(rolesGET, '/api/v2/roles?season=abc')).status).toBe(400);
  expect(getRanking).not.toHaveBeenCalled();
});

describe('/api/v2/games', () => {
  test('GET needs no login, pages in SQL and passes the schema', async () => {
    jest.mocked(getGamesPage).mockResolvedValue({
      total: 1,
      games: [{ id: '20261021_1106', date: '20261021', gameNumber: 1, duration: '10:00', players: 2, winner: 'Crewmate', winnerColor: '#fff', winCondition: 'x', map: 'Polus', winnerNames: ['A'], winnerColors: {}, allPlayerNames: ['A', 'B'] }],
    });
    const response = await call(gamesGET, '/api/v2/games?limit=5&offset=10&date=2026-10-21');
    const body = (await response.json()) as any;
    expect(response.status).toBe(200);
    expect(GamesResponseSchema.safeParse(body).success).toBe(true);
    expect(getGamesPage).toHaveBeenCalledWith(4, { date: '20261021', limit: 5, offset: 10 });
    expect(JSON.stringify(body)).not.toContain('winnerColor');
    expect(findForbiddenFields(body, ALLOWED)).toEqual([]);
  });

  test('POST without credentials gives 401, with wrong credentials 401, with the right ones it reaches the handler', async () => {
    const post = (headers: Record<string, string> = {}) => call(gamesPOST as never, '/api/v2/games', { method: 'POST', headers, body: '{}' });
    expect((await post()).status).toBe(401);
    expect((await post({ authorization: `Basic ${Buffer.from('user:wrong').toString('base64')}` })).status).toBe(401);
    expect((await post({ authorization: `Basic ${Buffer.from('user:pass').toString('base64')}` })).status).toBe(200);
  });

  test('OPTIONS answers the preflight of the public GET', async () => {
    const response = await call(gamesOPTIONS, '/api/v2/games', { method: 'OPTIONS' });
    expect(response.status).toBe(204);
    expect(response.headers.get('access-control-allow-methods')).toContain('GET');
  });
});
