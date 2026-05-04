import type { Metadata } from 'next';
import { getGameDatesLightweight, getSessionSummaryByDate } from '@/app/dramaafera/_services';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { parseAndValidateSeasonId } from '@/app/dramaafera/sezon/_utils/parseSeasonId';
import WynikiClient from '@/app/dramaafera/_components/WynikiClient';
import { getDatabaseClient } from '@/app/dramaafera/_services/db';
import { withoutDeleted } from '@/app/api/schema/common';

interface PageProps {
    params: Promise<{ seasonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);
    return {
        alternates: {
            canonical: buildSeasonUrl('/wyniki', seasonId),
        },
    };
}

export default async function SeasonWynikiPage({ params }: PageProps) {
    const { seasonId: seasonIdStr } = await params;
    const seasonId = parseAndValidateSeasonId(seasonIdStr);

    const { dates } = await getGameDatesLightweight(false, seasonId);

    // Pobierz Lista Cweli
    const prisma = await getDatabaseClient();
    let listaCweli: Array<{
        id: number;
        date: string;
        displayDate: string;
        players: Array<{ name: string }>;
    }> = [];

    if (prisma) {
        try {
            const lists = await prisma.gameSessionList.findMany({
                where: {
                    season: seasonId,
                    ...withoutDeleted,
                },
                orderBy: {
                    date: 'desc',
                },
            });

            listaCweli = lists.map((list) => {
                const players = JSON.parse(list.playerNames) as string[];
                const dateObj = new Date(list.date);
                
                return {
                    id: list.id,
                    date: dateObj.toISOString().split('T')[0],
                    displayDate: dateObj.toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                    players: players.map((name) => ({ name })),
                };
            });
        } catch (error) {
            console.error('Error fetching Lista Cweli:', error);
        }
    }

    const latestDate = dates.length > 0 ? dates[0].date : null;
    const initialResults = latestDate
        ? await getSessionSummaryByDate(latestDate, seasonId)
        : null;

    return (
        <WynikiClient
            initialDates={dates}
            initialResults={initialResults}
            seasonId={seasonId}
            listaCweli={listaCweli}
        />
    );
}
