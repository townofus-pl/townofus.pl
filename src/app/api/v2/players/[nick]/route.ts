import {
  getAllPlayerNames,
  getUserProfileStats,
  getPlayerRankingHistory,
  getPlayerTopGames,
  getPlayerVotingStats,
  getPlayerStars,
} from '@/app/dramaafera/_services';
import { FIRST_MIRA_SEASON } from '@/app/dramaafera/_constants/seasons';
import { convertNickToUrlSlug } from '@/app/dramaafera/_utils/gameUtils';
import { PlayerResponseSchema } from '../../_lib/schemas';
import { ApiError, publicGet, preflight, seasonParam, intParam } from '../../_lib/http';
import { buildGroupedCounters, type CounterColumns } from '../../_lib/counters';
import { getPlayerActionSubtypes } from '../../_lib/gameActions';

export const OPTIONS = preflight;

// Strona gracza. `{nick}` to nick albo jego slug (małe litery, spacje jako myślniki).
export const GET = publicGet(
  PlayerResponseSchema,
  async (request, { params }: { params: Promise<{ nick: string }> }) => {
    const raw = decodeURIComponent((await params).nick);
    const season = seasonParam(request);
    const limit = intParam(request, 'limit', 10, { min: 1, max: 50 });
    const offset = intParam(request, 'offset', 0, { max: 100_000 });

    const names = await getAllPlayerNames();
    const name = names.find((candidate) => candidate === raw)
      ?? names.find((candidate) => convertNickToUrlSlug(candidate) === raw.toLowerCase());
    if (!name) throw new ApiError(404, 'Nie znaleziono gracza');

    const stats = await getUserProfileStats(name, season);
    if (!stats) throw new ApiError(404, 'Gracz nie ma gier w tym sezonie');

    const hasActions = season >= FIRST_MIRA_SEASON;
    const [history, best, voting, stars, actionSubtypes] = await Promise.all([
      getPlayerRankingHistory(name, season),
      getPlayerTopGames(name, limit, season, offset),
      getPlayerVotingStats(name, season),
      getPlayerStars(name, season),
      hasActions ? getPlayerActionSubtypes(name, season) : null,
    ]);

    const roleRows = Object.entries(stats.roleColumns ?? {});
    const votes = hasActions
      ? roleRows.reduce(
          (total, [, row]) => ({
            correct: total.correct + (row.columns.correctVotes ?? 0),
            incorrect: total.incorrect + (row.columns.incorrectVotes ?? 0),
          }),
          { correct: 0, incorrect: 0 },
        )
      : null;

    return {
      season,
      name,
      stars,
      rating: history.at(-1)?.score ?? null,
      stats: {
        gamesPlayed: stats.gamesPlayed,
        wins: stats.wins,
        winRate: stats.winRate,
        impostorGames: stats.impostorGames,
        crewmateGames: stats.crewmateGames,
        neutralGames: stats.neutralGames,
        completedTasks: stats.totalTasks,
        maxTasks: stats.maxTasks,
        survivedRounds: stats.survivedRounds,
        totalRounds: stats.totalRounds,
        counters: buildGroupedCounters(stats as CounterColumns, {
          season,
          protectTypes: actionSubtypes?.protectTypes ?? null,
          guessTypes: actionSubtypes?.guessTypes ?? null,
          votes,
        }),
      },
      roleBreakdown: hasActions
        ? Object.fromEntries(
            roleRows.map(([role, row]) => [
              role,
              {
                gamesPlayed: row.gamesPlayed,
                counters: buildGroupedCounters(row.columns as CounterColumns, {
                  season,
                  role,
                  votes: { correct: row.columns.correctVotes ?? 0, incorrect: row.columns.incorrectVotes ?? 0 },
                }),
              },
            ]),
          )
        : undefined,
      ratingHistory: history.map((point) => ({
        date: point.date.toISOString(),
        rating: point.score,
        reason: point.reason ?? null,
        gameId: point.gameIdentifier ?? null,
      })),
      bestGames: best.best.map((game) => ({
        gameId: game.gameIdentifier,
        date: game.date.toISOString(),
        map: game.map,
        duration: game.duration,
        role: game.role,
        team: game.team,
        win: game.win,
      })),
      hasMoreBestGames: best.hasMore,
      voting: {
        totalVotesCast: voting.totalVotesCast,
        totalVotesReceived: voting.totalVotesReceived,
        timesVotedOut: voting.timesVotedOut,
        totalMeetings: voting.totalMeetings,
        skipVotes: voting.skipVotes,
        skipRate: voting.skipRate,
        bandwagonFactor: voting.bandwagonFactor,
        votingTargets: voting.votingTargets.map((row) => ({ player: row.playerName, voteCount: row.voteCount, percentage: row.percentage })),
        votedByPlayers: voting.votedByPlayers.map((row) => ({ player: row.playerName, voteCount: row.voteCount, percentage: row.percentage })),
      },
    };
  },
);
