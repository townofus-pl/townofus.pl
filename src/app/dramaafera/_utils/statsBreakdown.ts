// Groups a player's per-game counters the way the league reads them (Malkiz, 2026-10), with the
// roles behind each group. Shared by the day results (PlayerTable) and the season profile.
// No React here, so a Server Component can import it.
import { convertRoleNameForDisplay, normalizeRoleName, FIRST_MIRA_SEASON } from './gameUtils';

/** One player's counters from one game, as `UIPlayerData.originalStats` carries them. */
export interface GameCounters {
  correctKills?: number; incorrectKills?: number;
  correctJailorExecutes?: number; incorrectJailorExecutes?: number;
  correctDeputyShoots?: number; incorrectDeputyShoots?: number;
  correctGuesses?: number; incorrectGuesses?: number;
  correctProtects?: number; incorrectProtects?: number;
  correctWardenFortifies?: number; incorrectWardenFortifies?: number;
  correctProsecutes?: number; incorrectProsecutes?: number;
  correctAltruistRevives?: number; incorrectAltruistRevives?: number;
  correctSwaps?: number; incorrectSwaps?: number;
  correctVotes?: number; incorrectVotes?: number;
  janitorCleans?: number;
}

export type CategoryKey = 'kills' | 'guesses' | 'protects' | 'other' | 'votes';

export type Pair = { correct: number; incorrect: number };

/**
 * The league's grouping (Malkiz, 2026-10): every kill in one row whatever the role (a Jailor's
 * execute and a Deputy's shot are kills), guesses, protects, votes, and everything else under
 * "Other". From season 4 a Warden's fortify is a protect. Before Mira it was its own Warden
 * statistic, and it goes under Other rather than into the Medic's shields.
 */
export function categorize(s: GameCounters, seasonId: number): Record<CategoryKey, Pair> {
  const n = (v?: number) => v || 0;
  const mira = seasonId >= FIRST_MIRA_SEASON;
  return {
    kills: {
      correct: n(s.correctKills) + n(s.correctJailorExecutes) + n(s.correctDeputyShoots),
      incorrect: n(s.incorrectKills) + n(s.incorrectJailorExecutes) + n(s.incorrectDeputyShoots),
    },
    guesses: { correct: n(s.correctGuesses), incorrect: n(s.incorrectGuesses) },
    protects: {
      correct: n(s.correctProtects) + (mira ? n(s.correctWardenFortifies) : 0),
      incorrect: n(s.incorrectProtects) + (mira ? n(s.incorrectWardenFortifies) : 0),
    },
    other: {
      correct: n(s.correctProsecutes) + n(s.correctAltruistRevives) + n(s.correctSwaps) + (mira ? 0 : n(s.correctWardenFortifies)),
      incorrect: n(s.incorrectProsecutes) + n(s.incorrectAltruistRevives) + n(s.incorrectSwaps) + (mira ? 0 : n(s.incorrectWardenFortifies)),
    },
    votes: { correct: n(s.correctVotes), incorrect: n(s.incorrectVotes) },
  };
}

/** Per role: how many games the player had it, and its counters summed over those games. */
export type RoleBreakdown = Record<string, { games: number; categories: Record<CategoryKey, Pair> }>;

/**
 * Keyed by the name a reader sees, not the raw key: the mod writes TimeLord, the registry says
 * Time Lord, and Plaguebearer and Pestilence both show as "Plaguebearer / Pestilence". Keying on
 * the raw value split one role into two rows.
 */
export function roleLabel(role: string, seasonId: number): string {
  return convertRoleNameForDisplay(normalizeRoleName(role, seasonId));
}

/**
 * Adds one game to a breakdown. The key is a role (made a display name) unless `keyIsRole` is
 * false: the roles table breaks a role down by the players who played it, and a player's name
 * must stay as it is.
 */
export function addGame(breakdown: RoleBreakdown, key: string, counters: GameCounters, seasonId: number, keyIsRole = true): void {
  const add = categorize(counters, seasonId);
  const row = breakdown[keyIsRole ? roleLabel(key, seasonId) : key] ??= {
    games: 0,
    categories: { kills: { correct: 0, incorrect: 0 }, guesses: { correct: 0, incorrect: 0 },
      protects: { correct: 0, incorrect: 0 }, other: { correct: 0, incorrect: 0 }, votes: { correct: 0, incorrect: 0 } },
  };
  row.games += 1;
  for (const key of Object.keys(add) as CategoryKey[]) {
    row.categories[key].correct += add[key].correct;
    row.categories[key].incorrect += add[key].incorrect;
  }
}
