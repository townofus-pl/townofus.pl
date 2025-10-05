import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '../../_middlewares';
import { GET as getHandler } from './get';
import { PUT as putHandler } from './put';
import { DELETE as deleteHandler } from './delete';
import { openApiRegistry } from '../../schema/registry';
import { 
  PlayerWithStatsResponseSchema, 
  UpdatePlayerRequestSchema, 
  PlayerResponseSchema 
} from '../../schema/players';
import { ErrorResponseSchema } from '../../schema/base';

extendZodWithOpenApi(z);

// Apply middleware to handlers
export const GET = withCors(withAuth(getHandler));
export const PUT = withCors(withAuth(putHandler));
export const DELETE = withCors(withAuth(deleteHandler));

// Register OpenAPI paths for individual player operations
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/players/{id}',
  description: 'Get detailed information about a specific player including comprehensive statistics',
  summary: 'Get player details',
  tags: ['Players'],
  security: [{ basicAuth: [] }],
  request: {
    params: z.object({
      id: z.string().regex(/^\d+$/, 'ID must be a positive integer').openapi({
        description: 'Player ID',
        example: '1'
      })
    })
  },
  responses: {
    200: {
      description: 'Successfully retrieved player details with statistics',
      content: {
        'application/json': {
          schema: PlayerWithStatsResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid player ID format',
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
    404: {
      description: 'Player not found',
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
  method: 'put',
  path: '/api/players/{id}',
  description: 'Update player information with case-insensitive duplicate checking',
  summary: 'Update player',
  tags: ['Players'],
  security: [{ basicAuth: [] }],
  request: {
    params: z.object({
      id: z.string().regex(/^\d+$/, 'ID must be a positive integer').openapi({
        description: 'Player ID',
        example: '1'
      })
    }),
    body: {
      content: {
        'application/json': {
          schema: UpdatePlayerRequestSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Player updated successfully',
      content: {
        'application/json': {
          schema: PlayerResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid request data or player ID',
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
    404: {
      description: 'Player not found',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    409: {
      description: 'Player name already exists (case-insensitive match)',
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
  method: 'delete',
  path: '/api/players/{id}',
  description: 'Soft delete a player while preserving historical game data and statistics',
  summary: 'Delete player',
  tags: ['Players'],
  security: [{ basicAuth: [] }],
  request: {
    params: z.object({
      id: z.string().regex(/^\d+$/, 'ID must be a positive integer').openapi({
        description: 'Player ID',
        example: '1'
      })
    })
  },
  responses: {
    200: {
      description: 'Player soft-deleted successfully',
      content: {
        'application/json': {
          schema: PlayerResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid player ID format',
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
    404: {
      description: 'Player not found or already deleted',
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