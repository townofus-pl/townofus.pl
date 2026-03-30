# GitHub Copilot — TownOfUs.pl

Full instructions: `AGENTS.md` + `.github/instructions/*.instructions.md` (applied via `applyTo`).

**Stack**: Next.js 15.3 App Router · React 19 · TypeScript strict · Cloudflare Workers/D1/R2 · Prisma 6 · Tailwind 3.4 · Zod 3

## Hard Blocks

- Missing `{ ...withoutDeleted }` in any Prisma query on a model with `deletedAt` — except `GamePlayerStatistics` (no soft-delete column; filter via relation: `{ player: withoutDeleted }`)
- `where: { id: { in: largeArray } }` — hits D1 variable limit; use relation filters instead
- `_services/` functions called from a client component (RSC-only — Server Components and API routes only)
- API handler exported from `route.ts` without `withCors(withAuth(...))` wrapper, unless under `/api/dramaafera/` (public — `withCors` only)
- New API endpoint missing any of: handler file, `route.ts`, Zod schemas, `openApiRegistry.registerPath()`
- `any` type anywhere
- User-visible string not in Polish

## Key Imports

```ts
import { withAuth, withCors }                    from '@/app/api/_middlewares';
import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';      // returns NextResponse
import { withoutDeleted }                         from '@/app/api/schema/common';
import { getPrismaClient }                        from '@/app/api/_database';
import { getCloudflareContext }                   from '@opennextjs/cloudflare';
```
