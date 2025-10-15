import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { GameDataSchema } from '../../schema/games';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { formatZodError } from '../../schema/common';
import { createGameFromData } from '../_utils/createGame';

export async function POST(request: NextRequest, _authContext: { user: { username: string } }) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Handle file upload from multipart/form-data
    const formData = await request.formData();
    const file = formData.get('gameDataFile') as File;
    
    if (!file) {
      return createErrorResponse('No file provided. Please upload a JSON file with key "gameDataFile"', 400);
    }
    
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      return createErrorResponse('File must be a JSON file', 400);
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return createErrorResponse('File size cannot exceed 10MB', 400);
    }
    
    let gameData: unknown;
    try {
      const fileContent = await file.text();
      gameData = JSON.parse(fileContent);
    } catch {
      return createErrorResponse('Invalid JSON file content', 400);
    }
    
    // Validate the game data against schema
    const parseResult = GameDataSchema.safeParse(gameData);
    if (!parseResult.success) {
      return createErrorResponse('Invalid game data: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const validatedGameData = parseResult.data;
    
    // Use shared game creation utility
    const result = await createGameFromData(prisma, validatedGameData);

    return createSuccessResponse({
      message: 'Game uploaded successfully',
      ...result
    }, 201);

  } catch (error) {
    console.error('Game upload error:', error);
    
    if (error instanceof Error) {
      // Handle specific errors from createGameFromData
      if (error.message.includes('already exists')) {
        return createErrorResponse(error.message, 409);
      }
      
      if (error.message.includes('Invalid date format')) {
        return createErrorResponse(error.message, 400);
      }
      
      // Handle specific Prisma errors
      if (error.message.includes('Unique constraint')) {
        return createErrorResponse('Game or player data conflicts with existing records', 409);
      }
      
      return createErrorResponse(`Failed to upload game: ${error.message}`, 500);
    }
    
    return createErrorResponse('Failed to upload game: Unknown error occurred', 500);
  }
}