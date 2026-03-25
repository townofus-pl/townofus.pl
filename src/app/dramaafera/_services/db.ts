import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

export async function getDatabaseClient() {
  try {
    const { env } = await getCloudflareContext();
    return getPrismaClient(env.DB);
  } catch (_error) {
    // During build time, Cloudflare context is not available
    return null;
  }
}

// Helper to build the game where clause filtered by season
export function buildSeasonGameWhere(seasonId?: number) {
  return {
    ...withoutDeleted,
    season: seasonId ?? CURRENT_SEASON,
  };
}
