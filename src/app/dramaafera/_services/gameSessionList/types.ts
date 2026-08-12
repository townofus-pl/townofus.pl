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

export interface PlayerPickerData {
  seasonPlayers: Array<{ name: string; lastGameDate: string | null }>; // has a game this season — most recent game first
  otherPlayers: Array<{ name: string; lastGameDate: string | null }>; // most recent game first, never-played last
}
