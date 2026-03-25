import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export default async function SeasonRootPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    redirect(buildSeasonUrl('/ranking', seasonId));
}
