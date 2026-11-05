import { CURRENT_SEASON, SEASONS } from '@/app/dramaafera/_constants/seasons';
import { SeasonsResponseSchema } from '../_lib/schemas';
import { publicGet, preflight } from '../_lib/http';

export const OPTIONS = preflight;

// Nawigacja sezonów, ta sama lista co przełącznik sezonu na stronie (sezon 2 i późniejsze).
export const GET = publicGet(SeasonsResponseSchema, async () => ({
  seasons: SEASONS.map((season, index) => ({
    id: season.id,
    current: season.id === CURRENT_SEASON,
    startDate: season.startDate,
    endDate: SEASONS[index + 1]?.startDate ?? null,
  })),
}));
