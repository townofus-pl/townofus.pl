import type { Metadata } from 'next';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';

interface PodsumowanieLayoutProps {
    params: Promise<{
        seasonId: string;
        date: string;
    }>;
    children: React.ReactNode;
}

function formatDisplayDate(dateString: string): string {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}.${month}.${year}`;
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
