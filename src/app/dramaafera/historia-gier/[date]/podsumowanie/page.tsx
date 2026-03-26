import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import { PodsumowaniePageContent } from './PodsumowaniePageContent';

export default async function WeeklySummaryPage({
    params,
}: {
    params: Promise<{ date: string }>;
}) {
    const { date } = await params;
    return <PodsumowaniePageContent date={date} seasonId={CURRENT_SEASON} />;
}
