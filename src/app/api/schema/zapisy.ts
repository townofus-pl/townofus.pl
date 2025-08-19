import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { BaseResponseSchema } from './base';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Core zapisy schemas
 */

export const ZapisyUserSchema = z.object({
  id: z.number().int().positive().openapi({
    description: 'Unique identifier for the user',
    example: 1
  }),
  username: z.string().min(1).max(100).openapi({
    description: 'Username',
    example: 'Malkiz'
  }),
  createdAt: z.string().datetime().openapi({
    description: 'Creation timestamp',
    example: '2025-01-20T10:00:00.000Z'
  }),
  updatedAt: z.string().datetime().openapi({
    description: 'Last update timestamp',
    example: '2025-01-20T10:00:00.000Z'
  })
});

export const ZapisySessionSchema = z.object({
  id: z.number().int().positive().openapi({
    description: 'Unique identifier for the session',
    example: 1
  }),
  date: z.string().datetime().openapi({
    description: 'Session date',
    example: '2025-08-20T00:00:00.000Z'
  }),
  description: z.string().nullable().openapi({
    description: 'Optional session description',
    example: 'Weekly game session'
  }),
  createdAt: z.string().datetime().openapi({
    description: 'Creation timestamp',
    example: '2025-01-20T10:00:00.000Z'
  }),
  updatedAt: z.string().datetime().openapi({
    description: 'Last update timestamp',
    example: '2025-01-20T10:00:00.000Z'
  })
});

export const ZapisyResponseSchema = z.object({
  id: z.number().int().positive().openapi({
    description: 'Unique identifier for the response',
    example: 1
  }),
  userId: z.number().int().positive().openapi({
    description: 'User ID',
    example: 1
  }),
  sessionId: z.number().int().positive().openapi({
    description: 'Session ID',
    example: 1
  }),
  attending: z.boolean().openapi({
    description: 'Whether user is attending',
    example: true
  }),
  createdAt: z.string().datetime().openapi({
    description: 'Creation timestamp',
    example: '2025-01-20T10:00:00.000Z'
  }),
  updatedAt: z.string().datetime().openapi({
    description: 'Last update timestamp',
    example: '2025-01-20T10:00:00.000Z'
  })
});

/**
 * Request schemas
 */

export const ZapisyDataRequestSchema = z.object({
  users: z.array(z.string()).openapi({
    description: 'List of usernames',
    example: ['Malkiz', 'AlerGeek', 'Anterias']
  }),
  dates: z.array(z.string().datetime()).openapi({
    description: 'List of session dates',
    example: ['2025-08-20T00:00:00.000Z', '2025-08-27T00:00:00.000Z']
  }),
  responses: z.record(
    z.string(),
    z.array(z.boolean())
  ).openapi({
    description: 'User responses for each session',
    example: {
      'Malkiz': [true, false],
      'AlerGeek': [false, true]
    }
  })
});

/**
 * Response schemas
 */

export const ZapisyDataResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    users: z.array(z.string()),
    dates: z.array(z.string()),
    responses: z.record(z.string(), z.array(z.boolean()))
  })
}).openapi({
  description: 'Zapisy data response'
});

export const ZapisyUpdatedResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    message: z.string(),
    updated: z.boolean()
  })
}).openapi({
  description: 'Zapisy update response'
});
