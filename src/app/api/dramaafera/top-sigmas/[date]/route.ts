import { NextRequest, NextResponse } from 'next/server';
import { getTopSigmas } from '@/app/dramaafera/_services';
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

        const result = await getTopSigmas(date, season);

        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Brak gier w tym dniu' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.all
        });

    } catch (error) {
        console.error('Error fetching top sigmas:', error);
        return NextResponse.json(
            { success: false, error: 'Błąd serwera' },
            { status: 500 }
        );
    }
}

export const GET = withCors(getHandler);
