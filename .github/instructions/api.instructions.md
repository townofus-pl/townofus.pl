---
applyTo: "**/api/**"
---
# API Route Patterns

## File structure

Each API resource has separate files per HTTP method plus a route.ts:
  games/get.ts    — raw GET handler, no middleware, exports: async function GET(request, authContext)
  games/post.ts   — raw POST handler
  games/route.ts  — applies middleware, registers OpenAPI paths, exports GET/POST/etc.

Shared directories:
  _constants/   — domain-wide type definitions (e.g. PlayerRankingReason)
  _database/    — Prisma singleton, batchStatements, buildPaginationQuery
  _middlewares/ — withAuth, withCors
  _utils/       — response helpers, rankingCalculator

## Handler signatures

Non-dynamic route:
  export async function GET(
    request: NextRequest,
    authContext: { user: { username: string } }
  ): Promise<Response>

Dynamic route with params:
  export async function GET(
    request: NextRequest,
    authContext: { user: { username: string } },
    { params }: { params: Promise<{ id: string }> }
  ): Promise<Response>

## Middleware (in route.ts)

  import { withAuth, withCors } from '@/app/api/_middlewares';

  export const GET = withCors(withAuth(getHandler));   // Protected (/api/* except /api/dramaafera/*)
  export const GET = withCors(publicHandler);          // Public (/api/dramaafera/* only)

## OpenAPI registration (in route.ts)

  import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
  import { openApiRegistry } from '@/app/api/schema/registry';
  extendZodWithOpenApi(z); // Call once per route.ts module

  openApiRegistry.registerPath({
    method: 'get',
    path: '/api/resource',
    tags: ['ResourceName'],
    security: [{ basicAuth: [] }],   // Omit for /api/dramaafera/* routes
    request: { query: QuerySchema },
    responses: { 200: { content: { 'application/json': { schema: ResponseSchema } } } },
  });

## Response helpers

  import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';
  // These return NextResponse. Do NOT use the same-named helpers from schema/common.ts
  // (those return plain objects for schema building, not HTTP responses).

  return createSuccessResponse(data);            // 200 { success: true, data }
  return createSuccessResponse(data, 201);       // Custom status
  return createErrorResponse('Not found', 404); // { success: false, error }

## Prisma in API handlers

  import { getCloudflareContext } from '@opennextjs/cloudflare';
  import { getPrismaClient } from '@/app/api/_database';
  import { withoutDeleted } from '@/app/api/schema/common';

  const { env } = await getCloudflareContext();
  const prisma = getPrismaClient(env.DB);
  await prisma.player.findMany({ where: { ...withoutDeleted } }); // always
