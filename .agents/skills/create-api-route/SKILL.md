---
name: create-api-route
description: Scaffold a new API route with handler files, route.ts middleware composition, Zod schemas, and OpenAPI registration. Use this skill when asked to create a new API endpoint, add a new route, or build a new REST resource.
---

# Create API Route + Schema

This skill scaffolds a complete API route following the project's strict conventions. Every API endpoint requires multiple files working together — this skill ensures nothing is missed.

## Prerequisites

Gather from the user:

| Data              | Required | Example                                       |
|-------------------|----------|-----------------------------------------------|
| Resource name     | Yes      | `seasons`                                     |
| HTTP methods      | Yes      | GET, POST, PUT, DELETE                        |
| Route path        | Yes      | `/api/seasons` or `/api/seasons/[id]`         |
| Protected or public | Yes   | Protected (default) or public (`/api/dramaafera/*`) |
| Has dynamic segment | No    | `[id]`, `[date]`, `[nickname]`                |
| Prisma model      | If exists | `Season`                                     |

## Step 1: Create Zod Schema File

Create `src/app/api/schema/<resource>.ts` following the 6-layer pattern:

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { BaseResponseSchema, ErrorResponseSchema } from './base';
import { openApiRegistry } from './registry';
// If a Prisma model exists, import the auto-generated schema:
// import { ResourceModelSchema } from '../../../generated/zod/schemas/variants/pure';

// MUST call at top of every schema file
extendZodWithOpenApi(z);

// ─── 1. Core Model Schema ─────────────────────────────────────────────
// Derive from Prisma-generated schema via .pick()/.extend()
export const ResourceSchema = ResourceModelSchema.pick({
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
}).openapi('Resource', {
  description: 'Resource description',
  example: { id: 1, name: 'Example', createdAt: new Date(), updatedAt: new Date() }
});

// ─── 2. Request Schemas ───────────────────────────────────────────────
export const CreateResourceRequestSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .openapi({ description: 'Resource name', example: 'Example' })
}).openapi('CreateResourceRequest');

export const UpdateResourceRequestSchema = CreateResourceRequestSchema.partial()
  .openapi('UpdateResourceRequest');

// ─── 3. Query Parameter Schemas ───────────────────────────────────────
// Query params arrive as strings — use .transform() to parse
export const ResourceQuerySchema = z.object({
  limit: z.string().optional()
    .transform(val => val ? parseInt(val, 10) : 20)
    .refine(val => !isNaN(val) && val >= 1 && val <= 100, {
      message: 'Limit must be between 1 and 100'
    })
    .openapi({ description: 'Items per page', example: '20' }),
  offset: z.string().optional()
    .transform(val => val ? parseInt(val, 10) : 0)
    .refine(val => !isNaN(val) && val >= 0, {
      message: 'Offset must be non-negative'
    })
    .openapi({ description: 'Items to skip', example: '0' }),
});

// ─── 4. Response Schemas ──────────────────────────────────────────────
// Always extend BaseResponseSchema
export const ResourceResponseSchema = BaseResponseSchema.extend({
  data: ResourceSchema.openapi({ description: 'Resource data' })
}).openapi('ResourceResponse');

export const ResourceListResponseSchema = BaseResponseSchema.extend({
  data: z.object({
    resources: z.array(ResourceSchema),
    pagination: z.object({
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
      hasMore: z.boolean(),
    })
  })
}).openapi('ResourceListResponse');

// ─── 5. Type Exports ──────────────────────────────────────────────────
export type Resource = z.infer<typeof ResourceSchema>;
export type CreateResourceRequest = z.infer<typeof CreateResourceRequestSchema>;
export type UpdateResourceRequest = z.infer<typeof UpdateResourceRequestSchema>;

// ─── 6. Registry Registration ─────────────────────────────────────────
openApiRegistry.register('Resource', ResourceSchema);
openApiRegistry.register('CreateResourceRequest', CreateResourceRequestSchema);
openApiRegistry.register('ResourceResponse', ResourceResponseSchema);
openApiRegistry.register('ResourceListResponse', ResourceListResponseSchema);
```

### Key schema rules

- Every field MUST have `.openapi({ description, example })` annotations
- Derive core models from Prisma-generated schemas using `.pick()` then `.extend()`
- Query params are always strings — use `.transform()` to parse to numbers/booleans
- Response schemas extend `BaseResponseSchema` (adds `success` and optional `message`)
- Register every schema at module level (side effect on import)

## Step 2: Create Handler Files

Create one file per HTTP method in `src/app/api/<resource>/`.

### GET handler template (`get.ts`)

```typescript
import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../_database';
import { ResourceQuerySchema } from '../schema/resource';
import { createSuccessResponse, createErrorResponse } from '../_utils';
import { formatZodError, withoutDeleted } from '../schema/common';

export async function GET(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const parseResult = ResourceQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      return createErrorResponse(
        'Invalid query parameters: ' + JSON.stringify(formatZodError(parseResult.error)),
        400
      );
    }

    const { limit, offset } = parseResult.data;

    const total = await prisma.resource.count({ where: { ...withoutDeleted } });
    const resources = await prisma.resource.findMany({
      where: { ...withoutDeleted },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return createSuccessResponse({
      resources,
      pagination: { total, limit, offset, hasMore: offset + limit < total }
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch resources: ' + error.message, 500);
    }
    return createErrorResponse('Internal server error', 500);
  }
}
```

### POST handler template (`post.ts`)

```typescript
import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../_database';
import { CreateResourceRequestSchema } from '../schema/resource';
import { createSuccessResponse, createErrorResponse } from '../_utils';
import { formatZodError, withoutDeleted } from '../schema/common';

export async function POST(request: NextRequest) {
  try {
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    const body = await request.json();
    const parseResult = CreateResourceRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return createErrorResponse(
        'Invalid request data: ' + JSON.stringify(formatZodError(parseResult.error)),
        400
      );
    }

    const data = parseResult.data;

    const resource = await prisma.resource.create({
      data: { ...data },
    });

    return createSuccessResponse(resource, 201);
  } catch (error) {
    console.error('Error creating resource:', error);
    if (error instanceof Error) {
      return createErrorResponse('Failed to create resource: ' + error.message, 500);
    }
    return createErrorResponse('Internal server error', 500);
  }
}
```

### Dynamic route GET handler (`[id]/get.ts`)

```typescript
import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { withoutDeleted } from '../../schema/common';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  _authContext: { user: { username: string } },
  { params }: RouteContext
) {
  try {
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    const { id } = await params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return createErrorResponse('Invalid ID format', 400);
    }

    const resource = await prisma.resource.findFirst({
      where: { id: numericId, ...withoutDeleted },
    });

    if (!resource) {
      return createErrorResponse('Resource not found', 404);
    }

    return createSuccessResponse(resource);
  } catch (error) {
    console.error('Error fetching resource:', error);
    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch resource: ' + error.message, 500);
    }
    return createErrorResponse('Internal server error', 500);
  }
}
```

## Step 3: Create route.ts with Middleware + OpenAPI

### Protected route (`route.ts`)

```typescript
import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { withAuth, withCors } from '../_middlewares';
import { GET as getHandler } from './get';
import { POST as postHandler } from './post';
import { openApiRegistry } from '../schema/registry';
import { ResourceListResponseSchema, CreateResourceRequestSchema, ResourceResponseSchema } from '../schema/resource';
import { ErrorResponseSchema } from '../schema/base';

extendZodWithOpenApi(z);

// ─── Middleware Composition ───────────────────────────────────────────
export const GET = withCors(withAuth(getHandler));
export const POST = withCors(withAuth(postHandler));

// ─── OpenAPI Registration ─────────────────────────────────────────────
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/resource',
  description: 'Description of what GET does',
  summary: 'List resources',
  tags: ['Resources'],
  security: [{ basicAuth: [] }],
  request: {
    query: z.object({
      limit: z.string().optional().openapi({ description: 'Items per page', example: '20' }),
      offset: z.string().optional().openapi({ description: 'Items to skip', example: '0' }),
    })
  },
  responses: {
    200: {
      description: 'Successfully retrieved resources',
      content: { 'application/json': { schema: ResourceListResponseSchema } }
    },
    400: {
      description: 'Invalid query parameters',
      content: { 'application/json': { schema: ErrorResponseSchema } }
    },
    401: {
      description: 'Authentication required',
      content: { 'application/json': { schema: ErrorResponseSchema } }
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ErrorResponseSchema } }
    }
  }
});
```

### Public route (for `/api/dramaafera/*`)

The only difference — no `withAuth`, no `security`:

```typescript
// Middleware: no withAuth
export const GET = withCors(getHandler);

// OpenAPI: no security field
openApiRegistry.registerPath({
  method: 'get',
  path: '/api/dramaafera/resource',
  // ... same structure but WITHOUT: security: [{ basicAuth: [] }],
});
```

## Step 4: Verify

1. Run `npm run build` to catch TypeScript errors
2. Check that the OpenAPI docs render: `GET /api/docs`

## Critical Checklist

Before considering the task done, verify:

- [ ] Every Prisma query includes `{ ...withoutDeleted }` in the where clause
- [ ] `extendZodWithOpenApi(z)` is called at the top of every file using `.openapi()`
- [ ] Protected routes use `withCors(withAuth(handler))` — public routes use `withCors(handler)`
- [ ] Response helpers are imported from `@/app/api/_utils` (NOT `schema/common`)
- [ ] Every POST/PUT handler validates the body with Zod `.safeParse()`
- [ ] All schema fields have `.openapi()` annotations
- [ ] Schemas are registered with `openApiRegistry.register()`
- [ ] OpenAPI paths are registered with `openApiRegistry.registerPath()`
- [ ] Handler file exports a named function matching the HTTP method (e.g., `export async function GET`)
- [ ] No usage of TypeScript `any`
