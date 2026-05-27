/**
 * Single source of truth for the DramaAfera settings upload limit.
 * Imported by client (SettingsTab), server action (uploadSettingsAction),
 * and the public API POST handler — keep them in sync via this export.
 */
export const MAX_SETTINGS_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const validateSettingsFile = (file: File): string | null => {
  if (!file.name.endsWith('.txt')) {
    return 'Plik musi mieć rozszerzenie .txt';
  }

  if (file.size === 0) {
    return 'Plik nie może być pusty';
  }

  if (file.size > MAX_SETTINGS_FILE_SIZE_BYTES) {
    return 'Plik nie może być większy niż 5MB';
  }

  return null;
};

/**
 * Reject content that isn't a plain UTF-8 text file. `file.text()` silently
 * replaces invalid bytes with U+FFFD, so a binary file renamed `.txt` would
 * otherwise be stored as a stream of replacement characters. Also reject NUL
 * bytes — settings files are line-based and a NUL is a strong signal of
 * non-text content.
 */
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd);
const NUL_CHAR = String.fromCharCode(0);

export const validateSettingsContent = (content: string): string | null => {
  if (!content.trim()) {
    return 'Plik jest pusty';
  }
  if (content.includes(REPLACEMENT_CHAR)) {
    return 'Plik nie jest poprawnym tekstem UTF-8';
  }
  if (content.includes(NUL_CHAR)) {
    return 'Plik zawiera niedozwolone znaki binarne';
  }
  return null;
};
