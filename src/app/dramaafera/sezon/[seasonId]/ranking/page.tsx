import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getRanking } from '@/app/dramaafera/_services';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import RankingClient from '@/app/dramaafera/_components/RankingClient';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    if (!getSeasonById(seasonId)) {
        notFound();
    }
    return {
        alternates: {
            canonical: buildSeasonUrl('/ranking', seasonId),
        },
    };
}

export default async function SeasonRankingPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    const { ranking } = await getRanking(seasonId);
    return <RankingClient initialData={ranking} seasonId={seasonId} />;
}
