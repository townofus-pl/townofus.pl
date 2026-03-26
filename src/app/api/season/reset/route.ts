import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { POST as postHandler } from './post';
import { withAuth, withCors } from '../../_middlewares';
import { openApiRegistry } from '../../schema/registry';
import { BaseResponseSchema, ErrorResponseSchema } from '../../schema/base';

extendZodWithOpenApi(z);

// Chroniony endpoint — wymaga Basic Auth
export const POST = withCors(withAuth(postHandler));

const SeasonResetRequestSchema = z.object({
  seasonId: z.number().int().positive().openapi({
    description: 'Season number to reset',
    example: 2,
  }),
});

const SeasonResetPlayerSchema = z.object({
  playerName: z.string().openapi({ description: 'Player name', example: 'malk' }),
  oldSeason: z.number().int().nullable().openapi({
    description: 'Season of the previous ranking entry, or null if none',
    example: 1,
  }),
});

const SeasonResetResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    message: z.string().openapi({ example: 'Zresetowano ranking 15 graczy do sezonu 2.' }),
    resetCount: z.number().int().openapi({ description: 'Number of players reset', example: 15 }),
    targetSeason: z.number().int().openapi({ description: 'Season that was reset', example: 2 }),
    players: z.array(SeasonResetPlayerSchema).openapi({ description: 'List of reset players' }),
  }),
});

openApiRegistry.registerPath({
  method: 'post',
  path: '/api/season/reset',
  description: 'Reset season ranking: inserts a season_reset entry for every active player and updates their currentRankingId. Only allowed before any games or non-reset ranking entries exist for the target season.',
  summary: 'Reset season ranking',
  tags: ['Season', 'Ranking'],
  security: [{ basicAuth: [] }],
  request: {
    body: {
      content: {
        'application/json': {
          schema: SeasonResetRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Ranking reset successfully',
      content: { 'application/json': { schema: SeasonResetResponseSchema } },
    },
    400: {
      description: 'Invalid request or season does not exist',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    401: {
      description: 'Authentication required',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    409: {
      description: 'Season already has games or non-reset ranking entries — reset forbidden',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});
