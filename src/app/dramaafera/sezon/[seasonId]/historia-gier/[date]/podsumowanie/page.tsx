import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
import { PodsumowaniePageContent } from '@/app/dramaafera/historia-gier/[date]/podsumowanie/PodsumowaniePageContent';

interface PageProps {
    params: Promise<{ seasonId: string; date: string }>;
}

export default async function SeasonPodsumowaniePage({ params }: PageProps) {
    const { seasonId: seasonIdStr, date } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);

    return <PodsumowaniePageContent date={date} seasonId={seasonId} />;
}
