import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
// Extend Zod with OpenAPI
extendZodWithOpenApi(z);
/**
 * Base response schemas used across all API endpoints
 */
export const BaseResponseSchema = z.object({
  success: z.boolean().openapi({
    description: 'Indicates if the request was successful',
    example: true
  }),
  message: z.string().optional().openapi({
    description: 'Optional message providing additional context',
    example: 'Operation completed successfully'
  })
});
export const ErrorResponseSchema = z.object({
  success: z.boolean().openapi({ 
    example: false,
    description: 'Always false for error responses'
  }),
  error: z.string().openapi({
    description: 'Error message describing what went wrong',
    example: 'Validation failed'
  }),
  details: z.record(z.unknown()).optional().openapi({
    description: 'Additional error details (e.g., validation errors)',
    example: {
      field: 'name',
      message: 'Name is required'
    }
  })
});
/**
 * Common parameter schemas
 */
export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a positive integer').openapi({
    description: 'Unique identifier',
    example: '1'
  })
});
/**
 * Common field schemas
 */
export const TimestampSchema = z.object({
  createdAt: z.date().openapi({
    description: 'When the record was created',
    example: '2024-01-15T10:30:00Z'
  }),
  updatedAt: z.date().openapi({
    description: 'When the record was last updated',
    example: '2024-01-15T10:30:00Z'
  })
});
export const ColorSchema = z.string()
  .min(1)
  .max(50)
  .regex(/^[a-zA-Z\s-]+$/, 'Color must contain only letters, spaces, and hyphens')
  .openapi({
    description: 'Color name',
    example: 'red',
    pattern: '^[a-zA-Z\\s-]+$'
  });
export const PriceSchema = z.number()
  .positive('Price must be positive')
  .max(999999.99, 'Price too high')
  .openapi({
    description: 'Price in USD',
    example: 2.99,
    minimum: 0.01,
    maximum: 999999.99
  });
export const DescriptionSchema = z.string()
  .max(1000, 'Description too long')
  .optional()
  .openapi({
    description: 'Optional description text',
    example: 'A detailed description of the item',
    maxLength: 1000
  });
/**
 * Type helpers
 */
export type BaseResponse = z.infer<typeof BaseResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type IdParam = z.infer<typeof IdParamSchema>;
export type Timestamp = z.infer<typeof TimestampSchema>;
