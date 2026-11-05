---
applyTo: "**/api/**"
---
# API Route Patterns

The ingest endpoint is `POST /api/v2/games` (event-based, what the mod sends today). The v1
endpoint `POST /api/games` was removed; the pre-cutover games stay in the database. v2 splits
into `_utils/aggregate.ts` — pure, payload → counters — and `_utils/createGameV2.ts`, one atomic
D1 `batch()`. Keep that split: the pure half is the only testable one.

v2 is idempotent on `gameIdentifier`; a re-submit must stay a 409 with zero writes.

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

  export const POST = withCors(withAuth(postHandler)); // Protected (writes, mod host files)
  export const GET = publicGet(ResponseSchema, build); // Public (/api/v2/* reads, see _lib/http.ts)

## OpenAPI definition

`/api/schema` serves one public definition, built in `src/app/api/v2/_lib/openapi.ts` from the
schemas in `_lib/schemas.ts`. Add a `registerPath` entry there for every new public `/api/v2` read.
Protected routes (writes, mod host files, season reset) are not in the definition.

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
