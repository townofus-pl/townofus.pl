import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { formatDisplayDate } from '@/app/dramaafera/_utils/gameUtils';
import { DateGamesContent } from '@/app/dramaafera/historia-gier/[date]/DateGamesContent';

interface PageProps {
    params: Promise<{ seasonId: string; date: string }>;
}

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr, date } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    const formattedDate = formatDisplayDate(date);
    return {
        title: `Drama Afera - ${formattedDate}`,
        alternates: {
            canonical: buildSeasonUrl(`/historia-gier/${date}`, seasonId),
        },
    };
}

export default async function SeasonDateGamesPage({ params }: PageProps) {
    const { seasonId: seasonIdStr, date } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    return <DateGamesContent date={date} seasonId={seasonId} />;
}
