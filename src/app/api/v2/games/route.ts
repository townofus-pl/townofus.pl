import { withAuth, withCors } from '@/app/api/_middlewares';
import { getGamesPage } from '@/app/dramaafera/_services';
import { GamesResponseSchema } from '../_lib/schemas';
import { publicGet, preflight, seasonParam, intParam, normalizeDate } from '../_lib/http';
import { POST as postHandler } from './post';

// The endpoint the mod POSTs at (`ApiClient.SubmitPath = "/api/v2/games"`), Basic-auth'd.
// Payload contract: the mod's own `game_data.schema.json`. Not in the public OpenAPI document.
export const POST = withCors(withAuth(postHandler));

export const OPTIONS = preflight;

// Publiczna lista gier sezonu. Logowania wymaga tylko POST.
export const GET = publicGet(GamesResponseSchema, async (request) => {
  const season = seasonParam(request);
  const limit = intParam(request, 'limit', 100, { min: 1, max: 500 });
  const offset = intParam(request, 'offset', 0, { max: 100_000 });
  const rawDate = new URL(request.url).searchParams.get('date');
  const date = rawDate ? normalizeDate(rawDate) : null;

  // Filtr daty, liczba gier i stronicowanie idą w SQL.
  const { total, games } = await getGamesPage(season, { date: date ?? undefined, limit, offset });

  return { season, total, limit, offset, games };
});
