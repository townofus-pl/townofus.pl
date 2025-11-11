import { NextRequest, NextResponse } from 'next/server';
import { getGamesListByDate } from '@/app/dramaafera/_services/gameDataService';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../../_database';

const withoutDeleted = { deletedAt: null } as const;

interface PlayerRanking {
    nickname: string;
    rating: number;
    position: number;
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
                { success: false, error: 'Brak gier w tym dniu' },
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

        // Pobierz gry z bazy
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

        // Pobierz ranking przed pierwszą grą
        const playersBeforeQuery = await prisma.$queryRaw<Array<{ playerId: number; playerName: string; score: number }>>`
            SELECT 
                pr1.playerId,
                p.name as playerName,
                pr1.score
            FROM player_rankings pr1
            INNER JOIN players p ON pr1.playerId = p.id
            WHERE pr1.gameId < ${firstGameDb.id}
                AND p.deletedAt IS NULL
                AND pr1.id = (
                    SELECT pr2.id
                    FROM player_rankings pr2
                    WHERE pr2.playerId = pr1.playerId 
                        AND pr2.gameId < ${firstGameDb.id}
                    ORDER BY pr2.gameId DESC
                    LIMIT 1
                )
            ORDER BY pr1.score DESC
        `;

        // Pobierz ranking po ostatniej grze
        const playersAfterQuery = await prisma.$queryRaw<Array<{ playerId: number; playerName: string; score: number }>>`
            SELECT 
                pr.playerId,
                p.name as playerName,
                pr.score
            FROM player_rankings pr
            INNER JOIN players p ON pr.playerId = p.id
            WHERE pr.gameId = ${lastGameDb.id}
                AND p.deletedAt IS NULL
            ORDER BY pr.score DESC
        `;

        // Mapuj ranking przed sesją
        const beforeMap = new Map<number, number>();
        playersBeforeQuery.forEach(p => {
            beforeMap.set(p.playerId, p.score);
        });

        // Przygotuj wynik z obliczoną pozycją
        const rankingList: PlayerRanking[] = playersAfterQuery.map((player, index) => {
            const ratingBefore = beforeMap.get(player.playerId) || player.score;
            const ratingChange = player.score - ratingBefore;

            return {
                nickname: player.playerName,
                rating: Math.round(player.score),
                position: index + 1, // Pozycja = indeks + 1 (już posortowane DESC)
                ratingChange: Math.round(ratingChange)
            };
        });

        return NextResponse.json({
            success: true,
            data: rankingList
        });

    } catch (error) {
        console.error('Error fetching ranking after session:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to fetch ranking',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
