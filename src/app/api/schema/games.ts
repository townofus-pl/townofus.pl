import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {
  BaseResponseSchema,
  ErrorResponseSchema
} from './base';
import { 
  GameModelSchema,
  GamePlayerStatisticsModelSchema,
  GameEventModelSchema,
  MeetingModelSchema 
} from '../../../generated/zod/schemas/variants/pure';
import { openApiRegistry } from './registry';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Core Schemas - Using Auto-Generated Base Models
 */

// Game base schema using auto-generated model
export const GameSchema = GameModelSchema.pick({
  id: true,
  startTime: true,
  endTime: true,
  map: true,
  maxTasks: true,
  createdAt: true,
  updatedAt: true,
}).openapi('Game', {
  description: 'Game base model from database',
  example: {
    id: 123,
    startTime: new Date('2025-08-27T21:56:26Z'),
    endTime: new Date('2025-08-27T22:09:25Z'),
    map: 'Polus',
    maxTasks: 9,
    createdAt: new Date('2025-08-27T22:10:00Z'),
    updatedAt: new Date('2025-08-27T22:10:00Z')
  }
});

// Player statistics schema using auto-generated model  
export const PlayerGameStatsSchema = GamePlayerStatisticsModelSchema.pick({
  id: true,
  playerId: true,
  win: true,
  disconnected: true,
  initialRolePoints: true,
  correctKills: true,
  incorrectKills: true,
  correctProsecutes: true,
  incorrectProsecutes: true,
  correctGuesses: true,
  incorrectGuesses: true,
  correctDeputyShoots: true,
  incorrectDeputyShoots: true,
  correctJailorExecutes: true,
  incorrectJailorExecutes: true,
  correctMedicShields: true,
  incorrectMedicShields: true,
  correctWardenFortifies: true,
  incorrectWardenFortifies: true,
  janitorCleans: true,
  completedTasks: true,
  survivedRounds: true,
  correctAltruistRevives: true,
  incorrectAltruistRevives: true,
  correctSwaps: true,
  incorrectSwaps: true,
  totalPoints: true,
}).openapi('PlayerGameStats', {
  description: 'Player statistics for a specific game',
  example: {
    id: 1,
    playerId: 42,
    win: true,
    disconnected: false,
    initialRolePoints: 3,
    correctKills: 1,
    incorrectKills: 0,
    correctProsecutes: 0,
    incorrectProsecutes: 0,
    correctGuesses: 2,
    incorrectGuesses: 0,
    correctDeputyShoots: 0,
    incorrectDeputyShoots: 0,
    correctJailorExecutes: 0,
    incorrectJailorExecutes: 0,
    correctMedicShields: 0,
    incorrectMedicShields: 0,
    correctWardenFortifies: 0,
    incorrectWardenFortifies: 0,
    janitorCleans: 0,
    completedTasks: 5,
    survivedRounds: 3,
    correctAltruistRevives: 0,
    incorrectAltruistRevives: 0,
    correctSwaps: 0,
    incorrectSwaps: 0,
    totalPoints: 15.5
  }
});

// Game event schema using auto-generated model
export const GameEventSchema = GameEventModelSchema.pick({
  id: true,
  timestamp: true,
  description: true,
  eventType: true,
  playerId: true,
  targetId: true,
}).openapi('GameEvent', {
  description: 'Game event record',
  example: {
    id: 1,
    timestamp: '21:58:45',
    description: 'Malkiz killed by brubel',
    eventType: 'kill',
    playerId: 5,
    targetId: 3
  }
});

// Meeting schema using auto-generated model
export const MeetingSchema = MeetingModelSchema.pick({
  id: true,
  meetingNumber: true,
  deathsSinceLastMeeting: true,
  wasTie: true,
  wasBlessed: true,
}).openapi('Meeting', {
  description: 'Meeting information',
  example: {
    id: 1,
    meetingNumber: 1,
    deathsSinceLastMeeting: '[]',
    wasTie: false,
    wasBlessed: false
  }
});

/**
 * Upload and API-specific Schemas (not database models)
 */

// Game metadata schema for upload data (matches GameMetadata interface)
export const GameMetadataSchema = z.object({
  startTime: z.string().openapi({
    description: 'Game start time in ISO format',
    example: '2025-08-27 21:56:26'
  }),
  endTime: z.string().openapi({
    description: 'Game end time in ISO format',
    example: '2025-08-27 22:09:25'
  }),
  duration: z.string().openapi({
    description: 'Game duration in MM:SS format',
    example: '12:58'
  }),
  playerCount: z.number().int().positive().openapi({
    description: 'Number of players in the game',
    example: 12
  }),
  map: z.string().min(1).openapi({
    description: 'Map name where the game was played',
    example: 'Polus'
  }),
  maxTasks: z.number().int().positive().optional().openapi({
    description: 'Maximum number of tasks per player',
    example: 9
  })
});

// Player statistics schema for upload data (matches PlayerStats interface)
export const PlayerStatsSchema = z.object({
  playerName: z.string().min(1).openapi({
    description: 'Player name',
    example: 'brubel'
  }),
  roleHistory: z.array(z.string()).openapi({
    description: 'Array of roles the player had during the game',
    example: ['Doomsayer']
  }),
  modifiers: z.array(z.string()).openapi({
    description: 'Array of modifiers the player had',
    example: ['Torch', 'Satellite']
  }),
  win: z.number().int().min(0).max(1).openapi({
    description: 'Whether player won (1) or lost (0)',
    example: 1
  }),
  disconnected: z.number().int().min(0).max(1).openapi({
    description: 'Whether player disconnected (1) or not (0)',
    example: 0
  }),
  initialRolePoints: z.number().int().openapi({
    description: 'Points awarded for initial role',
    example: 3
  }),
  correctKills: z.number().int().min(0).openapi({
    description: 'Number of correct kills made',
    example: 1
  }),
  incorrectKills: z.number().int().min(0).openapi({
    description: 'Number of incorrect kills made',
    example: 0
  }),
  correctProsecutes: z.number().int().min(0).openapi({
    description: 'Number of correct prosecutions',
    example: 0
  }),
  incorrectProsecutes: z.number().int().min(0).openapi({
    description: 'Number of incorrect prosecutions',
    example: 0
  }),
  correctGuesses: z.number().int().min(0).openapi({
    description: 'Number of correct guesses',
    example: 3
  }),
  incorrectGuesses: z.number().int().min(0).openapi({
    description: 'Number of incorrect guesses',
    example: 0
  }),
  correctDeputyShoots: z.number().int().min(0).openapi({
    description: 'Number of correct deputy shoots',
    example: 0
  }),
  incorrectDeputyShoots: z.number().int().min(0).openapi({
    description: 'Number of incorrect deputy shoots',
    example: 0
  }),
  correctJailorExecutes: z.number().int().min(0).openapi({
    description: 'Number of correct jailor executes',
    example: 0
  }),
  incorrectJailorExecutes: z.number().int().min(0).openapi({
    description: 'Number of incorrect jailor executes',
    example: 0
  }),
  correctMedicShields: z.number().int().min(0).openapi({
    description: 'Number of correct medic shields',
    example: 0
  }),
  incorrectMedicShields: z.number().int().min(0).openapi({
    description: 'Number of incorrect medic shields',
    example: 0
  }),
  correctWardenFortifies: z.number().int().min(0).openapi({
    description: 'Number of correct warden fortifies',
    example: 0
  }),
  incorrectWardenFortifies: z.number().int().min(0).openapi({
    description: 'Number of incorrect warden fortifies',
    example: 0
  }),
  janitorCleans: z.number().int().min(0).openapi({
    description: 'Number of janitor cleans performed',
    example: 0
  }),
  completedTasks: z.number().int().min(0).openapi({
    description: 'Number of tasks completed',
    example: 5
  }),
  survivedRounds: z.number().int().min(0).openapi({
    description: 'Number of rounds survived',
    example: 3
  }),
  correctAltruistRevives: z.number().int().min(0).openapi({
    description: 'Number of correct altruist revives',
    example: 0
  }),
  incorrectAltruistRevives: z.number().int().min(0).openapi({
    description: 'Number of incorrect altruist revives',
    example: 0
  }),
  correctSwaps: z.number().int().min(0).openapi({
    description: 'Number of correct swaps',
    example: 0
  }),
  incorrectSwaps: z.number().int().min(0).openapi({
    description: 'Number of incorrect swaps',
    example: 0
  }),
  totalPoints: z.number().openapi({
    description: 'Total points earned in the game',
    example: 15.5
  })
});

// Upload game event schema (simpler than database schema)
export const UploadGameEventSchema = z.object({
  timestamp: z.string().openapi({
    description: 'Event timestamp in HH:MM:SS format',
    example: '21:58:45'
  }),
  description: z.string().openapi({
    description: 'Event description',
    example: 'Malkiz killed by brubel'
  })
});

// Meeting data schema for upload
export const MeetingDataSchema = z.object({
  meetingNumber: z.number().int().positive().openapi({
    description: 'Meeting number (sequential)',
    example: 1
  }),
  deathsSinceLastMeeting: z.array(z.string()).openapi({
    description: 'Array of death descriptions since last meeting',
    example: ['Malkiz was killed by brubel']
  }),
  votes: z.array(z.object({
    voter: z.string(),
    target: z.string()
  })).openapi({
    description: 'Array of vote records',
    example: [{ voter: 'brubel', target: 'Malkiz' }]
  }),
  skipVotes: z.array(z.string()).openapi({
    description: 'Array of players who voted to skip',
    example: ['player1', 'player2']
  }),
  noVotes: z.array(z.string()).openapi({
    description: 'Array of players who did not vote',
    example: []
  }),
  blackmailedPlayers: z.array(z.string()).openapi({
    description: 'Array of blackmailed players in this meeting',
    example: []
  }),
  jailedPlayers: z.array(z.string()).openapi({
    description: 'Array of jailed players in this meeting',
    example: ['Malkiz']
  }),
  wasTie: z.boolean().openapi({
    description: 'Whether the meeting result was a tie',
    example: false
  }),
  wasBlessed: z.boolean().openapi({
    description: 'Whether the meeting was blessed',
    example: false
  })
});

// Complete game data schema for uploads
export const GameDataSchema = z.object({
  metadata: GameMetadataSchema,
  players: z.array(PlayerStatsSchema).min(1).openapi({
    description: 'Array of player statistics for all players in the game'
  }),
  gameEvents: z.array(UploadGameEventSchema).openapi({
    description: 'Array of all game events that occurred'
  }),
  meetings: z.array(MeetingDataSchema).openapi({
    description: 'Array of all meetings that occurred in the game'
  })
});

// Upload game data file schema - for multipart/form-data uploads
export const UploadGameDataFileSchema = z.object({
  gameDataFile: z.instanceof(File).openapi({
    description: 'JSON file containing complete game data from mod',
    type: 'string',
    format: 'binary'
  })
}).openapi({
  description: 'File upload containing game data JSON'
});

/**
 * Query Parameter Schemas
 */
export const GamesQuerySchema = z.object({
  limit: z.string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 20)
    .refine(val => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100'
    })
    .openapi({
      description: 'Number of games to return (1-100)',
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
      description: 'Number of games to skip for pagination',
      example: '0',
      default: '0'
    }),
  startDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'Start date must be a valid ISO date string'
    })
    .openapi({
      description: 'Filter games starting from this date (ISO format)',
      example: '2025-01-01T00:00:00Z'
    }),
  endDate: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), {
      message: 'End date must be a valid ISO date string'
    })
    .openapi({
      description: 'Filter games up to this date (ISO format)',
      example: '2025-12-31T23:59:59Z'
    }),
  map: z.string()
    .optional()
    .transform(val => val?.trim() || undefined)
    .openapi({
      description: 'Filter games by map name (case-insensitive partial match)',
      example: 'polus'
    }),
  sort: z.enum(['startTime', 'endTime', 'map', 'playerCount', 'duration', 'createdAt'])
    .optional()
    .default('startTime')
    .openapi({
      description: 'Field to sort by',
      example: 'startTime',
      default: 'startTime',
      enum: ['startTime', 'endTime', 'map', 'playerCount', 'duration', 'createdAt']
    }),
  order: z.enum(['asc', 'desc'])
    .optional()
    .default('desc')
    .openapi({
      description: 'Sort order',
      example: 'desc',
      default: 'desc',
      enum: ['asc', 'desc']
    })
});

/**
 * Response Schemas
 */

// Game summary for list views
export const GameSummarySchema = GameSchema.extend({
  playerCount: z.number().int().openapi({
    description: 'Number of players in the game',
    example: 12
  }),
  duration: z.string().openapi({
    description: 'Game duration in MM:SS format',
    example: '12:58'
  }),
  eventsCount: z.number().int().openapi({
    description: 'Number of game events',
    example: 45
  }),
  meetingsCount: z.number().int().openapi({
    description: 'Number of meetings held',
    example: 3
  })
});

// Complete game details with relationships
export const GameDetailsSchema = GameSchema.extend({
  gamePlayerStatistics: z.array(PlayerGameStatsSchema.extend({
    player: z.object({
      id: z.number().int(),
      name: z.string()
    }).openapi({
      description: 'Player basic information'
    }),
    roleHistory: z.array(z.object({
      roleName: z.string(),
      order: z.number().int()
    })).openapi({
      description: 'Role history for this player'
    }),
    modifiers: z.array(z.object({
      modifierName: z.string()
    })).openapi({
      description: 'Modifiers for this player'
    })
  })).openapi({
    description: 'Complete player statistics with relationships'
  }),
  gameEvents: z.array(GameEventSchema.extend({
    player: z.object({
      id: z.number().int(),
      name: z.string()
    }).nullable().openapi({
      description: 'Player who triggered the event'
    }),
    target: z.object({
      id: z.number().int(),
      name: z.string()
    }).nullable().openapi({
      description: 'Target player of the event'
    })
  })).openapi({
    description: 'Game events with player information'
  }),
  meetings: z.array(MeetingSchema.extend({
    meetingVotes: z.array(z.object({
      target: z.object({
        id: z.number().int(),
        name: z.string()
      }),
      voter: z.object({
        id: z.number().int(),
        name: z.string()
      })
    })).openapi({
      description: 'Meeting votes with player information'
    }),
    skipVotes: z.array(z.object({
      player: z.object({
        id: z.number().int(),
        name: z.string()
      })
    })).openapi({
      description: 'Skip votes with player information'
    }),
    noVotes: z.array(z.object({
      player: z.object({
        id: z.number().int(),
        name: z.string()
      })
    })).openapi({
      description: 'No votes with player information'
    }),
    blackmailedPlayers: z.array(z.object({
      player: z.object({
        id: z.number().int(),
        name: z.string()
      })
    })).openapi({
      description: 'Blackmailed players with information'
    }),
    jailedPlayers: z.array(z.object({
      player: z.object({
        id: z.number().int(),
        name: z.string()
      })
    })).openapi({
      description: 'Jailed players with information'
    })
  })).openapi({
    description: 'Meetings with complete vote information'
  })
});

// Response wrapper schemas
export const GameResponseSchema = BaseResponseSchema.extend({
  data: GameSchema.openapi({
    description: 'Game data'
  })
});

export const GameDetailsResponseSchema = BaseResponseSchema.extend({
  data: GameDetailsSchema.openapi({
    description: 'Complete game details with relationships'
  })
});

export const GamesListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    games: z.array(GameSummarySchema).openapi({
      description: 'Array of games with summary information'
    }),
    pagination: z.object({
      total: z.number().int().min(0).openapi({
        description: 'Total number of games matching the query',
        example: 156
      }),
      limit: z.number().int().min(1).max(100).openapi({
        description: 'Number of games per page',
        example: 20
      }),
      offset: z.number().int().min(0).openapi({
        description: 'Number of games skipped',
        example: 0
      }),
      hasMore: z.boolean().openapi({
        description: 'Whether there are more games available',
        example: true
      })
    }).openapi({
      description: 'Pagination metadata'
    })
  }).openapi({
    description: 'Games list with pagination'
  })
});

export const GameUploadSuccessResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    gameId: z.number().int().positive().openapi({
      description: 'ID of the created game',
      example: 123
    }),
    message: z.string().openapi({
      description: 'Success message',
      example: 'Game data uploaded successfully'
    }),
    playersCreated: z.number().int().min(0).openapi({
      description: 'Number of new players created',
      example: 3
    }),
    playersUpdated: z.number().int().min(0).openapi({
      description: 'Number of existing players updated',
      example: 9
    })
  })
});

export const GameUploadErrorResponseSchema = ErrorResponseSchema.extend({
  details: z.object({
    duplicateGame: z.boolean().optional().openapi({
      description: 'Whether this is a duplicate game upload',
      example: true
    }),
    validationErrors: z.array(z.string()).optional().openapi({
      description: 'Array of validation error messages',
      example: ['Invalid timestamp format', 'Player name cannot be empty']
    })
  }).optional()
});

export const GameDeleteResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    deletedGameId: z.number().int().openapi({
      description: 'ID of the deleted game',
      example: 123
    }),
    deletedData: z.object({
      playerStatistics: z.number().int().min(0).openapi({
        description: 'Number of player statistics records deleted',
        example: 12
      }),
      gameEvents: z.number().int().min(0).openapi({
        description: 'Number of game events deleted',
        example: 45
      }),
      meetings: z.number().int().min(0).openapi({
        description: 'Number of meetings deleted',
        example: 3
      }),
      meetingVotes: z.number().int().min(0).openapi({
        description: 'Number of meeting votes deleted',
        example: 24
      }),
      playerRankings: z.number().int().min(0).openapi({
        description: 'Number of player ranking records deleted',
        example: 12
      })
    }).openapi({
      description: 'Summary of deleted related data'
    })
  }).openapi({
    description: 'Game deletion results'
  })
});

/**
 * Type Exports
 */
export type Game = z.infer<typeof GameSchema>;
export type PlayerGameStats = z.infer<typeof PlayerGameStatsSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
export type Meeting = z.infer<typeof MeetingSchema>;
export type GameMetadata = z.infer<typeof GameMetadataSchema>;
export type PlayerStats = z.infer<typeof PlayerStatsSchema>;
export type UploadGameEvent = z.infer<typeof UploadGameEventSchema>;
export type MeetingData = z.infer<typeof MeetingDataSchema>;
export type GameData = z.infer<typeof GameDataSchema>;
export type UploadGameData = z.infer<typeof UploadGameDataFileSchema>;
export type GameSummary = z.infer<typeof GameSummarySchema>;
export type GameDetails = z.infer<typeof GameDetailsSchema>;
export type GamesQuery = z.infer<typeof GamesQuerySchema>;
export type GameResponse = z.infer<typeof GameResponseSchema>;
export type GameDetailsResponse = z.infer<typeof GameDetailsResponseSchema>;
export type GamesListResponse = z.infer<typeof GamesListResponseSchema>;
export type GameUploadSuccessResponse = z.infer<typeof GameUploadSuccessResponseSchema>;
export type GameUploadErrorResponse = z.infer<typeof GameUploadErrorResponseSchema>;
export type GameDeleteResponse = z.infer<typeof GameDeleteResponseSchema>;

/**
 * Legacy aliases for backward compatibility
 */
export const DatabaseGameSchema = GameSchema;
export type DatabaseGame = Game;

/**
 * Register all schemas with OpenAPI registry
 */
openApiRegistry.register('Game', GameSchema);
openApiRegistry.register('PlayerGameStats', PlayerGameStatsSchema);
openApiRegistry.register('GameEvent', GameEventSchema);
openApiRegistry.register('Meeting', MeetingSchema);
openApiRegistry.register('GameMetadata', GameMetadataSchema);
openApiRegistry.register('PlayerStats', PlayerStatsSchema);
openApiRegistry.register('UploadGameEvent', UploadGameEventSchema);
openApiRegistry.register('MeetingData', MeetingDataSchema);
openApiRegistry.register('GameData', GameDataSchema);
openApiRegistry.register('UploadGameDataFile', UploadGameDataFileSchema);
openApiRegistry.register('GameSummary', GameSummarySchema);
openApiRegistry.register('GameDetails', GameDetailsSchema);
openApiRegistry.register('GamesQuery', GamesQuerySchema);
openApiRegistry.register('GameResponse', GameResponseSchema);
openApiRegistry.register('GameDetailsResponse', GameDetailsResponseSchema);
openApiRegistry.register('GamesListResponse', GamesListResponseSchema);
openApiRegistry.register('GameUploadSuccessResponse', GameUploadSuccessResponseSchema);
openApiRegistry.register('GameUploadErrorResponse', GameUploadErrorResponseSchema);
openApiRegistry.register('GameDeleteResponse', GameDeleteResponseSchema);
openApiRegistry.register('GameErrorResponse', ErrorResponseSchema);