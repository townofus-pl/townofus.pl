import { getAllGamesData } from './getAllGamesData';
import { getDatabaseClient } from '../db';
import { Prisma } from '@prisma/client';

jest.mock('../db', () => ({ getDatabaseClient: jest.fn(), buildSeasonGameWhere: (season = 4) => ({ season, deletedAt: null }) }));
jest.mock('@/app/api/_database', () => ({ chunkedInQuery: async (ids: number[], fetch: (ids: number[]) => Promise<unknown[]>) => ids.length ? fetch(ids) : [] }));
jest.mock('./_buildPlayerStats', () => ({ buildPlayerStats: (stat: { player: { name: string }; roleHistory: { roleName: string }[] }) => ({ nickname: stat.player.name, role: stat.roleHistory[0].roleName, roleHistory: stat.roleHistory.map(r => r.roleName) }) }));
jest.mock('./winCalculator', () => ({ calculateWinnerFromStats: () => ({ winner: '', winnerColor: '', winCondition: '' }) }));

const selection = jest.fn();
const games = jest.fn();
const stats = jest.fn();
const players = jest.fn();
const roles = jest.fn();
const modifiers = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getDatabaseClient).mockResolvedValue({
        $queryRaw: selection, game: { findMany: games }, gamePlayerStatistics: { findMany: stats },
        player: { findMany: players }, playerRole: { findMany: roles }, playerModifier: { findMany: modifiers },
    } as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
    selection.mockResolvedValue([{ id: 11, gameId: 7 }]);
    games.mockResolvedValue([{ id: 7, gameIdentifier: '20261025_2000', startTime: new Date('2026-10-25T20:00:00Z'), endTime: new Date('2026-10-25T20:10:00Z'), modVersion: '1.0.0', map: 'Polus' }]);
    stats.mockResolvedValue([{ id: 11, gameId: 7, playerId: 2, win: false }]);
    players.mockResolvedValue([{ id: 2, name: 'A' }]);
    roles.mockResolvedValue([{ gamePlayerStatisticsId: 11, roleName: 'Sheriff', order: 0 }]);
});

test('role detail queries only matching stats and games, never modifiers or full-season data', async () => {
    const result = await getAllGamesData(4, 'Sheriff');
    expect(selection).toHaveBeenCalledTimes(1);
    const [strings, ...values] = selection.mock.calls[0] as [TemplateStringsArray, ...unknown[]];
    const query = Prisma.sql(strings, ...values);
    expect(query.sql).toContain('WHERE s.id IN');
    expect(query.sql).toContain('roleName IN');
    expect(query.values).toContain('Sheriff');
    expect(games).toHaveBeenCalledWith({ where: { season: 4, deletedAt: null, id: { in: [7] } } });
    expect(stats).toHaveBeenCalledWith({ where: { id: { in: [11] }, player: { deletedAt: null } } });
    expect(roles).toHaveBeenCalledWith(expect.objectContaining({ where: { gamePlayerStatisticsId: { in: [11] } } }));
    expect(players).toHaveBeenCalledWith(expect.objectContaining({ where: { id: { in: [2] }, deletedAt: null } }));
    expect(modifiers).not.toHaveBeenCalled();
    expect(result[0].detailedStats.playersData).toHaveLength(1);
    expect(result[0].hasActionData).toBe(true);
});

test('an unplayed role stops after the indexed selection query', async () => {
    selection.mockResolvedValue([]);
    expect(await getAllGamesData(4, 'Sheriff')).toEqual([]);
    expect(selection).toHaveBeenCalledTimes(1);
    expect(games).not.toHaveBeenCalled();
    expect(stats).not.toHaveBeenCalled();
    expect(roles).not.toHaveBeenCalled();
});
