import { NextRequest } from 'next/server';
import { getPrismaClient } from '@/app/api/_database';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';

export async function GET(_req: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Pobierz aktualną i starą wersję (tylko nie soft-deleted)
    const [currentRecord, oldRecord] = await Promise.all([
      prisma.dramaAferaSettings.findFirst({
        where: {
          versionType: 'current',
          deletedAt: null,
        },
      }),
      prisma.dramaAferaSettings.findFirst({
        where: {
          versionType: 'old',
          deletedAt: null,
        },
      }),
    ]);

    return createSuccessResponse({
      current: currentRecord?.content || '',
      old: oldRecord?.content || null,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return createErrorResponse('Nie udało się pobrać ustawień', 500);
  }
}
