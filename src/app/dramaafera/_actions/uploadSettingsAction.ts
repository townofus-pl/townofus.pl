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

    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'Brak pliku do wgrania' };
    }

    const fileError = validateSettingsFile(file);
    if (fileError) {
      return { success: false, error: fileError };
    }

    const content = await file.text();
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
          ? `Wersja ${targetVersion} zmieniona pomyślnie`
          : 'Ustawienia wgrane pomyślnie',
    };
  } catch (error) {
    console.error('Error in uploadSettingsAction:', error);
    return { success: false, error: 'Błąd serwera podczas wgrywania ustawień' };
  }
}
