import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '../../_middlewares';
import { GET as getHandler } from './get';
import { openApiRegistry } from '../../schema/registry';
import { ErrorResponseSchema } from '../../schema/base';

extendZodWithOpenApi(z);

// Apply middleware to handlers
export const GET = withCors(withAuth(getHandler));

// Player statistics schema
const PlayerStatsSchema = z.object({
  playerId: z.number().openapi({
    description: 'Player database ID',
    example: 1
  }),
  playerName: z.string().openapi({
    description: 'Player name',
    example: 'Malkiz'
  }),
  gamesPlayed: z.number().openapi({
    description: 'Total number of games played',
    example: 45
  }),
  wins: z.number().openapi({
    description: 'Number of games won',
    example: 28
  }),
  losses: z.number().openapi({
    description: 'Number of games lost',
    example: 17
  }),
  winRate: z.number().openapi({
    description: 'Win rate as percentage (0-100)',
    example: 62.22
  }),
  totalPoints: z.number().openapi({
    description: 'Total points earned across all games',
    example: 156.8
  }),
  averagePoints: z.number().openapi({
    description: 'Average points per game',
    example: 3.49
  }),
  totalTasks: z.number().openapi({
    description: 'Total tasks completed',
    example: 234
  }),
  averageTasks: z.number().openapi({
    description: 'Average tasks completed per game',
    example: 5.2
  }),
  killAccuracy: z.number().openapi({
    description: 'Kill accuracy percentage (0-100)',
    example: 85.71
  }),
  guessAccuracy: z.number().openapi({
    description: 'Guess accuracy percentage (0-100)',
    example: 75.0
  }),
  currentRanking: z.number().nullable().openapi({
    description: 'Current ranking points (null if no ranking)',
    example: 2150
  })
}).openapi({
  description: 'Player statistics data'
});

// Role statistics schema
const RoleStatsSchema = z.object({
  roleName: z.string().openapi({
    description: 'Role name',
    example: 'Sheriff'
  }),
  gamesPlayed: z.number().openapi({
    description: 'Number of times this role was played',
    example: 23
  }),
  wins: z.number().openapi({
    description: 'Number of wins with this role',
    example: 15
  }),
  losses: z.number().openapi({
    description: 'Number of losses with this role',
    example: 8
  }),
  winRate: z.number().openapi({
    description: 'Win rate percentage for this role (0-100)',
    example: 65.22
  }),
  totalPoints: z.number().openapi({
    description: 'Total points earned with this role',
    example: 78.5
  }),
  averagePoints: z.number().openapi({
    description: 'Average points per game with this role',
    example: 3.41
  })
}).openapi({
  description: 'Role statistics data'
});

// Daily statistics schema
const DailyStatsSchema = z.object({
  gameDate: z.string().openapi({
    description: 'Date of games (YYYY-MM-DD)',
    example: '2025-08-27'
  }),
  totalGames: z.number().openapi({
    description: 'Total games played on this date',
    example: 15
  }),
  crewmateWins: z.number().openapi({
    description: 'Number of Crewmate wins',
    example: 8
  }),
  impostorWins: z.number().openapi({
    description: 'Number of Impostor wins',
    example: 5
  }),
  neutralWins: z.number().openapi({
    description: 'Number of Neutral wins',
    example: 2
  }),
  uniquePlayers: z.number().openapi({
    description: 'Number of unique players who played',
    example: 12
  }),
  averageDurationMinutes: z.number().openapi({
    description: 'Average game duration in minutes',
    example: 12.5
  })
}).openapi({
  description: 'Daily game statistics'
});

// Response schemas for different stat types
const PlayerStatsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    type: z.literal('players').openapi({
      description: 'Statistics type'
    }),
    players: z.array(PlayerStatsSchema).openapi({
      description: 'List of player statistics'
    }),
    pagination: z.object({
      total: z.number().openapi({ example: 35 }),
      limit: z.number().openapi({ example: 20 }),
      offset: z.number().openapi({ example: 0 }),
      hasMore: z.boolean().openapi({ example: true })
    }),
    filters: z.object({
      date: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      player: z.string().optional(),
      minGames: z.number()
    })
  })
}).openapi({
  description: 'Player statistics response'
});

const RoleStatsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    type: z.literal('roles').openapi({
      description: 'Statistics type'
    }),
    roles: z.array(RoleStatsSchema).openapi({
      description: 'List of role statistics'
    }),
    pagination: z.object({
      total: z.number().openapi({ example: 45 }),
      limit: z.number().openapi({ example: 20 }),
      offset: z.number().openapi({ example: 0 }),
      hasMore: z.boolean().openapi({ example: true })
    }),
    filters: z.object({
      date: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      minGames: z.number()
    })
  })
}).openapi({
  description: 'Role statistics response'
});

const DailyStatsResponseSchema = z.object({
  success: z.boolean().openapi({ example: true }),
  data: z.object({
    type: z.literal('daily').openapi({
      description: 'Statistics type'
    }),
    dailyStats: z.array(DailyStatsSchema).openapi({
      description: 'List of daily statistics'
    }),
    pagination: z.object({
      total: z.number().openapi({ example: 25 }),
      limit: z.number().openapi({ example: 50 }),
      offset: z.number().openapi({ example: 0 }),
      hasMore: z.boolean().openapi({ example: false })
    }),
    filters: z.object({
      date: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    })
  })
}).openapi({
  description: 'Daily statistics response'
});

// Register OpenAPI path
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/games/stats',
  description: 'Get comprehensive game statistics including player performance, role statistics, and daily summaries. Supports filtering by date ranges and player names.',
  summary: 'Get game statistics',
  tags: ['Games'],
  security: [{ basicAuth: [] }],
  request: {
    query: z.object({
      type: z.enum(['players', 'roles', 'daily']).default('players').openapi({
        description: 'Type of statistics to retrieve',
        example: 'players'
      }),
      date: z.string().optional().openapi({
        description: 'Filter by specific date (YYYYMMDD format)',
        example: '20250827'
      }),
      startDate: z.string().optional().openapi({
        description: 'Filter from this date onwards (YYYYMMDD format)',
        example: '20250801'
      }),
      endDate: z.string().optional().openapi({
        description: 'Filter up to this date (YYYYMMDD format)',
        example: '20250831'
      }),
      player: z.string().optional().openapi({
        description: 'Filter by player name (for player stats only)',
        example: 'Malkiz'
      }),
      minGames: z.string().optional().openapi({
        description: 'Minimum games played to include in results',
        example: '5'
      }),
      sort: z.enum(['name', 'gamesPlayed', 'wins', 'winRate', 'totalPoints', 'averagePoints']).optional().openapi({
        description: 'Field to sort by',
        example: 'winRate'
      }),
      order: z.enum(['asc', 'desc']).optional().openapi({
        description: 'Sort order',
        example: 'desc'
      }),
      limit: z.string().optional().openapi({
        description: 'Number of results to return (1-100)',
        example: '20'
      }),
      offset: z.string().optional().openapi({
        description: 'Number of results to skip for pagination',
        example: '0'
      })
    })
  },
  responses: {
    200: {
      description: 'Successfully retrieved game statistics',
      content: {
        'application/json': {
          schema: z.union([
            PlayerStatsResponseSchema,
            RoleStatsResponseSchema,
            DailyStatsResponseSchema
          ]).openapi({
            description: 'Statistics response (schema depends on type parameter)'
          })
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