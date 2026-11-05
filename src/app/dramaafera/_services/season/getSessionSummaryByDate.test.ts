import { getSessionSummaryByDate } from './getSessionSummaryByDate';
import { getGameData } from '../games/getGameData';
import { getLatestGameDay } from '../games/getLatestGameDay';
import { getGamesListByDate } from '../games/getGamesList';

jest.mock('../games/getGameData', () => ({ getGameData: jest.fn().mockResolvedValue(null) }));
jest.mock('../games/getLatestGameDay', () => ({ getLatestGameDay: jest.fn().mockResolvedValue({ date: '2026-10-21', gameIds: [1] }) }));
jest.mock('../games/getGamesList', () => ({
    getGamesListByDate: jest.fn(),
}));

test('a session with 12 games reads the latest day once and passes it to every game', async () => {
    jest.mocked(getGamesListByDate).mockResolvedValue(Array.from({ length: 12 }, (_, i) => ({ id: `20261021_${1000 + i}` })) as never);
    await getSessionSummaryByDate('20261021', 4);
    expect(getLatestGameDay).toHaveBeenCalledTimes(1);
    expect(getGameData).toHaveBeenCalledTimes(12);
    for (const call of jest.mocked(getGameData).mock.calls) {
        expect(call[1]).toEqual({ latestDay: { date: '2026-10-21', gameIds: [1] } });
    }
});
