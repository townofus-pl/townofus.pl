import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../../_database';
import { createSuccessResponse, createErrorResponse } from '../../../_utils';
import { calculateRankingForGame } from '../../../_utils';



export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const gameId = parseInt(resolvedParams.id);
    
    if (isNaN(gameId)) {
      return createErrorResponse('Invalid game ID', 400);
    }

    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Check if game exists
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { id: true, startTime: true, gameIdentifier: true }
    });

    if (!game) {
      return createErrorResponse('Game not found', 404);
    }

    console.log(`🎯 Starting ranking calculation for game ${gameId} (${game.gameIdentifier})`);

    // Calculate ranking
    const result = await calculateRankingForGame(prisma, gameId);

    return createSuccessResponse({
      message: 'Ranking calculated successfully',
      gameId: gameId,
      gameIdentifier: game.gameIdentifier,
      ...result
    }, 200);

  } catch (error) {
    console.error('Ranking calculation error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Game too old for ranking')) {
        return createErrorResponse(error.message, 409);
      }
      
      if (error.message.includes('Ranking already calculated')) {
        return createErrorResponse(error.message, 409);
      }
      
      return createErrorResponse(`Failed to calculate ranking: ${error.message}`, 500);
    }
    
    return createErrorResponse('Failed to calculate ranking: Unknown error occurred', 500);
  }
}