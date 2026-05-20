export const validateSettingsFile = (file: File): string | null => {
  if (!file.name.endsWith('.txt')) {
    return 'Plik musi mieć rozszerzenie .txt';
  }
  
  if (file.size === 0) {
    return 'Plik nie może być pusty';
  }

  if (file.size > 5 * 1024 * 1024) {
    return 'Plik nie może być większy niż 5MB';
  }

  return null;
};

export const readFileContent = async (file: File): Promise<string> => {
  return file.text();
};
