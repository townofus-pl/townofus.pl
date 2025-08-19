import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import {
  ZapisyDataRequestSchema,
  ZapisyUpdatedResponseSchema
} from '@/app/api/schema/zapisy';
import { ErrorResponseSchema } from '@/app/api/schema/base';

// Register schemas with the global registry
openApiRegistry.register('ZapisyDataRequest', ZapisyDataRequestSchema);
openApiRegistry.register('ZapisyUpdatedResponse', ZapisyUpdatedResponseSchema);

// Register the POST endpoint
openApiRegistry.registerPath({
  method: 'post',
  path: '/api/dramaafera/zapisy',
  description: 'Update zapisy data with users responses',
  summary: 'Update zapisy data',
  tags: ['Zapisy'],
  request: {
    body: {
      description: 'Zapisy data to update',
      content: {
        'application/json': {
          schema: ZapisyDataRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Zapisy data updated successfully',
      content: {
        'application/json': {
          schema: ZapisyUpdatedResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
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

// POST /api/dramaafera/zapisy - Update zapisy data
export const POST = withCors(async (request: NextRequest) => {
  // Get Cloudflare context for environment bindings
  const { env } = await getCloudflareContext();
  
  try {
    // Get DB from Cloudflare environment
    if (!env?.DB) {
      return createErrorResponse('Database not available', 500);
    }

    const prisma = getPrismaClient(env.DB);

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate request data
    const validationResult = ZapisyDataRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse('Invalid request data: ' + validationResult.error.message, 400);
    }

    const { users, dates, responses } = validationResult.data;

    // Use transaction to update data atomically
    await prisma.$transaction(async (tx) => {
      // First, ensure all users exist
      for (const username of users) {
        await tx.zapisyUser.upsert({
          where: { username },
          update: {},
          create: { username }
        });
      }

      // Then, ensure all sessions exist
      for (const dateStr of dates) {
        const date = new Date(dateStr);
        await tx.zapisySession.upsert({
          where: { date },
          update: {},
          create: { date }
        });
      }

      // Get all users and sessions to map IDs
      const [dbUsers, dbSessions] = await Promise.all([
        tx.zapisyUser.findMany(),
        tx.zapisySession.findMany({ orderBy: { date: 'asc' } })
      ]);

      // Create user and session maps for quick lookup
      const userMap = new Map(dbUsers.map(u => [u.username, u.id]));
      const sessionMap = new Map(dbSessions.map((s, index) => [index, s.id]));

      // Update responses
      for (const [username, userResponses] of Object.entries(responses)) {
        const userId = userMap.get(username);
        if (!userId) continue;

        for (let sessionIndex = 0; sessionIndex < userResponses.length; sessionIndex++) {
          const sessionId = sessionMap.get(sessionIndex);
          if (!sessionId) continue;

          const attending = userResponses[sessionIndex];

          await tx.zapisyResponse.upsert({
            where: {
              userId_sessionId: {
                userId,
                sessionId
              }
            },
            update: { attending },
            create: {
              userId,
              sessionId,
              attending
            }
          });
        }
      }
    });

    return createSuccessResponse({
      message: 'Zapisy data updated successfully',
      updated: true
    });

  } catch (error) {
    console.error('Error updating zapisy data:', error);
    return createErrorResponse('Failed to update zapisy data', 500);
  }
});
