import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { CURRENT_SEASON } from '../_constants/seasons';
import { generateRoleRankingSummary } from '../_services/rankings/generateRoleRankingStats';
import { getRoleProbabilities } from '../_services/rankings/getRoleProbabilities';
import { getHostRoleProbabilitiesAction, getHostRoleRankingsAction } from './hostRoleDataActions';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('@/app/api/_middlewares/auth', () => ({ authenticateHeaders: jest.fn() }));
jest.mock('../_services/rankings/generateRoleRankingStats', () => ({ generateRoleRankingSummary: jest.fn() }));
jest.mock('../_services/rankings/getRoleProbabilities', () => ({ getRoleProbabilities: jest.fn() }));
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(headers).mockResolvedValue(new Headers() as Awaited<ReturnType<typeof headers>>);
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: true });
});

it('authenticates before performing expensive D1 reads', async () => {
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: false });
    await expect(getHostRoleRankingsAction(CURRENT_SEASON)).rejects.toThrow('autoryzacji');
    await expect(getHostRoleProbabilitiesAction(CURRENT_SEASON)).rejects.toThrow('autoryzacji');
    expect(generateRoleRankingSummary).not.toHaveBeenCalled();
    expect(getRoleProbabilities).not.toHaveBeenCalled();
});

it('rejects invalid seasons before querying and loads summaries without player breakdowns', async () => {
    await expect(getHostRoleRankingsAction(-1)).rejects.toThrow('sezon');
    await expect(getHostRoleProbabilitiesAction(-1)).rejects.toThrow('sezon');
    expect(generateRoleRankingSummary).not.toHaveBeenCalled();
    expect(getRoleProbabilities).not.toHaveBeenCalled();
    await getHostRoleRankingsAction(CURRENT_SEASON);
    await getHostRoleProbabilitiesAction(CURRENT_SEASON);
    expect(generateRoleRankingSummary).toHaveBeenCalledWith(CURRENT_SEASON, undefined, undefined, { excludeLatestDay: false, includeStrength: true });
    expect(getRoleProbabilities).toHaveBeenCalledWith(CURRENT_SEASON);
});
