'use server';

import { generateRoleRankingStats } from '@/app/dramaafera/_services';
import type { RoleRankingStats } from '@/app/dramaafera/_services';

export async function getRoleRankingsByDateRange(
  seasonId: number,
  dateFromStr?: string,
  dateToStr?: string
): Promise<RoleRankingStats[]> {
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;

  if (dateFromStr) {
    dateFrom = new Date(dateFromStr);
  }

  if (dateToStr) {
    dateTo = new Date(dateToStr);
  }

  return generateRoleRankingStats(seasonId, dateFrom, dateTo);
}
