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
 * The league's grouping (Malkiz, 2026-10): every kill in one group whatever the role (a Jailor's
 * execute and a Deputy's shot are kills), guesses, protects, votes, and everything else under
 * "Other": prosecutes, revives, swaps, Janitor cleans and the Monarch's knighting.
 *
 * `role` is the role the player had in that game. The database files a Monarch's knighting in
 * the protect columns (there is no knight column), and a Monarch protects in no other way, so a
 * Monarch's protects are moved to Other here. From season 4 a Warden's fortify is a protect.
 * Before Mira it was its own Warden statistic, and it goes under Other.
 */
export function categorize(s: GameCounters, seasonId: number, role?: string): Record<CategoryKey, Pair> {
  const n = (v?: number) => v || 0;
  const mira = seasonId >= FIRST_MIRA_SEASON;
  const monarch = !!role && normalizeRoleName(role, seasonId) === 'Monarch';
  const protects = {
    correct: n(s.correctProtects) + (mira ? n(s.correctWardenFortifies) : 0),
    incorrect: n(s.incorrectProtects) + (mira ? n(s.incorrectWardenFortifies) : 0),
  };
  const knights = monarch ? protects : { correct: 0, incorrect: 0 };
  return {
    kills: {
      correct: n(s.correctKills) + n(s.correctJailorExecutes) + n(s.correctDeputyShoots),
      incorrect: n(s.incorrectKills) + n(s.incorrectJailorExecutes) + n(s.incorrectDeputyShoots),
    },
    guesses: { correct: n(s.correctGuesses), incorrect: n(s.incorrectGuesses) },
    protects: monarch ? { correct: 0, incorrect: 0 } : protects,
    other: {
      // A Janitor's clean has no verdict, and the league counts it as done: correct.
      correct: n(s.correctProsecutes) + n(s.correctAltruistRevives) + n(s.correctSwaps) + n(s.janitorCleans)
        + knights.correct + (mira ? 0 : n(s.correctWardenFortifies)),
      incorrect: n(s.incorrectProsecutes) + n(s.incorrectAltruistRevives) + n(s.incorrectSwaps)
        + knights.incorrect + (mira ? 0 : n(s.incorrectWardenFortifies)),
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
/**
 * `role` is the player's role in that game. It defaults to the key, which is right whenever the
 * rows are roles. When the rows are players, pass the role explicitly.
 */
export function addGame(breakdown: RoleBreakdown, key: string, counters: GameCounters, seasonId: number, keyIsRole = true, role?: string): void {
  const add = categorize(counters, seasonId, role ?? (keyIsRole ? key : undefined));
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

/** One action type inside "Other", for views of a single game. */
/** `verdict` is false for an action that is never right or wrong (a Janitor's clean): show the count only. */
export interface OtherPart { word: string; plural: string; correct: number; incorrect: number; verdict: boolean }

/**
 * The actions behind "Other" for one game, each under its own name. In a single game the reader
 * knows the role, so "1 correct knight" says more than "1 correct other" (2026-10). The groups
 * stay for views that sum many games, where ▼ shows the roles instead.
 */
export function otherParts(s: GameCounters, seasonId: number, role?: string): OtherPart[] {
  const n = (v?: number) => v || 0;
  const mira = seasonId >= FIRST_MIRA_SEASON;
  const monarch = !!role && normalizeRoleName(role, seasonId) === 'Monarch';
  const parts: OtherPart[] = [
    { word: 'Prosecute', plural: 's', correct: n(s.correctProsecutes), incorrect: n(s.incorrectProsecutes), verdict: true },
    { word: 'Revive', plural: 's', correct: n(s.correctAltruistRevives), incorrect: n(s.incorrectAltruistRevives), verdict: true },
    { word: 'Swap', plural: 's', correct: n(s.correctSwaps), incorrect: n(s.incorrectSwaps), verdict: true },
    {
      word: 'Knight', plural: 's', verdict: true,
      correct: monarch ? n(s.correctProtects) + (mira ? n(s.correctWardenFortifies) : 0) : 0,
      incorrect: monarch ? n(s.incorrectProtects) + (mira ? n(s.incorrectWardenFortifies) : 0) : 0,
    },
    { word: 'Fortify', plural: '', correct: mira ? 0 : n(s.correctWardenFortifies), incorrect: mira ? 0 : n(s.incorrectWardenFortifies), verdict: true },
    { word: 'Clean', plural: 's', correct: n(s.janitorCleans), incorrect: 0, verdict: false },
  ];
  return parts.filter((p) => p.correct > 0 || p.incorrect > 0);
}
