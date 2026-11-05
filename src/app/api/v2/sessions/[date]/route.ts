import { getSessionOverview } from '@/app/dramaafera/_services';
import { getListaCweliForDisplay } from '@/app/dramaafera/_services/gameSessionList';
import { SessionResponseSchema } from '../../_lib/schemas';
import { ApiError, publicGet, preflight, seasonParam, normalizeDate } from '../../_lib/http';

export const OPTIONS = preflight;

// Wyniki sesji jak na stronie `wyniki`, także dla otwartej (ostatniej) sesji.
export const GET = publicGet(
  SessionResponseSchema,
  async (request, { params }: { params: Promise<{ date: string }> }) => {
    const date = normalizeDate((await params).date);
    const season = seasonParam(request);

    const [summary, lists] = await Promise.all([
      getSessionOverview(date, season),
      getListaCweliForDisplay(season),
    ]);
    const list = lists.find((entry) => entry.date.replace(/-/g, '') === date);

    if (summary.games.length === 0 && !list) throw new ApiError(404, 'Brak sesji z tą datą w tym sezonie');

    return {
      season,
      date,
      displayDate: summary.displayDate,
      totalGames: summary.games.length,
      crewmateWins: summary.crewmateWins,
      impostorWins: summary.impostorWins,
      neutralWins: summary.neutralWins,
      games: summary.games,
      players: summary.players.map((p) => ({
        player: p.name, gamesPlayed: p.games, wins: p.wins, losses: p.loses, winRate: p.winRatio, results: p.results,
      })),
      roles: summary.roles.map((r) => ({
        name: r.name, displayName: r.displayName, team: r.team,
        gamesPlayed: r.games, wins: r.wins, losses: r.loses, winRate: r.winRatio, results: r.results,
      })),
      sessionList: list
        ? { players: list.players.map((p) => ({ player: p.name, rating: p.eloRanking })) }
        : null,
    };
  },
);
