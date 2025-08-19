import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import {
  BaseResponseSchema,
  TimestampSchema,
  ColorSchema,
  PriceSchema,
  DescriptionSchema,
  IdParamSchema
} from './base';

// Extend Zod with OpenAPI
extendZodWithOpenApi(z);

/**
 * Core fruit schemas
 */

export const FruitSchema = z.object({
  id: z.number().int().positive().openapi({
    description: 'Unique identifier for the fruit',
    example: 1
  }),
  name: z.string().min(1).max(100).openapi({
    description: 'Name of the fruit',
    example: 'Red Apple'
  }),
  color: ColorSchema,
  price: PriceSchema,
  description: z.string().nullable().openapi({
    description: 'Description of the fruit',
    example: 'A delicious red apple from local orchards'
  }),
  inStock: z.boolean().openapi({
    description: 'Whether the fruit is currently in stock',
    example: true
  })
}).merge(TimestampSchema);

export const CreateFruitSchema = z.object({
  name: z.string().min(1).max(100).openapi({
    description: 'Name of the fruit',
    example: 'Red Apple'
  }),
  color: ColorSchema,
  price: PriceSchema,
  description: DescriptionSchema,
  inStock: z.boolean().optional().default(true).openapi({
    description: 'Whether the fruit is currently in stock',
    example: true
  })
});

export const UpdateFruitSchema = z.object({
  name: z.string().min(1).max(100).optional().openapi({
    description: 'Name of the fruit',
    example: 'Green Apple'
  }),
  color: ColorSchema.optional(),
  price: PriceSchema.optional(),
  description: DescriptionSchema,
  inStock: z.boolean().optional().openapi({
    description: 'Whether the fruit is currently in stock',
    example: false
  })
});

/**
 * Query schemas
 */

export const FruitQuerySchema = z.object({
  color: z.string().optional().openapi({
    description: 'Filter fruits by color',
    example: 'red'
  }),
  inStock: z.enum(['true', 'false']).optional().openapi({
    description: 'Filter fruits by stock status'
  }),
  search: z.string().optional().openapi({
    description: 'Search fruits by name or description',
    example: 'apple'
  }),
  minPrice: z.coerce.number().positive().optional().openapi({
    description: 'Minimum price filter',
    example: 1.0
  }),
  maxPrice: z.coerce.number().positive().optional().openapi({
    description: 'Maximum price filter',
    example: 10.0
  })
});

export const FruitParamsSchema = IdParamSchema;

/**
 * Response schemas
 */

export const FruitResponseSchema = BaseResponseSchema.extend({
  data: FruitSchema
});

export const FruitsListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    fruits: z.array(FruitSchema).openapi({
      description: 'List of fruits matching the query'
    }),
    count: z.number().int().openapi({
      description: 'Number of fruits returned',
      example: 5
    }),
    filters: z.object({
      color: z.string().nullable(),
      inStock: z.string().nullable(),
      search: z.string().nullable(),
      minPrice: z.number().nullable(),
      maxPrice: z.number().nullable()
    }).openapi({
      description: 'Applied filters'
    })
  })
});

export const FruitCreatedResponseSchema = BaseResponseSchema.extend({
  data: FruitSchema
});

export const FruitUpdatedResponseSchema = BaseResponseSchema.extend({
  data: FruitSchema
});

export const FruitDeletedResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    message: z.string().openapi({
      description: 'Success message',
      example: 'Fruit deleted successfully'
    }),
    deletedFruit: FruitSchema
  })
});

/**
 * Type exports
 */

export type Fruit = z.infer<typeof FruitSchema>;
export type CreateFruit = z.infer<typeof CreateFruitSchema>;
export type UpdateFruit = z.infer<typeof UpdateFruitSchema>;
export type FruitQuery = z.infer<typeof FruitQuerySchema>;
export type FruitParams = z.infer<typeof FruitParamsSchema>;
export type FruitResponse = z.infer<typeof FruitResponseSchema>;
export type FruitsListResponse = z.infer<typeof FruitsListResponseSchema>;
export type FruitCreatedResponse = z.infer<typeof FruitCreatedResponseSchema>;
export type FruitUpdatedResponse = z.infer<typeof FruitUpdatedResponseSchema>;
export type FruitDeletedResponse = z.infer<typeof FruitDeletedResponseSchema>;
