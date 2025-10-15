import { POST } from './post';
import { withAuth } from '../../../_middlewares/auth';
import { withCors } from '../../../_middlewares/cors';
import { openApiRegistry } from '../../../schema/registry';

// Apply middleware - note: params come after auth context
const handler = withCors(withAuth(POST));

// Export handlers
export { handler as POST };

// Register OpenAPI documentation
openApiRegistry.registerPath({
  method: 'post',
  path: '/api/games/{id}/ranking',
  description: 'Calculate ranking for all players after a specific game. Updates player rankings based on game results and applies penalties for absent players.',
  summary: 'Calculate game ranking',
  tags: ['Games', 'Ranking'],
  security: [{ basicAuth: [] }],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      description: 'Game ID',
      schema: { type: 'integer', example: 123 }
    }
  ],
  responses: {
    200: {
      description: 'Ranking calculated successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: true },
              data: {
                type: 'object',
                properties: {
                  message: { type: 'string', example: 'Ranking calculated successfully' },
                  gameId: { type: 'integer', example: 123 },
                  gameIdentifier: { type: 'string', example: '20250521_1842' },
                  playersUpdated: { type: 'integer', example: 15 },
                  presentPlayers: { type: 'integer', example: 12 },
                  absentPlayers: { type: 'integer', example: 3 },
                  calculations: {
                    type: 'object',
                    properties: {
                      sumP: { type: 'number', example: 156.5 },
                      sumR: { type: 'number', example: 24000 },
                      absentCount: { type: 'integer', example: 2 }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    404: {
      description: 'Game not found'
    },
    409: {
      description: 'Game too old for ranking or ranking already calculated'
    },
    500: {
      description: 'Internal server error'
    }
  }
});