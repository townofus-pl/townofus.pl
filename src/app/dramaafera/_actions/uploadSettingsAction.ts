'use server';

import { headers } from 'next/headers';
import { authenticateHeaders } from '@/app/api/_middlewares/auth';
import {
  validateSettingsFile,
  validateSettingsContent,
} from '@/app/api/dramaafera/settings/utils';
import {
  rotateDramaAferaSettings,
  replaceDramaAferaSettings,
  getSettingsDraft,
} from '@/app/dramaafera/_services/settings';

export interface UploadSettingsActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function uploadSettingsAction(
  formData: FormData,
  mode: 'normal' | 'advanced' = 'normal',
  targetVersion?: 'current' | 'old',
  source: 'file' | 'draft' = 'file',
): Promise<UploadSettingsActionResult> {
  try {
    // Defense-in-depth: `src/middleware.ts` already gates `/dramaafera/host`
    // with Basic Auth, but server actions are an independent code path. A
    // future matcher edit that exempted host subpaths must not silently open
    // this write surface — re-check the Authorization header in the action.
    const auth = await authenticateHeaders(await headers());
    if (!auth.success) {
      return { success: false, error: 'Brak autoryzacji' };
    }

    if ((mode !== 'normal' && mode !== 'advanced') || (source !== 'file' && source !== 'draft')) {
      return { success: false, error: 'Nieprawidłowy tryb wgrywania' };
    }
    if (mode === 'advanced' && targetVersion !== 'current' && targetVersion !== 'old') {
      return { success: false, error: 'Brak wybranej wersji do zamiany' };
    }

    let content: string;
    if (source === 'draft') {
      const draft = await getSettingsDraft();
      if (!draft.exists) {
        return { success: false, error: 'Brak zapisanego draftu. Zmień i zapisz ustawienia w kreatorze.' };
      }
      content = draft.content;
    } else {
      const file = formData.get('file');
      if (!file || typeof file === 'string') {
        return { success: false, error: 'Brak pliku do wgrania' };
      }
      const fileError = validateSettingsFile(file);
      if (fileError) return { success: false, error: fileError };
      content = await file.text();
    }
    const contentError = validateSettingsContent(content);
    if (contentError) {
      return { success: false, error: contentError };
    }

    if (mode === 'advanced') {
      if (!targetVersion) {
        return { success: false, error: 'Brak wybranej wersji do zamiany' };
      }
      await replaceDramaAferaSettings(content, targetVersion);
    } else {
      await rotateDramaAferaSettings(content);
    }

    // No `revalidatePath` here: the project's `open-next.config.ts` uses default
    // (dummy) tag cache, so on-demand revalidation is a no-op until cache bindings
    // are configured. Pages reading settings (changelog, role detail) are
    // `force-dynamic` and re-render per request.

    return {
      success: true,
      message:
        mode === 'advanced'
          ? source === 'draft'
            ? `Draft wgrany do ${targetVersion === 'current' ? 'aktualnych' : 'starych'} ustawień bez rotacji`
            : `Wersja ${targetVersion} zmieniona pomyślnie`
          : source === 'draft' ? 'Draft wgrany jako aktualne ustawienia' : 'Ustawienia wgrane pomyślnie',
    };
  } catch (error) {
    console.error('Error in uploadSettingsAction:', error);
    return { success: false, error: 'Błąd serwera podczas wgrywania ustawień' };
  }
}

export async function uploadDraftSettingsAction(
  mode: 'normal' | 'advanced' = 'normal',
  targetVersion?: 'current' | 'old',
): Promise<UploadSettingsActionResult> {
  return uploadSettingsAction(new FormData(), mode, targetVersion, 'draft');
}
