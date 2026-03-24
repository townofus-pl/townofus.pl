'use client';

import { useParams } from 'next/navigation';
import { CURRENT_SEASON, getSeasonById } from '../_constants/seasons';

export function useSeason(): number {
  const params = useParams();
  const seasonId = params.seasonId;
  if (seasonId && typeof seasonId === 'string') {
    const parsed = parseInt(seasonId, 10);
    if (!isNaN(parsed) && getSeasonById(parsed)) return parsed;
  }
  return CURRENT_SEASON;
}
