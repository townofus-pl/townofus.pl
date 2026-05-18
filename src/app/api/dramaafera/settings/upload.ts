import { NextRequest } from 'next/server';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { getPrismaClient } from '@/app/api/_database';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';
import { validateSettingsFile, readFileContent } from './utils';

async function uploadHandler(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return createErrorResponse('Brak pliku w żądaniu', 400);
    }

    const validationError = validateSettingsFile(file);
    if (validationError) {
      return createErrorResponse(validationError, 400);
    }

    const content = await readFileContent(file);
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    const mode = req.nextUrl.searchParams.get('mode') || 'normal';
    const targetVersion = req.nextUrl.searchParams.get('targetVersion') as 'current' | 'old' | null;

    if (mode === 'normal') {
      // Rotacja: current -> old, new -> current
      // Soft-delete poprzedni old
      const oldRecord = await prisma.dramaAferaSettings.findFirst({
        where: {
          versionType: 'old',
          deletedAt: null,
        },
      });

      if (oldRecord) {
        await prisma.dramaAferaSettings.update({
          where: { id: oldRecord.id },
          data: { deletedAt: new Date() },
        });
      }

      // Update current -> old
      const currentRecord = await prisma.dramaAferaSettings.findFirst({
        where: {
          versionType: 'current',
          deletedAt: null,
        },
      });

      if (currentRecord) {
        await prisma.dramaAferaSettings.update({
          where: { id: currentRecord.id },
          data: { versionType: 'old' },
        });
      }

      // Create new current
      const newCurrent = await prisma.dramaAferaSettings.create({
        data: {
          versionType: 'current',
          content,
          uploadedBy: 'host', // TODO: pobierz z auth
        },
      });

      const newOld = currentRecord
        ? await prisma.dramaAferaSettings.findUnique({
            where: { id: currentRecord.id },
          })
        : null;

      return createSuccessResponse({
        message: 'Plik wgrany! Aktualna wersja zaktualizowana.',
        data: {
          current: {
            id: newCurrent.id,
            versionType: 'current' as const,
            uploadedAt: newCurrent.uploadedAt.toISOString(),
            uploadedBy: newCurrent.uploadedBy,
          },
          old: newOld
            ? {
                id: newOld.id,
                versionType: 'old' as const,
                uploadedAt: newOld.uploadedAt.toISOString(),
                uploadedBy: newOld.uploadedBy,
              }
            : null,
        },
      });
    } else if (mode === 'advanced' && targetVersion) {
      // Soft-delete obecny wariant
      const existingRecord = await prisma.dramaAferaSettings.findFirst({
        where: {
          versionType: targetVersion,
          deletedAt: null,
        },
      });

      if (existingRecord) {
        await prisma.dramaAferaSettings.update({
          where: { id: existingRecord.id },
          data: { deletedAt: new Date() },
        });
      }

      // Create new wariant
      const newRecord = await prisma.dramaAferaSettings.create({
        data: {
          versionType: targetVersion,
          content,
          uploadedBy: 'host', // TODO: pobierz z auth
        },
      });

      const otherRecord = await prisma.dramaAferaSettings.findFirst({
        where: {
          versionType: targetVersion === 'current' ? 'old' : 'current',
          deletedAt: null,
        },
      });

      return createSuccessResponse({
        message: `Plik ${targetVersion === 'current' ? 'aktualnego' : 'starego'} wariantu zaktualizowany.`,
        data: {
          current: targetVersion === 'current' ? {
            id: newRecord.id,
            versionType: 'current' as const,
            uploadedAt: newRecord.uploadedAt.toISOString(),
            uploadedBy: newRecord.uploadedBy,
          } : otherRecord ? {
            id: otherRecord.id,
            versionType: 'current' as const,
            uploadedAt: otherRecord.uploadedAt.toISOString(),
            uploadedBy: otherRecord.uploadedBy,
          } : null,
          old: targetVersion === 'old' ? {
            id: newRecord.id,
            versionType: 'old' as const,
            uploadedAt: newRecord.uploadedAt.toISOString(),
            uploadedBy: newRecord.uploadedBy,
          } : otherRecord ? {
            id: otherRecord.id,
            versionType: 'old' as const,
            uploadedAt: otherRecord.uploadedAt.toISOString(),
            uploadedBy: otherRecord.uploadedBy,
          } : null,
        },
      });
    } else {
      return createErrorResponse('Nieprawidłowy mode lub targetVersion', 400);
    }
  } catch (error) {
    console.error('Error uploading settings:', error);
    return createErrorResponse('Błąd podczas wgrywania pliku', 500);
  }
}

export const POST = withCors(withAuth(uploadHandler));
