import { getRoleRankingsByDateRange, getHostRoleRankingsByDateRange } from './roleRankingActions';
import { requireHostAuth } from './_requireHostAuth';
import { generateRoleRankingSummary } from '@/app/dramaafera/_services';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

jest.mock('./_requireHostAuth', () => ({ requireHostAuth: jest.fn().mockResolvedValue(undefined) }));
jest.mock('@/app/dramaafera/_services', () => ({ generateRoleRankingSummary: jest.fn().mockResolvedValue([]) }));
const generate = jest.mocked(generateRoleRankingSummary);

beforeEach(() => jest.clearAllMocks());

test('passes the full selected day in UTC to the season-scoped query', async () => {
    await getRoleRankingsByDateRange(CURRENT_SEASON, '2026-10-25', '2026-10-25');
    expect(generate).toHaveBeenCalledWith(CURRENT_SEASON, new Date('2026-10-25T00:00:00Z'), new Date('2026-10-25T23:59:59.999Z'), { excludeLatestDay: true });
});

test('reset keeps the season and removes both date bounds', async () => {
    await getRoleRankingsByDateRange(CURRENT_SEASON);
    expect(generate).toHaveBeenCalledWith(CURRENT_SEASON, undefined, undefined, { excludeLatestDay: true });
});

test.each([
    ['2026-10-26', '2026-10-25'],
    ['2026-02-30', undefined],
    [undefined, 'invalid'],
])('rejects invalid date ranges before querying (%s, %s)', async (from, to) => {
    await expect(getRoleRankingsByDateRange(CURRENT_SEASON, from, to)).rejects.toThrow();
    expect(generate).not.toHaveBeenCalled();
});

test('rejects an unknown season before querying', async () => {
    await expect(getRoleRankingsByDateRange(999)).rejects.toThrow();
    expect(generate).not.toHaveBeenCalled();
});


test('the public action has no way to include the latest day', async () => {
    await (getRoleRankingsByDateRange as (...args: unknown[]) => Promise<unknown>)(CURRENT_SEASON, undefined, undefined, false);
    expect(generate).toHaveBeenLastCalledWith(CURRENT_SEASON, undefined, undefined, { excludeLatestDay: true });
    expect(requireHostAuth).not.toHaveBeenCalled();
});

test('host date changes and reset retain all-day DAP', async () => {
    await getHostRoleRankingsByDateRange(CURRENT_SEASON, '2026-10-25', '2026-10-25');
    expect(generate).toHaveBeenLastCalledWith(CURRENT_SEASON, new Date('2026-10-25T00:00:00Z'), new Date('2026-10-25T23:59:59.999Z'), { excludeLatestDay: false });
    await getHostRoleRankingsByDateRange(CURRENT_SEASON);
    expect(generate).toHaveBeenLastCalledWith(CURRENT_SEASON, undefined, undefined, { excludeLatestDay: false });
});

test('the host action refuses a caller without a login', async () => {
    jest.mocked(requireHostAuth).mockRejectedValueOnce(new Error('Brak autoryzacji'));
    await expect(getHostRoleRankingsByDateRange(CURRENT_SEASON)).rejects.toThrow('Brak autoryzacji');
    expect(generate).not.toHaveBeenCalled();
});
