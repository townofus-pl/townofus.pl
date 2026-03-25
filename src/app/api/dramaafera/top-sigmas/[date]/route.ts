import { NextRequest, NextResponse } from 'next/server';
import { getTopSigmas } from '@/app/dramaafera/_services';
import { withCors } from '@/app/api/_middlewares';

async function getHandler(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    try {
        const { date } = await params;
        const result = await getTopSigmas(date);

        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Brak gier w tym dniu' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result
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
