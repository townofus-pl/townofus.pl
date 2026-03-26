import type { Metadata } from 'next';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
import { formatDisplayDate } from '@/app/dramaafera/_utils/gameUtils';
import { getGamesListByDate } from '@/app/dramaafera/_services';
import { GameDetailContent } from '@/app/dramaafera/historia-gier/[date]/[gameId]/GameDetailContent';

interface PageProps {
    params: Promise<{ seasonId: string; date: string; gameId: string }>;
}

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr, date, gameId } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);
    const formattedDate = formatDisplayDate(date);
    const games = await getGamesListByDate(date, seasonId);
    const gameIndex = games.findIndex(g => g.id.toString() === gameId);
    const gameNumber = gameIndex !== -1 ? games.length - gameIndex : gameId;
    return {
        title: `Drama Afera - Gra #${gameNumber} - ${formattedDate}`,
        alternates: {
            canonical: buildSeasonUrl(`/historia-gier/${date}/${gameId}`, seasonId),
        },
    };
}

export default async function SeasonGamePage({ params }: PageProps) {
    const { seasonId: seasonIdStr, date, gameId } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);

    return <GameDetailContent date={date} gameId={gameId} seasonId={seasonId} />;
}
