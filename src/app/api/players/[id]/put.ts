import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { UpdatePlayerRequestSchema } from '../../schema/players';
import { IdParamSchema } from '../../schema/base';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { formatZodError, withoutDeleted } from '../../schema/common';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, authContext: { user: { username: string } }, context: RouteContext) {
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

    // Parse and validate request body
    const body = await request.json();
    const bodyParseResult = UpdatePlayerRequestSchema.safeParse(body);
    
    if (!bodyParseResult.success) {
      return createErrorResponse('Invalid request data: ' + JSON.stringify(formatZodError(bodyParseResult.error)), 400);
    }

    const playerId = parseInt(id, 10);
    const { name } = bodyParseResult.data;

    // Check if the player exists and is not deleted
    const existingPlayer = await prisma.player.findFirst({
      where: {
        id: playerId,
        ...withoutDeleted
      }
    });

    if (!existingPlayer) {
      return createErrorResponse('Player not found', 404);
    }

    // If the name hasn't changed, no update needed
    if (existingPlayer.name.trim() === name.trim()) {
      return createSuccessResponse({
        id: existingPlayer.id,
        name: existingPlayer.name,
        deletedAt: existingPlayer.deletedAt,
        createdAt: existingPlayer.createdAt,
        updatedAt: existingPlayer.updatedAt,
        currentRankingId: existingPlayer.currentRankingId
      }, 200);
    }

    // Check if another player already has this name (case-sensitive)
    const duplicatePlayer = await prisma.player.findFirst({
      where: {
        name: name,
        id: {
          not: playerId
        },
        ...withoutDeleted
      }
    });

    if (duplicatePlayer) {
      return createErrorResponse(`Player name already exists: '${duplicatePlayer.name}'`, 409);
    }

    // Update the player name
    const updatedPlayer = await prisma.player.update({
      where: { id: playerId },
      data: { 
        name: name.trim(), // Store with original casing but trimmed
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        currentRankingId: true
      }
    });

    // Validate response schema
    return createSuccessResponse(updatedPlayer, 200);

  } catch (error) {
    console.error('Error updating player:', error);
    
    // Handle Prisma unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return createErrorResponse('Player name must be unique', 409);
    }
    
    if (error instanceof Error) {
      return createErrorResponse('Failed to update player: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}