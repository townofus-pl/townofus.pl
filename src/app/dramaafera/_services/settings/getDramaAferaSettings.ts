import 'server-only';

import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';

export interface DramaAferaSettings {
  current: string;
  old: string | null;
}

// Next.js sets these phase markers during `next build`. Any other value
// (including `undefined`) means we're running per-request — a null D1 client
// then indicates a real deploy/binding failure that we must surface.
const BUILD_PHASES = new Set([
  'phase-production-build',
  'phase-export',
]);

export async function getDramaAferaSettingsPair() {
  const prisma = await getDatabaseClient();
  if (!prisma) {
    if (BUILD_PHASES.has(process.env.NEXT_PHASE ?? '')) {
      // Expected during build: D1 bindings aren't available at SSG time.
      return { current: null, old: null };
    }
    // Runtime with no Cloudflare context — points at a misconfigured deploy
    // (missing DB binding). Fail loudly so the operator can fix it.
    throw new Error(
      'getDramaAferaSettings: Cloudflare context unavailable at runtime — DB binding missing?',
    );
  }

  const [currentRecord, oldRecord] = await Promise.all([
    prisma.dramaAferaSettings.findFirst({
      where: { versionType: 'current', ...withoutDeleted },
      select: { content: true, uploadedAt: true },
    }),
    prisma.dramaAferaSettings.findFirst({
      where: { versionType: 'old', ...withoutDeleted },
      select: { content: true, uploadedAt: true },
    }),
  ]);

  return { current: currentRecord, old: oldRecord };
}

export async function getDramaAferaSettings(): Promise<DramaAferaSettings> {
  const { current, old } = await getDramaAferaSettingsPair();
  return { current: current?.content ?? '', old: old?.content ?? null };
}
