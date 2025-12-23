import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { withoutDeleted } from '../../schema/common';

export async function GET(request: NextRequest) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse query parameters
    const url = new URL(request.url);
    const dateParam = url.searchParams.get('date');

    if (!dateParam) {
      return createErrorResponse('Missing date parameter', 400);
    }

    // Konwersja daty YYYYMMDD na zakres czasowy
    const year = dateParam.substring(0, 4);
    const month = dateParam.substring(4, 6);
    const day = dateParam.substring(6, 8);
    
    // Znajdź wszystkie gry z danego dnia
    const games = await prisma.game.findMany({
      where: {
        ...withoutDeleted,
        gameIdentifier: {
          startsWith: dateParam
        }
      },
      include: {
        gamePlayerStatistics: {
          include: {
            player: {
              select: {
                id: true,
                name: true
              }
            },
            roleHistory: true,
            modifiers: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    if (games.length === 0) {
      return createErrorResponse('No games found for this date', 404);
    }

    // Formatowanie daty do wyświetlenia
    const months = [
      '', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
      'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
    ];
    const displayDate = `${parseInt(day)} ${months[parseInt(month)]} ${year}`;

    // Znajdź pierwsze i ostatnie gry dnia
    const firstGameDb = games[0];
    const lastGameDb = games[games.length - 1];

    // Pobierz najnowszy ranking przed pierwszą grą dnia dla każdego gracza
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

    // Pobierz najnowszy ranking po ostatniej grze dnia dla każdego gracza
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

    // Zbierz statystyki graczy (punkty)
    interface PlayerHostInfo {
      name: string;
      avatar: string;
      totalPoints: number;
      games: number;
    }

    const playerMap = new Map<string, PlayerHostInfo>();

    games.forEach((game) => {
      game.gamePlayerStatistics.forEach((playerStat) => {
        const playerName = playerStat.player.name;
        
        if (!playerMap.has(playerName)) {
          playerMap.set(playerName, {
            name: playerName,
            avatar: `/images/avatars/${playerName}.png`,
            totalPoints: 0,
            games: 0
          });
        }
        
        const stats = playerMap.get(playerName)!;
        stats.totalPoints += playerStat.totalPoints;
        stats.games++;
      });
    });

    // Stwórz mapy rankingów
    const rankingBeforeMap = new Map(
      playersBeforeQuery.map(r => [r.playerName, r.score])
    );
    
    const rankingAfterMap = new Map(
      playersAfterQuery.map(r => [r.playerName, r.score])
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

    // Oblicz zmiany w rankingu dla graczy którzy grali w tej sesji
    interface PlayerRankingChange {
      name: string;
      avatar: string;
      rankBefore: number;
      rankAfter: number;
      change: number;
      ratingBefore: number;
      ratingAfter: number;
    }

    const rankingChanges: PlayerRankingChange[] = Array.from(playerMap.keys())
      .map(playerName => {
        const rankBefore = rankPositionBefore.get(playerName) || 0;
        const rankAfter = rankPositionAfter.get(playerName) || 0;
        const ratingBefore = rankingBeforeMap.get(playerName) || 2000;
        const ratingAfter = rankingAfterMap.get(playerName) || 2000;
        
        return {
          name: playerName,
          avatar: `/images/avatars/${playerName}.png`,
          rankBefore,
          rankAfter,
          change: rankBefore - rankAfter, // Dodatnia wartość = awans
          ratingBefore: Number(ratingBefore),
          ratingAfter: Number(ratingAfter)
        };
      })
      .filter(p => p.rankBefore > 0 && p.rankAfter > 0) // Tylko gracze z rankingiem
      .sort((a, b) => (b.ratingAfter - b.ratingBefore) - (a.ratingAfter - a.ratingBefore)); // Sortuj od największej różnicy

    // Posortuj graczy po punktach (malejąco)
    const players = Array.from(playerMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return createSuccessResponse({
      players,
      rankingChanges,
      totalGames: games.length,
      displayDate
    });

  } catch (error) {
    console.error('Error fetching host info:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch host info',
      500
    );
  }
}
