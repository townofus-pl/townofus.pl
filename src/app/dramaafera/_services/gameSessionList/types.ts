// Types for Game Session List (Lista Cweli)

export interface GameSessionListEntry {
  id: number;
  season: number;
  date: Date;
  playerNames: string[]; // Array of player nicknames
  createdAt: Date;
  updatedAt: Date;
}

export interface GameSessionListSummary {
  id: number;
  date: string; // ISO date string
  dateFormatted: string; // Formatted for display
  playerCount: number;
  players: Array<{
    name: string;
  }>;
}

export interface ListaCweliDisplayEntry {
  id: number;
  date: string;
  displayDate: string;
  players: Array<{ name: string; eloRanking: number | null }>;
}
