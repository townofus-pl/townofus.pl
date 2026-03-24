export interface Season {
  id: number;
  startDate: string | null; // ISO date, null = beginning of time
  endDate: string | null; // ISO date (exclusive), null = ongoing
}

// Date ranges used for auto-determining season on game creation.
// Read queries will filter directly by the `season` column once Phase 2 is implemented.
export const SEASONS: Season[] = [
  { id: 1, startDate: null, endDate: '2026-03-23' },
  { id: 2, startDate: '2026-03-23', endDate: null },
];

export const CURRENT_SEASON = 2;

export function getSeasonById(id: number): Season | undefined {
  return SEASONS.find((s) => s.id === id);
}

// Determine which season a game belongs to based on its start time.
// Used when creating new games. Iterates SEASONS in reverse to find the most recent match.
export function getSeasonForDate(date: Date): number {
  for (let i = SEASONS.length - 1; i >= 0; i--) {
    const season = SEASONS[i];
    const startOk = !season.startDate || date >= new Date(season.startDate);
    const endOk = !season.endDate || date < new Date(season.endDate);
    if (startOk && endOk) return season.id;
  }
  return CURRENT_SEASON;
}
