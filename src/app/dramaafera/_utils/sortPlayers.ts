export type PlayerSortKey = 'name' | 'games' | 'wins' | 'loses' | 'winRatio';

export interface PlayerSort {
  key: PlayerSortKey;
  ascending: boolean;
}

export interface SortablePlayer {
  name: string;
  games: number;
  wins: number;
  loses: number;
  winRatio: number;
}

// Serwer zwraca graczy według W/R malejąco, więc ten stan nie zmienia ich kolejności.
export const DEFAULT_PLAYER_SORT: PlayerSort = { key: 'winRatio', ascending: false };

// Pierwsze kliknięcie: nazwy od A do Z, liczby od największej. Kolejne odwraca kierunek.
export function nextPlayerSort(current: PlayerSort, key: PlayerSortKey): PlayerSort {
  if (current.key === key) return { key, ascending: !current.ascending };
  return { key, ascending: key === 'name' };
}

// Remisy zachowują kolejność z serwera, bo Array.prototype.sort jest stabilne.
export function sortPlayers<T extends SortablePlayer>(players: T[], { key, ascending }: PlayerSort): T[] {
  const direction = ascending ? 1 : -1;
  return [...players].sort((a, b) => {
    if (key === 'name') return direction * a.name.localeCompare(b.name, 'pl');
    return direction * (a[key] - b[key]);
  });
}
