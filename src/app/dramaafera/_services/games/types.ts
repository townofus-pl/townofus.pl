// Types and interfaces for the games domain.

import type { GamePlayerStatistics, PlayerRole, PlayerModifier } from '@prisma/client';

// Type for game statistics with included relationships
export type GamePlayerStatisticsWithRelations = GamePlayerStatistics & {
  roleHistory: PlayerRole[];
  modifiers: PlayerModifier[];
};

export interface GameSummary {
  id: string;
  date: string;
  gameNumber: number;
  duration: string;
  players: number;
  winner: string;
  winnerColor: string;
  winCondition: string;
  map: string;
  winnerNames: string[];
  winnerColors: Record<string, string>;
  allPlayerNames: string[];
}

export interface DateWithGames {
  date: string; // format YYYYMMDD
  displayDate: string; // format wyświetlany użytkownikowi
  games: GameSummary[];
  totalGames: number;
}

// Interface for UI player data (compatible with existing components)
export interface UIPlayerData {
  nickname: string;
  role: string;
  roleColor: string;
  roleHistory?: string[];
  modifiers: string[];
  modifierColors: string[];
  team: string;
  survived: boolean;
  tasksCompleted: number;
  totalTasks?: number;
  kills: number;
  deaths: number;
  meetings?: number;
  totalPoints: number;
  win: boolean;
  correctKills: number;
  incorrectKills: number;
  correctProsecutes: number;
  incorrectProsecutes: number;
  correctGuesses: number;
  incorrectGuesses: number;
  correctDeputyShoots: number;
  incorrectDeputyShoots: number;
  correctJailorExecutes: number;
  incorrectJailorExecutes: number;
  correctMedicShields: number;
  incorrectMedicShields: number;
  correctWardenFortifies: number;
  incorrectWardenFortifies: number;
  janitorCleans: number;
  completedTasks: number;
  survivedRounds: number;
  correctAltruistRevives: number;
  incorrectAltruistRevives: number;
  correctSwaps: number;
  incorrectSwaps: number;
  originalStats: {
    playerName: string;
    roleHistory: string[];
    modifiers: string[];
    win: number;
    disconnected?: number;
    initialRolePoints: number;
    correctKills: number;
    incorrectKills: number;
    correctProsecutes: number;
    incorrectProsecutes: number;
    correctGuesses: number;
    incorrectGuesses: number;
    correctDeputyShoots: number;
    incorrectDeputyShoots: number;
    correctJailorExecutes: number;
    incorrectJailorExecutes: number;
    correctMedicShields: number;
    incorrectMedicShields: number;
    correctWardenFortifies: number;
    incorrectWardenFortifies: number;
    janitorCleans: number;
    completedTasks: number;
    survivedRounds?: number;
    correctAltruistRevives: number;
    incorrectAltruistRevives: number;
    correctSwaps: number;
    incorrectSwaps: number;
    totalPoints: number;
  };
}

export interface UIGameEvent {
  timestamp: string;
  type: 'kill' | 'meeting' | 'vote' | 'task' | 'sabotage' | 'fix' | 'vent' | 'other';
  player: string;
  target?: string;
  description: string;
}

export interface UIMeetingData {
  meetingNumber: number;
  deathsSinceLastMeeting: string[];
  votes: { [playerName: string]: string[] };
  skipVotes: string[];
  noVotes: string[];
  blackmailedPlayers?: string[];
  jailedPlayers?: string[];
  wasTie: boolean;
  wasBlessed: boolean;
}

// Interface for UI game data (compatible with existing components)
export interface UIGameData {
  id: string;
  date: string;
  gameNumber: number;
  startTime: string;
  endTime: string;
  duration: string;
  map: string;
  winner: string;
  winnerColor: string;
  winCondition: string;
  winnerNames: string[];
  winnerColors: Record<string, string>;
  players: number;
  maxTasks?: number;
  detailedStats: {
    playersData: UIPlayerData[];
    events: UIGameEvent[];
    meetings: UIMeetingData[];
    gameSettings?: Record<string, unknown> | null;
  };
}

// Type alias for backward compatibility
export type DetailedGameData = UIGameData;
