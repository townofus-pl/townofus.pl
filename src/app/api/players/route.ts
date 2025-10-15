import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '../_middlewares';
import { GET as getHandler } from './get';
import { POST as postHandler } from './post';
import { openApiRegistry } from '../schema/registry';
import { 
  PlayersListResponseSchema, 
  CreatePlayerRequestSchema, 
  PlayerResponseSchema 
} from '../schema/players';
import { ErrorResponseSchema } from '../schema/base';

extendZodWithOpenApi(z);

// Apply middleware to handlers
export const GET = withCors(withAuth(getHandler));
export const POST = withCors(withAuth(postHandler));

// Register OpenAPI paths
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/players',
  description: 'Get list of players with optional pagination, search, and statistics',
  summary: 'List players',
  tags: ['Players'],
  security: [{ basicAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional().openapi({
        description: 'Number of players to return (1-100)',
        example: '20'
      }),
      offset: z.string().optional().openapi({
        description: 'Number of players to skip for pagination',
        example: '0'
      }),
      search: z.string().optional().openapi({
        description: 'Search players by name (case-sensitive)',
        example: 'malk'
      }),
      sort: z.enum(['name', 'createdAt', 'updatedAt', 'totalGames', 'winRate', 'totalPoints']).optional().openapi({
        description: 'Field to sort by',
        example: 'name'
      }),
      order: z.enum(['asc', 'desc']).optional().openapi({
        description: 'Sort order',
        example: 'asc'
      }),
      includeStats: z.string().optional().openapi({
        description: 'Include player statistics in response',
        example: 'true'
      })
    })
  },
  responses: {
    200: {
      description: 'Successfully retrieved players list',
      content: {
        'application/json': {
          schema: PlayersListResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid query parameters',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    401: {
      description: 'Authentication required',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/api/players',
  description: 'Create a new player with duplicate checking',
  summary: 'Create player',
  tags: ['Players'],
  security: [{ basicAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreatePlayerRequestSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Player created successfully',
      content: {
        'application/json': {
          schema: PlayerResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid request data',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    401: {
      description: 'Authentication required',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    409: {
      description: 'Player already exists',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});