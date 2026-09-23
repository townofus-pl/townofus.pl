# GitHub Copilot — TownOfUs.pl

Full instructions: `AGENTS.md` + `.github/instructions/*.instructions.md` (applied via `applyTo`).

**Stack**: Next.js 16.2 App Router · React 19 · TypeScript strict · Cloudflare Workers/D1/R2 · Prisma 7 · Tailwind 3.4 · Zod 4 · Jest 30

## Hard Blocks

- **The mod's scoring weights in any file, comment, commit message or issue.** The site names
  which actions score, never what each is worth. The values live in a private repo.
- Missing `{ ...withoutDeleted }` in any Prisma query on a model with `deletedAt` — except `GamePlayerStatistics` (no soft-delete column; filter via relation: `{ player: withoutDeleted }`)
- `where: { id: { in: largeArray } }` — hits D1 variable limit; use relation filters instead
- `_services/` functions called from a client component (RSC-only — Server Components and API routes only)
- API handler exported from `route.ts` without `withCors(withAuth(...))` wrapper, unless under `/api/dramaafera/` (public **GET only** — `withCors`; POST/PUT/DELETE still need `withAuth`)
- New API endpoint missing any of: handler file, `route.ts`, Zod schemas, `openApiRegistry.registerPath()`
- `any` type anywhere
- User-visible string not in Polish
- A `PlayerRanking` write without an explicit `season`

## Ingest (v2) — quiet-corruption blocks

`POST /api/v2/games` takes the mod's event payload. These fail silently rather than loudly, so
flag them on sight:

- **Adding any bonus to `totalPoints` server-side**, or re-applying the disconnect clamp. The mod
  scores; the server only sums `pointsChange`. The clamp arrives applied.
- **Deriving a season from `CURRENT_SEASON` or from the request** instead of from the game's own
  timestamp (`getSeasonForDate`). The era comes from the data.
- **Treating an absent `isCorrect` as `null`.** Absent on a `swap` means the rule declined to
  score; `null` means the mod could not classify. Both score zero, but they are different facts
  and only one of them is a counter's business.
- **Assuming a child row can reuse a parent's auto-increment id inside a `batch()`.** It cannot —
  resolve the parent through a subquery on a unique key.
- Writing game actions to `game_events` (that is v1's table) instead of `game_actions`.

## Key Imports

```ts
import { withAuth, withCors }                    from '@/app/api/_middlewares';
import { createSuccessResponse, createErrorResponse } from '@/app/api/_utils';      // returns NextResponse
import { withoutDeleted }                         from '@/app/api/schema/common';
import { getPrismaClient }                        from '@/app/api/_database';
import { getCloudflareContext }                   from '@opennextjs/cloudflare';
```
