import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { openApiRegistry } from '@/app/api/schema/registry';
import {
  CreateFruitSchema,
  FruitCreatedResponseSchema
} from '@/app/api/schema/fruits';
import { ErrorResponseSchema } from '@/app/api/schema/base';

// Register schemas with the global registry
openApiRegistry.register('CreateFruit', CreateFruitSchema);
openApiRegistry.register('FruitCreatedResponse', FruitCreatedResponseSchema);

// Register the POST endpoint
openApiRegistry.registerPath({
  method: 'post',
  path: '/api/fruits',
  description: 'Create a new fruit',
  summary: 'Create fruit',
  tags: ['Fruits'],
  request: {
    body: {
      description: 'Fruit data to create',
      content: {
        'application/json': {
          schema: CreateFruitSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Fruit created successfully',
      content: {
        'application/json': {
          schema: FruitCreatedResponseSchema,
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

// POST /api/fruits - Create a new fruit
export async function POST(request: NextRequest) {
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

    // Validate request body using Zod schema
    const validationResult = CreateFruitSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse('Validation failed: ' + validationResult.error.message, 400);
    }

    const validatedData = validationResult.data;

    // Create the fruit
    const newFruit = await prisma.fruit.create({
      data: {
        name: validatedData.name.trim(),
        color: validatedData.color.trim(),
        price: validatedData.price,
        description: validatedData.description?.trim() || null,
        inStock: validatedData.inStock
      }
    });

    return createSuccessResponse(newFruit, 201);

  } catch (error) {
    console.error('Error creating fruit:', error);
    return createErrorResponse('Failed to create fruit', 500);
  }
}