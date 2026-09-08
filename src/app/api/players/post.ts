import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../_database';
import { CreatePlayerRequestSchema } from '../schema/players';
import { createSuccessResponse, createErrorResponse, createPlayerWithRanking } from '../_utils';
import { formatZodError, withoutDeleted } from '../schema/common';

export async function POST(request: NextRequest) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse and validate request body
    const body = await request.json();
    
    const parseResult = CreatePlayerRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return createErrorResponse('Invalid request data: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const { name } = parseResult.data;

    // Check if player already exists (case-sensitive)
    const existingPlayer = await prisma.player.findFirst({
      where: {
        name: name,
        ...withoutDeleted
      }
    });

    if (existingPlayer) {
      return createErrorResponse(`Player already exists: '${existingPlayer.name}'`, 409);
    }

    // Create new player with initial ranking (original casing, trimmed)
    const updatedPlayer = await createPlayerWithRanking(prisma, name);

    return createSuccessResponse(updatedPlayer, 201);

  } catch (error) {
    console.error('Error creating player:', error);
    
    // Handle Prisma unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return createErrorResponse('Player name must be unique', 409);
    }
    
    if (error instanceof Error) {
      return createErrorResponse('Failed to create player: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}