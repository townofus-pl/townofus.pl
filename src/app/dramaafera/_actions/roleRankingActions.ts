'use server';

import { generateRoleRankingSummary } from '@/app/dramaafera/_services';
import type { RoleRankingSummary } from '@/app/dramaafera/_services';
import { z } from 'zod';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';

export async function getRoleRankingsByDateRange(
  seasonId: number,
  dateFromStr?: string,
  dateToStr?: string,
  excludeLatestDay = true
): Promise<RoleRankingSummary[]> {
  if (!getSeasonById(seasonId)) throw new Error('Nieprawidłowy sezon.');
  const dateSchema = z.iso.date();
  if (dateFromStr) dateSchema.parse(dateFromStr);
  if (dateToStr) dateSchema.parse(dateToStr);
  if (dateFromStr && dateToStr && dateFromStr > dateToStr) {
    throw new Error('Nieprawidłowy zakres dat.');
  }
  let dateFrom: Date | undefined;
  let dateTo: Date | undefined;

  if (dateFromStr) {
    dateFrom = new Date(`${dateFromStr}T00:00:00Z`);
  }

  if (dateToStr) {
    dateTo = new Date(`${dateToStr}T23:59:59.999Z`);
  }

  return generateRoleRankingSummary(seasonId, dateFrom, dateTo, { excludeLatestDay: z.boolean().parse(excludeLatestDay) });
}
