
import { createSuccessResponse } from '@/app/api/_utils';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

// Status response schema
const StatusResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    ok: z.boolean().openapi({ example: true }),
    timestamp: z.string().openapi({ example: '2025-01-15T10:30:00.000Z' }),
    uptime: z.number().openapi({ example: 1234567 }),
    environment: z.string().openapi({ example: 'development' })
  })
}).openapi({
  description: 'API status response'
});

// Register schema
openApiRegistry.register('StatusResponse', StatusResponseSchema);

// Register the GET endpoint
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/status',
  description: 'Check API status and health',
  summary: 'Get API status',
  tags: ['System'],
  responses: {
    200: {
      description: 'API is operational',
      content: {
        'application/json': {
          schema: StatusResponseSchema,
        },
      },
    },
    401: {
      description: 'Authentication required',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            error: z.string()
          }),
        },
      },
    },
  },
});

// GET /api/status - Get API status
export const GET = withCors(withAuth(async () => {
  const now = new Date();
  const uptime = process.uptime();

  return createSuccessResponse({
    ok: true,
    timestamp: now.toISOString(),
    uptime: Math.floor(uptime),
    environment: process.env.NODE_ENV || 'unknown'
  });
}));