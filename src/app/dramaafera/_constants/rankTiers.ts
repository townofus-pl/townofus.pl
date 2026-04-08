// Canonical tier definitions — sorted by minRating descending
// This file is intentionally free of next/font imports so it can be safely
// imported from client components such as RankingClient without pulling in
// the font-loader side-effect from PodsumowanieClient/constants.ts.
export const RANK_TIERS: readonly { minRating: number; name: string; color: string }[] = [
    { minRating: 2500, name: 'PIERDOLONA LEGENDA', color: 'rgb(114, 5, 14)' },
    { minRating: 2400, name: 'CELESTIAL OVERLORD', color: 'rgb(147, 112, 219)' },
    { minRating: 2300, name: 'GRANDMASTER', color: 'rgb(255, 215, 0)' },
    { minRating: 2200, name: 'MASTER', color: 'rgb(220, 220, 220)' },
    { minRating: 2137, name: 'VIRTUOSO', color: 'rgb(0, 0, 0)' },
    { minRating: 2075, name: 'SPECIALIST', color: 'rgb(0, 0, 0)' },
    { minRating: 2025, name: 'CAPTAIN', color: 'rgb(0, 0, 0)' },
    { minRating: 1975, name: 'CREWMATE', color: 'rgb(0, 0, 0)' },
    { minRating: 1925, name: 'CADET', color: 'rgb(0, 0, 0)' },
    { minRating: 1850, name: 'PISSLOW', color: 'rgb(0, 0, 0)' },
    { minRating: 1767, name: 'CWEL', color: 'rgb(0, 0, 0)' },
    { minRating: 0, name: 'BAROX', color: 'rgb(95, 49, 22)' },
];

// Ranking tier name from rating
export function getRankName(rating: number): string {
    const tier = RANK_TIERS.find(t => rating >= t.minRating);
    return tier?.name ?? 'BAROX';
}
