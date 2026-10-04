'use client';

import { useState } from 'react';
import { getRoleColor, FIRST_MIRA_SEASON } from '@/app/dramaafera/_utils/gameUtils';
import type { CategoryKey, Pair, RoleBreakdown } from '@/app/dramaafera/_utils/statsBreakdown';

const LABELS: Record<CategoryKey, (seasonId: number) => string> = {
  kills: () => 'Kills',
  guesses: () => 'Guesses',
  protects: (seasonId) => (seasonId < FIRST_MIRA_SEASON ? 'Medic Shields' : 'Protects'),
  other: () => 'Other',
  votes: () => 'Votes',
};

interface Props {
  breakdown: RoleBreakdown;
  seasonId: number;
  /** Hide a box whose correct and incorrect are both 0. */
  hideZeroStats: boolean;
  /** 'role' (default): the rows in a box are roles, in role colours. 'player': player names. */
  rows?: 'role' | 'player';
  /**
   * 'compact' (default) sits in the day results' expanded row, on the old cards' background.
   * 'wide' matches the profile's and role page's stat cards.
   */
  variant?: 'compact' | 'wide';
}

/**
 * One box per action type (Malkiz, 2026-10): Kills, Guesses, Protects, Other, Votes, each with
 * its correct and incorrect count. ▼ opens the roles (or players) behind the box, in tight columns
 * inside the box, so a name sits right next to its numbers.
 */
export default function PlayerStatsBreakdown({ breakdown, seasonId, hideZeroStats, rows = 'role', variant = 'compact' }: Props) {
  const wide = variant === 'wide';
  const [open, setOpen] = useState<Set<CategoryKey>>(new Set());
  const toggle = (key: CategoryKey) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const entries = Object.entries(breakdown);
  const totals = (key: CategoryKey): Pair =>
    entries.reduce((sum, [, r]) => ({
      correct: sum.correct + r.categories[key].correct,
      incorrect: sum.incorrect + r.categories[key].incorrect,
    }), { correct: 0, incorrect: 0 });

  const keys = (Object.keys(LABELS) as CategoryKey[]).filter((key) => {
    const t = totals(key);
    return !hideZeroStats || t.correct > 0 || t.incorrect > 0;
  });
  if (keys.length === 0) return null;

  const box = wide ? 'bg-zinc-800/30 rounded-lg p-4' : 'bg-zinc-700/60 rounded-lg p-3';

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 ${wide ? 'mt-4' : 'mb-4'} items-start`}>
      {keys.map((key) => {
        const t = totals(key);
        const isOpen = open.has(key);
        const rowsInBox = entries
          .filter(([, r]) => r.categories[key].correct > 0 || r.categories[key].incorrect > 0)
          .sort((a, b) => b[1].categories[key].correct - a[1].categories[key].correct);
        return (
          // In the wide variant five boxes share a row, too narrow for role names: an open box takes
          // two columns.
          <div key={key} className={`${box} ${wide && isOpen ? 'col-span-2' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <div className={wide ? 'text-base font-semibold text-zinc-200' : 'text-sm font-medium text-zinc-300'}>{LABELS[key](seasonId)}</div>
              {rowsInBox.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  className="text-yellow-400 hover:text-yellow-300 text-sm leading-none transition-transform"
                  style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                  title={isOpen ? 'Ukryj szczegóły' : rows === 'role' ? 'Pokaż role' : 'Pokaż graczy'}
                  aria-expanded={isOpen}
                >
                  ▼
                </button>
              )}
            </div>
            <div className={`text-green-400 ${wide ? 'text-lg font-bold' : ''}`}>Correct: {t.correct}</div>
            <div className={`text-red-400 ${wide ? 'text-lg font-bold' : ''}`}>Incorrect: {t.incorrect}</div>

            {isOpen && (
              <div className="mt-2 pt-2 border-t border-zinc-600/60 grid grid-cols-[minmax(0,max-content)_1.75rem_1.75rem_1.75rem] w-fit max-w-full gap-x-2 gap-y-0.5 text-xs items-center">
                <div className="text-zinc-500">{rows === 'role' ? 'rola' : 'gracz'}</div>
                <div className="text-zinc-500 text-center">✓</div>
                <div className="text-zinc-500 text-center">✗</div>
                <div className="text-zinc-500 text-center" title={rows === 'role' ? 'Liczba gier tą rolą' : 'Liczba gier tego gracza'}>gry</div>
                {rowsInBox.map(([name, r]) => (
                  <div key={name} className="contents">
                    <div className="truncate font-semibold" title={name}
                      style={{ color: rows === 'role' ? getRoleColor(name, seasonId) : '#E4E4E7' }}>{name}</div>
                    <div className="text-center text-green-400">{r.categories[key].correct}</div>
                    <div className="text-center text-red-400">{r.categories[key].incorrect}</div>
                    <div className="text-center text-sky-300">{r.games}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
