import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import { getSettingsDraft, rotateDramaAferaSettings, replaceDramaAferaSettings } from '../_services/settings';
import { uploadDraftSettingsAction, uploadSettingsAction } from './uploadSettingsAction';

jest.mock('next/headers', () => ({ headers: jest.fn() }));
jest.mock('@/app/api/_middlewares/auth', () => ({ authenticateHeaders: jest.fn() }));
jest.mock('../_services/settings', () => ({
  getSettingsDraft: jest.fn(), rotateDramaAferaSettings: jest.fn(), replaceDramaAferaSettings: jest.fn(),
}));
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(headers).mockResolvedValue(new Headers() as Awaited<ReturnType<typeof headers>>);
  jest.mocked(authenticateHeaders).mockResolvedValue({ success: true });
  jest.mocked(getSettingsDraft).mockResolvedValue({ content: '[Roles]\nChance Sheriff = 50', exists: true, token: 'draft:1:2' });
});

it('publishes the stored draft with normal rotation without needing a file', async () => {
  expect(await uploadDraftSettingsAction()).toMatchObject({ success: true });
  expect(rotateDramaAferaSettings).toHaveBeenCalledWith('[Roles]\nChance Sheriff = 50');
  expect(replaceDramaAferaSettings).not.toHaveBeenCalled();
});

it.each(['current', 'old'] as const)('replaces only the selected %s variant in advanced mode', async version => {
  expect(await uploadDraftSettingsAction('advanced', version)).toMatchObject({ success: true });
  expect(replaceDramaAferaSettings).toHaveBeenCalledWith('[Roles]\nChance Sheriff = 50', version);
  expect(rotateDramaAferaSettings).not.toHaveBeenCalled();
});

it('requires authentication before reading or publishing a draft', async () => {
  jest.mocked(authenticateHeaders).mockResolvedValue({ success: false });
  expect(await uploadDraftSettingsAction()).toMatchObject({ success: false, error: 'Brak autoryzacji' });
  expect(getSettingsDraft).not.toHaveBeenCalled();
  expect(rotateDramaAferaSettings).not.toHaveBeenCalled();
});

it('does not publish the current fallback when there is no saved draft', async () => {
  jest.mocked(getSettingsDraft).mockResolvedValue({ content: 'current', exists: false, token: 'current:1:0' });
  expect(await uploadDraftSettingsAction()).toMatchObject({ success: false });
  expect(rotateDramaAferaSettings).not.toHaveBeenCalled();
  expect(replaceDramaAferaSettings).not.toHaveBeenCalled();
});

it('rejects missing advanced targets before reading the draft', async () => {
  expect(await uploadDraftSettingsAction('advanced')).toMatchObject({ success: false });
  expect(getSettingsDraft).not.toHaveBeenCalled();
});

it('still uploads a selected file independently of the draft', async () => {
  const data = new FormData();
  data.set('file', new File(['file preset'], 'preset.cfg'));
  expect(await uploadSettingsAction(data)).toMatchObject({ success: true });
  expect(rotateDramaAferaSettings).toHaveBeenCalledWith('file preset');
  expect(getSettingsDraft).not.toHaveBeenCalled();
});
