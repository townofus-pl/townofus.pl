import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { getDatabaseClient } from '../db';
import { getRankingAfterSession } from './getRankingAfterSession';

jest.mock('../db', () => ({
  getDatabaseClient: jest.fn(),
  buildSeasonGameWhere: (season: number) => ({ season, deletedAt: null }),
}));

test('a late import does not bring a newer rating into the prior session', async () => {
  const db = new DatabaseSync(':memory:');
  try {
    db.exec(`
      CREATE TABLE games (id INTEGER PRIMARY KEY, startTime TEXT, season INTEGER, deletedAt TEXT);
      CREATE TABLE players (id INTEGER PRIMARY KEY, name TEXT, deletedAt TEXT);
      CREATE TABLE player_rankings (id INTEGER PRIMARY KEY, playerId INTEGER, score REAL, gameId INTEGER, season INTEGER, createdAt TEXT, deletedAt TEXT);
      CREATE TABLE game_player_statistics (playerId INTEGER, gameId INTEGER);
      INSERT INTO games VALUES
        (100, '2026-10-28 20:00:00', 4, NULL),
        (101, '2026-11-04T20:00:00+00:00', 4, NULL),
        (102, '2026-10-28T21:00:00.000Z', 4, NULL);
      INSERT INTO players VALUES (1, 'Hunter', NULL), (2, 'New player', NULL);
      INSERT INTO game_player_statistics VALUES (1, 100), (1, 101), (1, 102), (2, 101);
      INSERT INTO player_rankings VALUES
        (1, 1, 2000, NULL, 4, '2026-09-23', NULL),
        (2, 1, 2000.6, 100, 4, '2026-10-28', NULL),
        (3, 1, 2010.4, 101, 4, '2026-11-04', NULL),
        (4, 2, 2000, NULL, 4, '2026-11-04', NULL);
    `);
    const client = {
      game: { findMany: async () => [
        { id: 102, startTime: new Date('2026-10-28T21:00:00Z') },
        { id: 100, startTime: new Date('2026-10-28T20:00:00Z') },
      ] },
      $queryRaw: async (parts: TemplateStringsArray, ...values: SQLInputValue[]) =>
        db.prepare(parts.join('?')).all(...values),
    };
    jest.mocked(getDatabaseClient).mockResolvedValue(client as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);

    await expect(getRankingAfterSession('20261028', 4)).resolves.toEqual([
      { nickname: 'Hunter', rating: 2001, position: 1, ratingChange: 1 },
    ]);
    await expect(getRankingAfterSession('20261028', 4, { preciseRating: true })).resolves.toEqual([
      { nickname: 'Hunter', rating: 2000.6, position: 1, ratingChange: 1 },
    ]);
  } finally {
    db.close();
  }
});
