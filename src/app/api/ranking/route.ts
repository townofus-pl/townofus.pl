import { GET } from './get';
import { withCors } from '../_middlewares/cors';
import { openApiRegistry } from '../schema/registry';

// Apply middleware (no auth required for ranking view)
const handler = withCors(GET);

// Export handlers
export { handler as GET };

// Register OpenAPI documentation
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/ranking',
  description: 'Get current player ranking based on their latest scores. Returns players ordered by rating with statistics.',
  summary: 'Get player ranking',
  tags: ['Ranking'],
  parameters: [
    {
      name: 'limit',
      in: 'query',
      required: false,
      description: 'Number of players to return (1-100)',
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 50 }
    },
    {
      name: 'offset',
      in: 'query',
      required: false,
      description: 'Number of players to skip for pagination',
      schema: { type: 'integer', minimum: 0, default: 0 }
    }
  ],
  responses: {
    200: {
      description: 'Ranking retrieved successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  ranking: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        rank: { type: 'integer', example: 1 },
                        playerId: { type: 'integer', example: 15 },
                        playerName: { type: 'string', example: 'Malkiz' },
                        currentRating: { type: 'number', example: 2156.78 },
                        totalGames: { type: 'integer', example: 45 },
                        wins: { type: 'integer', example: 28 },
                        losses: { type: 'integer', example: 17 },
                        winRate: { type: 'number', example: 62.22 },
                        lastUpdated: { type: 'string', format: 'date-time' }
                      }
                    }
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: { type: 'integer', example: 156 },
                      limit: { type: 'integer', example: 50 },
                      offset: { type: 'integer', example: 0 },
                      hasMore: { type: 'boolean', example: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    500: {
      description: 'Internal server error'
    }
  }
});