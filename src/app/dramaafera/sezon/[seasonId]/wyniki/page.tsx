import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGameDatesLightweight, getSessionSummaryByDate } from '@/app/dramaafera/_services';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import WynikiClient from '@/app/dramaafera/_components/WynikiClient';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    return {
        alternates: {
            canonical: buildSeasonUrl('/wyniki', seasonId),
        },
    };
}

export default async function SeasonWynikiPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    const { dates } = await getGameDatesLightweight(false, seasonId);
    const latestDate = dates.length > 0 ? dates[0].date : null;
    const initialResults = latestDate
        ? await getSessionSummaryByDate(latestDate, seasonId)
        : null;

    return (
        <WynikiClient
            initialDates={dates}
            initialResults={initialResults}
            seasonId={seasonId}
        />
    );
}
