import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { getRoleBalanceOverview, initializeRoleBalanceCycles, saveRoleBalanceReview } from '@/app/dramaafera/_services/rankings/roleBalanceReviews';
import { getRoleBalanceOverviewAction, initializeRoleBalanceAction, saveRoleBalanceReviewAction } from './roleBalanceReviewActions';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('@/app/api/_middlewares/auth', () => ({ authenticateHeaders: jest.fn() }));
jest.mock('@/app/dramaafera/_services/rankings/roleBalanceReviews', () => ({ getRoleBalanceOverview: jest.fn(), initializeRoleBalanceCycles: jest.fn(), saveRoleBalanceReview: jest.fn() }));
const input = { season: CURRENT_SEASON, roleName: 'Sheriff', revision: 0, throughGameId: 13, decision: 'unchanged' as const, note: '', sampleToken: 'a'.repeat(64), confirmed: true };
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(headers).mockResolvedValue(new Headers() as Awaited<ReturnType<typeof headers>>);
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: true, user: { username: 'host' } });
});
test('every review read and write requires host authentication', async () => {
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: false });
    await expect(getRoleBalanceOverviewAction(CURRENT_SEASON)).rejects.toThrow('autoryzacji');
    await expect(initializeRoleBalanceAction(CURRENT_SEASON, 1)).resolves.toMatchObject({ success: false, error: 'Brak autoryzacji.' });
    await expect(saveRoleBalanceReviewAction(input)).resolves.toMatchObject({ success: false, error: 'Brak autoryzacji.' });
    expect(getRoleBalanceOverview).not.toHaveBeenCalled(); expect(initializeRoleBalanceCycles).not.toHaveBeenCalled(); expect(saveRoleBalanceReview).not.toHaveBeenCalled();
});
test('decision author comes from authentication and confirmation is mandatory', async () => {
    await saveRoleBalanceReviewAction(input);
    expect(saveRoleBalanceReview).toHaveBeenCalledWith(input, 'host');
    jest.mocked(saveRoleBalanceReview).mockClear();
    await expect(saveRoleBalanceReviewAction({ ...input, confirmed: false })).resolves.toMatchObject({ success: false });
    expect(saveRoleBalanceReview).not.toHaveBeenCalled();
});
test('invalid season, game and decision never reach persistence', async () => {
    await expect(getRoleBalanceOverviewAction(999)).rejects.toThrow('sezon');
    await expect(initializeRoleBalanceAction(CURRENT_SEASON, -1)).resolves.toMatchObject({ success: false });
    await expect(saveRoleBalanceReviewAction({ ...input, revision: -1 })).resolves.toMatchObject({ success: false });
    expect(saveRoleBalanceReview).not.toHaveBeenCalled();
});

test('stale decisions retain a Polish error message in production responses', async () => {
    jest.mocked(saveRoleBalanceReview).mockRejectedValueOnce(new Error('Dane przeglądu zmieniły się. Odśwież i sprawdź ocenę ponownie.'));
    await expect(saveRoleBalanceReviewAction(input)).resolves.toMatchObject({ success: false, error: 'Dane przeglądu zmieniły się. Odśwież i sprawdź ocenę ponownie.' });
});
