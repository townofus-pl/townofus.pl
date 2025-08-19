import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '@/app/api/_database';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import {
  FruitQuerySchema,
  FruitsListResponseSchema
} from '@/app/api/schema/fruits';
import { ErrorResponseSchema } from '@/app/api/schema/base';

// Register schemas with the global registry
openApiRegistry.register('FruitQuery', FruitQuerySchema);
openApiRegistry.register('FruitsListResponse', FruitsListResponseSchema);
openApiRegistry.register('ErrorResponse', ErrorResponseSchema);

// Import and register the Fruit schema
import { FruitSchema } from '@/app/api/schema/fruits';
openApiRegistry.register('Fruit', FruitSchema);

// Register the GET endpoint
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/fruits',
  description: 'List all fruits with optional filtering',
  summary: 'Get fruits list',
  tags: ['Fruits'],
  request: {
    query: FruitQuerySchema,
  },
  responses: {
    200: {
      description: 'Successful response with fruits list',
      content: {
        'application/json': {
          schema: FruitsListResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid query parameters',
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

// GET /api/fruits - List all fruits
export const GET = withCors(withAuth(async (request: NextRequest) => {
  // Get Cloudflare context for environment bindings
  const { env } = await getCloudflareContext();
  
  try {
    // Get DB from Cloudflare environment
    if (!env?.DB) {
      return createErrorResponse('Database not available', 500);
    }

    const prisma = getPrismaClient(env.DB);
    
    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryParams = {
      color: searchParams.get('color') || undefined,
      inStock: searchParams.get('inStock') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined
    };

    // Validate query parameters
    const validationResult = FruitQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      return createErrorResponse('Invalid query parameters: ' + validationResult.error.message, 400);
    }

    const { color, inStock, search, minPrice, maxPrice } = validationResult.data;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (color) {
      where.color = {
        contains: color
      };
    }
    
    if (inStock !== undefined) {
      where.inStock = inStock === 'true';
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } }
      ];
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        (where.price as Record<string, unknown>).gte = minPrice;
      }
      if (maxPrice !== undefined) {
        (where.price as Record<string, unknown>).lte = maxPrice;
      }
    }

    const fruits = await prisma.fruit.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { createdAt: 'desc' }
    });

    return createSuccessResponse({
      fruits,
      count: fruits.length,
      filters: {
        color: color || null,
        inStock: inStock || null,
        search: search || null,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null
      }
    });

  } catch (error) {
    console.error('Error fetching fruits:', error);
    return createErrorResponse('Failed to fetch fruits', 500);
  }
}));
