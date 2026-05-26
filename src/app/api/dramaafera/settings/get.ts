import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';
import { getDramaAferaSettings } from '@/app/dramaafera/_services/settings';

export async function GET(_request: NextRequest) {
  try {
    const settings = await getDramaAferaSettings();
    return createSuccessResponse(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return createErrorResponse('Nie udało się pobrać ustawień', 500);
  }
}
