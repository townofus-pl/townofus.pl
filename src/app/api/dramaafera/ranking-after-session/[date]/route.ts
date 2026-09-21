import { NextRequest, NextResponse } from 'next/server';
import { getRankingAfterSession } from '@/app/dramaafera/_services';
import { withCors } from '@/app/api/_middlewares';
import { resolveSeasonParam } from '@/app/api/_utils';

async function getHandler(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    try {
        const { date } = await params;
        const season = resolveSeasonParam(request);
        if (season === null) {
            return NextResponse.json(
                { success: false, error: 'Nieprawidłowy numer sezonu — wymagana liczba całkowita' },
                { status: 400 }
            );
        }

        const ranking = await getRankingAfterSession(date, season);

        if (!ranking) {
            return NextResponse.json(
                { success: false, error: 'Brak gier w tym dniu' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: ranking
        });

    } catch (error) {
        console.error('Error fetching ranking after session:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Nie udało się pobrać rankingu',
                details: error instanceof Error ? error.message : 'Nieznany błąd'
            },
            { status: 500 }
        );
    }
}

export const GET = withCors(getHandler);
