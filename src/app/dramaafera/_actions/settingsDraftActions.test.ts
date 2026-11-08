import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { getSettingsDraft, saveSettingsDraft } from '../_services/settings/settingsDraft';
import { getSettingsDraftAction, saveSettingsDraftAction } from './settingsDraftActions';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('@/app/api/_middlewares/auth', () => ({ authenticateHeaders: jest.fn() }));
jest.mock('../_services/settings/settingsDraft', () => ({ getSettingsDraft: jest.fn(), saveSettingsDraft: jest.fn() }));
beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(headers).mockResolvedValue(new Headers() as Awaited<ReturnType<typeof headers>>);
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: true, user: { username: 'host' } });
});

it('requires host authentication for reads and writes', async () => {
    jest.mocked(authenticateHeaders).mockResolvedValue({ success: false });
    expect(await getSettingsDraftAction()).toEqual({ success: false, error: 'Brak autoryzacji.' });
    expect(await saveSettingsDraftAction('content', 'draft:1:0')).toEqual({ success: false, error: 'Brak autoryzacji.' });
    expect(getSettingsDraft).not.toHaveBeenCalled();
    expect(saveSettingsDraft).not.toHaveBeenCalled();
});

it('passes the version token through and preserves conflict messages', async () => {
    const data = { content: 'cfg', token: 'draft:1:2', exists: true };
    jest.mocked(getSettingsDraft).mockResolvedValue(data);
    expect(await getSettingsDraftAction()).toEqual({ success: true, data });
    jest.mocked(saveSettingsDraft).mockResolvedValue(data);
    expect(await saveSettingsDraftAction('cfg', 'draft:1:1')).toEqual({ success: true, data });
    expect(saveSettingsDraft).toHaveBeenCalledWith('cfg', 'draft:1:1');
    jest.mocked(saveSettingsDraft).mockRejectedValue(new Error('Draft lub aktualne ustawienia zmieniły się w innym miejscu.'));
    expect(await saveSettingsDraftAction('cfg', 'draft:1:1')).toMatchObject({ success: false, error: 'Draft lub aktualne ustawienia zmieniły się w innym miejscu.' });
});

it('rejects invalid version tokens before persistence', async () => {
    expect(await saveSettingsDraftAction('cfg', 'invalid')).toMatchObject({ success: false });
    expect(saveSettingsDraft).not.toHaveBeenCalled();
});
