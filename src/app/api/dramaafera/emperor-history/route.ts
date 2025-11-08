import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';

export const runtime = 'edge';

const withoutDeleted = { deletedAt: null } as const;

interface EmperorEntry {
    nickname: string;
    count: number;
    dates: string[];
    isLatest: boolean;
}

export async function GET(request: NextRequest) {
    try {
        // Pobierz Cloudflare context i Prisma client
        const { env } = await getCloudflareContext();
        const prisma = getPrismaClient(env.DB);

        // Pobierz wszystkie gry
        const allGames = await prisma.game.findMany({
            where: withoutDeleted,
            select: {
                id: true,
                startTime: true,
                gamePlayerStatistics: {
                    select: {
                        playerId: true,
                        totalPoints: true,
                        player: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });

        // Pogrupuj gry po dacie (YYYY-MM-DD)
        const gamesByDate = new Map<string, typeof allGames>();
        allGames.forEach(game => {
            const dateKey = game.startTime.toISOString().split('T')[0];
            if (!gamesByDate.has(dateKey)) {
                gamesByDate.set(dateKey, []);
            }
            gamesByDate.get(dateKey)!.push(game);
        });

        // Pobierz wszystkie unikalne daty i posortuj
        const allDates = Array.from(gamesByDate.keys()).sort();

        if (allDates.length === 0) {
            return NextResponse.json({
                success: true,
                data: []
            });
        }

        // Dla każdej daty znajdź Emperora (gracza z największą liczbą DAP)
        const emperorsByDate: Array<{ date: string; nickname: string }> = [];
        
        // Bierzemy wszystkie dni (włącznie z najnowszym)
        for (let i = 0; i < allDates.length; i++) {
            const dateKey = allDates[i];
            const gamesOnDate = gamesByDate.get(dateKey)!;
            
            // Oblicz sumę punktów dla każdego gracza w tym dniu
            const playerPoints = new Map<string, { playerId: number; points: number }>();
            
            gamesOnDate.forEach(game => {
                game.gamePlayerStatistics.forEach(stat => {
                    const nickname = stat.player.name;
                    const current = playerPoints.get(nickname);
                    if (current) {
                        current.points += stat.totalPoints;
                    } else {
                        playerPoints.set(nickname, {
                            playerId: stat.playerId,
                            points: stat.totalPoints
                        });
                    }
                });
            });

            // Znajdź maksymalną liczbę punktów
            if (playerPoints.size === 0) continue;
            
            const maxPoints = Math.max(...Array.from(playerPoints.values()).map(p => p.points));
            const playersWithMaxPoints = Array.from(playerPoints.entries())
                .filter(([_, data]) => data.points === maxPoints)
                .map(([nickname, _]) => nickname);

            // Jeśli tylko jeden gracz ma najwięcej punktów, jest Emperorem tego dnia
            if (playersWithMaxPoints.length === 1) {
                emperorsByDate.push({
                    date: dateKey,
                    nickname: playersWithMaxPoints[0]
                });
            }
        }

        // Grupuj po nickname i zlicz wystąpienia
        const emperorMap = new Map<string, { count: number; dates: string[] }>();
        
        emperorsByDate.forEach(({ date, nickname }) => {
            const existing = emperorMap.get(nickname);
            if (existing) {
                existing.count++;
                existing.dates.push(date);
            } else {
                emperorMap.set(nickname, {
                    count: 1,
                    dates: [date]
                });
            }
        });

        // Najnowszy Emperor (ostatnia data w emperorsByDate)
        const latestEmperor = emperorsByDate.length > 0 
            ? emperorsByDate[emperorsByDate.length - 1].nickname 
            : null;

        // Konwertuj na tablicę i sortuj po liczbie zwycięstw (malejąco)
        const emperorList: EmperorEntry[] = Array.from(emperorMap.entries())
            .map(([nickname, data]) => ({
                nickname,
                count: data.count,
                dates: data.dates,
                isLatest: nickname === latestEmperor
            }))
            .sort((a, b) => b.count - a.count);

        return NextResponse.json({
            success: true,
            data: emperorList
        });

    } catch (error) {
        console.error('Error fetching emperor history:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch emperor history',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
