import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { openApiRegistry } from '@/app/api/schema/registry';
import { ErrorResponseSchema } from '@/app/api/schema/base';
import { GET as getHandler } from './get';
import { POST as postHandler } from './upload';
import {
  GetDramaAferaSettingsResponseSchema,
  UploadDramaAferaSettingsResponseSchema,
} from './schema';

extendZodWithOpenApi(z);

// GET is public — wrap with CORS only.
const GET = withCors(getHandler);

// POST is a destructive admin endpoint — public-prefix exception per AGENTS.md.
const POST = withCors(withAuth(postHandler));

openApiRegistry.registerPath({
  method: 'get',
  path: '/api/dramaafera/settings',
  description: 'Fetch the current and previous (old) DramaAfera settings files from D1.',
  summary: 'Get DramaAfera settings',
  tags: ['DramaAfera'],
  responses: {
    200: {
      description: 'Current + old settings payload',
      content: { 'application/json': { schema: GetDramaAferaSettingsResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/api/dramaafera/settings',
  description:
    'Upload a new DramaAfera settings file. `mode=normal` rotates new→current, current→old, soft-deletes previous old. `mode=advanced` replaces only the targetVersion without rotation.',
  summary: 'Upload DramaAfera settings',
  tags: ['DramaAfera'],
  security: [{ basicAuth: [] }],
  request: {
    query: z.object({
      mode: z.enum(['normal', 'advanced']).optional().openapi({
        description: 'Upload mode. Defaults to `normal`.',
        example: 'normal',
      }),
      targetVersion: z.enum(['current', 'old']).optional().openapi({
        description: 'Required when `mode=advanced`. Identifies the row to replace.',
        example: 'current',
      }),
    }),
    body: {
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              file: { type: 'string', format: 'binary', description: 'Settings .txt file (max 5MB)' },
            },
            required: ['file'],
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Settings uploaded successfully',
      content: { 'application/json': { schema: UploadDramaAferaSettingsResponseSchema } },
    },
    400: {
      description: 'Validation error (file missing/invalid, content invalid, bad query params)',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Authentication required',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

export { GET, POST };
