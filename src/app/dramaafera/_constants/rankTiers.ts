// Canonical tier definitions — sorted by minRating descending
// This file is intentionally free of next/font imports so it can be safely
// imported from client components such as RankingClient without pulling in
// the font-loader side-effect from PodsumowanieClient/constants.ts.
export const RANK_TIERS: readonly { minRating: number; name: string; color: string }[] = [
    { minRating: 2500, name: 'PIERDOLONA LEGENDA', color: 'rgb(114, 5, 14)' },
    { minRating: 2400, name: 'CELESTIAL OVERLORD', color: 'rgb(147, 112, 219)' },
    { minRating: 2300, name: 'GRANDMASTER', color: 'rgb(255, 215, 0)' },
    { minRating: 2200, name: 'MASTER', color: 'rgb(220, 220, 220)' },
    { minRating: 2150, name: 'VIRTUOSO', color: 'rgb(0, 128, 128)' },
    { minRating: 2100, name: 'THE SPECIALIST', color: 'rgb(0, 100, 180)' },
    { minRating: 2050, name: 'THE CAPTAIN', color: 'rgb(30, 80, 140)' },
    { minRating: 1975, name: 'THE CREWMATE', color: 'rgb(50, 100, 80)' },
    { minRating: 1875, name: 'THE CADET', color: 'rgb(80, 80, 80)' },
    { minRating: 1750, name: 'THE PISSLOW', color: 'rgb(100, 60, 40)' },
    { minRating: 0, name: 'CWEL', color: 'rgb(60, 20, 20)' },
];

// Ranking tier name from rating
export function getRankName(rating: number): string {
    const tier = RANK_TIERS.find(t => rating >= t.minRating);
    return tier?.name ?? 'CWEL';
}
