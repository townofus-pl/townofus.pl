import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '../../_middlewares';
import { GET as getHandler } from './get';
import { openApiRegistry } from '../../schema/registry';
import { ErrorResponseSchema } from '../../schema/base';

extendZodWithOpenApi(z);

// Apply middleware to handlers
export const GET = withCors(withAuth(getHandler));

// Date group schema
const DateGroupSchema = z.object({
  date: z.string().openapi({
    description: 'Date in YYYYMMDD format',
    example: '20250827'
  }),
  displayDate: z.string().openapi({
    description: 'Human-readable date in Polish format',
    example: '27 sierpnia 2025'
  }),
  totalGames: z.number().openapi({
    description: 'Number of games played on this date',
    example: 15
  }),
  games: z.array(z.object({
    id: z.number().openapi({
      description: 'Game database ID',
      example: 123
    }),
    gameIdentifier: z.string().openapi({
      description: 'Game identifier string',
      example: '20250827_2156_15'
    }),
    allPlayerNames: z.array(z.string()).optional().openapi({
      description: 'List of all player names in this game (only if includePlayers=true)',
      example: ['Malkiz', 'ziomson', 'brubel']
    })
  })).openapi({
    description: 'List of games on this date'
  }),
  allPlayerNames: z.array(z.string()).optional().openapi({
    description: 'Unique list of all players who played on this date (only if includePlayers=true)',
    example: ['Barox24', 'Bartek', 'brubel', 'Malkiz', 'ziomson']
  })
}).openapi({
  description: 'Game date group with games and player information'
});

const GameDatesResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    dates: z.array(DateGroupSchema).openapi({
      description: 'List of dates with their games, sorted by date descending (newest first)'
    }),
    totalDates: z.number().openapi({
      description: 'Total number of unique dates with games',
      example: 25
    })
  })
}).openapi({
  description: 'Game dates response with date groups'
});

// Register OpenAPI path
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/games/dates',
  description: 'Get list of dates with games, grouped by date. Useful for game history navigation.',
  summary: 'List game dates',
  tags: ['Games'],
  security: [{ basicAuth: [] }],
  request: {
    query: z.object({
      includePlayers: z.string().optional().openapi({
        description: 'Include player names in response',
        example: 'true'
      })
    })
  },
  responses: {
    200: {
      description: 'Successfully retrieved game dates list',
      content: {
        'application/json': {
          schema: GameDatesResponseSchema
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