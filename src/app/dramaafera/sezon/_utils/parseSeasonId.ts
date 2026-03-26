import { notFound } from 'next/navigation';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';

/**
 * Parse seasonId from URL params, validate it exists in the SEASONS array,
 * and call notFound() if invalid. Returns the validated numeric seasonId.
 *
 * Usage in season route pages:
 *   const seasonId = parseAndValidateSeasonId(seasonIdStr);
 */
export function parseAndValidateSeasonId(seasonIdStr: string): number {
    const seasonId = parseInt(seasonIdStr, 10);
    if (isNaN(seasonId) || !getSeasonById(seasonId)) {
        notFound();
    }
    return seasonId;
}
