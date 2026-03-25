import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGameDatesLightweight } from '@/app/dramaafera/_services';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import HostClient from '@/app/dramaafera/_components/HostClient';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    return {
        alternates: {
            canonical: buildSeasonUrl('/host', seasonId),
        },
    };
}

export default async function SeasonHostPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    const { dates } = await getGameDatesLightweight(false, seasonId);
    return <HostClient initialDates={dates} seasonId={seasonId} />;
}
