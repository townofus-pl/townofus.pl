// Player stats display formatting utilities.
// Safe to import from client components — no server-only dependencies.

import type { UIPlayerData } from '../_services/games/types';
import { FIRST_MIRA_SEASON } from '../_constants/seasons';
import { categorize, otherParts } from './statsBreakdown';

export function formatPlayerStatsWithColors(player: UIPlayerData, seasonId: number, maxTasks?: number): Array<{ text: string; color?: string }> {
  const statParts: Array<{ text: string; color?: string }> = [];

  // "label" jest po angielsku umyślnie!
  // Same counters, but before Mira they were Medic-only and the league still calls them shields.
  const protect = seasonId < FIRST_MIRA_SEASON ? 'Medic Shields' : 'Protects';
  // From Mira on, the Time Lord also revives. The counter is not for the Altruist alone.
  const revive = seasonId < FIRST_MIRA_SEASON ? 'Altruist Revives' : 'Revives';

  const statLabels: Record<string, { label: string; color?: string }> = {
    'correctKills': { label: 'Correct Kills', color: '#22C55E' }, // zielony
    'incorrectKills': { label: 'Incorrect Kills', color: '#EF4444' }, // czerwony
    'correctProsecutes': { label: 'Correct Prosecutes', color: '#22C55E' },
    'incorrectProsecutes': { label: 'Incorrect Prosecutes', color: '#EF4444' },
    'correctGuesses': { label: 'Correct Guesses', color: '#22C55E' },
    'incorrectGuesses': { label: 'Incorrect Guesses', color: '#EF4444' },
    'correctDeputyShoots': { label: 'Correct Deputy Shoots', color: '#22C55E' },
    'incorrectDeputyShoots': { label: 'Incorrect Deputy Shoots', color: '#EF4444' },
    'correctJailorExecutes': { label: 'Correct Jailor Executes', color: '#22C55E' },
    'incorrectJailorExecutes': { label: 'Incorrect Jailor Executes', color: '#EF4444' },
    'correctProtects': { label: `Correct ${protect}`, color: '#22C55E' },
    'incorrectProtects': { label: `Incorrect ${protect}`, color: '#EF4444' },
    'correctWardenFortifies': { label: 'Correct Warden Fortifies', color: '#22C55E' },
    'incorrectWardenFortifies': { label: 'Incorrect Warden Fortifies', color: '#EF4444' },
    'janitorCleans': { label: 'Janitor Cleans' },
    'correctAltruistRevives': { label: `Correct ${revive}`, color: '#22C55E' },
    'incorrectAltruistRevives': { label: `Incorrect ${revive}`, color: '#EF4444' },
    'correctSwaps': { label: 'Correct Swaps', color: '#22C55E' },
    'incorrectSwaps': { label: 'Incorrect Swaps', color: '#EF4444' },
    'correctVotes': { label: 'Correct Votes', color: '#22C55E' },
    'incorrectVotes': { label: 'Incorrect Votes', color: '#EF4444' }
  };

  const stats = player.originalStats;

  // Season 4+: the same groups as the day results (Malkiz, 2026-10). A Jailor's execute and a
  // Deputy's shot are kills, and prosecutes, revives and swaps are "Other".
  if (seasonId >= FIRST_MIRA_SEASON) {
    const role = player.roleHistory?.[player.roleHistory.length - 1] ?? player.role;
    const groups = categorize(stats, seasonId, role);
    // One game: the actions behind "Other" keep their own names (Correct Knights: 1).
    const rows: Array<{ name: string; correct: number; incorrect: number; verdict: boolean }> = [
      { name: 'Kills', ...groups.kills, verdict: true },
      { name: 'Guesses', ...groups.guesses, verdict: true },
      { name: 'Protects', ...groups.protects, verdict: true },
      ...otherParts(stats, seasonId, role).map((p) => ({ name: p.word + p.plural, correct: p.correct, incorrect: p.incorrect, verdict: p.verdict })),
      { name: 'Votes', ...groups.votes, verdict: true },
    ];
    for (const r of rows) {
      if (r.correct > 0) statParts.push(r.verdict
        ? { text: `Correct ${r.name}: ${r.correct}`, color: '#22C55E' }
        : { text: `${r.name}: ${r.correct}` });
      if (r.incorrect > 0) statParts.push({ text: `Incorrect ${r.name}: ${r.incorrect}`, color: '#EF4444' });
    }
  }

  if (seasonId < FIRST_MIRA_SEASON) Object.entries(stats).forEach(([key, value]) => {
    if (typeof value === 'number' && value > 0 && statLabels[key]) {
      const config = statLabels[key];
      statParts.push({ text: `${config.label}: ${value}`, color: config.color });
    }
  });

  // Completed tasks
  const isCrewmate = player.team === 'Crewmate';
  const hasLovers = player.modifiers.some(mod => mod.toLowerCase().includes('lover'));
  const shouldShowTasks = isCrewmate && !hasLovers;

  if (stats.completedTasks > 0 || shouldShowTasks) {
    const tasksText = maxTasks !== undefined
      ? `Ukończone zadania: ${stats.completedTasks}/${maxTasks}`
      : `Ukończone zadania: ${stats.completedTasks}`;
    statParts.push({ text: tasksText, color: undefined });
  }

  if (stats.survivedRounds !== undefined && stats.survivedRounds >= 0) {
    statParts.push({ text: `Przeżyte rundy: ${stats.survivedRounds}`, color: '#06B6D4' });
  }

  if (stats.disconnected) {
    statParts.push({ text: '🔌 Rozłączony', color: '#EF4444' });
  }

  if (stats.win) {
    statParts.push({ text: '🏆 Zwycięzca', color: '#FFD700' });
  }

  return statParts;
}
