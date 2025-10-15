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

    // Parse query parameters for optional filtering
    const url = new URL(request.url);
    const includePlayerNames = url.searchParams.get('includePlayers') === 'true';

    // Get all games grouped by date
    const games = includePlayerNames
      ? await prisma.game.findMany({
          where: withoutDeleted,
          select: {
            id: true,
            gameIdentifier: true,
            startTime: true,
            gamePlayerStatistics: {
              include: {
                player: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            startTime: 'desc'
          }
        })
      : await prisma.game.findMany({
          where: withoutDeleted,
          select: {
            id: true,
            gameIdentifier: true,
            startTime: true
          },
          orderBy: {
            startTime: 'desc'
          }
        });

    // Group games by date
    const dateGroups = new Map<string, {
      date: string;
      displayDate: string;
      games: Array<{ id: number; gameIdentifier: string; allPlayerNames?: string[] }>;
      totalGames: number;
      allPlayerNames: Set<string>;
    }>();

    games.forEach(game => {
      let dateKey = '';
      let displayDate = '';

      // Extract date from gameIdentifier (preferred) or startTime
      if (game.gameIdentifier) {
        const datePart = game.gameIdentifier.split('_')[0];
        if (datePart && datePart.length === 8) {
          dateKey = datePart; // YYYYMMDD format
          
          // Format for display: "DD MMMM YYYY"
          const year = datePart.substring(0, 4);
          const month = parseInt(datePart.substring(4, 6));
          const day = parseInt(datePart.substring(6, 8));
          
          const months = [
            '', 'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
            'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
          ];
          
          displayDate = `${day} ${months[month]} ${year}`;
        }
      } else if (game.startTime) {
        // Fallback to startTime
        const date = new Date(game.startTime);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        dateKey = `${year}${month}${day}`;
        displayDate = date.toLocaleDateString('pl-PL', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      if (!dateKey) return; // Skip games without valid dates

      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, {
          date: dateKey,
          displayDate,
          games: [],
          totalGames: 0,
          allPlayerNames: new Set<string>()
        });
      }

      const dateGroup = dateGroups.get(dateKey);
      
      // Add game summary
      const gameSummary: { id: number; gameIdentifier: string; allPlayerNames?: string[] } = {
        id: game.id,
        gameIdentifier: game.gameIdentifier
      };

      // Add player names if requested
      if (includePlayerNames && 'gamePlayerStatistics' in game && game.gamePlayerStatistics) {
        const playerNames = (game.gamePlayerStatistics as Array<{ player: { name: string } }>).map(stat => stat.player.name);
        gameSummary.allPlayerNames = playerNames;
        
        // Add to unique players for this date
        playerNames.forEach(name => dateGroup!.allPlayerNames.add(name));
      }

      dateGroup!.games.push(gameSummary);
      dateGroup!.totalGames++;
    });

    // Convert to array and format response
    const datesList = Array.from(dateGroups.values()).map(dateGroup => ({
      date: dateGroup.date,
      displayDate: dateGroup.displayDate,
      totalGames: dateGroup.totalGames,
      games: dateGroup.games.map((game) => ({
        id: game.id,
        gameIdentifier: game.gameIdentifier,
        ...(includePlayerNames && game.allPlayerNames ? { allPlayerNames: game.allPlayerNames } : {})
      })),
      ...(includePlayerNames ? { 
        allPlayerNames: Array.from(dateGroup.allPlayerNames).sort() 
      } : {})
    }));

    // Sort by date descending (newest first)
    datesList.sort((a, b) => b.date.localeCompare(a.date));

    return createSuccessResponse({
      dates: datesList,
      totalDates: datesList.length
    }, 200);

  } catch (error) {
    console.error('Error fetching game dates:', error);
    
    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch game dates: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}