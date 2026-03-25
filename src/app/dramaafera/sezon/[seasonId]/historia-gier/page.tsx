import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { HistoriaGierContent } from '@/app/dramaafera/historia-gier/HistoriaGierContent';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    return {
        alternates: {
            canonical: buildSeasonUrl('/historia-gier', seasonId),
        },
    };
}

export default async function SeasonHistoriaGierPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    return <HistoriaGierContent seasonId={seasonId} />;
}
