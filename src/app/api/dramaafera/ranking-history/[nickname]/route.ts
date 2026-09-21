import { NextRequest, NextResponse } from 'next/server';
import { getPlayerRankingHistory } from '@/app/dramaafera/_services';
import { withCors } from '@/app/api/_middlewares';
import { resolveSeasonParam } from '@/app/api/_utils';

async function getHandler(
    request: NextRequest,
    { params }: { params: Promise<{ nickname: string }> }
) {
    try {
        const { nickname } = await params;
        const decodedNickname = decodeURIComponent(nickname);

        const season = resolveSeasonParam(request);
        if (season === null) {
            return NextResponse.json(
                { success: false, error: 'Nieprawidłowy numer sezonu — wymagana liczba całkowita' },
                { status: 400 }
            );
        }

        // Pobierz historię rankingu z serwisu
        const rankingHistory = await getPlayerRankingHistory(decodedNickname, season);

        if (!rankingHistory || rankingHistory.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Brak danych historycznych' },
                { status: 404 }
            );
        }

        // Konwertuj daty na format JSON
        const formattedHistory = rankingHistory.map(point => ({
            date: point.date.toISOString(),
            rating: point.score,
            position: 0, // TODO: oblicz pozycję w rankingu na podstawie score
            gameId: point.gameId,
            gameIdentifier: point.gameIdentifier
        }));

        return NextResponse.json({
            success: true,
            data: formattedHistory
        });

    } catch (error) {
        console.error('Error fetching ranking history:', error);
        return NextResponse.json(
            { success: false, error: 'Błąd serwera' },
            { status: 500 }
        );
    }
}

export const GET = withCors(getHandler);
