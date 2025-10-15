import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '../_middlewares';
import { GET as getHandler } from './get';
import { POST as postHandler } from './post';
import { openApiRegistry } from '../schema/registry';
import { 
  GamesListResponseSchema,
  GameDataSchema,
  GameUploadSuccessResponseSchema
} from '../schema/games';
import { ErrorResponseSchema } from '../schema/base';

extendZodWithOpenApi(z);

// Apply middleware to handlers
export const GET = withCors(withAuth(getHandler));
export const POST = withCors(withAuth(postHandler));

// Register OpenAPI paths
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/games',
  description: 'Get list of games with optional filtering by date, pagination, and statistics',
  summary: 'List games',
  tags: ['Games'],
  security: [{ basicAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional().openapi({
        description: 'Number of games to return (1-100)',
        example: '20'
      }),
      offset: z.string().optional().openapi({
        description: 'Number of games to skip for pagination',
        example: '0'
      }),
      date: z.string().optional().openapi({
        description: 'Filter games by date (YYYYMMDD format)',
        example: '20250827'
      }),
      startDate: z.string().optional().openapi({
        description: 'Filter games from this date onwards (YYYYMMDD format)',
        example: '20250801'
      }),
      endDate: z.string().optional().openapi({
        description: 'Filter games up to this date (YYYYMMDD format)',
        example: '20250831'
      }),
      player: z.string().optional().openapi({
        description: 'Filter games that include specific player name',
        example: 'Malkiz'
      }),
      winnerTeam: z.enum(['Crewmate', 'Impostor', 'Neutral']).optional().openapi({
        description: 'Filter games by winning team',
        example: 'Crewmate'
      }),
      map: z.string().optional().openapi({
        description: 'Filter games by map name',
        example: 'Polus'
      }),
      sort: z.enum(['startTime', 'endTime', 'duration', 'players', 'winnerTeam']).optional().openapi({
        description: 'Field to sort by',
        example: 'startTime'
      }),
      order: z.enum(['asc', 'desc']).optional().openapi({
        description: 'Sort order',
        example: 'desc'
      }),
      includePlayers: z.string().optional().openapi({
        description: 'Include player statistics in response',
        example: 'true'
      })
    })
  },
  responses: {
    200: {
      description: 'Successfully retrieved games list',
      content: {
        'application/json': {
          schema: GamesListResponseSchema
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

// Register POST endpoint for creating games
openApiRegistry.registerPath({
  method: 'post',
  path: '/api/games',
  description: 'Create a new game from JSON data. Automatically creates missing players.',
  summary: 'Create game',
  tags: ['Games'],
  security: [{ basicAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: GameDataSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Game created successfully',
      content: {
        'application/json': {
          schema: GameUploadSuccessResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid game data format or validation error',
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
      description: 'Game already exists or data conflicts',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error during game creation',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});