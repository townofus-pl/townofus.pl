import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient, type Prisma } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import {
  FruitParamsSchema,
  UpdateFruitSchema,
  FruitUpdatedResponseSchema
} from '@/app/api/schema/fruits';
import { ErrorResponseSchema } from '@/app/api/schema/base';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Register schemas with the global registry
openApiRegistry.register('UpdateFruit', UpdateFruitSchema);
openApiRegistry.register('FruitUpdatedResponse', FruitUpdatedResponseSchema);

// Register the PUT endpoint
openApiRegistry.registerPath({
  method: 'put',
  path: '/api/fruits/{id}',
  description: 'Update a specific fruit',
  summary: 'Update fruit',
  tags: ['Fruits'],
  request: {
    params: FruitParamsSchema,
    body: {
      description: 'Updated fruit data',
      content: {
        'application/json': {
          schema: UpdateFruitSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Fruit updated successfully',
      content: {
        'application/json': {
          schema: FruitUpdatedResponseSchema,
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

// PUT /api/fruits/[id] - Update a specific fruit
export const PUT = withCors(withAuth(async (request: NextRequest, context: { user: { username: string } }, { params }: RouteParams) => {
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

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse('Invalid JSON in request body', 400);
    }

    // Validate request body using Zod schema
    const validationResult = UpdateFruitSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse('Validation failed: ' + validationResult.error.message, 400);
    }

    const validatedData = validationResult.data;

    // Check if fruit exists
    const existingFruit = await prisma.fruit.findUnique({
      where: { id: fruitId }
    });

    if (!existingFruit) {
      return createErrorResponse('Fruit not found', 404);
    }

    // Prepare update data - only include fields that are provided
    const updateData: Prisma.FruitUpdateInput = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name.trim();
    if (validatedData.color !== undefined) updateData.color = validatedData.color.trim();
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.description !== undefined) updateData.description = validatedData.description?.trim() || null;
    if (validatedData.inStock !== undefined) updateData.inStock = validatedData.inStock;

    // Update the fruit
    const updatedFruit = await prisma.fruit.update({
      where: { id: fruitId },
      data: updateData
    });

    return createSuccessResponse(updatedFruit);

  } catch (error) {
    console.error('Error updating fruit:', error);
    return createErrorResponse('Failed to update fruit', 500);
  }
}));
