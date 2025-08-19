import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import {
  FruitParamsSchema,
  FruitResponseSchema
} from '@/app/api/schema/fruits';
import { ErrorResponseSchema } from '@/app/api/schema/base';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Register schemas with the global registry
openApiRegistry.register('FruitParams', FruitParamsSchema);
openApiRegistry.register('FruitResponse', FruitResponseSchema);

// Register the GET endpoint
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/fruits/{id}',
  description: 'Get a specific fruit by ID',
  summary: 'Get fruit by ID',
  tags: ['Fruits'],
  request: {
    params: FruitParamsSchema,
  },
  responses: {
    200: {
      description: 'Fruit found',
      content: {
        'application/json': {
          schema: FruitResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid ID format',
      content: {
        'application/json': {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: 'Fruit not found',
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

// GET /api/fruits/[id] - Get a specific fruit
export const GET = withCors(withAuth(async (request: NextRequest, context: { user: { username: string } }, { params }: RouteParams) => {
  // Get Cloudflare context for environment bindings
  const { env } = await getCloudflareContext();
  
  try {
    const { id } = await params;

    // Validate path parameters
    const paramValidation = FruitParamsSchema.safeParse({ id });
    if (!paramValidation.success) {
      return createErrorResponse('Invalid fruit ID: ' + paramValidation.error.message, 400);
    }

    const fruitId = parseInt(id);

    // Get DB from Cloudflare environment
    if (!env?.DB) {
      return createErrorResponse('Database not available', 500);
    }

    const prisma = getPrismaClient(env.DB);
    
    const fruit = await prisma.fruit.findUnique({
      where: { id: fruitId }
    });

    if (!fruit) {
      return createErrorResponse('Fruit not found', 404);
    }

    return createSuccessResponse(fruit);

  } catch (error) {
    console.error('Error fetching fruit:', error);
    return createErrorResponse('Failed to fetch fruit', 500);
  }
}));