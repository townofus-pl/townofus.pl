import type { Metadata } from 'next';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { formatDisplayDate } from '@/app/dramaafera/_utils/gameUtils';

interface PodsumowanieLayoutProps {
    params: Promise<{
        seasonId: string;
        date: string;
    }>;
    children: React.ReactNode;
}

export async function generateMetadata({ params }: PodsumowanieLayoutProps): Promise<Metadata> {
    const { date, seasonId: seasonIdStr } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    const formattedDate = formatDisplayDate(date);

    return {
        title: `Drama Afera - Podsumowanie - ${formattedDate}`,
        alternates: {
            canonical: buildSeasonUrl(`/historia-gier/${date}/podsumowanie`, seasonId),
        },
    };
}

export default function PodsumowanieLayout({ children }: { children: React.ReactNode }) {
    return children;
}
