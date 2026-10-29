import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { Prisma } from '@prisma/client';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDatabaseClient } from '../db';
import { getRoleBalanceOverview, initializeRoleBalanceCycles, saveRoleBalanceReview, type SaveRoleBalanceReview } from './roleBalanceReviews';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
let db: DatabaseSync;
let failUpdate = false;
let decodeBoundaryDates = false;
let beforeBatch: (() => void) | null = null;
const query = jest.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const sql = Prisma.sql(strings, ...values);
    const rows = db.prepare(sql.sql).all(...sql.values as SQLInputValue[]);
    return rows.map(row => {
        const decoded: Record<string, unknown> = { ...row };
        if (decodeBoundaryDates) for (const key of ['afterTime', 'fromTime', 'throughTime']) {
            if (typeof decoded[key] === 'string') decoded[key] = new Date(decoded[key] as string);
        }
        return decoded;
    });
});
interface Statement { sql: string; values: SQLInputValue[] }
const binding = {
    prepare: (sql: string) => ({ bind: (...values: SQLInputValue[]): Statement => ({ sql, values }) }),
    batch: async (statements: Statement[]) => {
        const hook = beforeBatch; beforeBatch = null; hook?.();
        db.exec('BEGIN');
        try {
            const results = statements.map((statement, index) => {
                if (failUpdate && index === 1) throw new Error('simulated failure');
                const result = db.prepare(statement.sql).run(...statement.values);
                return { meta: { changes: Number(result.changes) } };
            });
            db.exec('COMMIT');
            return results;
        } catch (error) { db.exec('ROLLBACK'); throw error; }
    },
};
function addGame(id: number, day: string) {
    const timestamp = '2026-10-' + day + (id % 2 ? 'T' : ' ') + '20:' + String(id).padStart(2, '0') + ':00';
    db.prepare('INSERT INTO games VALUES (?,4,?,?,NULL)').run(id, timestamp, '202610' + day + '_20' + String(id).padStart(2, '0'));
    for (const playerId of [1, 2]) {
        const statId = id * 2 + playerId;
        db.prepare('INSERT INTO game_player_statistics VALUES (?,?,?,?,?)').run(statId, id, playerId, playerId === 1 ? 6 : 4, id % 2);
        db.prepare('INSERT INTO player_roles VALUES (?,?,0)').run(statId, playerId === 1 ? 'Sheriff' : id <= 3 ? 'Medic' : 'Crewmate');
        db.prepare("INSERT INTO player_rankings (playerId,gameId,season,score,reason) VALUES (?,?,4,2000,'game_result')").run(playerId, id);
    }
}
beforeEach(() => {
    jest.clearAllMocks(); failUpdate = false; decodeBoundaryDates = false; beforeBatch = null;
    db = new DatabaseSync(':memory:');
    db.exec(`
        CREATE TABLE games (id INTEGER PRIMARY KEY, season INTEGER, startTime TEXT, gameIdentifier TEXT, deletedAt TEXT);
        CREATE TABLE players (id INTEGER PRIMARY KEY, name TEXT, deletedAt TEXT);
        CREATE TABLE game_player_statistics (id INTEGER PRIMARY KEY, gameId INTEGER, playerId INTEGER, totalPoints REAL, win INTEGER);
        CREATE TABLE player_roles (gamePlayerStatisticsId INTEGER, roleName TEXT, "order" INTEGER);
        CREATE TABLE player_rankings (id INTEGER PRIMARY KEY AUTOINCREMENT, playerId INTEGER, gameId INTEGER, season INTEGER, score REAL, reason TEXT, deletedAt TEXT);
        INSERT INTO players VALUES (1,'Pierwszy',NULL),(2,'Drugi',NULL);
        INSERT INTO player_rankings (playerId,season,score,reason) VALUES (1,4,2000,'season_reset'),(2,4,2000,'season_reset');
    `);
    db.exec(readFileSync('prisma/migrations/0014_role_balance_reviews.sql', 'utf8'));
    for (let id = 1; id <= 13; id++) addGame(id, id <= 4 ? '24' : id <= 7 ? '25' : '26');
    jest.mocked(getDatabaseClient).mockResolvedValue({ $queryRaw: query } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
    (getCloudflareContext as jest.Mock).mockReturnValue({ env: { DB: binding } });
});
afterEach(() => db.close());
async function payload(throughGameId = 13, decision: SaveRoleBalanceReview['decision'] = 'unchanged'): Promise<SaveRoleBalanceReview> {
    const data = await getRoleBalanceOverview(4, throughGameId);
    const row = data.rows.find(r => r.roleName === 'Sheriff')!;
    return { season: 4, roleName: row.roleName, revision: row.revision!, throughGameId, decision, note: decision === 'settings_changed' ? 'Nowy cooldown' : '', sampleToken: row.sampleToken };
}

test('first activation is explicit, season-scoped and keeps each role independent', async () => {
    const initial = await getRoleBalanceOverview(4);
    expect(initial.rows.every(r => r.revision === null && r.stats === null)).toBe(true);
    await initializeRoleBalanceCycles(4, 1, 'host');
    const data = await getRoleBalanceOverview(4, 7);
    expect(data.rows.find(r => r.roleName === 'Sheriff')!.stats!.gamesPlayed).toBe(7);
    expect(data.rows.find(r => r.roleName === 'Medic')!.stats!.gamesPlayed).toBe(3);
    expect((await getRoleBalanceOverview(3)).rows).toEqual([]);
});

test('threshold 9/10 uses occurrences and full-session sample can exceed ten', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    expect((await getRoleBalanceOverview(4, 9)).rows.find(r => r.roleName === 'Sheriff')!.stats!.gamesPlayed).toBe(9);
    expect((await getRoleBalanceOverview(4, 10)).rows.find(r => r.roleName === 'Sheriff')!.stats!.gamesPlayed).toBe(10);
    expect((await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!.stats!.gamesPlayed).toBe(13);
    db.exec("UPDATE games SET deletedAt='deleted' WHERE id > 7");
    await expect(saveRoleBalanceReview(await payload(7), 'host')).rejects.toThrow('co najmniej 10');
});

test('refresh and crossing the threshold never reset a cycle', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    for (let i = 0; i < 2; i++) {
        const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
        expect(row.revision).toBe(0); expect(row.stats!.gamesPlayed).toBe(13); expect(row.history).toEqual([]);
    }
});

test('a new game requires a refreshed review; unchanged then starts a new cycle after the latest game', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    const input = await payload();
    addGame(14, '27');
    await expect(saveRoleBalanceReview(input, 'host')).rejects.toThrow('nowsza gra');
    expect(db.prepare('SELECT COUNT(*) AS count FROM role_balance_reviews').get()!.count).toBe(0);
    await saveRoleBalanceReview(await payload(14), 'host');
    addGame(15, '28');
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.revision).toBe(1); expect(row.stats!.gamesPlayed).toBe(1);
    expect(row.history[0]).toMatchObject({ decision: 'unchanged', author: 'host', assessment: { label: 'mocna' }, stats: { gamesPlayed: 14, totalPoints: 84 }, through: { gameId: 14 } });
    db.exec('UPDATE game_player_statistics SET totalPoints=100 WHERE id=3');
    expect((await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!.history[0].stats!.totalPoints).toBe(84);
});

test('a settings change can close three appearances when the third game is the latest', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    db.exec("UPDATE games SET deletedAt='deleted' WHERE id > 3");
    await saveRoleBalanceReview(await payload(3, 'settings_changed'), 'host');
    db.exec('UPDATE games SET deletedAt=NULL WHERE id > 3');
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.after!.gameId).toBe(3); expect(row.stats!.gamesPlayed).toBe(10);
    expect(row.history[0]).toMatchObject({ decision: 'settings_changed', stats: { gamesPlayed: 3 } });
});

test('stale preview after a correction requires a fresh decision', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    const input = await payload();
    db.exec('UPDATE game_player_statistics SET totalPoints=20 WHERE id=3');
    await expect(saveRoleBalanceReview(input, 'host')).rejects.toThrow('zmieniły się');
    expect(db.prepare('SELECT COUNT(*) AS count FROM role_balance_reviews').get()!.count).toBe(0);
});

test('double-click and concurrent hosts produce exactly one review and one revision increment', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    const input = await payload();
    const results = await Promise.allSettled([saveRoleBalanceReview(input, 'first'), saveRoleBalanceReview(input, 'second')]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.revision).toBe(1); expect(row.history).toHaveLength(1);
    await expect(saveRoleBalanceReview(input, 'host')).rejects.toThrow('zmieniły się');
});

test('a failed state update rolls back history too', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    const input = await payload(); failUpdate = true;
    await expect(saveRoleBalanceReview(input, 'host')).rejects.toThrow('simulated');
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.revision).toBe(0); expect(row.history).toHaveLength(0);
});

test('missing lobby rankings do not silently refill the sample with old appearances', async () => {
    await initializeRoleBalanceCycles(4, 5, 'host');
    db.exec("UPDATE player_rankings SET deletedAt='deleted' WHERE gameId=8 AND playerId=2");
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.stats!.gamesPlayed).toBe(9); expect(row.stats!.strengthGames).toBe(8);
});

test('initialization cannot overwrite an active cycle', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    await initializeRoleBalanceCycles(4, 8, 'other');
    expect((await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!.stats!.gamesPlayed).toBe(13);
});


test('Prisma Date values in cycle TEXT time fields do not filter out the whole window', async () => {
    await initializeRoleBalanceCycles(4, 5, 'host');
    decodeBoundaryDates = true;
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(typeof row.after!.time).toBe('string');
    expect(row.stats!.gamesPlayed).toBe(9);
});

test('Prisma Date boundaries remain canonical after acknowledgement and in history', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    await saveRoleBalanceReview(await payload(), 'host');
    addGame(14, '27');
    decodeBoundaryDates = true;
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.stats!.gamesPlayed).toBe(1);
    expect(row.after!.time).toBe('2026-10-26T20:13:00.000Z');
    expect(row.history[0].through.time).toBe(row.after!.time);
});


test('a new game arriving between preview verification and the write blocks the atomic batch', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    const input = await payload();
    beforeBatch = () => addGame(14, '27');
    await expect(saveRoleBalanceReview(input, 'host')).rejects.toThrow('Dane przeglądu zmieniły się');
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.revision).toBe(0); expect(row.history).toHaveLength(0);
    expect(row.stats!.gamesPlayed).toBe(14);
});


test('an open cycle start decoded by Prisma as Invalid Date still includes all available games', async () => {
    await initializeRoleBalanceCycles(4, 1, 'host');
    decodeBoundaryDates = true;
    const row = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!;
    expect(row.after).toEqual({ time: '', gameId: 0 });
    expect(row.stats!.gamesPlayed).toBe(13);
    await saveRoleBalanceReview(await payload(), 'host');
    const history = (await getRoleBalanceOverview(4)).rows.find(r => r.roleName === 'Sheriff')!.history;
    expect(history[0].from).toEqual({ time: '', gameId: 0 });
});
