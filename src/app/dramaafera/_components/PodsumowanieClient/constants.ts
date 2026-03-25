import localFont from 'next/font/local';

export const videotext = localFont({
    src: '../../_fonts/Videotext.ttf',
    display: 'swap',
    variable: '--font-videotext',
});

export const PODIUM_STANDARD_STEPS = {
    thirdPlaceReveal: 1,
    thirdPlaceHistory: 2,
    secondPlaceReveal: 4,
    secondPlaceHistory: 5,
    firstPlaceReveal: 7,
    firstPlaceHistory: 8,
    total: 9
} as const;

export const PODIUM_TIE_STEPS = {
    secondPlaceReveal: 5,
    secondPlaceHistory: 6,
    firstPlaceReveal: 8,
    firstPlaceHistory: 9,
    total: 10
} as const;

// YYYYMMDD → DD.MM.YYYY
export const formatDate = (dateStr: string): string => {
    if (dateStr.length !== 8) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}.${month}.${year}`;
};

// Canonical tier definitions — sorted by minRating descending
export const RANK_TIERS: readonly { minRating: number; name: string; color: string }[] = [
    { minRating: 2500, name: 'PIERDOLONA LEGENDA', color: 'rgb(114, 5, 14)' },
    { minRating: 2400, name: 'CELESTIAL OVERLORD', color: 'rgb(147, 112, 219)' },
    { minRating: 2300, name: 'GRANDMASTER', color: 'rgb(255, 215, 0)' },
    { minRating: 2200, name: 'MASTER', color: 'rgb(220, 220, 220)' },
    { minRating: 2150, name: 'VIRTUOSO', color: 'rgb(0, 0, 0)' },
    { minRating: 2100, name: 'THE SPECIALIST', color: 'rgb(0, 0, 0)' },
    { minRating: 2050, name: 'THE CAPTAIN', color: 'rgb(0, 0, 0)' },
    { minRating: 1975, name: 'THE CREWMATE', color: 'rgb(0, 0, 0)' },
    { minRating: 1875, name: 'THE CADET', color: 'rgb(0, 0, 0)' },
    { minRating: 1750, name: 'THE PISSLOW', color: 'rgb(0, 0, 0)' },
    { minRating: 0, name: 'CWEL', color: 'rgb(0, 0, 0)' },
];

// Ranking tier name from rating
export function getRankName(rating: number): string {
    const tier = RANK_TIERS.find(t => rating >= t.minRating);
    return tier?.name ?? 'CWEL';
}
