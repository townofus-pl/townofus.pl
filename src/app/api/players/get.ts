import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../_database';
import { PlayersQuerySchema } from '../schema/players';
import { createSuccessResponse, createErrorResponse } from '../_utils';
import { formatZodError, withoutDeleted } from '../schema/common';

export async function GET(request: NextRequest) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = PlayersQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return createErrorResponse('Invalid query parameters: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const { limit, offset, search, sort, order, includeStats } = parseResult.data;

    // Build where clause for search and soft deletes
    let where: { deletedAt?: null; id?: { in: number[] } } = {
      ...withoutDeleted, // Exclude soft-deleted players
    };

    // Add search filter if provided (case-insensitive using SQLite COLLATE NOCASE)
    if (search) {
      // Use raw SQL for case-insensitive search with SQLite COLLATE NOCASE
      const searchResults = await prisma.$queryRaw<{ id: number }[]>`
        SELECT id FROM players 
        WHERE name LIKE '%' || ${search} || '%' COLLATE NOCASE 
        AND deletedAt IS NULL
      `;

      const playerIds = searchResults.map(result => result.id);

      if (playerIds.length === 0) {
        // No matches found, return empty result early
        return createSuccessResponse({
          players: [],
          pagination: {
            total: 0,
            limit,
            offset,
            hasMore: false
          }
        }, 200);
      }

      where = {
        id: {
          in: playerIds
        }
      };
    }

    // Get total count for pagination
    console.error('DEBUG GET /api/players - where clause:', JSON.stringify(where, null, 2));
    const total = await prisma.player.count({ where });
    console.error('DEBUG GET /api/players - total count:', total);

    // Build orderBy clause
    let orderBy: Record<string, 'asc' | 'desc'> = {};

    if (sort === 'totalGames' || sort === 'winRate' || sort === 'totalPoints') {
      // For stats-based sorting, we need to use raw SQL or computed fields
      // For now, we'll sort by name and handle stats sorting in memory if needed
      orderBy = { name: order };
    } else {
      orderBy = { [sort]: order };
    }

    // Fetch players with optional stats
    let players;

    if (includeStats) {
      // Fetch players with computed statistics
      console.error('DEBUG GET /api/players - fetching with stats, orderBy:', JSON.stringify(orderBy, null, 2));
      players = await prisma.player.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        include: {
          gamePlayerStatistics: {
            where: {
              game: withoutDeleted // Only include stats from non-deleted games
            },
            select: {
              win: true,
              totalPoints: true,
              game: {
                select: {
                  id: true
                }
              }
            }
          },
          currentRanking: {
            select: {
              score: true
            }
          }
        }
      });

      // Transform to include computed stats
      players = players.map((player) => {
        const gameStats = player.gamePlayerStatistics || [];
        const totalGames = gameStats.length;
        const wins = gameStats.filter((stat) => stat.win).length;
        const winRate = totalGames > 0 ? wins / totalGames : 0;
        const totalPoints = gameStats.reduce((sum, stat) => sum + stat.totalPoints, 0);
        const averagePoints = totalGames > 0 ? totalPoints / totalGames : 0;
        const currentRanking = player.currentRanking?.score || 0;

        return {
          id: player.id,
          name: player.name,
          createdAt: player.createdAt,
          updatedAt: player.updatedAt,
          currentRankingId: player.currentRankingId,
          stats: {
            totalGames,
            wins,
            winRate,
            totalPoints,
            averagePoints,
            currentRanking
          }
        };
      });

      // Apply stats-based sorting if requested
      if (sort === 'totalGames' || sort === 'winRate' || sort === 'totalPoints') {
        players.sort((a, b) => {
          const playerA = a as { stats?: { [key: string]: number } };
          const playerB = b as { stats?: { [key: string]: number } };
          const aVal = playerA.stats?.[sort] || 0;
          const bVal = playerB.stats?.[sort] || 0;

          if (order === 'desc') {
            return (bVal as number) - (aVal as number);
          } else {
            return (aVal as number) - (bVal as number);
          }
        });
      }
    } else {
      // Fetch players without stats
      console.error('DEBUG GET /api/players - fetching without stats, orderBy:', JSON.stringify(orderBy, null, 2));
      players = await prisma.player.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          currentRankingId: true
        }
      });
    }

    // Calculate pagination metadata
    const hasMore = offset + limit < total;
    console.error('DEBUG GET /api/players - players found:', players?.length || 0);
    console.error('DEBUG GET /api/players - pagination:', { total, limit, offset, hasMore });

    // Prepare response
    const responseData = {
      players,
      pagination: {
        total,
        limit,
        offset,
        hasMore
      }
    };

    return createSuccessResponse(responseData, 200);

  } catch (error) {
    console.error('Error fetching players:', error);

    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch players: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}
