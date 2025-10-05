import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../_database';
import { CreatePlayerRequestSchema } from '../schema/players';
import { createSuccessResponse, createErrorResponse } from '../_utils';
import { formatZodError } from '../schema/common';

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

    // Check if player already exists (case-insensitive using SQLite COLLATE NOCASE)
    const existingPlayers = await prisma.$queryRaw<{ id: number; name: string }[]>`
      SELECT id, name FROM players 
      WHERE name = ${name} COLLATE NOCASE
      AND deletedAt IS NULL
    `;

    if (existingPlayers.length > 0) {
      return createErrorResponse(`Player already exists: '${existingPlayers[0].name}' (case-insensitive match)`, 409);
    }

    // Create new player with original casing
    const newPlayer = await prisma.player.create({
      data: {
        name: name.trim(), // Store with original casing but trimmed
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        currentRankingId: true
      }
    });

    // Create initial ranking record for the player
    const initialRanking = await prisma.playerRanking.create({
      data: {
        playerId: newPlayer.id,
        score: 2000.0, // Default starting ranking
        reason: 'initial_value'
      }
    });

    // Update player's current ranking reference
    const updatedPlayer = await prisma.player.update({
      where: { id: newPlayer.id },
      data: { currentRankingId: initialRanking.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        currentRankingId: true
      }
    });

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