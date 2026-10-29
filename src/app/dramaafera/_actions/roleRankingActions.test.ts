import { getRoleRankingsByDateRange, getRoleRankingsByAppearanceCount } from './roleRankingActions';
import { generateRoleRankingSummary } from '@/app/dramaafera/_services';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

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


test('host date changes and reset retain all-day DAP', async () => {
    await getRoleRankingsByDateRange(CURRENT_SEASON, '2026-10-25', '2026-10-25', false);
    expect(generate).toHaveBeenLastCalledWith(CURRENT_SEASON, new Date('2026-10-25T00:00:00Z'), new Date('2026-10-25T23:59:59.999Z'), { excludeLatestDay: false });
    await getRoleRankingsByDateRange(CURRENT_SEASON, undefined, undefined, false);
    expect(generate).toHaveBeenLastCalledWith(CURRENT_SEASON, undefined, undefined, { excludeLatestDay: false });
});


test('appearance count has no date bounds and retains host/public eligibility', async () => {
    await getRoleRankingsByAppearanceCount(CURRENT_SEASON, 10);
    expect(generate).toHaveBeenLastCalledWith(CURRENT_SEASON, undefined, undefined, { excludeLatestDay: true, lastGamesPerRole: 10 });
    await getRoleRankingsByAppearanceCount(CURRENT_SEASON, 3, false);
    expect(generate).toHaveBeenLastCalledWith(CURRENT_SEASON, undefined, undefined, { excludeLatestDay: false, lastGamesPerRole: 3 });
});

test.each([0, -1, 1.5, NaN, Infinity, 10001])('rejects invalid appearance count %s', async count => {
    await expect(getRoleRankingsByAppearanceCount(CURRENT_SEASON, count)).rejects.toThrow();
    expect(generate).not.toHaveBeenCalled();
});

test('appearance mode rejects unknown seasons', async () => {
    await expect(getRoleRankingsByAppearanceCount(999, 10)).rejects.toThrow();
    expect(generate).not.toHaveBeenCalled();
});
