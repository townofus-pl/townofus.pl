import { getPrismaClient } from '@/app/api/_database';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { PrismaClient } from '@prisma/client';

const withoutDeleted = { deletedAt: null };

export async function getDramaAferaSettings(prisma?: PrismaClient): Promise<{
  current: string;
  old: string | null;
}> {
  // If no prisma client provided, create one (for API routes)
  let client = prisma;
  if (!client) {
    const { env } = await getCloudflareContext();
    client = getPrismaClient(env.DB);
  }

  const [currentRecord, oldRecord] = await Promise.all([
    client.dramaAferaSettings.findFirst({
      where: { versionType: 'current', ...withoutDeleted }
    }),
    client.dramaAferaSettings.findFirst({
      where: { versionType: 'old', ...withoutDeleted }
    })
  ]);

  return {
    current: currentRecord?.content || '',
    old: oldRecord?.content || null
  };
}
