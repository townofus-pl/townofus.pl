import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { Prisma } from '@prisma/client';
import { getRanking } from './getRanking';
import { getDatabaseClient } from '../db';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));
jest.mock('@/app/dramaafera/_constants/seasons', () => ({ CURRENT_SEASON: 4 }));

let db: DatabaseSync;
const query = jest.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const sql = Prisma.sql(strings, ...values);
    return db.prepare(sql.sql).all(...sql.values as SQLInputValue[]);
});

beforeEach(() => {
    db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE games (id INTEGER PRIMARY KEY, season INTEGER, startTime TEXT, deletedAt TEXT);
      CREATE TABLE players (id INTEGER PRIMARY KEY, name TEXT, deletedAt TEXT, currentRankingId INTEGER);
      CREATE TABLE game_player_statistics (id INTEGER PRIMARY KEY, gameId INTEGER, playerId INTEGER, totalPoints REAL, win INTEGER);
      CREATE TABLE player_rankings (id INTEGER PRIMARY KEY, playerId INTEGER, season INTEGER, score REAL, createdAt TEXT, deletedAt TEXT);
      INSERT INTO games VALUES (1,4,'2026-10-07T20:00:00.000+00:00',NULL),(2,4,'2026-10-21T20:00:00.000+00:00',NULL),(3,3,'2026-06-01T20:00:00.000+00:00',NULL),(4,3,'2026-06-08T20:00:00.000+00:00',NULL);
      INSERT INTO players VALUES (1,'Gracz',NULL,10);
      INSERT INTO player_rankings VALUES (10,1,4,2050,'2026-10-21T21:00:00.000Z',NULL),(11,1,3,2010,'2026-06-08T21:00:00.000Z',NULL);
      INSERT INTO game_player_statistics VALUES (1,1,1,12,1),(2,2,1,40,0),(3,3,1,7,1),(4,4,1,9,1);
    `);
    jest.mocked(getDatabaseClient).mockResolvedValue({ $queryRaw: query } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
});
afterEach(() => db.close());

test('the delayed dap of the current season leaves out the latest day', async () => {
    const [player] = (await getRanking(4)).ranking;
    expect(player).toMatchObject({ playerName: 'Gracz', totalGames: 2, wins: 1, dap: 12 });
});

test('a past season also leaves out its own latest day', async () => {
    const [player] = (await getRanking(3)).ranking;
    expect(player).toMatchObject({ totalGames: 2, dap: 7 });
});
