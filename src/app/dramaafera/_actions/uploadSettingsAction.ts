'use server';

import { getPrismaClient } from '@/app/api/_database';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface UploadSettingsActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function uploadSettingsAction(formData: FormData, mode: 'normal' | 'advanced' = 'normal', targetVersion?: 'current' | 'old'): Promise<UploadSettingsActionResult> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'Brak pliku do wgrania' };
    }

    // Validate file extension
    if (!file.name.endsWith('.txt')) {
      return { success: false, error: 'Plik musi być w formacie .txt' };
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      return { success: false, error: 'Plik jest za duży (max 1MB)' };
    }

    // Read file content
    const content = await file.text();
    if (!content.trim()) {
      return { success: false, error: 'Plik jest pusty' };
    }

    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    if (mode === 'normal') {
      // Normal mode: new → current, current → old, old → soft-delete
      const withoutDeleted = { deletedAt: null };

      // Soft-delete old version
      const oldRecord = await prisma.dramaAferaSettings.findFirst({
        where: { versionType: 'old', ...withoutDeleted }
      });
      if (oldRecord) {
        await prisma.dramaAferaSettings.update({
          where: { id: oldRecord.id },
          data: { deletedAt: new Date() }
        });
      }

      // Move current to old
      const currentRecord = await prisma.dramaAferaSettings.findFirst({
        where: { versionType: 'current', ...withoutDeleted }
      });
      if (currentRecord) {
        await prisma.dramaAferaSettings.update({
          where: { id: currentRecord.id },
          data: { versionType: 'old' }
        });
      }

      // Create new current
      await prisma.dramaAferaSettings.create({
        data: {
          versionType: 'current',
          content,
          uploadedAt: new Date()
        }
      });

      return { success: true, message: 'Ustawienia wgrane pomyślnie' };
    } else if (mode === 'advanced') {
      // Advanced mode: replace specific version
      if (!targetVersion) {
        return { success: false, error: 'Brak wybranej wersji do zamiany' };
      }

      const withoutDeleted = { deletedAt: null };
      const existing = await prisma.dramaAferaSettings.findFirst({
        where: { versionType: targetVersion, ...withoutDeleted }
      });

      if (existing) {
        await prisma.dramaAferaSettings.update({
          where: { id: existing.id },
          data: {
            content,
            uploadedAt: new Date()
          }
        });
      } else {
        await prisma.dramaAferaSettings.create({
          data: {
            versionType: targetVersion,
            content,
            uploadedAt: new Date()
          }
        });
      }

      return { success: true, message: `Wersja ${targetVersion} zmieniona pomyślnie` };
    }

    return { success: false, error: 'Nieznany tryb wgrywania' };
  } catch (error) {
    console.error('Error in uploadSettingsAction:', error);
    return { success: false, error: 'Błąd serwera podczas wgrywania ustawień' };
  }
}
