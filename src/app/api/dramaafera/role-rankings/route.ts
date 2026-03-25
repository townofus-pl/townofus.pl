import { NextRequest, NextResponse } from 'next/server';
import { generateRoleRankingStats } from '@/app/dramaafera/_services';
import { withCors } from '@/app/api/_middlewares';

async function getHandler(request: NextRequest): Promise<Response> {
    try {
        const { searchParams } = new URL(request.url);
        const sortField = searchParams.get('sortField') || 'winRate';
        const sortDirection = searchParams.get('sortDirection') || 'desc';
        const teamFilter = searchParams.get('teamFilter') || 'all';

        const roleStats = await generateRoleRankingStats();

        // Map service type to response format (name → role for backwards compatibility)
        let data = roleStats.map(r => ({
            role: r.name,
            displayName: r.displayName,
            team: r.team,
            color: r.color,
            winRate: r.winRate,
            gamesPlayed: r.gamesPlayed,
            wins: r.wins,
        }));

        // Filter by team
        if (teamFilter !== 'all') {
            data = data.filter(r => r.team === teamFilter);
        }

        // Sort
        data.sort((a, b) => {
            let valueA: string | number;
            let valueB: string | number;

            switch (sortField) {
                case 'name':
                    valueA = a.displayName.toLowerCase();
                    valueB = b.displayName.toLowerCase();
                    break;
                case 'winRate':
                    valueA = a.winRate;
                    valueB = b.winRate;
                    break;
                case 'gamesPlayed':
                    valueA = a.gamesPlayed;
                    valueB = b.gamesPlayed;
                    break;
                case 'wins':
                    valueA = a.wins;
                    valueB = b.wins;
                    break;
                default:
                    valueA = a.winRate;
                    valueB = b.winRate;
            }

            if (sortDirection === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error('Error fetching role rankings:', error);
        return NextResponse.json(
            { success: false, error: 'Błąd pobierania rankingu ról' },
            { status: 500 }
        );
    }
}

export const GET = withCors(getHandler);
