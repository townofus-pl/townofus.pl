export interface Season {
  id: number;
  startDate: string | null; // ISO date, null = beginning of time; endDate is derived from next season's startDate
}

// Date ranges used for auto-determining season on game creation.
// A season ends when the next one begins — no explicit endDate needed.
export const SEASONS: Season[] = [
  { id: 2, startDate: null },
  { id: 3, startDate: '2026-03-23' },
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
    const nextSeason = SEASONS[i + 1];
    const startOk = !season.startDate || date >= new Date(season.startDate);
    const endOk = !nextSeason || date < new Date(nextSeason.startDate!);
    if (startOk && endOk) return season.id;
  }
  return CURRENT_SEASON;
}
