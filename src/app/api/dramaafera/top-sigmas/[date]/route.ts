import { NextRequest, NextResponse } from 'next/server';
import { getGamesListByDate } from '@/app/dramaafera/_services/gameDataService';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../../_database';

const withoutDeleted = { deletedAt: null } as const;

interface PlayerRankingChange {
    nickname: string;
    rankBefore: number;
    rankAfter: number;
    ratingBefore: number;
    ratingAfter: number;
    change: number;
    ratingChange: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ date: string }> }
) {
    try {
        const { date } = await params;
        const games = await getGamesListByDate(date);

        if (!games || games.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Brak gier w tym tygodniu' },
                { status: 404 }
            );
        }

        // Pobierz Cloudflare context i Prisma client
        const { env } = await getCloudflareContext();
        const prisma = getPrismaClient(env.DB);

        // Znajdź pierwsze i ostatnie gry dnia
        const sortedGames = [...games].sort((a, b) => a.id.localeCompare(b.id));
        const firstGameIdentifier = sortedGames[0]?.id;
        const lastGameIdentifier = sortedGames[sortedGames.length - 1]?.id;

        // Pobierz gry z bazy, żeby mieć ich ID numeryczne
        const firstGameDb = await prisma.game.findUnique({
            where: { gameIdentifier: firstGameIdentifier, ...withoutDeleted }
        });
        const lastGameDb = await prisma.game.findUnique({
            where: { gameIdentifier: lastGameIdentifier, ...withoutDeleted }
        });

        if (!firstGameDb || !lastGameDb) {
            return NextResponse.json(
                { success: false, error: 'Nie znaleziono gier w bazie' },
                { status: 404 }
            );
        }

        // Pobierz ranking przed pierwszą grą dnia
        const playersBeforeQuery = await prisma.$queryRaw<Array<{ playerId: number; playerName: string; score: number }>>`
            SELECT DISTINCT
                p.id as playerId,
                p.name as playerName,
                COALESCE(
                    (SELECT pr.score 
                     FROM player_rankings pr 
                     WHERE pr.playerId = p.id 
                       AND pr.deletedAt IS NULL
                       AND (pr.gameId IS NULL OR pr.gameId < ${firstGameDb.id})
                     ORDER BY pr.createdAt DESC 
                     LIMIT 1),
                    2000
                ) as score
            FROM players p
            WHERE p.deletedAt IS NULL
        `;

        // Pobierz ranking po ostatniej grze dnia
        const playersAfterQuery = await prisma.$queryRaw<Array<{ playerId: number; playerName: string; score: number }>>`
            SELECT DISTINCT
                p.id as playerId,
                p.name as playerName,
                COALESCE(
                    (SELECT pr.score 
                     FROM player_rankings pr 
                     WHERE pr.playerId = p.id 
                       AND pr.deletedAt IS NULL
                       AND (pr.gameId IS NULL OR pr.gameId <= ${lastGameDb.id})
                     ORDER BY pr.createdAt DESC 
                     LIMIT 1),
                    2000
                ) as score
            FROM players p
            WHERE p.deletedAt IS NULL
        `;

        // Stwórz mapy rankingów
        const rankingBeforeMap = new Map<string, number>(
            playersBeforeQuery.map((r: { playerName: string; score: number }) => [r.playerName, r.score])
        );
        
        const rankingAfterMap = new Map<string, number>(
            playersAfterQuery.map((r: { playerName: string; score: number }) => [r.playerName, r.score])
        );

        // Posortuj rankingi przed i po, żeby określić pozycje
        const sortedBefore = Array.from(rankingBeforeMap.entries())
            .sort((a, b) => (b[1] as number) - (a[1] as number));
        const sortedAfter = Array.from(rankingAfterMap.entries())
            .sort((a, b) => (b[1] as number) - (a[1] as number));

        const rankPositionBefore = new Map(
            sortedBefore.map(([name], index) => [name, index + 1])
        );
        const rankPositionAfter = new Map(
            sortedAfter.map(([name], index) => [name, index + 1])
        );

        // Zbierz graczy którzy grali w tej sesji
        const allPlayerNames = new Set<string>();
        for (const game of games) {
            for (const playerName of game.allPlayerNames) {
                allPlayerNames.add(playerName);
            }
        }

        // Oblicz zmiany w rankingu
        const rankingChanges: PlayerRankingChange[] = Array.from(allPlayerNames)
            .map(playerName => {
                const rankBefore = rankPositionBefore.get(playerName) || 0;
                const rankAfter = rankPositionAfter.get(playerName) || 0;
                const ratingBefore = rankingBeforeMap.get(playerName) || 2000;
                const ratingAfter = rankingAfterMap.get(playerName) || 2000;
                
                return {
                    nickname: playerName,
                    rankBefore,
                    rankAfter,
                    ratingBefore: Number(ratingBefore),
                    ratingAfter: Number(ratingAfter),
                    change: rankBefore - rankAfter, // Dodatnia wartość = awans
                    ratingChange: Number(ratingAfter) - Number(ratingBefore)
                };
            })
            .filter(p => p.rankBefore > 0 && p.rankAfter > 0) // Tylko gracze z rankingiem
            .sort((a, b) => b.ratingChange - a.ratingChange); // Sortuj od największej różnicy ratingu

        return NextResponse.json({
            success: true,
            data: rankingChanges
        });

    } catch (error) {
        console.error('Error fetching top sigmas:', error);
        return NextResponse.json(
            { success: false, error: 'Błąd serwera' },
            { status: 500 }
        );
    }
}
