import type { Metadata } from 'next';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
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
    const seasonId = parseAndValidateSeasonId(seasonIdStr);
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
    const seasonId = parseAndValidateSeasonId(seasonIdStr);

    return <DateGamesContent date={date} seasonId={seasonId} />;
}
