import { NextRequest, NextResponse } from 'next/server';
import { withCors } from '../../../_middlewares/cors';
import { z } from 'zod';
import { getPrismaClient } from '../../../_database';
import { getCloudflareContext } from '@opennextjs/cloudflare';

// Schema walidacji parametrów
const WeeklyStatsQuerySchema = z.object({
    date: z.string().regex(/^\d{8}$/, 'Date must be in YYYYMMDD format')
});

// Typ dla wyników
interface WeeklyPlayerStats {
    nickname: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    position: number;
    totalPoints: number;
}

async function getWeeklyStats(dateStr: string, d1Database: any): Promise<WeeklyPlayerStats[]> {
    const prisma = getPrismaClient(d1Database);
    
    // Parsowanie daty
    const year = parseInt(dateStr.substring(0, 4));
    const month = parseInt(dateStr.substring(4, 6));
    const day = parseInt(dateStr.substring(6, 8));
    
    // Obliczanie zakresu tygodnia (od poniedziałku do niedzieli)
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay(); // 0 = niedziela, 1 = poniedziałek, itd.
    
    // Obliczanie początku tygodnia (poniedziałek)
    const startOfWeek = new Date(targetDate);
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Jeśli niedziela, cofnij o 6 dni
    startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Obliczanie końca tygodnia (niedziela)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    endOfWeek.setHours(0, 0, 0, 0);
    
    console.log(`Fetching stats for week: ${startOfWeek.toISOString()} - ${endOfWeek.toISOString()}`);
    
    // Pobranie gier z tego tygodnia
    const weeklyGames = await prisma.game.findMany({
        where: {
            startTime: {
                gte: startOfWeek,
                lt: endOfWeek
            },
            deletedAt: null
        },
        include: {
            gamePlayerStatistics: {
                include: {
                    player: true
                }
            }
        }
    });
    
    if (weeklyGames.length === 0) {
        return [];
    }
    
    // Jeśli nie ma gier w tym tygodniu, zwróć przykładowe dane dla demonstracji
    if (weeklyGames.length === 0) {
        // Mock data tylko dla celów demonstracyjnych - usuń to gdy baza będzie miała prawdziwe dane
        const mockData: WeeklyPlayerStats[] = [
            { nickname: "ziomson", gamesPlayed: 15, wins: 12, winRate: 80, position: 1, totalPoints: 245.8 },
            { nickname: "Malkiz", gamesPlayed: 12, wins: 8, winRate: 67, position: 2, totalPoints: 189.4 },
            { nickname: "nevs", gamesPlayed: 10, wins: 6, winRate: 60, position: 3, totalPoints: 156.2 },
            { nickname: "smoqu", gamesPlayed: 8, wins: 4, winRate: 50, position: 4, totalPoints: 123.1 },
            { nickname: "Fearu", gamesPlayed: 9, wins: 4, winRate: 44, position: 5, totalPoints: 98.7 },
            { nickname: "Budyn", gamesPlayed: 11, wins: 4, winRate: 36, position: 6, totalPoints: 87.3 },
            { nickname: "Bartek", gamesPlayed: 7, wins: 2, winRate: 29, position: 7, totalPoints: 64.5 },
        ];
        console.log(`No games found for week ${startOfWeek.toISOString()} - ${endOfWeek.toISOString()}, returning mock data`);
        return mockData;
    }

    // Agregacja statystyk dla każdego gracza
    const playerStatsMap = new Map<string, {
        gamesPlayed: number;
        wins: number;
        totalPoints: number;
    }>();
    
    weeklyGames.forEach(game => {
        game.gamePlayerStatistics.forEach(stat => {
            const playerName = stat.player.name;
            
            if (!playerStatsMap.has(playerName)) {
                playerStatsMap.set(playerName, {
                    gamesPlayed: 0,
                    wins: 0,
                    totalPoints: 0
                });
            }
            
            const playerStats = playerStatsMap.get(playerName)!;
            playerStats.gamesPlayed++;
            if (stat.win) {
                playerStats.wins++;
            }
            playerStats.totalPoints += stat.totalPoints;
        });
    });
    
    // Konwersja do finalnego formatu i sortowanie
    const weeklyStats: WeeklyPlayerStats[] = Array.from(playerStatsMap.entries())
        .map(([nickname, stats]) => ({
            nickname,
            gamesPlayed: stats.gamesPlayed,
            wins: stats.wins,
            winRate: stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0,
            totalPoints: Math.round(stats.totalPoints * 100) / 100,
            position: 0 // Będzie przypisane po sortowaniu
        }))
        .filter(player => player.gamesPlayed >= 3) // Minimum 3 gry w tygodniu
        .sort((a, b) => {
            // Sortowanie według win rate, potem według liczby wygranych, potem według punktów
            if (b.winRate !== a.winRate) {
                return b.winRate - a.winRate;
            }
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            return b.totalPoints - a.totalPoints;
        });
    
    // Przypisanie pozycji
    weeklyStats.forEach((player, index) => {
        player.position = index + 1;
    });
    
    return weeklyStats.slice(0, 10); // Top 10 graczy
}

async function handler(request: NextRequest, context: { params: Promise<{ date: string }> }) {
    const params = await context.params;
    
    try {
        // Get Cloudflare context for D1 database
        const { env } = await getCloudflareContext();
        
        // Walidacja parametrów
        const { date } = WeeklyStatsQuerySchema.parse(params);
        
        // Pobranie statystyk tygodniowych
        const weeklyStats = await getWeeklyStats(date, env.DB);
        
        return NextResponse.json({
            success: true,
            data: {
                date,
                weekRange: {
                    year: parseInt(date.substring(0, 4)),
                    month: parseInt(date.substring(4, 6)),
                    day: parseInt(date.substring(6, 8))
                },
                players: weeklyStats,
                totalPlayers: weeklyStats.length
            }
        });
        
    } catch (error) {
        console.error('Error in weekly-stats API:', error);
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Invalid request parameters', 
                    details: error.errors 
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Internal server error' 
            },
            { status: 500 }
        );
    }
}

// Wrapper function to handle route params extraction
async function publicHandler(request: NextRequest) {
    // Extract route parameters manually from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const date = pathSegments[pathSegments.length - 1]; // Last segment should be the date
    
    const mockContext = {
        params: Promise.resolve({ date })
    };
    
    return handler(request, mockContext);
}

// Public endpoint - no authentication required for weekly summaries
export const GET = withCors(publicHandler);