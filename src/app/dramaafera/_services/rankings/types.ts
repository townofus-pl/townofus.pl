// Types and interfaces for the rankings domain.

// Interface for ranking statistics
export interface PlayerRankingStats {
  name: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  rankingPoints?: number;
}

// Interface for role ranking statistics
export interface RoleRankingStats {
  name: string;
  displayName: string;
  color: string;
  team: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
  averagePoints: number;
  players: Array<{
    playerName: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    averagePoints: number;
  }>;
}
