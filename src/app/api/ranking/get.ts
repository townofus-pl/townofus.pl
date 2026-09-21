import { NextRequest } from 'next/server';
import { getRanking } from '@/app/dramaafera/_services';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { createSuccessResponse, createErrorResponse } from '../_utils';

// Delegates to the `getRanking` service rather than carrying its own query.
//
// The previous implementation was a second, divergent copy: `player.findMany` with
// `include: { gamePlayerStatistics: { where: { game: withoutDeleted } } }` and **no season
// filter**, so `totalGames` and `winRate` summed every season while `currentRating` showed only
// the current one. `pagination.total` counted all players rather than ranked ones. It also read
// ~10k rows per call. Since `_services/` is callable from route handlers (not from client
// components), one implementation is both correct and ~10x cheaper. See #299.
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);

    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 1), 100);
    const offset = Math.max(parseInt(url.searchParams.get('offset') || '0', 10) || 0, 0);

    const seasonParam = url.searchParams.get('season');
    const season = seasonParam ? parseInt(seasonParam, 10) : CURRENT_SEASON;
    if (Number.isNaN(season)) {
      return createErrorResponse('Invalid season parameter', 400);
    }

    const { ranking } = await getRanking(season, limit, offset);

    return createSuccessResponse({
      ranking,
      pagination: {
        season,
        limit,
        offset,
        // A short page means there is nothing after it. Deriving it this way avoids a second
        // COUNT query over the same joins purely to fill a field.
        hasMore: ranking.length === limit,
      },
    });
  } catch (error) {
    console.error('Ranking fetch error:', error);
    return createErrorResponse('Failed to fetch ranking', 500);
  }
}
