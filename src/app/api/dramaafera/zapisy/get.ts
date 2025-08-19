import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import {
  ZapisyDataResponseSchema
} from '@/app/api/schema/zapisy';
import { ErrorResponseSchema } from '@/app/api/schema/base';

// Register schemas with the global registry
openApiRegistry.register('ZapisyDataResponse', ZapisyDataResponseSchema);

// Register the GET endpoint
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/dramaafera/zapisy',
  description: 'Get all zapisy data with users, sessions and responses',
  summary: 'Get zapisy data',
  tags: ['Zapisy'],
  responses: {
    200: {
      description: 'Successful response with zapisy data',
      content: {
        'application/json': {
          schema: ZapisyDataResponseSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

// GET /api/dramaafera/zapisy - Get all zapisy data
export const GET = withCors(async (request: NextRequest) => {
  // Get Cloudflare context for environment bindings
  const { env } = await getCloudflareContext();
  
  try {
    // Get DB from Cloudflare environment
    if (!env?.DB) {
      return createErrorResponse('Database not available', 500);
    }

    const prisma = getPrismaClient(env.DB);
    
    // Get all users, sessions and responses
    const [users, sessions, responses] = await Promise.all([
      prisma.zapisyUser.findMany({
        orderBy: { username: 'asc' }
      }),
      prisma.zapisySession.findMany({
        orderBy: { date: 'asc' }
      }),
      prisma.zapisyResponse.findMany({
        include: {
          user: true,
          session: true
        }
      })
    ]);

    // Format data to match the expected structure
    const usernames = users.map((u) => u.username);
    const dates = sessions.map((s) => s.date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    
    // Create responses object
    const responsesMap: Record<string, boolean[]> = {};
    
    // Initialize all users with false responses
    usernames.forEach((username) => {
      responsesMap[username] = new Array(sessions.length).fill(false);
    });
    
    // Fill in actual responses
    responses.forEach((response) => {
      const userIndex = usernames.indexOf(response.user.username);
      const sessionIndex = sessions.findIndex((s) => s.id === response.sessionId);
      
      if (userIndex !== -1 && sessionIndex !== -1) {
        responsesMap[response.user.username][sessionIndex] = response.attending;
      }
    });

    return createSuccessResponse({
      users: usernames,
      dates,
      responses: responsesMap
    });

  } catch (error) {
    console.error('Error fetching zapisy data:', error);
    return createErrorResponse('Failed to fetch zapisy data', 500);
  }
});
