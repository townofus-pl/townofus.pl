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
    tiedThirdPlaceHistory1: 2,
    tiedThirdPlaceHistory2: 3,
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

// Re-export tier definitions from the font-free canonical source
export { RANK_TIERS, getRankName } from '@/app/dramaafera/_constants/rankTiers';

