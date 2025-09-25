import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Common validation helpers and utilities used across API schemas
 */

// Date/time validation helpers
export const DateTimeSchema = z.string()
  .datetime({ message: 'Invalid datetime format. Expected ISO 8601 format.' })
  .openapi({
    description: 'ISO 8601 datetime string',
    example: '2025-08-27T21:56:26.000Z',
    format: 'date-time'
  });

export const TimeStringSchema = z.string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, 'Invalid time format. Expected HH:MM:SS')
  .openapi({
    description: 'Time string in HH:MM:SS format',
    example: '21:56:26',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$'
  });

export const DurationStringSchema = z.string()
  .regex(/^\d{1,2}:\d{2}$/, 'Invalid duration format. Expected MM:SS or HH:MM')
  .openapi({
    description: 'Duration string in MM:SS or HH:MM format',
    example: '12:58',
    pattern: '^\\d{1,2}:\\d{2}$'
  });

// Game identifier validation
export const GameIdentifierSchema = z.string()
  .regex(/^\d{8}_\d{4}$/, 'Invalid game identifier format. Expected YYYYMMDD_HHMM')
  .openapi({
    description: 'Unique game identifier based on start time',
    example: '20250827_2156',
    pattern: '^\\d{8}_\\d{4}$'
  });

// Player name validation with case-insensitive matching support
export const PlayerNameSchema = z.string()
  .min(1, 'Player name cannot be empty')
  .max(50, 'Player name cannot exceed 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_.]+$/, 'Player name can only contain letters, numbers, spaces, hyphens, underscores, and dots')
  .transform(name => name.trim()) // Always trim whitespace
  .openapi({
    description: 'Player name (case-insensitive, automatically trimmed)',
    example: 'PlayerName123',
    minLength: 1,
    maxLength: 50,
    pattern: '^[a-zA-Z0-9\\s\\-_.]+$'
  });

// Role and modifier validation
export const RoleNameSchema = z.string()
  .min(1, 'Role name cannot be empty')
  .max(30, 'Role name cannot exceed 30 characters')
  .openapi({
    description: 'Game role name',
    example: 'Sheriff',
    minLength: 1,
    maxLength: 30
  });

export const ModifierNameSchema = z.string()
  .min(1, 'Modifier name cannot be empty')
  .max(30, 'Modifier name cannot exceed 30 characters')
  .openapi({
    description: 'Game modifier name',
    example: 'Bait',
    minLength: 1,
    maxLength: 30
  });

// Team validation
export const TeamSchema = z.enum(['Crewmate', 'Impostor', 'Neutral'])
  .openapi({
    description: 'Game team type',
    example: 'Crewmate',
    enum: ['Crewmate', 'Impostor', 'Neutral']
  });

// Map validation
export const MapSchema = z.string()
  .min(1, 'Map name cannot be empty')
  .max(20, 'Map name cannot exceed 20 characters')
  .openapi({
    description: 'Among Us map name',
    example: 'Polus',
    minLength: 1,
    maxLength: 20
  });

// Numeric validation helpers
export const PositiveIntegerSchema = z.number()
  .int('Must be an integer')
  .positive('Must be a positive number')
  .openapi({
    description: 'Positive integer',
    example: 1,
    minimum: 1
  });

export const NonNegativeIntegerSchema = z.number()
  .int('Must be an integer')
  .min(0, 'Must be zero or positive')
  .openapi({
    description: 'Non-negative integer',
    example: 0,
    minimum: 0
  });

export const PointsSchema = z.number()
  .finite('Points must be a finite number')
  .openapi({
    description: 'Point value (can be positive, negative, or zero)',
    example: 7.5
  });

export const WinRatioSchema = z.number()
  .min(0, 'Win ratio cannot be less than 0')
  .max(1, 'Win ratio cannot be greater than 1')
  .openapi({
    description: 'Win ratio as decimal between 0 and 1',
    example: 0.65,
    minimum: 0,
    maximum: 1
  });

// Pagination helpers
export const PaginationLimitSchema = z.number()
  .int('Limit must be an integer')
  .min(1, 'Limit must be at least 1')
  .max(100, 'Limit cannot exceed 100')
  .default(20)
  .openapi({
    description: 'Number of items to return per page',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100
  });

export const PaginationOffsetSchema = z.number()
  .int('Offset must be an integer')
  .min(0, 'Offset cannot be negative')
  .default(0)
  .openapi({
    description: 'Number of items to skip for pagination',
    example: 0,
    default: 0,
    minimum: 0
  });

// Sort order validation
export const SortOrderSchema = z.enum(['asc', 'desc'])
  .default('asc')
  .openapi({
    description: 'Sort order direction',
    example: 'asc',
    default: 'asc',
    enum: ['asc', 'desc']
  });

// File upload validation
export const JsonFileSchema = z.instanceof(File)
  .refine(
    (file) => file.type === 'application/json' || file.name.endsWith('.json'),
    'File must be a JSON file'
  )
  .refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB limit
    'File size cannot exceed 10MB'
  )
  .openapi({
    description: 'JSON file upload (max 10MB)',
    type: 'string',
    format: 'binary'
  });

// Filename pattern extraction
export const extractGameIdentifierFromFilename = (filename: string): string | null => {
  // Extract YYYYMMDD_HHMM pattern from filenames like "game_data_20250827_2156.json"
  const match = filename.match(/(\d{8}_\d{4})/);
  return match ? match[1] : null;
};

// Case-insensitive string comparison helper
export const normalizePlayerName = (name: string): string => {
  return name.trim().toLowerCase();
};

// Validation error formatter
export const formatZodError = (error: z.ZodError) => {
  return error.issues.reduce((acc, issue) => {
    const path = issue.path.join('.');
    acc[path] = issue.message;
    return acc;
  }, {} as Record<string, string>);
};

// Common response helpers
export const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true as const,
  data,
  ...(message && { message })
});

export const createErrorResponse = (error: string, details?: Record<string, unknown>) => ({
  success: false as const,
  error,
  ...(details && { details })
});

// Database query helpers for soft deletes
export const withoutDeleted = {
  deletedAt: null
};

export const onlyDeleted = {
  deletedAt: { not: null }
};

/**
 * Type exports for common helpers
 */
export type GameIdentifier = z.infer<typeof GameIdentifierSchema>;
export type PlayerName = z.infer<typeof PlayerNameSchema>;
export type RoleName = z.infer<typeof RoleNameSchema>;
export type ModifierName = z.infer<typeof ModifierNameSchema>;
export type Team = z.infer<typeof TeamSchema>;
export type Map = z.infer<typeof MapSchema>;
export type Points = z.infer<typeof PointsSchema>;
export type WinRatio = z.infer<typeof WinRatioSchema>;
export type SortOrder = z.infer<typeof SortOrderSchema>;