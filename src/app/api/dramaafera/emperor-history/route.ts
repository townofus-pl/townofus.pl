import { NextRequest, NextResponse } from 'next/server';
import { getEmperorHistory } from '@/app/dramaafera/_services';
import { withCors } from '@/app/api/_middlewares';
import { resolveSeasonParam } from '@/app/api/_utils';

async function getHandler(request: NextRequest): Promise<Response> {
    try {
        const season = resolveSeasonParam(request);
        if (season === null) {
            return NextResponse.json(
                { success: false, error: 'Nieprawidłowy numer sezonu — wymagana liczba całkowita' },
                { status: 400 }
            );
        }

        const data = await getEmperorHistory(season);

        return NextResponse.json({
            success: true,
            data
        });

    } catch (error) {
        console.error('Error fetching emperor history:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Błąd pobierania historii Imperatora',
                details: error instanceof Error ? error.message : 'Nieznany błąd'
            },
            { status: 500 }
        );
    }
}

export const GET = withCors(getHandler);
