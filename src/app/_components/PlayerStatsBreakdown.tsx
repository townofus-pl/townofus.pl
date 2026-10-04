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
  janitorCleans: number;
  seasonId: number;
  hideZeroStats: boolean;
  /** 'role' (default): rows are roles, in role colours. 'player': rows are player names. */
  rows?: 'role' | 'player';
  /**
   * 'compact' (default) fits inside a table row, as in the day results. 'wide' fills its column
   * and matches the profile's and role page's stat cards: same background, larger numbers.
   */
  variant?: 'compact' | 'wide';
}

/**
 * The day's actions of one player as a compact table: one row per category, and the roles behind
 * it only after the row is opened.
 */
export default function PlayerStatsBreakdown({ breakdown, janitorCleans, seasonId, hideZeroStats, rows = 'role', variant = 'compact' }: Props) {
  const wide = variant === 'wide';
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
    <div className={wide ? 'bg-zinc-800/30 rounded-lg p-4 md:p-5 w-full mt-4' : 'bg-zinc-700/60 rounded-lg p-3 mb-4 max-w-md'}>
      <div className={wide
        ? 'grid grid-cols-[1fr_4rem_4rem_4rem] md:grid-cols-[1fr_6rem_6rem_6rem] gap-x-3 gap-y-2 items-center text-base'
        : 'grid grid-cols-[1fr_3rem_3rem_3rem] gap-x-2 gap-y-1 items-center text-sm'}>
        <div className={wide ? 'text-sm text-zinc-400 uppercase tracking-wide' : 'text-xs text-zinc-400'}>Akcje</div>
        <div className={`${wide ? 'text-sm' : 'text-xs'} text-zinc-400 text-center`}>✓</div>
        <div className={`${wide ? 'text-sm' : 'text-xs'} text-zinc-400 text-center`}>✗</div>
        <div className={`${wide ? 'text-sm' : 'text-xs'} text-zinc-400 text-center`} title={rows === 'role' ? 'Liczba gier tą rolą' : 'Liczba gier tego gracza'}>gry</div>

        {keys.map((key) => {
          const t = totals(key);
          const isOpen = open.has(key);
          const roleRows = roles
            .filter(([, r]) => r.categories[key].correct > 0 || r.categories[key].incorrect > 0)
            .sort((a, b) => b[1].categories[key].correct - a[1].categories[key].correct);
          return (
            <div key={key} className="contents">
              <div className={wide ? 'font-semibold text-zinc-100 text-lg' : 'font-medium text-zinc-200'}>{LABELS[key](seasonId)}</div>
              <div className={`text-center font-bold text-green-400 ${wide ? 'text-xl' : ''}`}>{t.correct}</div>
              <div className={`text-center font-bold text-red-400 ${wide ? 'text-xl' : ''}`}>{t.incorrect}</div>
              <div className="text-center">
                {roleRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className={`text-yellow-400 hover:text-yellow-300 transition-transform ${wide ? 'text-lg' : ''}`}
                    style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                    title={isOpen ? 'Ukryj role' : 'Pokaż role'}
                    aria-expanded={isOpen}
                  >
                    ▼
                  </button>
                )}
              </div>
              {isOpen && roleRows.map(([role, r]) => {
                const display = role;   // already a display name (addGame)
                return (
                  <div key={`${key}-${role}`} className="contents">
                    <div className="pl-3 font-semibold" style={{ color: rows === 'role' ? getRoleColor(display, seasonId) : '#E4E4E7' }}>{display}</div>
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
