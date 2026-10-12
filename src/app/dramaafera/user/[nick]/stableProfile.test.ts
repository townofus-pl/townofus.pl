import { renderToStaticMarkup } from 'react-dom/server';
import { UserProfileContent } from './UserProfileContent';
import { getAllPlayerNames, getUserProfileStats } from '../../_services';
import { getDatabaseClient } from '../../_services/db';
jest.mock('../../_services', () => ({
    getAllPlayerNames: jest.fn(),
    getUserProfileStats: jest.fn(),
}));
jest.mock('../../_services/db', () => ({ getDatabaseClient: jest.fn() }));
jest.mock('./RankingHistorySection', () => ({ __esModule: true, default: () => null }));
jest.mock('./TopGamesDisplay', () => ({ __esModule: true, default: () => null }));
jest.mock('./VotingStatsDisplay', () => ({ __esModule: true, default: () => null }));
jest.mock('next/navigation', () => ({
    notFound: () => {
        throw new Error('404');
    },
}));
const players = [
    { id: 1, name: 'A B' },
    { id: 2, name: 'a-b' },
];
const findFirst = jest.fn(),
    findMany = jest.fn();
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getAllPlayerNames).mockResolvedValue(players.map((p) => p.name));
    jest.mocked(getUserProfileStats).mockResolvedValue(null);
    jest.mocked(getDatabaseClient).mockResolvedValue({
        player: { findFirst, findMany },
    } as unknown as Awaited<ReturnType<typeof getDatabaseClient>>);
    findFirst.mockResolvedValue(players[1]);
    findMany.mockResolvedValue(players);
});
test('stable profile resolves exact PK, including a player with no current-season games', async () => {
    const output = renderToStaticMarkup(await UserProfileContent({ playerId: 2, seasonId: 4 }));
    expect(findFirst).toHaveBeenCalledWith({
        where: { id: 2, deletedAt: null },
        select: { id: true, name: true },
    });
    expect(getUserProfileStats).toHaveBeenCalledWith(2, 4);
    expect(output).toContain('a-b');
    expect(output).toContain('nie rozegrał żadnej gry');
});
test('legacy slug collisions show both stable profiles without choosing one', async () => {
    const output = renderToStaticMarkup(await UserProfileContent({ nick: 'a-b', seasonId: 4 }));
    expect(output).toContain('/gracz/1');
    expect(output).toContain('/gracz/2');
    expect(getUserProfileStats).not.toHaveBeenCalled();
});
test('renamed stable player still uses its original PK for statistics', async () => {
    findFirst.mockResolvedValue({ id: 1, name: 'New name' });
    jest.mocked(getAllPlayerNames).mockResolvedValue(['New name', 'a-b']);
    const output = renderToStaticMarkup(await UserProfileContent({ playerId: 1, seasonId: 1 }));
    expect(getUserProfileStats).toHaveBeenCalledWith(1, 1);
    expect(output).toContain('New name');
});
test('deleted/nonexistent stable player remains unavailable', async () => {
    findFirst.mockResolvedValue(null);
    await expect(UserProfileContent({ playerId: 1, seasonId: 4 })).rejects.toThrow('404');
});
