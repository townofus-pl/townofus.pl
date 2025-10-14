import { NextRequest, NextResponse } from 'next/server';
import { getAllGamesData } from '@/app/dramaafera/_services/gameDataService';

interface RoleRankingData {
    role: string;
    displayName: string;
    team: string;
    color: string;
    winRate: number;
    gamesPlayed: number;
    wins: number;
    image?: string;
}

// Funkcja do generowania statystyk ról z bazy danych
function generateRoleRankingStats(games: any[]): RoleRankingData[] {
    const roleStats: Map<string, {
        wins: number;
        total: number;
        team: string;
        color: string;
        displayName: string;
        image?: string;
    }> = new Map();

    // Zliczanie statystyk dla każdej roli
    games.forEach(game => {
        game.players.forEach((player: any) => {
            const role = player.role;
            if (!role) return;

            if (!roleStats.has(role)) {
                roleStats.set(role, {
                    wins: 0,
                    total: 0,
                    team: player.team || 'Unknown',
                    color: player.roleColor || '#808080',
                    displayName: player.roleDisplayName || role,
                    image: player.roleImage
                });
            }

            const stats = roleStats.get(role)!;
            stats.total++;
            
            if (player.won) {
                stats.wins++;
            }
        });
    });

    // Konwertowanie na format finalny
    return Array.from(roleStats.entries())
        .map(([role, stats]) => ({
            role,
            displayName: stats.displayName,
            team: stats.team,
            color: stats.color,
            winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
            gamesPlayed: stats.total,
            wins: stats.wins,
            image: stats.image
        }))
        .filter(role => role.gamesPlayed > 0); // Tylko role które były grane
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sortField = searchParams.get('sortField') || 'winRate';
        const sortDirection = searchParams.get('sortDirection') || 'desc';
        const teamFilter = searchParams.get('teamFilter') || 'all';

        // Pobierz dane z bazy danych
        const games = await getAllGamesData();
        
        // Generuj statystyki ról
        let roleStats = generateRoleRankingStats(games);

        // Filtrowanie według drużyny
        if (teamFilter !== 'all') {
            roleStats = roleStats.filter(role => role.team === teamFilter);
        }

        // Sortowanie
        roleStats.sort((a, b) => {
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

        return NextResponse.json({
            success: true,
            data: roleStats
        });

    } catch (error) {
        console.error('Error fetching role rankings:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch role rankings' },
            { status: 500 }
        );
    }
}