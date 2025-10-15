import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '../../_middlewares';
import { GET as getHandler } from './get';
import { openApiRegistry } from '../../schema/registry';
import { 
  GameDetailsResponseSchema
} from '../../schema/games';
import { ErrorResponseSchema } from '../../schema/base';

extendZodWithOpenApi(z);

// Apply middleware to handlers
export const GET = withCors(withAuth(getHandler));

// Register OpenAPI paths for individual game operations
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/games/{id}',
  description: 'Get detailed information about a specific game including comprehensive statistics, events, and meetings',
  summary: 'Get game details',
  tags: ['Games'],
  security: [{ basicAuth: [] }],
  request: {
    params: z.object({
      id: z.string().regex(/^\d+$/, 'ID must be a positive integer').openapi({
        description: 'Game ID',
        example: '1'
      })
    })
  },
  responses: {
    200: {
      description: 'Successfully retrieved game details with comprehensive statistics',
      content: {
        'application/json': {
          schema: GameDetailsResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid game ID format',
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
      description: 'Game not found',
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