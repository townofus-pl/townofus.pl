import { getGamesListByDate, getSessionGameStats } from '../games/getGamesList';
import { getGameData } from '../games/getGameData';
import { getLatestGameDay } from '../games/getLatestGameDay';
import { formatDisplayDate } from '@/app/dramaafera/_utils/gameUtils';
import { summarizeSession } from './summarizeSession';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { toPublicGameData } from '../games/_toPublic';
import type { PublicGameData } from '../games/types';

export interface SessionPlayer {
  name: string;
  avatar: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: Array<'W' | 'L' | null>;
}

export interface SessionRole {
  name: string;
  displayName: string;
  color: string;
  team: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
  results: Array<'W' | 'L' | null>;
}

export interface SessionSummary {
  date: string;
  displayDate: string;
  players: SessionPlayer[];
  roles: SessionRole[];
  games: Awaited<ReturnType<typeof getGamesListByDate>>;
  detailedGames: Array<Awaited<ReturnType<typeof getGameData>>>;
  crewmateWins: number;
  impostorWins: number;
  neutralWins: number;
}

/** Podsumowanie sesji bez pól punktowych. Używają go strony publiczne i `/api/v2`. */
export type PublicSessionSummary = Omit<SessionSummary, 'detailedGames'> & {
  detailedGames: Array<PublicGameData | null>;
};

export async function getPublicSessionSummaryByDate(
  date: string,
  seasonId?: number,
): Promise<PublicSessionSummary> {
  const summary = await getSessionSummaryByDate(date, seasonId);
  return {
    date: summary.date,
    displayDate: summary.displayDate,
    players: summary.players,
    roles: summary.roles,
    games: summary.games,
    detailedGames: summary.detailedGames.map((game) => (game ? toPublicGameData(game) : null)),
    crewmateWins: summary.crewmateWins,
    impostorWins: summary.impostorWins,
    neutralWins: summary.neutralWins,
  };
}

export async function getSessionSummaryByDate(
  date: string,
  seasonId?: number,
): Promise<SessionSummary> {
  const empty: SessionSummary = {
    date,
    displayDate: formatDisplayDate(date),
    players: [],
    roles: [],
    games: [],
    detailedGames: [],
    crewmateWins: 0,
    impostorWins: 0,
    neutralWins: 0,
  };

  const season = seasonId ?? CURRENT_SEASON;
  const games = await getGamesListByDate(date, seasonId);
  if (!games || games.length === 0) return empty;

  const displayDate = formatDisplayDate(date);
  // Wszystkie gry sesji są z jednego sezonu, więc ostatni dzień czytamy raz.
  const latestDay = await getLatestGameDay(season);
  const reversedGames = [...games].reverse();
  const detailedGames = await Promise.all(
    reversedGames.map((game) => getGameData(game.id, { latestDay })),
  );

  const { players, roles, crewmateWins, impostorWins, neutralWins } = summarizeSession(
    detailedGames.map((game) => game?.detailedStats?.playersData ? {
      winner: game.winner,
      players: game.detailedStats.playersData.map((player) => ({
        name: player.nickname,
        win: player.win,
        initialRole: player.roleHistory && player.roleHistory.length > 0 ? player.roleHistory[0] : player.role,
      })),
    } : null),
    games.length,
    season,
  );

  return {
    date,
    displayDate,
    players,
    roles,
    games: reversedGames,
    detailedGames,
    crewmateWins,
    impostorWins,
    neutralWins,
  };
}

/**
 * Podsumowanie sesji dla `/api/v2/sessions/{date}`. Gry sesji są czytane razem
 * (`getSessionGameStats`), bez `getGameData` dla każdej gry. Liczby są takie same jak w
 * `getSessionSummaryByDate`, bo oba używają `summarizeSession`.
 */
export async function getSessionOverview(date: string, seasonId?: number) {
  const season = seasonId ?? CURRENT_SEASON;
  const rows = await getSessionGameStats(date, seasonId);
  // `rows` jest od najnowszej gry, a wyniki liczymy od najstarszej.
  const oldestFirst = [...rows].reverse();
  const { players, roles, crewmateWins, impostorWins, neutralWins } = summarizeSession(
    oldestFirst.map((row) => ({
      winner: row.summary.winner,
      players: row.players.map((player) => ({ name: player.name, win: player.win, initialRole: player.roleHistory[0] ?? 'Nieznana rola' })),
    })),
    rows.length,
    season,
  );
  return {
    displayDate: formatDisplayDate(date),
    games: oldestFirst.map((row) => row.summary),
    players: players.map(({ avatar: _avatar, ...player }) => player),
    roles,
    crewmateWins,
    impostorWins,
    neutralWins,
  };
}
