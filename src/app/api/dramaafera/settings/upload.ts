import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';
import { validateSettingsFile } from './utils';
import {
  rotateDramaAferaSettings,
  replaceDramaAferaSettings,
} from '@/app/dramaafera/_services/settings';

export async function POST(req: NextRequest) {
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

    const content = await file.text();

    const mode = req.nextUrl.searchParams.get('mode') ?? 'normal';
    const targetVersionParam = req.nextUrl.searchParams.get('targetVersion');

    if (mode === 'advanced') {
      if (targetVersionParam !== 'current' && targetVersionParam !== 'old') {
        return createErrorResponse('Nieprawidłowy targetVersion', 400);
      }
      await replaceDramaAferaSettings(content, targetVersionParam);
      return createSuccessResponse({
        message: `Plik ${targetVersionParam === 'current' ? 'aktualnego' : 'starego'} wariantu zaktualizowany.`,
      });
    }

    if (mode === 'normal') {
      await rotateDramaAferaSettings(content);
      return createSuccessResponse({
        message: 'Plik wgrany! Aktualna wersja zaktualizowana.',
      });
    }

    return createErrorResponse('Nieprawidłowy mode', 400);
  } catch (error) {
    console.error('Error uploading settings:', error);
    return createErrorResponse('Błąd podczas wgrywania pliku', 500);
  }
}
