# GitHub Copilot — TownOfUs.pl

> Copilot reads AGENTS.md automatically. This file is a Copilot-specific addendum — do not repeat AGENTS.md content here.

## Coding Behavior

- Never use `any`. Use `interface` for object shapes, `type` for unions/aliases.
- Import from barrel files:
    @/app/api/_middlewares  →  withAuth, withCors
    @/app/api/_utils        →  createSuccessResponse, createErrorResponse
    @/app/api/schema/common →  withoutDeleted
- All user-visible strings must be in Polish.
- When generating a new API endpoint, always produce all four parts:
    1. Handler file (get.ts / post.ts)
    2. route.ts with middleware composition
    3. Zod request/response schemas
    4. openApiRegistry.registerPath() call in route.ts
- When writing a Prisma query on any model with deletedAt: always include
  `{ ...withoutDeleted }` in the where clause unless explicitly querying deleted records.

## Code Review Checklist

### Block (must fix before merge)

- API handler exported from route.ts without withCors(withAuth(...)) wrapper,
  unless the route is under /api/dramaafera/ (public — withCors only is correct there)
- Prisma query on a model with deletedAt field missing { deletedAt: null } filter
- Any use of TypeScript `any` type
- API POST/PUT handler reading request body without Zod validation

### Flag for discussion

- New shared component created inside a page directory
  (should be in src/app/_components/ or src/app/dramaafera/_components/)
- 'use client' on a component using no state, effects, or browser APIs
- gameDataService functions called from a client component or API route handler
  (it is RSC-only)
- New role or modifier file not using snake_case filename

### Approve without concern

- { ...withoutDeleted } spread in Prisma where clauses
- withCors(withAuth(handler)) composition
- RSC patterns with direct gameDataService calls
- getCloudflareContext() calls in service/data functions
- TypeScript non-null assertions on Cloudflare env bindings
