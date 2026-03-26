import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { UserProfileContent } from '@/app/dramaafera/user/[nick]/UserProfileContent';

interface PageProps {
    params: Promise<{ seasonId: string; nick: string }>;
}

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr, nick } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    if (!getSeasonById(seasonId)) {
        notFound();
    }
    const playerName = decodeURIComponent(nick.replace(/-/g, ' '));
    return {
        title: `Drama Afera - ${playerName}`,
        description: `Statystyki gracza ${playerName} w Among Us Drama Afera. Historia rankingu, zagranych gier i szczegółowe statystyki.`,
        alternates: {
            canonical: buildSeasonUrl(`/user/${nick}`, seasonId),
        },
    };
}

export default async function SeasonUserProfilePage({ params }: PageProps) {
    const { seasonId: seasonIdStr, nick } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    return <UserProfileContent nick={nick} seasonId={seasonId} />;
}
