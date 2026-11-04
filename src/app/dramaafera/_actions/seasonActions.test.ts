import { getHostInfoAction, getSessionResults } from './seasonActions';
import { requireHostAuth } from './_requireHostAuth';
import { getHostInfo, getPublicSessionSummaryByDate } from '@/app/dramaafera/_services';

jest.mock('./_requireHostAuth', () => ({ requireHostAuth: jest.fn() }));
jest.mock('@/app/dramaafera/_services', () => ({
    getHostInfo: jest.fn().mockResolvedValue({ players: [] }),
    getPublicSessionSummaryByDate: jest.fn().mockResolvedValue({ players: [] }),
    getRanking: jest.fn(), getLatestEmperorId: jest.fn(), getGameDatesLightweight: jest.fn(), getSeasonRankingHistories: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

test('host info needs a login', async () => {
    jest.mocked(requireHostAuth).mockRejectedValueOnce(new Error('Brak autoryzacji'));
    await expect(getHostInfoAction('20261021', 4)).rejects.toThrow('Brak autoryzacji');
    expect(getHostInfo).not.toHaveBeenCalled();
});

test('host info is returned after a login', async () => {
    await getHostInfoAction('20261021', 4);
    expect(getHostInfo).toHaveBeenCalledWith('20261021', 4);
});

test('session results come from the public service and need no login', async () => {
    await getSessionResults('20261021', 4);
    expect(getPublicSessionSummaryByDate).toHaveBeenCalledWith('20261021', 4);
    expect(requireHostAuth).not.toHaveBeenCalled();
});
