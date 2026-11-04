import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { Prisma } from '@prisma/client';
import { buildRoleProbabilities, getRoleProbabilities } from './getRoleProbabilities';
import { getDatabaseClient } from '../db';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn() }));

test('SQL keeps old rare-role samples but only resolves final roles for the latest 20 nonempty games', async () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`CREATE TABLE games (id INTEGER PRIMARY KEY, season INTEGER, startTime TEXT, deletedAt TEXT);
      CREATE TABLE players (id INTEGER PRIMARY KEY, deletedAt TEXT);
      CREATE TABLE game_player_statistics (id INTEGER PRIMARY KEY, gameId INTEGER, playerId INTEGER, win INTEGER);
      CREATE TABLE player_roles (gamePlayerStatisticsId INTEGER, roleName TEXT, "order" INTEGER);
      CREATE TABLE player_modifiers (gamePlayerStatisticsId INTEGER, modifierName TEXT);
      INSERT INTO players VALUES (1,NULL),(2,'deleted');`);
    for (let id = 1; id <= 32; id++) {
      db.prepare('INSERT INTO games VALUES (?,4,?,NULL)').run(id, `2026-10-${String(id).padStart(2,'0')}T20:00:00`);
      if (id === 31) continue; // Empty games must not consume the 20-game faction window.
      db.prepare('INSERT INTO game_player_statistics VALUES (?,?,?,1)').run(id,id,id === 32 ? 2 : 1);
      db.prepare('INSERT INTO player_roles VALUES (?,?,0)').run(id,id === 1 ? 'Medic' : 'Sheriff');
      db.prepare("INSERT INTO player_roles VALUES (?,'Sheriff',1)").run(id);
    }
    let raw: Array<{ gameId: number; finalRole: string | null }> = [];
    const query = jest.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const sql = Prisma.sql(strings,...values);
      const rows = db.prepare(sql.sql).all(...sql.values as SQLInputValue[]);
      raw = rows as unknown as typeof raw;
      return rows;
    });
    jest.mocked(getDatabaseClient).mockResolvedValue({ $queryRaw: query } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
    const result = await getRoleProbabilities(4);
    expect(result.games).toBe(20);
    expect(result.unknownWins).toBe(0);
    expect(result.roles.find(role => role.name === 'Medic')).toMatchObject({ games: 1, wins: 1 });
    expect(raw.filter(row => row.finalRole !== null)).toHaveLength(20);
    expect(raw.find(row => row.gameId === 1)?.finalRole).toBeNull();
  } finally { db.close(); }
});

test('faction and role last 20 matches are independent; duplicates and transformations do not add appearances', () => {
  const rows = Array.from({ length: 35 }, (_, index) => ({
    gameId: 35 - index,
    win: index < 14,
    initialRole: 'Sheriff',
    finalRole: 'Sheriff',
    lover: 0,
  }));
  rows.push(...Array.from({ length: 35 }, (_, index) => ({
    gameId: 35 - index, win: index >= 14, initialRole: 'Impostor', finalRole: 'Impostor', lover: 0,
  })));
  // The rare role occurs only before the faction window; 4/10 wins.
  for (let index = 20; index < 30; index++) {
    rows.push({ gameId: 35 - index, win: index < 24, initialRole: 'Medic', finalRole: 'Sheriff', lover: 0 });
  }
  // Match ordering, not player-row count, controls both windows.
  rows.push({ ...rows[0] });
  rows.sort((a, b) => b.gameId - a.gameId);
  const data = buildRoleProbabilities(rows, 4);
  expect(data.games).toBe(20);
  expect(data.factions.find(faction => faction.team === 'Crewmate')).toMatchObject({ wins: 14, winRate: 0.7 });
  expect(data.roles.find(role => role.name === 'Medic')).toMatchObject({ games: 10, wins: 4 });
  expect(data.roles.find(role => role.name === 'Medic')?.weight).toBeCloseTo(0.62);
  expect(data.roles.find(role => role.name === 'Sheriff')).toMatchObject({ games: 20, wins: 14 });
  expect(data.roles.find(role => role.name === 'Sheriff')?.weight).toBeCloseTo(0.5);
});

test('partial or unknown faction samples and unseen roles retain base weight', () => {
  const empty = buildRoleProbabilities([], 4);
  expect(empty.games).toBe(0);
  expect(empty.roles.length).toBeGreaterThan(0);
  expect(empty.roles.every(role => role.weight === 0.5)).toBe(true);
  const unknown = buildRoleProbabilities(Array.from({ length: 20 }, (_, index) => ({
    gameId: index, win: false, initialRole: 'Sheriff', finalRole: 'Sheriff', lover: 0,
  })), 4);
  expect(unknown.unknownWins).toBe(20);
  expect(unknown.roles.every(role => role.weight === 0.5)).toBe(true);
});

test('SQL excludes other seasons, deleted games and deleted players without filtering nonexistent stats columns', async () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE games (id INTEGER PRIMARY KEY, season INTEGER, startTime TEXT, deletedAt TEXT);
      CREATE TABLE players (id INTEGER PRIMARY KEY, deletedAt TEXT);
      CREATE TABLE game_player_statistics (id INTEGER PRIMARY KEY, gameId INTEGER, playerId INTEGER, win INTEGER);
      CREATE TABLE player_roles (gamePlayerStatisticsId INTEGER, roleName TEXT, "order" INTEGER);
      CREATE TABLE player_modifiers (gamePlayerStatisticsId INTEGER, modifierName TEXT);
      INSERT INTO games VALUES (1,4,'2026-10-20',NULL),(2,3,'2026-10-21',NULL),(3,4,'2026-10-22','deleted');
      INSERT INTO players VALUES (1,NULL),(2,'deleted');
      INSERT INTO game_player_statistics VALUES (1,1,1,1),(2,2,1,1),(3,3,1,1),(4,1,2,1);
      INSERT INTO player_roles VALUES (1,'Sheriff',0),(1,'Impostor',1),(2,'Medic',0),(3,'Medic',0),(4,'Medic',0);
    `);
    const query = jest.fn(async (strings: TemplateStringsArray, ...values: unknown[]) => {
      const sql = Prisma.sql(strings, ...values);
      return db.prepare(sql.sql).all(...sql.values as SQLInputValue[]);
    });
    jest.mocked(getDatabaseClient).mockResolvedValue({ $queryRaw: query } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
    const data = await getRoleProbabilities(4);
    expect(data.games).toBe(1);
    expect(data.factions.find(faction => faction.team === 'Impostor')?.wins).toBe(1);
    expect(data.roles.find(role => role.name === 'Sheriff')?.games).toBe(1);
    expect(data.roles.find(role => role.name === 'Medic')?.games).toBe(0);
    expect(query).toHaveBeenCalledTimes(1);
  } finally {
    db.close();
  }
});

test('incomplete role samples retain base despite a complete faction window; lovers count as neutral', () => {
  const rows = Array.from({ length: 20 }, (_, index) => ({
    gameId: 20 - index, win: true, initialRole: index < 9 ? 'Sheriff' : 'Medic', finalRole: 'Sheriff', lover: 0,
  }));
  rows[0].lover = 1;
  rows.push({ ...rows[0], initialRole: 'Impostor', finalRole: 'Impostor' });
  const data = buildRoleProbabilities(rows, 4);
  expect(data.factions.find(faction => faction.team === 'Neutral')?.wins).toBe(1);
  expect(data.roles.find(role => role.name === 'Sheriff')).toMatchObject({ games: 9, weight: 0.5 });
  expect(data.roles.find(role => role.name === 'Medic')).toMatchObject({ games: 11, wins: 11 });
  expect(data.roles.find(role => role.name === 'Medic')?.weight).not.toBe(0.5);
});
