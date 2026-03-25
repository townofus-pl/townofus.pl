---
applyTo: "src/app/api/schema/**"
---
# Zod Schemas & OpenAPI Patterns

## Architecture (layered)

  common.ts   → Atomic validators, soft-delete helpers, formatting utilities
  base.ts     → Framework-level response/param schemas (BaseResponse, ErrorResponse, IdParam)
  players.ts  → Domain schemas for players (derives from Prisma-generated models)
  games.ts    → Domain schemas for games
  registry.ts → Singleton OpenAPI registry + document generator

## Creating a new domain schema file

Follow this structure:

  import { z } from 'zod';
  import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
  import { BaseResponseSchema, ErrorResponseSchema } from './base';
  import { openApiRegistry } from './registry';
  import { SomeModelSchema } from '../../../generated/zod/schemas/variants/pure';

  extendZodWithOpenApi(z);  // MUST call at top of every schema file

  // 1. Core model — derive from Prisma-generated schema via .pick()/.extend()
  export const FooSchema = SomeModelSchema.pick({
    id: true,
    name: true,
  }).openapi('Foo', {
    description: 'Description of the model',
    example: { id: 1, name: 'Example' }
  });

  // 2. Request schemas
  export const CreateFooRequestSchema = z.object({
    name: z.string()
      .min(1, 'Name is required')
      .openapi({ description: '...', example: '...' })
  });

  // 3. Query parameter schemas (string inputs, transform to typed values)
  export const FooQuerySchema = z.object({
    limit: z.string().optional()
      .transform(val => val ? parseInt(val, 10) : 20)
      .refine(val => !isNaN(val) && val >= 1 && val <= 100, { message: '...' })
      .openapi({ description: '...', example: '20', default: '20' }),
  });

  // 4. Response schemas — extend BaseResponseSchema
  export const FooResponseSchema = BaseResponseSchema.extend({
    data: FooSchema.openapi({ description: 'Foo data' })
  });

  // 5. Type exports via z.infer
  export type Foo = z.infer<typeof FooSchema>;
  export type CreateFooRequest = z.infer<typeof CreateFooRequestSchema>;

  // 6. Register ALL schemas with the global registry
  openApiRegistry.register('Foo', FooSchema);
  openApiRegistry.register('CreateFooRequest', CreateFooRequestSchema);
  openApiRegistry.register('FooResponse', FooResponseSchema);

## Key rules

- Every schema field MUST have `.openapi({ description, example })` annotations
- Derive core models from Prisma-generated schemas (`src/generated/zod/schemas/variants/pure`)
  using `.pick()` then `.extend()` — do not redefine fields that exist in the model
- Query params arrive as strings — use `.transform()` to parse to numbers/booleans
- Response schemas extend `BaseResponseSchema` (adds `success` and optional `message`)
- Error responses use `ErrorResponseSchema` (adds `success`, `error`, optional `details`)
- Export TypeScript types via `z.infer<typeof Schema>` at the bottom
- Register every schema at module level (side effect on import)

## Reusable validators from common.ts

  GameIdentifierSchema    // YYYYMMDD_HHMM pattern
  PlayerNameSchema        // 1-50 chars, trimmed, alphanumeric + basic punctuation
  RoleNameSchema          // 1-30 chars
  ModifierNameSchema      // 1-30 chars
  TeamSchema              // enum: Crewmate | Impostor | Neutral
  MapSchema               // 1-20 chars
  PaginationLimitSchema   // int 1-100, default 20
  PaginationOffsetSchema  // int >= 0, default 0
  SortOrderSchema         // enum: asc | desc, default asc
  JsonFileSchema          // File type, JSON, max 10MB

## Soft-delete helpers (also in common.ts)

  import { withoutDeleted } from '@/app/api/schema/common';  // = { deletedAt: null }
  import { onlyDeleted } from '@/app/api/schema/common';     // = { deletedAt: { not: null } }

## IMPORTANT: Two createSuccessResponse / createErrorResponse functions exist

  // @/app/api/_utils — returns NextResponse (use in API route handlers)
  import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';
  return createSuccessResponse(data);           // NextResponse.json(...)
  return createErrorResponse('Not found', 404); // NextResponse.json(...)

  // @/app/api/schema/common — returns plain objects (use for schema building / tests)
  import { createSuccessResponse, createErrorResponse } from '@/app/api/schema/common';
  createSuccessResponse(data);                  // { success: true, data }
  createErrorResponse('Not found');             // { success: false, error }

  In API handlers, ALWAYS import from @/app/api/_utils.

## Validation error formatting

  import { formatZodError } from '@/app/api/schema/common';

  const result = SomeSchema.safeParse(input);
  if (!result.success) {
    return createErrorResponse(
      'Validation failed: ' + JSON.stringify(formatZodError(result.error)),
      400
    );
  }
