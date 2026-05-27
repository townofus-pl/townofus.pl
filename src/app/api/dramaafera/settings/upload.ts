import { NextRequest } from 'next/server';
import { createMessageResponse, createErrorResponse } from '@/app/api/_utils';
import { validateSettingsFile, validateSettingsContent } from './utils';
import { UploadDramaAferaSettingsQuerySchema } from './schema';
import {
  rotateDramaAferaSettings,
  replaceDramaAferaSettings,
} from '@/app/dramaafera/_services/settings';

export async function POST(req: NextRequest) {
  try {
    const queryParse = UploadDramaAferaSettingsQuerySchema.safeParse({
      mode: req.nextUrl.searchParams.get('mode') ?? undefined,
      targetVersion: req.nextUrl.searchParams.get('targetVersion') ?? undefined,
    });
    if (!queryParse.success) {
      return createErrorResponse(
        'Nieprawidłowe parametry: ' + queryParse.error.issues.map((i) => i.message).join(', '),
        400,
      );
    }
    const { mode, targetVersion } = queryParse.data;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return createErrorResponse('Brak pliku w żądaniu', 400);
    }

    const fileError = validateSettingsFile(file);
    if (fileError) {
      return createErrorResponse(fileError, 400);
    }

    const content = await file.text();
    const contentError = validateSettingsContent(content);
    if (contentError) {
      return createErrorResponse(contentError, 400);
    }

    if (mode === 'advanced') {
      // `targetVersion` is guaranteed by the Zod refine when mode === 'advanced'.
      await replaceDramaAferaSettings(content, targetVersion!);
      return createMessageResponse(
        `Plik ${targetVersion === 'current' ? 'aktualnego' : 'starego'} wariantu zaktualizowany.`,
      );
    }

    await rotateDramaAferaSettings(content);
    return createMessageResponse('Plik wgrany! Aktualna wersja zaktualizowana.');
  } catch (error) {
    console.error('Error uploading settings:', error);
    return createErrorResponse('Błąd podczas wgrywania pliku', 500);
  }
}
