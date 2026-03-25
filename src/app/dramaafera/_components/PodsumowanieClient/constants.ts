import localFont from 'next/font/local';

export const videotext = localFont({
    src: '../../_fonts/Videotext.ttf',
    display: 'swap',
    variable: '--font-videotext',
});

export const PODIUM_STANDARD_STEPS = {
    thirdPlaceReveal: 1,
    thirdPlaceHistory: 2,
    fakeSecondReveal: 4,
    fakeSecondHistory: 5,
    fakeSecondReturn: 6,
    swapReveal: 7,
    secondPlaceHistory: 8,
    total: 9
} as const;

export const PODIUM_TIE_STEPS = {
    secondPlaceReveal: 5,
    secondPlaceHistory: 6,
    firstPlaceReveal: 8,
    firstPlaceHistory: 9,
    total: 10
} as const;

export const PODIUM_SWAP_DURATION = 2600;
export const PODIUM_SWAP_SECOND_REVEAL_DELAY = 850;

// YYYYMMDD → DD.MM.YYYY
export const formatDate = (dateStr: string): string => {
    if (dateStr.length !== 8) return dateStr;
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${day}.${month}.${year}`;
};

// Ranking tier name from rating
export function getRankName(rating: number): string {
    if (rating >= 2500) return 'PIERDOLONA LEGENDA';
    if (rating >= 2400) return 'CELESTIAL OVERLORD';
    if (rating >= 2300) return 'GRANDMASTER';
    if (rating >= 2200) return 'MASTER';
    if (rating >= 2150) return 'VIRTUOSO';
    if (rating >= 2100) return 'THE SPECIALIST';
    if (rating >= 2050) return 'THE CAPTAIN';
    if (rating >= 1975) return 'THE CREWMATE';
    if (rating >= 1875) return 'THE CADET';
    if (rating >= 1750) return 'THE PISSLOW';
    return 'CWEL';
}
