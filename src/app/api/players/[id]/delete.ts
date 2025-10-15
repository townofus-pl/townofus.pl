import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';

import { IdParamSchema } from '../../schema/base';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { formatZodError, withoutDeleted } from '../../schema/common';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, authContext: { user: { username: string } }, context: RouteContext) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse and validate route parameters
    const { id } = await context.params;
    const parseResult = IdParamSchema.safeParse({ id });
    
    if (!parseResult.success) {
      return createErrorResponse('Invalid player ID: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const playerId = parseInt(id, 10);

    // Check if the player exists and is not already deleted
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        ...withoutDeleted
      },
      include: {
        gamePlayerStatistics: {
          select: { id: true }
        },
        gameEvents: {
          select: { id: true }
        },
        meetingVotesFor: {
          select: { id: true }
        },
        meetingVotesBy: {
          select: { id: true }
        }
      }
    });

    if (!existingPlayer) {
      return createErrorResponse('Player not found or already deleted', 404);
    }

    // Check if player has associated game data (for potential future use)
    // const hasGameData = existingPlayer.gamePlayerStatistics.length > 0 ||
    //                    existingPlayer.gameEvents.length > 0 ||
    //                    existingPlayer.meetingVotesFor.length > 0 ||
    //                    existingPlayer.meetingVotesBy.length > 0;

    // Use transaction to ensure consistency
    await prisma.$transaction(async (tx) => {
      // Soft delete the player
      await tx.player.update({
        where: { id: playerId },
        data: {
          deletedAt: new Date(),
          updatedAt: new Date()
        }
      });

      // If player has current ranking, soft delete it too
      if (existingPlayer.currentRankingId) {
        await tx.playerRanking.update({
          where: { id: existingPlayer.currentRankingId },
          data: { deletedAt: new Date() }
        });
      }

      // Soft delete all ranking history records
      await tx.playerRanking.updateMany({
        where: { 
          playerId: playerId,
          deletedAt: null
        },
        data: { deletedAt: new Date() }
      });
    });

    // Return the soft-deleted player data (without sensitive info)
    const deletedPlayerResponse = {
      id: existingPlayer.id,
      name: existingPlayer.name,
      createdAt: existingPlayer.createdAt,
      updatedAt: new Date(),
      currentRankingId: null // Clear the ranking reference
    };

    return createSuccessResponse(deletedPlayerResponse, 200);

  } catch (error) {
    console.error('Error deleting player:', error);
    
    if (error instanceof Error) {
      return createErrorResponse('Failed to delete player: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}