import { notFound } from 'next/navigation';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { PodsumowaniePageContent } from '@/app/dramaafera/historia-gier/[date]/podsumowanie/PodsumowaniePageContent';

interface PageProps {
    params: Promise<{ seasonId: string; date: string }>;
}

export default async function SeasonPodsumowaniePage({ params }: PageProps) {
    const { seasonId: seasonIdStr, date } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    return <PodsumowaniePageContent date={date} seasonId={seasonId} />;
}
