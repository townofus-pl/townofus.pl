import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { CURRENT_SEASON } from '../_constants/seasons';
import { getSettingsDraft, saveSettingsDraft } from '../_services/settings/settingsDraft';
import { getRoleProbabilities } from '../_services/rankings/getRoleProbabilities';
import { applyRoleWeightsToDraftAction } from './applyRoleWeightsToDraftAction';
import { Teams } from '@/constants/teams';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('@/app/api/_middlewares/auth', () => ({ authenticateHeaders: jest.fn() }));
jest.mock('../_services/settings/settingsDraft', () => ({ getSettingsDraft: jest.fn(), saveSettingsDraft: jest.fn() }));
jest.mock('../_services/rankings/getRoleProbabilities', () => ({ getRoleProbabilities: jest.fn() }));
const content = '[Roles]\nNum TownOfUs.Roles.Neutral.JesterRole = 1\nChance TownOfUs.Roles.Neutral.JesterRole = 50\n[Other]\nCooldown = 20\n';
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(headers).mockResolvedValue(new Headers() as Awaited<ReturnType<typeof headers>>);
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: true });
    jest.mocked(getSettingsDraft).mockResolvedValue({ content, exists: true, token: 'draft:1:2' });
    jest.mocked(getRoleProbabilities).mockResolvedValue({ games: 20, unknownWins: 0, factions: [], roles: [
        { name: 'Jester', team: Teams.Neutral, color: '#fff', games: 10, wins: 2, winRate: 0.2, weight: 0.624 },
    ] });
});

it('applies server-calculated weights to the latest draft while preserving other settings', async () => {
    expect(await applyRoleWeightsToDraftAction(CURRENT_SEASON)).toMatchObject({ success: true, updated: 1 });
    expect(getRoleProbabilities).toHaveBeenCalledWith(CURRENT_SEASON);
    expect(saveSettingsDraft).toHaveBeenCalledWith(content.replace('Role = 50', 'Role = 62'), 'draft:1:2');
});

it('can create the draft from the current preset', async () => {
    jest.mocked(getSettingsDraft).mockResolvedValue({ content, exists: false, token: 'current:1:0' });
    expect(await applyRoleWeightsToDraftAction(CURRENT_SEASON)).toMatchObject({ success: true });
    expect(saveSettingsDraft).toHaveBeenCalledWith(expect.any(String), 'current:1:0');
});

it('does not write or advance the revision when weights are already applied', async () => {
    jest.mocked(getSettingsDraft).mockResolvedValue({ content: content.replace('Role = 50', 'Role = 62'), exists: true, token: 'draft:1:2' });
    expect(await applyRoleWeightsToDraftAction(CURRENT_SEASON)).toMatchObject({ success: true, updated: 0 });
    expect(saveSettingsDraft).not.toHaveBeenCalled();
});

it('requires authentication and the current season before touching settings', async () => {
    expect(await applyRoleWeightsToDraftAction(-1)).toMatchObject({ success: false });
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: false });
    expect(await applyRoleWeightsToDraftAction(CURRENT_SEASON)).toMatchObject({ success: false });
    expect(getSettingsDraft).not.toHaveBeenCalled();
    expect(saveSettingsDraft).not.toHaveBeenCalled();
});

it('surfaces concurrency conflicts without retrying over newer edits', async () => {
    jest.mocked(saveSettingsDraft).mockRejectedValueOnce(new Error('Draft lub aktualne ustawienia zmieniły się w innym miejscu.'));
    expect(await applyRoleWeightsToDraftAction(CURRENT_SEASON)).toMatchObject({ success: false, error: 'Draft lub aktualne ustawienia zmieniły się w innym miejscu.' });
    expect(saveSettingsDraft).toHaveBeenCalledTimes(1);
});

it.each([{ games: 19, unknownWins: 0 }, { games: 20, unknownWins: 1 }])(
    'leaves the draft untouched without a complete faction sample (%j)',
    async sample => {
        jest.mocked(getRoleProbabilities).mockResolvedValue({ ...sample, factions: [], roles: [] });
        expect(await applyRoleWeightsToDraftAction(CURRENT_SEASON)).toMatchObject({ success: false });
        expect(getSettingsDraft).not.toHaveBeenCalled();
        expect(saveSettingsDraft).not.toHaveBeenCalled();
    }
);
