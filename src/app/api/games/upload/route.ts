import { POST } from './post';
import { withAuth } from '../../_middlewares/auth';
import { withCors } from '../../_middlewares/cors';
import { openApiRegistry } from '../../schema/registry';
import { GameUploadSuccessResponseSchema } from '../../schema/games';
import { ErrorResponseSchema } from '../../schema/base';

// Apply middleware
const handler = withCors(withAuth(POST));

// Register OpenAPI documentation
openApiRegistry.registerPath({
  method: 'post',
  path: '/api/games/upload',
  description: 'Upload complete game data from Among Us mod via file upload. Creates game record and automatically creates missing players.',
  summary: 'Upload game data',
  tags: ['Games'],
  security: [{ basicAuth: [] }],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              gameDataFile: {
                type: 'string',
                format: 'binary',
                description: 'JSON file containing complete game data'
              }
            },
            required: ['gameDataFile']
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Game uploaded successfully',
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
      description: 'Internal server error during game upload',
      content: {
        'application/json': {
          schema: ErrorResponseSchema
        }
      }
    }
  }
});

export { handler as POST };