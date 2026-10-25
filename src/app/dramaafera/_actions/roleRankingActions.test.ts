import { getRoleRankingsByDateRange } from './roleRankingActions';
import { generateRoleRankingStats } from '@/app/dramaafera/_services';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

jest.mock('@/app/dramaafera/_services', () => ({ generateRoleRankingStats: jest.fn().mockResolvedValue([]) }));
const generate = jest.mocked(generateRoleRankingStats);

beforeEach(() => jest.clearAllMocks());

test('passes the full selected day in UTC to the season-scoped query', async () => {
    await getRoleRankingsByDateRange(CURRENT_SEASON, '2026-10-25', '2026-10-25');
    expect(generate).toHaveBeenCalledWith(CURRENT_SEASON, new Date('2026-10-25T00:00:00Z'), new Date('2026-10-25T23:59:59.999Z'));
});

test('reset keeps the season and removes both date bounds', async () => {
    await getRoleRankingsByDateRange(CURRENT_SEASON);
    expect(generate).toHaveBeenCalledWith(CURRENT_SEASON, undefined, undefined);
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
