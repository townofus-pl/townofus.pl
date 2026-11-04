import type {
  UIGameData,
  UIPlayerData,
  PublicGameData,
  PublicPlayerData,
  PublicOriginalStats,
} from './types';

// Mapowanie na typy publiczne. Pola są wypisane jawnie (allow-list), żeby nowe
// pole w typie wewnętrznym nie trafiło do przeglądarki bez decyzji.

export function toPublicOriginalStats(s: UIPlayerData['originalStats']): PublicOriginalStats {
  return {
    playerName: s.playerName,
    roleHistory: s.roleHistory,
    modifiers: s.modifiers,
    win: s.win,
    disconnected: s.disconnected,
    correctKills: s.correctKills,
    incorrectKills: s.incorrectKills,
    correctProsecutes: s.correctProsecutes,
    incorrectProsecutes: s.incorrectProsecutes,
    correctGuesses: s.correctGuesses,
    incorrectGuesses: s.incorrectGuesses,
    correctDeputyShoots: s.correctDeputyShoots,
    incorrectDeputyShoots: s.incorrectDeputyShoots,
    correctJailorExecutes: s.correctJailorExecutes,
    incorrectJailorExecutes: s.incorrectJailorExecutes,
    correctProtects: s.correctProtects,
    incorrectProtects: s.incorrectProtects,
    correctWardenFortifies: s.correctWardenFortifies,
    incorrectWardenFortifies: s.incorrectWardenFortifies,
    janitorCleans: s.janitorCleans,
    completedTasks: s.completedTasks,
    survivedRounds: s.survivedRounds,
    correctAltruistRevives: s.correctAltruistRevives,
    incorrectAltruistRevives: s.incorrectAltruistRevives,
    correctSwaps: s.correctSwaps,
    incorrectSwaps: s.incorrectSwaps,
    correctVotes: s.correctVotes,
    incorrectVotes: s.incorrectVotes,
  };
}

export function toPublicPlayerData(p: UIPlayerData): PublicPlayerData {
  return {
    nickname: p.nickname,
    role: p.role,
    roleColor: p.roleColor,
    roleHistory: p.roleHistory,
    modifiers: p.modifiers,
    modifierColors: p.modifierColors,
    team: p.team,
    survived: p.survived,
    tasksCompleted: p.tasksCompleted,
    totalTasks: p.totalTasks,
    kills: p.kills,
    deaths: p.deaths,
    meetings: p.meetings,
    win: p.win,
    correctKills: p.correctKills,
    incorrectKills: p.incorrectKills,
    correctProsecutes: p.correctProsecutes,
    incorrectProsecutes: p.incorrectProsecutes,
    correctGuesses: p.correctGuesses,
    incorrectGuesses: p.incorrectGuesses,
    correctDeputyShoots: p.correctDeputyShoots,
    incorrectDeputyShoots: p.incorrectDeputyShoots,
    correctJailorExecutes: p.correctJailorExecutes,
    incorrectJailorExecutes: p.incorrectJailorExecutes,
    correctProtects: p.correctProtects,
    incorrectProtects: p.incorrectProtects,
    correctWardenFortifies: p.correctWardenFortifies,
    incorrectWardenFortifies: p.incorrectWardenFortifies,
    janitorCleans: p.janitorCleans,
    completedTasks: p.completedTasks,
    survivedRounds: p.survivedRounds,
    correctAltruistRevives: p.correctAltruistRevives,
    incorrectAltruistRevives: p.incorrectAltruistRevives,
    correctSwaps: p.correctSwaps,
    incorrectSwaps: p.incorrectSwaps,
    originalStats: toPublicOriginalStats(p.originalStats),
  };
}

/**
 * Kolejność graczy na stronie gry dla przycisku „Standardowo”. Sortowanie
 * dzieje się na serwerze, a do przeglądarki idzie sama kolejność.
 * Sort jest stabilny, więc remisy zachowują kolejność z bazy.
 */
export function sortPlayersStandard<T extends UIPlayerData>(players: T[]): T[] {
  return [...players].sort((a, b) => b.totalPoints - a.totalPoints);
}

/** `standardOrder: true` ustawia graczy w kolejności „Standardowo”. */
export function toPublicGameData(game: UIGameData, opts: { standardOrder?: boolean } = {}): PublicGameData {
  const players = opts.standardOrder ? sortPlayersStandard(game.detailedStats.playersData) : game.detailedStats.playersData;
  return {
    ...game,
    detailedStats: {
      ...game.detailedStats,
      playersData: players.map(toPublicPlayerData),
    },
  };
}
