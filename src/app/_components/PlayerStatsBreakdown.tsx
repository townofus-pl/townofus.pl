'use client';

import { useState } from 'react';
import { convertRoleNameForDisplay, getRoleColor, normalizeRoleName, FIRST_MIRA_SEASON } from '@/app/dramaafera/_utils/gameUtils';

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

type Pair = { correct: number; incorrect: number };

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

export function addGame(breakdown: RoleBreakdown, role: string, counters: GameCounters, seasonId: number): void {
  const add = categorize(counters, seasonId);
  const row = breakdown[role] ??= {
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

const LABELS: Record<CategoryKey, (seasonId: number) => string> = {
  kills: () => 'Kills',
  guesses: () => 'Guesses',
  protects: (seasonId) => (seasonId < FIRST_MIRA_SEASON ? 'Medic Shields' : 'Protects'),
  other: () => 'Other',
  votes: () => 'Votes',
};

interface Props {
  breakdown: RoleBreakdown;
  janitorCleans: number;
  seasonId: number;
  hideZeroStats: boolean;
}

/**
 * The day's actions of one player as a compact table: one row per category, and the roles behind
 * it only after the row is opened.
 */
export default function PlayerStatsBreakdown({ breakdown, janitorCleans, seasonId, hideZeroStats }: Props) {
  const [open, setOpen] = useState<Set<CategoryKey>>(new Set());
  const toggle = (key: CategoryKey) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const roles = Object.entries(breakdown);
  const totals = (key: CategoryKey): Pair =>
    roles.reduce((sum, [, r]) => ({
      correct: sum.correct + r.categories[key].correct,
      incorrect: sum.incorrect + r.categories[key].incorrect,
    }), { correct: 0, incorrect: 0 });

  const keys = (Object.keys(LABELS) as CategoryKey[]).filter((key) => {
    const t = totals(key);
    return !hideZeroStats || t.correct > 0 || t.incorrect > 0;
  });

  if (keys.length === 0 && janitorCleans === 0) return null;

  return (
    <div className="bg-zinc-700/60 rounded-lg p-3 mb-4 max-w-md">
      <div className="grid grid-cols-[1fr_3rem_3rem_3rem] gap-x-2 gap-y-1 items-center text-sm">
        <div className="text-xs text-zinc-400">Akcje</div>
        <div className="text-xs text-zinc-400 text-center">✓</div>
        <div className="text-xs text-zinc-400 text-center">✗</div>
        <div className="text-xs text-zinc-400 text-center" title="Liczba gier tą rolą">gry</div>

        {keys.map((key) => {
          const t = totals(key);
          const isOpen = open.has(key);
          const roleRows = roles
            .filter(([, r]) => r.categories[key].correct > 0 || r.categories[key].incorrect > 0)
            .sort((a, b) => b[1].categories[key].correct - a[1].categories[key].correct);
          return (
            <div key={key} className="contents">
              <div className="font-medium text-zinc-200">{LABELS[key](seasonId)}</div>
              <div className="text-center font-bold text-green-400">{t.correct}</div>
              <div className="text-center font-bold text-red-400">{t.incorrect}</div>
              <div className="text-center">
                {roleRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="text-yellow-400 hover:text-yellow-300 transition-transform"
                    style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                    title={isOpen ? 'Ukryj role' : 'Pokaż role'}
                    aria-expanded={isOpen}
                  >
                    ▼
                  </button>
                )}
              </div>
              {isOpen && roleRows.map(([role, r]) => {
                // The mod's key (TimeLord) becomes the registry name (Time Lord) first.
                const display = convertRoleNameForDisplay(normalizeRoleName(role, seasonId));
                return (
                  <div key={`${key}-${role}`} className="contents">
                    <div className="pl-3 font-semibold" style={{ color: getRoleColor(display, seasonId) }}>{display}</div>
                    <div className="text-center text-green-400">{r.categories[key].correct}</div>
                    <div className="text-center text-red-400">{r.categories[key].incorrect}</div>
                    <div className="text-center text-sky-300">{r.games}</div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {janitorCleans > 0 && (
          <>
            <div className="font-medium text-zinc-200">Janitor Cleans</div>
            <div className="text-center font-bold text-purple-400">{janitorCleans}</div>
            <div />
            <div />
          </>
        )}
      </div>
    </div>
  );
}
