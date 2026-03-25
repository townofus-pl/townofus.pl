# AGENTS.md — TownOfUs.pl

## Project

TownOfUs.pl is a Polish Among Us community website: a role search engine for the Town of Us mod and game statistics tracker for the Dramaafera gaming group.

## Stack

- **Next.js 15.3** (App Router) · **React 19** · **TypeScript** (strict)
- **Cloudflare Workers** via @opennextjs/cloudflare · **Cloudflare D1** (SQLite) · **Cloudflare R2**
- **Prisma 6** with @prisma/adapter-d1
- **Tailwind CSS 3.4** · **Zod 3** · **Jest**

## Commands

```
npm run dev                          # Next.js dev server (Turbopack)
npm run build                        # Production build
npm test                             # Run Jest tests
npm run cf-typegen                   # Regenerate cloudflare-env.d.ts
npm run db:generate                  # Generate Prisma client + Zod schemas
npm run db:migrate:create            # Create migration + diff against local D1
npm run db:migrate:apply:local       # Apply migrations to local D1
npm run db:migrate:apply:preview     # Apply to preview D1
npm run db:migrate:apply:remote      # Apply to production D1
npm run preview                      # Build + preview on Cloudflare
npm run deploy                       # Build + deploy to production
```

## Structure

```
src/
├── app/
│   ├── _components/              # Universal shared components (2+ pages)
│   ├── api/                      # API routes
│   │   ├── _constants/           # rankingTypes.ts (PlayerRankingReason)
│   │   ├── _database/            # Prisma singleton, batchStatements, buildPaginationQuery
│   │   ├── _middlewares/         # withAuth, withCors (barrel: @/app/api/_middlewares)
│   │   ├── _utils/               # createSuccessResponse, createErrorResponse, rankingCalculator
│   │   └── schema/               # Zod schemas, OpenAPI registry (openApiRegistry)
│   └── dramaafera/               # Dramaafera section
│       ├── _components/          # Dramaafera shared components
│       ├── _constants/           # seasons.ts (SEASONS, CURRENT_SEASON, season helpers)
│       ├── _hooks/               # useSeason.ts
│       ├── _utils/               # seasonHelpers.ts (extractDramaAferaSubPath, buildSeasonUrl)
│       │                         # gameUtils.ts (getRoleColor, formatDisplayDate, normalizeRoleName, determineTeam, etc.)
│       └── _services/            # RSC data layer — domain-grouped subdirectories:
                                  #   index.ts                  — slim barrel re-exporting everything
                                  #   db.ts                     — getDatabaseClient, buildSeasonGameWhere
                                  #   games/                    — getGamesList, getGameData, getAllGamesData, getGameDatesList
                                  #                               types.ts (GameSummary, UIGameData, UIPlayerData, etc.)
                                  #                               winCalculator.ts (calculateWinnerFromStats)
                                  #   players/                  — getPlayerStats, getPlayersList, getUserProfileStats, etc.
                                  #                               types.ts (PlayerStats, UserProfileStats, etc.)
                                  #                               formatPlayerStats.ts (formatPlayerStatsWithColors)
                                  #   rankings/                 — generatePlayerRankingStats, generateRoleRankingStats
                                  #                               types.ts (PlayerRankingStats, RoleRankingStats)
                                  #   season/                   — getRanking, getGameDatesLightweight, getSessionSummaryByDate, etc.
├── constants/                    # Teams, RoleOrModifierTypes, SettingTypes, abilities
├── roles/                        # 62 role definitions (snake_case filenames), exported from index.ts
└── modifiers/                    # 24 modifier definitions, same structure as roles
```

## Patterns

### API routes
Split HTTP methods: get.ts / post.ts / put.ts / delete.ts + route.ts composing middleware.

Always wrap in route.ts:
```
  Protected:  export const GET = withCors(withAuth(getHandler));  // all /api/* except /api/dramaafera/*
  Public:     export const GET = withCors(handler);               // /api/dramaafera/* only
```

Response format (from @/app/api/_utils — returns NextResponse, not plain objects):
```
  return createSuccessResponse(data);            // 200 { success: true, data }
  return createErrorResponse('Not found', 404);  // { success: false, error }
```

### Database
```
  const { env } = await getCloudflareContext();
  const prisma = getPrismaClient(env.DB);
```

ALWAYS include soft-delete filter on all models (every model has deletedAt DateTime?):
```
  import { withoutDeleted } from '@/app/api/schema/common'; // = { deletedAt: null }
  await prisma.game.findMany({ where: { ...withoutDeleted } });
```

### React / Next.js
- Default: Server Components. Add 'use client' only for state/effects/browser APIs/event handlers
- All `_services/` files are Server-Component-only — never call from client components:
  all domain subdirectory files and `_services/index.ts`
- Utility functions (`getRoleColor`, `formatDisplayDate`, `normalizeRoleName`, `determineTeam`, etc.)
  live in `src/app/dramaafera/_utils/gameUtils.ts` — import directly from there, NOT from `_services`
- Universal components → src/app/_components/; page-local → co-locate in page directory

### Splitting large service files

When splitting a large service file into a domain subdirectory, create an `index.ts` barrel
inside the subdirectory that re-exports everything so existing import paths via the parent
barrel (`_services/index.ts`) continue to work without changes to consumers:
```
  // _services/games/index.ts
  export * from './getGamesList';
  export * from './getGameData';
  export type { GameSummary, UIGameData } from './types';
```

### Roles & Modifiers
New role: src/roles/<snake_case_name>.ts, add to src/roles/index.ts
Type: { type, name, id, color, team: Teams, icon, description: ReactNode, settings, abilities, tip? }

## Conventions

| Context                      | Convention        |
|------------------------------|-------------------|
| TypeScript files             | camelCase         |
| Role/modifier files          | snake_case        |
| Route segments + assets      | kebab-case        |
| Component names + interfaces | PascalCase        |
| Constants + env vars         | SCREAMING_SNAKE   |
| Private shared dirs          | underscore-prefix |

- No `any` — strict TypeScript. Path alias: @/* → ./src/*
- src/generated/ excluded from type-checking (auto-generated Zod schemas)
- All user-facing text in Polish
- Headings: font-brook class (BrookPL). Body: font-barlow (Barlow)
- Team colors: role-crewmate (cyan), role-impostor (red), role-neutral (gray)

## Ranking System

ELO-like: START_RATING=2000, W=9 (game influence), PEN=5 (absence penalty)
Calculator: src/app/api/_utils/rankingCalculator.ts → calculateRankingForGame(prisma, gameId)
PlayerRanking.reason values defined in src/app/api/_constants/rankingTypes.ts as PlayerRankingReason:
  `const` object + derived type (same identifier — valid TS value/type namespace split):
  PlayerRankingReason.BaseValue | .InitialValue | .GameResult | .AbsencePenalty |
  .AbsenceNoPenalty | .Penalty | .Reward | .SeasonReset
  Always import as a value (not `import type`) when using the constants.

Every PlayerRanking write MUST include an explicit season:
  rankingCalculator.ts  — reads game.season and passes it to playerRanking.create()
  players/post.ts       — uses CURRENT_SEASON for the initial ranking row on player creation

### Database gotchas

`prisma.model.findUnique()` cannot accept extra `where` conditions beyond the unique key —
it does not support `{ ...withoutDeleted }`. To find a single record by PK and exclude
soft-deleted rows, use `findFirst` instead:
  prisma.game.findFirst({ where: { id, ...withoutDeleted } })
Performance is identical on PK lookups (SQLite uses the unique index either way).

## Proposing New Rules

When you notice a pattern used 2+ times, a decision made in this session, or a convention
not documented here, output a suggestion block:

---RULE SUGGESTION---
File: [AGENTS.md | .github/instructions/api.instructions.md | .github/skills/X/SKILL.md | etc.]
Section: [section name]
Content: [proposed rule text]
Reason: [why this should be captured]
---END SUGGESTION---

Routing guide:
- Universal/architectural → AGENTS.md
- File-type-specific → .github/instructions/<relevant>.instructions.md
- Complex active feature → .github/skills/<feature>/SKILL.md
