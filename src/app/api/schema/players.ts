import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { BaseResponseSchema, ErrorResponseSchema } from './base';
import { openApiRegistry } from './registry';
import { 
  PlayerModelSchema,
  PlayerRankingModelSchema
} from '../../../generated/zod/schemas/variants/pure';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Core Player Schemas - Using Auto-Generated Base Models
 */
export const PlayerSchema = PlayerModelSchema.pick({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
  currentRankingId: true,
}).openapi('Player', {
  description: 'Player base model from database',
  example: {
    id: 1,
    name: 'Malkiz',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    currentRankingId: 42
  }
});

// Player ranking schema using auto-generated model
export const PlayerRankingSchema = PlayerRankingModelSchema.pick({
  id: true,
  playerId: true,
  gameId: true,
  score: true,
  reason: true,
  createdAt: true,
}).openapi('PlayerRanking', {
  description: 'Player ranking record',
  example: {
    id: 1,
    playerId: 42,
    gameId: 123,
    score: 1543.2,
    reason: 'game_result',
    createdAt: new Date('2024-01-15T10:30:00Z')
  }
});

export const PlayerStatsSchema = z.object({
  totalGames: z.number().int().min(0).openapi({
    description: 'Total number of games played',
    example: 156
  }),
  wins: z.number().int().min(0).openapi({
    description: 'Total number of games won',
    example: 45
  }),
  winRate: z.number().min(0).max(1).openapi({
    description: 'Win rate as a decimal (0.0 to 1.0)',
    example: 0.288
  }),
  totalPoints: z.number().openapi({
    description: 'Total points accumulated across all games',
    example: 1245.7
  }),
  averagePoints: z.number().openapi({
    description: 'Average points per game',
    example: 7.98
  }),
  currentRanking: z.number().openapi({
    description: 'Current ranking score',
    example: 1543.2
  })
});

export const PlayerWithStatsSchema = PlayerSchema.extend({
  stats: PlayerStatsSchema.optional().openapi({
    description: 'Player statistics summary'
  })
});

/**
 * Request Schemas
 */
export const CreatePlayerRequestSchema = z.object({
  name: z.string()
    .min(1, 'Player name is required')
    .max(100, 'Player name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Player name contains invalid characters')
    .openapi({
      description: 'Player name to create',
      example: 'NewPlayer123',
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-zA-Z0-9\\s\\-_\\.]+$'
    })
});

export const UpdatePlayerRequestSchema = z.object({
  name: z.string()
    .min(1, 'Player name is required')
    .max(100, 'Player name must be 100 characters or less')
    .regex(/^[a-zA-Z0-9\s\-_\.]+$/, 'Player name contains invalid characters')
    .openapi({
      description: 'New player name',
      example: 'UpdatedPlayerName',
      minLength: 1,
      maxLength: 100,
      pattern: '^[a-zA-Z0-9\\s\\-_\\.]+$'
    })
});

export const MergePlayersRequestSchema = z.object({
  sourcePlayerId: z.number().int().positive().openapi({
    description: 'ID of the player to merge from (will be deleted)',
    example: 5
  }),
  targetPlayerId: z.number().int().positive().openapi({
    description: 'ID of the player to merge into (will retain all data)',
    example: 3
  })
}).refine(data => data.sourcePlayerId !== data.targetPlayerId, {
  message: 'Source and target player IDs must be different',
  path: ['sourcePlayerId']
});

/**
 * Query Parameter Schemas
 */
export const PlayersQuerySchema = z.object({
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 20)
    .refine(val => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100'
    })
    .openapi({
      description: 'Number of players to return (1-100)',
      example: '20',
      default: '20'
    }),
  offset: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 0)
    .refine(val => !isNaN(val) && val >= 0, {
      message: 'Offset must be a non-negative number'
    })
    .openapi({
      description: 'Number of players to skip for pagination',
      example: '0',
      default: '0'
    }),
  search: z.string()
    .optional()
    .transform(val => val?.trim() || undefined)
    .openapi({
      description: 'Search players by name (case-sensitive partial match)',
      example: 'malk'
    }),
  sort: z.enum(['name', 'createdAt', 'updatedAt', 'totalGames', 'winRate', 'totalPoints'])
    .optional()
    .default('name')
    .openapi({
      description: 'Field to sort by',
      example: 'name',
      default: 'name',
      enum: ['name', 'createdAt', 'updatedAt', 'totalGames', 'winRate', 'totalPoints']
    }),
  order: z.enum(['asc', 'desc'])
    .optional()
    .default('asc')
    .openapi({
      description: 'Sort order',
      example: 'asc',
      default: 'asc',
      enum: ['asc', 'desc']
    }),
  includeStats: z.string()
    .optional()
    .transform(val => val === 'true')
    .openapi({
      description: 'Include player statistics in response',
      example: 'true',
      default: 'false'
    })
});

/**
 * Response Schemas
 */
export const PlayerResponseSchema = BaseResponseSchema.extend({
  data: PlayerSchema.openapi({
    description: 'Player data'
  })
});

export const PlayerWithStatsResponseSchema = BaseResponseSchema.extend({
  data: PlayerWithStatsSchema.openapi({
    description: 'Player data with statistics'
  })
});

export const PlayersListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    players: z.array(PlayerWithStatsSchema).openapi({
      description: 'Array of players with optional statistics'
    }),
    pagination: z.object({
      total: z.number().int().min(0).openapi({
        description: 'Total number of players matching the query',
        example: 156
      }),
      limit: z.number().int().min(1).max(100).openapi({
        description: 'Number of players per page',
        example: 20
      }),
      offset: z.number().int().min(0).openapi({
        description: 'Number of players skipped',
        example: 0
      }),
      hasMore: z.boolean().openapi({
        description: 'Whether there are more players available',
        example: true
      })
    }).openapi({
      description: 'Pagination metadata'
    })
  }).openapi({
    description: 'Players list with pagination'
  })
});

export const MergePlayersResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    targetPlayer: PlayerSchema.openapi({
      description: 'The player that received all merged data'
    }),
    mergedData: z.object({
      gamesTransferred: z.number().int().min(0).openapi({
        description: 'Number of game statistics transferred',
        example: 12
      }),
      eventsTransferred: z.number().int().min(0).openapi({
        description: 'Number of game events transferred',
        example: 45
      }),
      votesTransferred: z.number().int().min(0).openapi({
        description: 'Number of meeting votes transferred',
        example: 67
      }),
      rankingsTransferred: z.number().int().min(0).openapi({
        description: 'Number of ranking records transferred',
        example: 15
      })
    }).openapi({
      description: 'Summary of data that was merged'
    })
  }).openapi({
    description: 'Merge operation results'
  })
});

/**
 * Type Exports
 */
export type Player = z.infer<typeof PlayerSchema>;
export type PlayerStats = z.infer<typeof PlayerStatsSchema>;
export type PlayerWithStats = z.infer<typeof PlayerWithStatsSchema>;
export type CreatePlayerRequest = z.infer<typeof CreatePlayerRequestSchema>;
export type UpdatePlayerRequest = z.infer<typeof UpdatePlayerRequestSchema>;
export type MergePlayersRequest = z.infer<typeof MergePlayersRequestSchema>;
export type PlayersQuery = z.infer<typeof PlayersQuerySchema>;
export type PlayerResponse = z.infer<typeof PlayerResponseSchema>;
export type PlayerWithStatsResponse = z.infer<typeof PlayerWithStatsResponseSchema>;
export type PlayersListResponse = z.infer<typeof PlayersListResponseSchema>;
export type MergePlayersResponse = z.infer<typeof MergePlayersResponseSchema>;

/**
 * Register all schemas with OpenAPI registry
 */
openApiRegistry.register('Player', PlayerSchema);
openApiRegistry.register('PlayerRanking', PlayerRankingSchema);
openApiRegistry.register('PlayerStats', PlayerStatsSchema);
openApiRegistry.register('PlayerWithStats', PlayerWithStatsSchema);
openApiRegistry.register('CreatePlayerRequest', CreatePlayerRequestSchema);
openApiRegistry.register('UpdatePlayerRequest', UpdatePlayerRequestSchema);
openApiRegistry.register('MergePlayersRequest', MergePlayersRequestSchema);
openApiRegistry.register('PlayersQuery', PlayersQuerySchema);
openApiRegistry.register('PlayerResponse', PlayerResponseSchema);
openApiRegistry.register('PlayerWithStatsResponse', PlayerWithStatsResponseSchema);
openApiRegistry.register('PlayersListResponse', PlayersListResponseSchema);
openApiRegistry.register('MergePlayersResponse', MergePlayersResponseSchema);
openApiRegistry.register('PlayerErrorResponse', ErrorResponseSchema);