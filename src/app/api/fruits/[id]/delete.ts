import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import {
  FruitParamsSchema,
  FruitDeletedResponseSchema
} from '@/app/api/schema/fruits';
import { ErrorResponseSchema } from '@/app/api/schema/base';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Register schemas with the global registry
openApiRegistry.register('FruitDeletedResponse', FruitDeletedResponseSchema);

// Register the DELETE endpoint
openApiRegistry.registerPath({
  method: 'delete',
  path: '/api/fruits/{id}',
  description: 'Delete a specific fruit',
  summary: 'Delete fruit',
  tags: ['Fruits'],
  request: {
    params: FruitParamsSchema,
  },
  responses: {
    200: {
      description: 'Fruit deleted successfully',
      content: {
        'application/json': {
          schema: FruitDeletedResponseSchema,
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

// DELETE /api/fruits/[id] - Delete a specific fruit
export const DELETE = withCors(withAuth(async (request: NextRequest, context: { user: { username: string } }, { params }: RouteParams) => {
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

    // Check if fruit exists
    const existingFruit = await prisma.fruit.findUnique({
      where: { id: fruitId }
    });

    if (!existingFruit) {
      return createErrorResponse('Fruit not found', 404);
    }

    // Delete the fruit
    await prisma.fruit.delete({
      where: { id: fruitId }
    });

    return createSuccessResponse({ 
      message: 'Fruit deleted successfully',
      deletedFruit: existingFruit
    });

  } catch (error) {
    console.error('Error deleting fruit:', error);
    return createErrorResponse('Failed to delete fruit', 500);
  }
}));
