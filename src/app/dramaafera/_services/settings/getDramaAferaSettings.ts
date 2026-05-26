import 'server-only';

import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';

export interface DramaAferaSettings {
  current: string;
  old: string | null;
}

export async function getDramaAferaSettings(): Promise<DramaAferaSettings> {
  const prisma = await getDatabaseClient();
  if (!prisma) return { current: '', old: null };

  const [currentRecord, oldRecord] = await Promise.all([
    prisma.dramaAferaSettings.findFirst({
      where: { versionType: 'current', ...withoutDeleted },
    }),
    prisma.dramaAferaSettings.findFirst({
      where: { versionType: 'old', ...withoutDeleted },
    }),
  ]);

  return {
    current: currentRecord?.content ?? '',
    old: oldRecord?.content ?? null,
  };
}
