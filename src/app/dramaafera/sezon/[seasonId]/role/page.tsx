import { notFound } from 'next/navigation';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import InnePage from '../../../role/page';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export default async function SeasonRolePage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    return <InnePage />;
}
