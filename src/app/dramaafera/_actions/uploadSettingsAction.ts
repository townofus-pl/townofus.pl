'use server';

import {
  rotateDramaAferaSettings,
  replaceDramaAferaSettings,
} from '@/app/dramaafera/_services/settings';

export interface UploadSettingsActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — matches API utils.ts

export async function uploadSettingsAction(
  formData: FormData,
  mode: 'normal' | 'advanced' = 'normal',
  targetVersion?: 'current' | 'old',
): Promise<UploadSettingsActionResult> {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'Brak pliku do wgrania' };
    }

    if (!file.name.endsWith('.txt')) {
      return { success: false, error: 'Plik musi być w formacie .txt' };
    }

    if (file.size === 0) {
      return { success: false, error: 'Plik nie może być pusty' };
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { success: false, error: 'Plik nie może być większy niż 5MB' };
    }

    const content = await file.text();
    if (!content.trim()) {
      return { success: false, error: 'Plik jest pusty' };
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
