import { DatabaseSync } from 'node:sqlite';
import { getPlayerStars } from '../players/getPlayerStars';
import { getEmperorHistory } from './getEmperorHistory';
import { getDatabaseClient } from '../db';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { getLatestEmperorId, getSessionEmperors } from './getSessionEmperors';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));
jest.mock('@/app/api/_database', () => ({
  chunkedInQuery: (ids: number[], query: (ids: number[]) => Promise<unknown>) => query(ids),
}));

let db: DatabaseSync;
const past = CURRENT_SEASON - 1;

beforeEach(() => {
  db = new DatabaseSync(':memory:');
  db.exec(`
    CREATE TABLE games (id INTEGER PRIMARY KEY, startTime TEXT, season INTEGER, deletedAt TEXT);
    CREATE TABLE players (id INTEGER PRIMARY KEY, deletedAt TEXT);
    CREATE INDEX deleted_players ON players(deletedAt) WHERE deletedAt IS NOT NULL;
    CREATE TABLE game_player_statistics (gameId INTEGER, playerId INTEGER, totalPoints REAL);
    INSERT INTO players VALUES (1, NULL), (2, NULL), (3, 'deleted');
  `);
  const $queryRaw = async (parts: TemplateStringsArray, ...values: (number | string)[]) =>
    db.prepare(parts.join('?')).all(...values);
  jest.mocked(getDatabaseClient).mockResolvedValue({ $queryRaw, player: {
    findFirst: async ({ where }: { where: { name: string } }) => ({ id: where.name === 'One' ? 1 : 2 }),
    findMany: async () => [{ id: 1, name: 'One' }, { id: 2, name: 'Two' }],
  } } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
});

afterEach(() => db.close());

function game(id: number, day: string, points: number[], season = CURRENT_SEASON, deleted = false) {
  db.prepare('INSERT INTO games VALUES (?, ?, ?, ?)').run(id, `${day}T18:00:00`, season, deleted ? 'deleted' : null);
  points.forEach((score, i) => db.prepare('INSERT INTO game_player_statistics VALUES (?, ?, ?)').run(id, i + 1, score));
}

test('no games or unavailable database gives no emperor', async () => {
  expect(await getLatestEmperorId()).toBeNull();
  jest.mocked(getDatabaseClient).mockResolvedValue(null);
  expect(await getSessionEmperors()).toEqual([]);
});

test('one current date stays open; an archived finale awards a star', async () => {
  game(1, '2026-09-16', [5, 2]);
  game(2, '2026-09-16', [2, 5], past);
  expect(await getLatestEmperorId()).toBeNull();
  expect(await getSessionEmperors(past)).toEqual([{ date: '2026-09-16', playerId: 2 }]);
});

test('aggregates the full session and excludes the open date', async () => {
  game(1, '2026-10-07', [4, 1]);
  game(2, '2026-10-07', [0, 5]);
  game(3, '2026-10-14', [9, 0]);
  expect(await getLatestEmperorId()).toBe(2);
});

test('a tied session retains the last unique winner', async () => {
  game(1, '2026-09-02', [1, 4], past);
  game(2, '2026-09-09', [4, 1], past);
  game(3, '2026-09-16', [3, 3], past);
  expect(await getLatestEmperorId(past)).toBe(1);
  expect(await getSessionEmperors(past)).toHaveLength(2);
});

test('all ties give no emperor', async () => {
  game(1, '2026-09-16', [3, 3], past);
  expect(await getLatestEmperorId(past)).toBeNull();
});

test('excludes deleted games and players and isolates seasons', async () => {
  game(1, '2026-09-09', [4, 1, 50], past);
  game(2, '2026-09-16', [1, 9], past, true);
  game(3, '2026-10-01', [1, 9]);
  expect(await getSessionEmperors(past)).toEqual([{ date: '2026-09-09', playerId: 1 }]);
});


test('crown, history and profile stars agree, including the archived finale', async () => {
  game(1, '2026-09-02', [5, 1], past);
  game(2, '2026-09-09', [1, 5], past);
  game(3, '2026-09-16', [1, 5], past);
  expect(await getLatestEmperorId(past)).toBe(2);
  expect(await getPlayerStars('One', past)).toBe(1);
  expect(await getPlayerStars('Two', past)).toBe(2);
  expect(await getEmperorHistory(past)).toEqual([
    { nickname: 'Two', count: 2, dates: ['2026-09-09', '2026-09-16'], isLatest: true },
    { nickname: 'One', count: 1, dates: ['2026-09-02'], isLatest: false },
  ]);
});
