import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { Prisma } from '@prisma/client';
import { generateRoleRankingStats } from './generateRoleRankingStats';
import { getDatabaseClient } from '../db';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));
let db: DatabaseSync;
const query = jest.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const sql = Prisma.sql(strings, ...values);
    return db.prepare(sql.sql).all(...sql.values as SQLInputValue[]);
});

beforeEach(() => {
    jest.clearAllMocks();
    db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE games (id INTEGER PRIMARY KEY, season INTEGER, startTime TEXT, deletedAt TEXT);
      CREATE TABLE players (id INTEGER PRIMARY KEY, name TEXT, deletedAt TEXT);
      CREATE TABLE game_player_statistics (id INTEGER PRIMARY KEY, gameId INTEGER, playerId INTEGER, totalPoints REAL, win INTEGER);
      CREATE TABLE player_roles (gamePlayerStatisticsId INTEGER, roleName TEXT, "order" INTEGER);
      INSERT INTO games VALUES (1,4,'2026-10-24T23:59:59.000+00:00',NULL),(2,4,'2026-10-25T00:00:00.000+00:00',NULL),(3,4,'2026-10-26T20:00:00.000+00:00','deleted'),(4,3,'2026-10-30T20:00:00.000+00:00',NULL);
      INSERT INTO players VALUES (1,'Gracz',NULL),(2,'Usunięty','deleted');
      INSERT INTO game_player_statistics VALUES (1,1,1,12,1),(2,2,1,40,0),(3,3,1,90,1),(4,4,1,90,1),(5,1,2,90,1);
      INSERT INTO player_roles VALUES (1,'Sheriff',0),(1,'Impostor',1),(2,'Sheriff',0),(3,'Sheriff',0),(4,'Sheriff',0),(5,'Sheriff',0);
    `);
    jest.mocked(getDatabaseClient).mockResolvedValue({ $queryRaw: query } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
});
afterEach(() => db.close());

test('one SQL statement excludes latest-day DAP but counts every active initial-role appearance', async () => {
    const [role] = await generateRoleRankingStats(4);
    expect(role).toMatchObject({ name: 'Sheriff', gamesPlayed: 2, wins: 1, totalPoints: 12, averagePoints: 12 });
    expect(role.players[0]).toMatchObject({ gamesPlayed: 2, wins: 1, averagePoints: 12 });
    expect(query).toHaveBeenCalledTimes(1);
});

test('a role played only on the newest day has zero DAP without division by zero', async () => {
    db.exec("UPDATE player_roles SET roleName='Medic' WHERE gamePlayerStatisticsId=2");
    const roles = await generateRoleRankingStats(4);
    expect(roles.find(role => role.name === 'Medic')).toMatchObject({ gamesPlayed: 1, totalPoints: 0, averagePoints: 0 });
});

test('starting a new session includes the preceding session in DAP', async () => {
    db.exec("INSERT INTO games VALUES (6,4,'2026-10-27T20:00:00.000+00:00',NULL)");
    const [role] = await generateRoleRankingStats(4);
    expect(role).toMatchObject({ totalPoints: 52, averagePoints: 26 });
});

test('date ranges use UTC day bounds without redefining the season-wide DAP cutoff', async () => {
    const [role] = await generateRoleRankingStats(4, new Date('2026-10-24T00:00:00Z'), new Date('2026-10-24T23:59:59.999Z'));
    expect(role).toMatchObject({ gamesPlayed: 1, totalPoints: 12, averagePoints: 12 });
});

test('normalizes role aliases before grouping', async () => {
    db.exec("UPDATE player_roles SET roleName='TimeLord' WHERE gamePlayerStatisticsId=1 AND \"order\"=0; UPDATE player_roles SET roleName='Time Lord' WHERE gamePlayerStatisticsId=2");
    const roles = await generateRoleRankingStats(4);
    expect(roles).toHaveLength(1);
    expect(roles[0]).toMatchObject({ name: 'Time Lord', gamesPlayed: 2 });
});
