import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';

/**
 * Resolves `?season=` for a read endpoint, defaulting to the current season.
 *
 * Every `/api/dramaafera/*` GET used to take its season implicitly from `CURRENT_SEASON` with no
 * way to ask for another, so the day the season flipped every public consumer lost its whole
 * history — `data: []` or a 404 for every date, permanently. These are `withCors`-only public
 * routes, so that included embedded widgets nobody here controls. See #314.
 *
 * Returns `null` for a malformed value so the caller can 400 in its own response shape; an
 * unknown-but-numeric season is left alone, because "that season has no games" is a truthful
 * empty answer and season 1 legitimately exists in the database without being in `SEASONS`.
 */
export function resolveSeasonParam(request: Request): number | null {
    const raw = new URL(request.url).searchParams.get('season');
    if (raw === null) return CURRENT_SEASON;

    const season = Number(raw);
    return Number.isInteger(season) ? season : null;
}
