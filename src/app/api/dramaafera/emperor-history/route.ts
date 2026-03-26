import { NextRequest, NextResponse } from 'next/server';
import { getEmperorHistory } from '@/app/dramaafera/_services';
import { withCors } from '@/app/api/_middlewares';

async function getHandler(_request: NextRequest): Promise<Response> {
    try {
        const data = await getEmperorHistory();

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
