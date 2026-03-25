// Player stats display formatting utilities.

import type { UIPlayerData } from '../games/types';

export function formatPlayerStatsWithColors(player: UIPlayerData, maxTasks?: number): Array<{ text: string; color?: string }> {
  const statParts: Array<{ text: string; color?: string }> = [];

  const statLabels: Record<string, { label: string; color?: string }> = {
    'correctKills': { label: 'Correct Kills', color: '#22C55E' },
    'incorrectKills': { label: 'Incorrect Kills', color: '#EF4444' },
    'correctProsecutes': { label: 'Correct Prosecutes', color: '#22C55E' },
    'incorrectProsecutes': { label: 'Incorrect Prosecutes', color: '#EF4444' },
    'correctGuesses': { label: 'Correct Guesses', color: '#22C55E' },
    'incorrectGuesses': { label: 'Incorrect Guesses', color: '#EF4444' },
    'correctDeputyShoots': { label: 'Correct Deputy Shoots', color: '#22C55E' },
    'incorrectDeputyShoots': { label: 'Incorrect Deputy Shoots', color: '#EF4444' },
    'correctJailorExecutes': { label: 'Correct Jailor Executes', color: '#22C55E' },
    'incorrectJailorExecutes': { label: 'Incorrect Jailor Executes', color: '#EF4444' },
    'correctMedicShields': { label: 'Correct Medic Shields', color: '#22C55E' },
    'incorrectMedicShields': { label: 'Incorrect Medic Shields', color: '#EF4444' },
    'correctWardenFortifies': { label: 'Correct Warden Fortifies', color: '#22C55E' },
    'incorrectWardenFortifies': { label: 'Incorrect Warden Fortifies', color: '#EF4444' },
    'janitorCleans': { label: 'Janitor Cleans' },
    'correctAltruistRevives': { label: 'Correct Altruist Revives', color: '#22C55E' },
    'incorrectAltruistRevives': { label: 'Incorrect Altruist Revives', color: '#EF4444' },
    'correctSwaps': { label: 'Correct Swaps', color: '#22C55E' },
    'incorrectSwaps': { label: 'Incorrect Swaps', color: '#EF4444' }
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
      ? `Completed Tasks: ${stats.completedTasks}/${maxTasks}`
      : `Completed Tasks: ${stats.completedTasks}`;
    statParts.push({ text: tasksText, color: undefined });
  }

  if (stats.survivedRounds !== undefined && stats.survivedRounds >= 0) {
    statParts.push({ text: `Survived Rounds: ${stats.survivedRounds}`, color: '#06B6D4' });
  }

  if (stats.disconnected === 1) {
    statParts.push({ text: '🔌 Disconnected', color: '#EF4444' });
  }

  if (stats.win > 0) {
    statParts.push({ text: '🏆 Winner', color: '#FFD700' });
  }

  return statParts;
}
