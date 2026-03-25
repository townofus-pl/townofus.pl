import { NextRequest, NextResponse } from 'next/server';
import { getWeeklyStats } from '@/app/dramaafera/_services';
import { withCors } from '@/app/api/_middlewares';
import { z } from 'zod';

const DateParamSchema = z.string().regex(/^\d{8}$/, 'Data musi być w formacie YYYYMMDD');

async function getHandler(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
): Promise<Response> {
    try {
        const { date: rawDate } = await params;
        const dateResult = DateParamSchema.safeParse(rawDate);

        if (!dateResult.success) {
            return NextResponse.json(
                { success: false, error: 'Nieprawidłowy format daty — wymagany YYYYMMDD' },
                { status: 400 }
            );
        }

        const date = dateResult.data;
        const data = await getWeeklyStats(date);

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error in weekly-stats API:', error);
        return NextResponse.json(
            { success: false, error: 'Błąd serwera' },
            { status: 500 }
        );
    }
}

export const GET = withCors(getHandler);
