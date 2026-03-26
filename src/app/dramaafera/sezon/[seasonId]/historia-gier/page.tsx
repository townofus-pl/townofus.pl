import type { Metadata } from 'next';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
import { HistoriaGierContent } from '@/app/dramaafera/historia-gier/HistoriaGierContent';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);
    return {
        alternates: {
            canonical: buildSeasonUrl('/historia-gier', seasonId),
        },
    };
}

export default async function SeasonHistoriaGierPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);

    return <HistoriaGierContent seasonId={seasonId} />;
}
