// Types and interfaces for the players domain.

export interface PlayerStats {
  nickname: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPoints: number;
  averagePoints: number;
  roles: Record<string, number>;
  modifiers: Record<string, number>;
  favoriteRole: string;
  favoriteTeam: string;
  teamStats: {
    crewmate: { games: number; wins: number };
    impostor: { games: number; wins: number };
    neutral: { games: number; wins: number };
  };
}

// Interface for user profile statistics
export interface UserProfileStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  impostorGames: number;
  crewmateGames: number;
  neutralGames: number;
  totalTasks: number;
  maxTasks: number;
  correctKills: number;
  incorrectKills: number;
  correctGuesses: number;
  incorrectGuesses: number;
  correctProsecutes: number;
  incorrectProsecutes: number;
  correctDeputyShoots: number;
  incorrectDeputyShoots: number;
  correctJailorExecutes: number;
  incorrectJailorExecutes: number;
  correctMedicShields: number;
  incorrectMedicShields: number;
  correctWardenFortifies: number;
  incorrectWardenFortifies: number;
  janitorCleans: number;
  survivedRounds: number;
  totalRounds: number;
  correctAltruistRevives: number;
  incorrectAltruistRevives: number;
  correctSwaps: number;
  incorrectSwaps: number;
}

// Interface for ranking history point
export interface RankingHistoryPoint {
  date: Date;
  score: number;
  reason?: string;
  gameId?: number;
  gameIdentifier?: string;
}

// Interface for player's top games
export interface PlayerTopGame {
  gameIdentifier: string;
  date: Date;
  map: string;
  duration: string;
  role: string;
  roleColor: string;
  team: string;
  win: boolean;
  totalPoints: number;
}

// Interface for voting statistics
export interface VotingStatistics {
  // Podstawowe statystyki
  totalVotesCast: number;        // Ile razy gracz głosował na kogokolwiek
  totalVotesReceived: number;    // Ile razy inni głosowali na tego gracza
  timesVotedOut: number;         // Ile razy został wyrzucony przez głosowanie

  // Skip rate
  totalMeetings: number;         // Łączna liczba spotkań
  skipVotes: number;             // Ile razy skipował
  skipRate: number;              // Procent skipów

  // Bandwagon factor
  bandwagonFactor: number;       // Jak często głosuje z większością (0-100%)

  // Ranking ofiar
  votingTargets: Array<{
    playerName: string;
    voteCount: number;
    percentage: number;
  }>;

  // Ranking prześladowców
  votedByPlayers: Array<{
    playerName: string;
    voteCount: number;
    percentage: number;
  }>;
}
