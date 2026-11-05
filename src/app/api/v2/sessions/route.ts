import { getGameDatesLightweight } from '@/app/dramaafera/_services';
import { getListaCweliForDisplay } from '@/app/dramaafera/_services/gameSessionList';
import { SessionsResponseSchema } from '../_lib/schemas';
import { publicGet, preflight, seasonParam } from '../_lib/http';

export const OPTIONS = preflight;

// Lista sesji jak na stronie `historia-gier`, razem z datami, które mają tylko listę graczy sesji.
export const GET = publicGet(SessionsResponseSchema, async (request) => {
  const season = seasonParam(request);
  const [{ dates }, lists] = await Promise.all([
    getGameDatesLightweight(true, season),
    getListaCweliForDisplay(season),
  ]);

  const sessions = dates.map((entry) => ({
    date: entry.date,
    displayDate: entry.displayDate,
    totalGames: entry.totalGames,
    gameIds: entry.games.map((game) => game.gameIdentifier),
    players: entry.allPlayerNames ?? [],
    hasSessionList: lists.some((list) => list.date.replace(/-/g, '') === entry.date),
  }));

  const knownDates = new Set(sessions.map((session) => session.date));
  for (const list of lists) {
    const compact = list.date.replace(/-/g, '');
    if (knownDates.has(compact)) continue;
    sessions.push({
      date: compact,
      displayDate: list.displayDate,
      totalGames: 0,
      gameIds: [],
      players: list.players.map((player) => player.name),
      hasSessionList: true,
    });
  }
  sessions.sort((a, b) => b.date.localeCompare(a.date));

  return { season, sessions };
});
