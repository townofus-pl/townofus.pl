// Player stats display formatting utilities.
// Safe to import from client components — no server-only dependencies.

import type { UIPlayerData } from '../_services/games/types';

export function formatPlayerStatsWithColors(player: UIPlayerData, maxTasks?: number): Array<{ text: string; color?: string }> {
  const statParts: Array<{ text: string; color?: string }> = [];

  const statLabels: Record<string, { label: string; color?: string }> = {
    'correctKills': { label: 'Poprawne zabójstwa', color: '#22C55E' },
    'incorrectKills': { label: 'Błędne zabójstwa', color: '#EF4444' },
    'correctProsecutes': { label: 'Poprawne oskarżenia', color: '#22C55E' },
    'incorrectProsecutes': { label: 'Błędne oskarżenia', color: '#EF4444' },
    'correctGuesses': { label: 'Poprawne zgadnięcia', color: '#22C55E' },
    'incorrectGuesses': { label: 'Błędne zgadnięcia', color: '#EF4444' },
    'correctDeputyShoots': { label: 'Poprawne strzały zastępcy', color: '#22C55E' },
    'incorrectDeputyShoots': { label: 'Błędne strzały zastępcy', color: '#EF4444' },
    'correctJailorExecutes': { label: 'Poprawne egzekucje strażnika', color: '#22C55E' },
    'incorrectJailorExecutes': { label: 'Błędne egzekucje strażnika', color: '#EF4444' },
    'correctMedicShields': { label: 'Poprawne osłony medyka', color: '#22C55E' },
    'incorrectMedicShields': { label: 'Błędne osłony medyka', color: '#EF4444' },
    'correctWardenFortifies': { label: 'Poprawne fortyfikacje strażnika', color: '#22C55E' },
    'incorrectWardenFortifies': { label: 'Błędne fortyfikacje strażnika', color: '#EF4444' },
    'janitorCleans': { label: 'Sprzątania woźnego' },
    'correctAltruistRevives': { label: 'Poprawne wskrzeszenia altruisty', color: '#22C55E' },
    'incorrectAltruistRevives': { label: 'Błędne wskrzeszenia altruisty', color: '#EF4444' },
    'correctSwaps': { label: 'Poprawne zamiany', color: '#22C55E' },
    'incorrectSwaps': { label: 'Błędne zamiany', color: '#EF4444' }
  };

  const stats = player.originalStats;
  Object.entries(stats).forEach(([key, value]) => {
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
