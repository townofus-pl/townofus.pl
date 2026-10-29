import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { Prisma } from '@prisma/client';
import { generateRoleRankingStats, generateRoleRankingSummary } from './generateRoleRankingStats';
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
      CREATE TABLE player_rankings (id INTEGER PRIMARY KEY, playerId INTEGER, gameId INTEGER, season INTEGER, score REAL, reason TEXT, deletedAt TEXT);
      INSERT INTO games VALUES (1,4,'2026-10-24T23:59:59.000+00:00',NULL),(2,4,'2026-10-25T00:00:00.000+00:00',NULL),(3,4,'2026-10-26T20:00:00.000+00:00','deleted'),(4,3,'2026-10-30T20:00:00.000+00:00',NULL);
      INSERT INTO players VALUES (1,'Gracz',NULL),(2,'Usunięty','deleted');
      INSERT INTO game_player_statistics VALUES (1,1,1,12,1),(2,2,1,40,0),(3,3,1,90,1),(4,4,1,90,1),(5,1,2,90,1);
      INSERT INTO player_roles VALUES (1,'Sheriff',0),(1,'Impostor',1),(2,'Sheriff',0),(3,'Sheriff',0),(4,'Sheriff',0),(5,'Sheriff',0);
    `);
    jest.mocked(getDatabaseClient).mockResolvedValue({ $queryRaw: query } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
});
afterEach(() => db.close());

test('bounded SQL reads exclude latest-day DAP but count every active initial-role appearance', async () => {
    const [role] = await generateRoleRankingStats(4, undefined, undefined, true, { excludeLatestDay: true });
    expect(role).toMatchObject({ name: 'Sheriff', gamesPlayed: 2, wins: 1, totalPoints: 12, averagePoints: 12 });
    expect(role.players[0]).toMatchObject({ gamesPlayed: 2, wins: 1, averagePoints: 12 });
    expect(query).toHaveBeenCalledTimes(2);
});

test('a role played only on the newest day has zero DAP without division by zero', async () => {
    db.exec("UPDATE player_roles SET roleName='Medic' WHERE gamePlayerStatisticsId=2");
    const roles = await generateRoleRankingStats(4, undefined, undefined, true, { excludeLatestDay: true });
    expect(roles.find(role => role.name === 'Medic')).toMatchObject({ gamesPlayed: 1, totalPoints: 0, averagePoints: 0 });
});

test('starting a new session includes the preceding session in DAP', async () => {
    db.exec("INSERT INTO games VALUES (6,4,'2026-10-27T20:00:00.000+00:00',NULL)");
    const [role] = await generateRoleRankingStats(4, undefined, undefined, true, { excludeLatestDay: true });
    expect(role).toMatchObject({ totalPoints: 52, averagePoints: 26 });
});

test('date ranges use UTC day bounds without redefining the season-wide DAP cutoff', async () => {
    const [role] = await generateRoleRankingStats(4, new Date('2026-10-24T00:00:00Z'), new Date('2026-10-24T23:59:59.999Z'));
    expect(role).toMatchObject({ gamesPlayed: 1, totalPoints: 12, averagePoints: 12 });
});

test('normalizes role aliases before grouping', async () => {
    db.exec("UPDATE player_roles SET roleName='TimeLord' WHERE gamePlayerStatisticsId=1 AND \"order\"=0; UPDATE player_roles SET roleName='Time Lord' WHERE gamePlayerStatisticsId=2");
    const roles = await generateRoleRankingStats(4, undefined, undefined, true, { excludeLatestDay: true });
    expect(roles).toHaveLength(1);
    expect(roles[0]).toMatchObject({ name: 'Time Lord', gamesPlayed: 2 });
});


test('lightweight summary preserves aggregates without returning player breakdowns', async () => {
    const full = await generateRoleRankingStats(4, undefined, undefined, true, { excludeLatestDay: true });
    const summary = await generateRoleRankingSummary(4);
    expect(summary).toEqual(full.map(({ players: _players, ...role }) => role));
    expect(summary[0]).not.toHaveProperty('players');
});

test('date bounds include late games and stop at the following month', async () => {
    db.exec("UPDATE games SET startTime='2026-10-31 23:59:59.999' WHERE id=1; UPDATE games SET startTime='2026-11-01T00:00:00Z' WHERE id=2");
    const roles = await generateRoleRankingSummary(4, new Date('2026-10-31T00:00:00Z'), new Date('2026-10-31T23:59:59.999Z'));
    expect(roles[0]).toMatchObject({ gamesPlayed: 1, totalPoints: 12 });
});


test('API and host defaults include the newest day in role and player DAP', async () => {
    const [role] = await generateRoleRankingStats(4);
    expect(role).toMatchObject({ gamesPlayed: 2, wins: 1, totalPoints: 52, averagePoints: 26 });
    expect(role.players[0]).toMatchObject({ gamesPlayed: 2, averagePoints: 26 });
    expect(query).toHaveBeenCalledTimes(2);
    const sql = Prisma.sql(query.mock.calls[0][0], ...query.mock.calls[0].slice(1));
    expect(sql.sql).not.toContain('latest_day');
});

test('newest-day-only table filters keep appearances but expose no eligible DAP games', async () => {
    const [role] = await generateRoleRankingSummary(4, new Date('2026-10-25T00:00:00Z'), new Date('2026-10-25T23:59:59.999Z'));
    expect(role).toMatchObject({ gamesPlayed: 1, wins: 0, dapGames: 0 });
});

test('a genuine zero DAP remains distinguishable from excluded DAP', async () => {
    db.exec('UPDATE game_player_statistics SET totalPoints=0 WHERE id=1');
    const [role] = await generateRoleRankingSummary(4);
    expect(role).toMatchObject({ dapGames: 1, totalPoints: 0, averagePoints: 0 });
});


test('host table filters can include newest-day DAP without player breakdowns', async () => {
    const [role] = await generateRoleRankingSummary(4, new Date('2026-10-25T00:00:00Z'), new Date('2026-10-25T23:59:59.999Z'), { excludeLatestDay: false });
    expect(role).toMatchObject({ gamesPlayed: 1, wins: 0, dapGames: 1, totalPoints: 40, averagePoints: 40 });
    expect(role).not.toHaveProperty('players');
});

function seedRankedLobby() {
    db.exec(`
      DELETE FROM game_player_statistics;
      DELETE FROM player_roles;
      INSERT INTO players VALUES (3,'Drugi',NULL),(4,'Trzeci',NULL);
      INSERT INTO game_player_statistics VALUES (1,1,1,8,1),(2,1,3,6,1),(3,1,4,4,0),(4,2,1,10,0);
      INSERT INTO player_roles VALUES (1,'Hunter',0),(2,'Sheriff',0),(3,'Sheriff',0),(4,'Hunter',0);
      INSERT INTO player_rankings VALUES
        (1,1,NULL,4,2400,'season_reset',NULL),
        (2,3,NULL,4,2000,'initial_value',NULL),
        (3,4,NULL,4,1600,'season_reset',NULL),
        (10,1,1,4,9000,'game_result',NULL),
        (11,3,1,4,100,'game_result',NULL),
        (12,4,1,4,8000,'game_result',NULL),
        (20,1,2,4,10000,'game_result',NULL),
        (30,1,NULL,4,100000,'reward',NULL);
    `);
}

test('uses pre-game ranking relative to the full lobby, not post-game or current ranking', async () => {
    seedRankedLobby();
    const roles = await generateRoleRankingSummary(4);
    const hunter = roles.find(role => role.name === 'Hunter')!;
    // 2400 / 2000 * 5 = 6 expected, 8 scored: +2; k=3, n=1.
    expect(hunter.strength).toBeCloseTo(100 + 20 * 2 / 4);
    expect(hunter).toMatchObject({ strengthGames: 1, strengthPlayers: 1 });
    const sheriff = roles.find(role => role.name === 'Sheriff')!;
    // Other players have expected scores 5 and 4; deviations +1 and 0.
    expect(sheriff.strength).toBeCloseTo(100 + 20 / 5);
    expect(sheriff).toMatchObject({ strengthGames: 2, strengthPlayers: 2 });
});

test('host includes latest-day strength and counts repeated players once', async () => {
    seedRankedLobby();
    const roles = await generateRoleRankingSummary(4, undefined, undefined, { excludeLatestDay: false });
    const hunter = roles.find(role => role.name === 'Hunter')!;
    // Second game's only participant expects 5, scores 10: total deviation +7.
    expect(hunter.strength).toBeCloseTo(100 + 20 * 7 / 5);
    expect(hunter).toMatchObject({ strengthGames: 2, strengthPlayers: 1 });
});

test('date filtering keeps historical rankings and does not change the lobby denominator', async () => {
    seedRankedLobby();
    const roles = await generateRoleRankingSummary(4, new Date('2026-10-24'), new Date('2026-10-24'));
    expect(roles.find(role => role.name === 'Hunter')!.strength).toBeCloseTo(100 + 20 * 2 / 4);
});

test('manual corrections and absence penalties before a game contribute to its expectation', async () => {
    seedRankedLobby();
    db.exec(`INSERT INTO player_rankings VALUES
      (4,1,NULL,4,2700,'reward',NULL),
      (5,1,99,4,2600,'absence_penalty',NULL),
      (6,1,NULL,4,99999,'reward','deleted'),
      (7,1,NULL,3,99999,'reward',NULL)`);
    const roles = await generateRoleRankingSummary(4);
    const expected = 5 * 2600 / ((2600 + 2000 + 1600) / 3);
    expect(roles.find(role => role.name === 'Hunter')!.strength).toBeCloseTo(100 + 20 * (8 - expected) / 4);
});

test('missing or soft-deleted ranking history invalidates the entire lobby, without hiding DAP', async () => {
    seedRankedLobby();
    db.exec("UPDATE player_rankings SET deletedAt='deleted' WHERE playerId=4");
    const roles = await generateRoleRankingSummary(4);
    expect(roles.find(role => role.name === 'Hunter')).toMatchObject({ strength: null, strengthGames: 0, strengthPlayers: 0, dapGames: 1, totalPoints: 8 });
    expect(roles.find(role => role.name === 'Sheriff')!.strength).toBeNull();
});

test('a subsequently deleted participant still contributes to the historical lobby average', async () => {
    seedRankedLobby();
    db.exec("UPDATE players SET deletedAt='deleted' WHERE id=4");
    const roles = await generateRoleRankingSummary(4);
    expect(roles.find(role => role.name === 'Hunter')!.strength).toBeCloseTo(100 + 20 * 2 / 4);
    expect(roles.find(role => role.name === 'Sheriff')).toMatchObject({ gamesPlayed: 1, strengthGames: 1, strengthPlayers: 1 });
});

test('newest-day-only public filters expose no strength while host filters expose it', async () => {
    seedRankedLobby();
    const from = new Date('2026-10-25');
    const [publicRole] = await generateRoleRankingSummary(4, from, from);
    const [hostRole] = await generateRoleRankingSummary(4, from, from, { excludeLatestDay: false });
    expect(publicRole).toMatchObject({ strength: null, strengthGames: 0, strengthPlayers: 0 });
    expect(hostRole.strength).toBeCloseTo(100 + 20 * 5 / 4);
});


test('last N appearances are selected independently per role with deterministic same-game ordering', async () => {
    seedRankedLobby();
    const roles = await generateRoleRankingStats(4, undefined, undefined, true, { lastGamesPerRole: 1 });
    const hunter = roles.find(role => role.name === 'Hunter')!;
    expect(hunter).toMatchObject({ gamesPlayed: 1, dapGames: 1, totalPoints: 10, averagePoints: 10, strengthGames: 1 });
    expect(hunter.strength).toBeCloseTo(100 + 20 * 5 / 4);
    const sheriff = roles.find(role => role.name === 'Sheriff')!;
    expect(sheriff).toMatchObject({ gamesPlayed: 1, totalPoints: 4, strength: 100 });
    expect(sheriff.players).toHaveLength(1);
    expect(sheriff.players[0].playerName).toBe('Trzeci');
});

test('last N retains all available appearances when fewer than N exist', async () => {
    seedRankedLobby();
    const limited = await generateRoleRankingSummary(4, undefined, undefined, { excludeLatestDay: false, lastGamesPerRole: 10 });
    const all = await generateRoleRankingSummary(4, undefined, undefined, { excludeLatestDay: false });
    expect(limited).toEqual(all);
});

test('public last N skips unreleased sessions before selecting each role sample', async () => {
    seedRankedLobby();
    const roles = await generateRoleRankingSummary(4, undefined, undefined, { lastGamesPerRole: 1 });
    expect(roles.find(role => role.name === 'Hunter')).toMatchObject({ gamesPlayed: 1, dapGames: 1, totalPoints: 8, strengthGames: 1 });
    expect(roles.find(role => role.name === 'Hunter')!.strength).toBeCloseTo(110);
});

test('normalizes aliases before enforcing the per-role limit', async () => {
    seedRankedLobby();
    db.exec("UPDATE player_roles SET roleName='TimeLord' WHERE gamePlayerStatisticsId=1; UPDATE player_roles SET roleName='Time Lord' WHERE gamePlayerStatisticsId=4");
    const roles = await generateRoleRankingSummary(4, undefined, undefined, { excludeLatestDay: false, lastGamesPerRole: 1 });
    const timeLord = roles.find(role => role.name === 'Time Lord')!;
    expect(timeLord).toMatchObject({ gamesPlayed: 1, totalPoints: 10 });
});

test('last N does not replace a recent appearance with an older one when ranking history is missing', async () => {
    seedRankedLobby();
    db.exec('DELETE FROM player_rankings WHERE gameId=2');
    const roles = await generateRoleRankingSummary(4, undefined, undefined, { excludeLatestDay: false, lastGamesPerRole: 1 });
    expect(roles.find(role => role.name === 'Hunter')).toMatchObject({ gamesPlayed: 1, totalPoints: 10, strength: null, strengthGames: 0 });
});
