import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { Prisma } from '@prisma/client';
import { getLatestGameDay } from './getLatestGameDay';
import { getPlayerTopGames } from '../players/getPlayerTopGames';
import { getDatabaseClient } from '../db';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn(), buildSeasonGameWhere: jest.fn() }));

let db: DatabaseSync;
const query = jest.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const sql = Prisma.sql(strings, ...values);
    return db.prepare(sql.sql).all(...sql.values as SQLInputValue[]);
});
const findMany = jest.fn().mockResolvedValue([]);

beforeEach(() => {
    jest.clearAllMocks();
    db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE games (id INTEGER PRIMARY KEY, season INTEGER, startTime TEXT, deletedAt TEXT);
      INSERT INTO games VALUES (1,4,'2026-10-07T20:00:00.000+00:00',NULL),(2,4,'2026-10-21T19:00:00.000+00:00',NULL),
        (3,4,'2026-10-21T21:30:00.000+00:00',NULL),(4,4,'2026-10-28T20:00:00.000+00:00','deleted'),(5,3,'2026-11-01T20:00:00.000+00:00',NULL);
    `);
    jest.mocked(getDatabaseClient).mockResolvedValue({
        $queryRaw: query,
        player: { findFirst: jest.fn().mockResolvedValue({ id: 1 }) },
        gamePlayerStatistics: { findMany },
    } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
});
afterEach(() => db.close());

test('the latest day is the newest day with a live game in the season', async () => {
    expect(await getLatestGameDay(4)).toEqual({ date: '2026-10-21', gameIds: [2, 3] });
    expect(await getLatestGameDay(3)).toEqual({ date: '2026-11-01', gameIds: [5] });
    expect(await getLatestGameDay(9)).toBeNull();
});

test('best games of a player leave out the games of the latest day', async () => {
    await getPlayerTopGames('Gracz', 3, 4);
    expect(findMany.mock.calls[0][0].where).toMatchObject({ playerId: 1, gameId: { notIn: [2, 3] } });
});
