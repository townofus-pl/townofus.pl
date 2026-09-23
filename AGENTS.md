# AGENTS.md — TownOfUs.pl

## Project

TownOfUs.pl is a Polish Among Us community website: a role search engine for the Town of Us mod and game statistics tracker for the Dramaafera gaming group.

## Stack

- **Next.js 16.2** (App Router) · **React 19** · **TypeScript** (strict)
- **Cloudflare Workers** via @opennextjs/cloudflare · **Cloudflare D1** (SQLite) · **Cloudflare R2**
- **Prisma 7** with @prisma/adapter-d1 (migrate config in `prisma.config.ts`; `partialIndexes` preview feature enabled)
- **Tailwind CSS 3.4** · **Zod 4** · **Jest 30**

## Commands

```
npm run dev                          # Next.js dev server (Turbopack)
npm run build                        # Production build
npm test                             # Run Jest tests
npm run cf-typegen                   # Regenerate cloudflare-env.d.ts
npm run db:generate                  # Generate Prisma client + Zod schemas
npm run db:migrate:create            # Create migration + diff against local D1
npm run db:migrate:apply:local       # Apply migrations to local D1
npm run db:migrate:apply:staging     # Apply to staging D1
npm run db:migrate:apply:production  # Apply to production D1
npm run preview                      # Build + preview on Cloudflare
npm run validate                     # integrity checks (--target local|staging|production)
npm run ranking:oracle               # Replay a season's ELO, diff against stored
npm run replay -- --file <p.json>    # POST a payload, show the per-table row delta
npm run mod:publish                  # report: does latest.json match the files beside it
npm run mod:publish -- --write       # rewrite latest.json from public/mod/client/
npm run db:seed:staging              # Wipe + reseed staging from the dump
npm run deploy:staging               # Build + deploy to staging
npm run deploy                       # Build + deploy to production
```

## Environments and deploys

`wrangler.toml`'s top level is a **dev** config that deploys nowhere useful. Every real target is
a named environment, so nothing deploys by accident:

| | worker | D1 |
|---|---|---|
| staging | `townofus-pl-staging` | `townofus_pl_preview` (`44f0d77c-…`) |
| production | `townofus-pl` | `townofus-pl` (`0edadde7-…`) |

**Named environments do not inherit bindings** — `[[d1_databases]]`, `[assets]` and `[vars]` are
redeclared in full inside each `[env.*]` block. `[env.*.secrets] required` is **enforced** by
wrangler: a deploy is refused outright if a listed secret is unset.

**Push to `main` deploys to staging. Production is `workflow_dispatch` only.** Both run
`check.yml` (typecheck, tests, and the mod manifest check) first, and migrations are applied in the same job as the deploy,
so a failed migration means no code ships against a half-migrated database.

See `docs/ops/LOCAL_TESTING.md` for the local loop and a symptom → cause → fix table.

## Ingest: v1 and v2

The league's games arrive from the companion mod, not from a human. Two endpoints are live:

| | endpoint | payload | who writes it |
|---|---|---|---|
| v1 | `POST /api/games` | aggregated — 24 counters already computed per player | the 735 pre-cutover games; never rewritten |
| v2 | `POST /api/v2/games` | event-based — a flat `actions[]` the server aggregates | what the mod sends today |

Three rules. Breaking any of them corrupts data quietly rather than loudly:

1. **The mod scores, the server sums.** `totalPoints` = Σ every action's `pointsChange`, full
   stop. Never add a bonus server-side; never re-apply the disconnect clamp, which arrives
   already applied. Counters are for display — the ranking reads `totalPoints` alone.
2. **The era comes from the data.** A game's season is derived from its own timestamp
   (`getSeasonForDate`), and the role registry follows from the season — never from the request
   and never from "what season is it now". `FIRST_MIRA_SEASON` in `_constants/seasons.ts` is the
   boundary between `src/roles/` (60 legacy) and `src/mira/roles/` (77 Mira).
3. **Ingest is chronological.** `rankingCalculator` refuses a game older than one already scored:
   `previousRating` only means anything in order.

### v2 shapes worth knowing before touching the ingest

- **Times are real UTC.** The 735 v1 games store Polish wall-clock labelled `+00:00`; v2 converts
  incoming UTC to that same Warsaw wall-clock so both eras sort together. See the comment on
  `toWarsawWallClock` in `createGameV2.ts`.
- **One atomic `batch()`.** Auto-increment ids cannot be threaded between statements, so child
  rows resolve their parent through a subquery on a unique key. That is why the duplicate check
  is load-bearing — the subqueries assume exactly one match.
- **`isCorrect` is three-valued, and absent ≠ null.** `true`/`false` pick the `correct*` /
  `incorrect*` counter; `null` means the mod could not classify and counts as neither; **absent**
  on a `swap` means the rule declined to score. Different facts, both scoring zero.
- **Actions land in `game_actions`, not `game_events`.** v1's `game_events` table is still read by
  the timeline UI.
- **Identity ladder.** `players` carries `hashedProductUserId` and `friendCode`; a payload
  resolves against those before falling back to the display name. A name collision against a
  different hash is a 422, not a silent merge.

`POST /api/v2/games` is idempotent on `gameIdentifier` — a re-submit is a 409 with zero writes.

**Never publish the mod's scoring weights.** The site names which actions score, not what each is
worth; the values live in the private mod repo and must not be restated here, in docs, in issues
or in commit messages.

## AI Tools

### Skills

Reusable workflows for complex tasks. Primary location: `.agents/skills/<name>/SKILL.md`
Claude Code CLI accesses the same skills via `.claude/skills/` (symlinks to `.agents/skills/`).
Every directory in `.agents/skills/` needs a matching symlink in `.claude/skills/` — without
one the skill is invisible to Claude Code.

Project-authored:

| Skill                    | Description                                                    |
|--------------------------|----------------------------------------------------------------|
| `create-api-route`       | Scaffold a new API route with handler, route.ts, and schemas   |
| `create-migration`       | Create and apply a Prisma + D1 migration                       |
| `import-d1-database`     | Safely import a remote D1 export into local development state  |
| `create-role-or-modifier`| Add a new role or modifier with icon, types, and registration  |
| `plan-feature`           | Plan a new feature: design decisions, tasks, and phased impl   |
| `weekly-content-update`  | Weekly game data and ranking content update workflow           |
| `publish-client-mod`     | Publish new hats or a client build; rewrite the update manifest|

Use `import-d1-database` when syncing production D1 data into local state and the raw export fails because of foreign keys, dump ordering, or wrangler transaction limits.

### Slash Commands

Available in OpenCode (`.opencode/commands/`) and Claude Code CLI (`.claude/commands/`):

| Command         | File                             | Description                      |
|-----------------|----------------------------------|----------------------------------|
| `/plan-feature` | `.opencode/commands/plan-feature.md` | Run the plan-feature skill   |

### Vendored skills

Copied from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) — not authored
here, so edit upstream rather than in place. See `.agents/skills/VENDORED.md` for the sync
commit and re-sync procedure.

| Skill             | Description                                                          |
|-------------------|----------------------------------------------------------------------|
| `wayfinder`       | Chart work too big for one session as decision tickets on the tracker |
| `triage`          | Move issues/PRs through triage roles into agent-ready briefs          |
| `research`        | Investigate a question against primary sources, capture as Markdown   |
| `prototype`       | Build a throwaway prototype to answer a design question               |
| `domain-modeling` | Pin down domain terminology; record ADRs                              |
| `grilling`        | Stress-test a plan or decision by relentless questioning              |

Verbatim copies — names match upstream, since `wayfinder` calls the others internally as
`/research`, `/prototype`, `/grilling`, and `/domain-modeling`. No prefix is needed: the
globally-installed plugin exposes the same skills as `mattpocock-skills:*`, so the
namespaces can't collide.

## Agent skills

### Issue tracker

Issues live in GitHub Issues on `townofus-pl/townofus.pl`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label string equal to its name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

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
│   │   ├── schema/               # Zod schemas, OpenAPI registry (openApiRegistry)
│   │   │                         # gamesV2.ts — mirrors the mod's game_data.schema.json, all .strict()
│   │   ├── v2/games/             # POST /api/v2/games — event-based ingest
│   │   │   └── _utils/           # aggregate.ts (action → counter, pure), createGameV2.ts (one atomic batch)
│   │   └── season/reset/         # POST /api/season/reset — explicit season reset (protected)
│   ├── dramaafera/               # Dramaafera section
│   │   ├── _components/          # Dramaafera shared components
│   │   ├── _actions/             # Server actions (seasonActions.ts — getSessionResults, getHostInfoAction, etc.)
│   │   ├── _constants/           # seasons.ts (SEASONS, CURRENT_SEASON, season helpers)
│   │   │                         # rankTiers.ts (getRankName, ELO tier definitions — client-safe)
│   │   ├── _hooks/               # useSeason.ts
│   │   ├── _roles/               # Dramaafera role list (mod_settings.ts, impostor_settings.ts)
│   │   │                         # extends src/roles/ with ModSettings, ImpostorSettings types
│   │   ├── _utils/               # seasonHelpers.ts (extractDramaAferaSubPath, buildSeasonUrl)
│   │   │                         # gameUtils.ts (getRoleColor, formatDisplayDate, normalizeRoleName, determineTeam,
│   │   │                         #   convertRoleNameForDisplay, convertRoleToUrlSlug, convertUrlSlugToRole,
│   │   │                         #   convertNickToUrlSlug, getRoleIconPath, getTeamColor, getModifierColor,
│   │   │                         #   formatDuration, extractDateFromGameId, getPlayerAvatarPath)
│   │   │                         # formatPlayerStats.ts (formatPlayerStatsWithColors — safe for client components)
│   │   │                         # settingsParser.ts (host upload settings parser)
│   │   └── _services/            # RSC data layer — domain-grouped subdirectories:
│                                 #   index.ts                  — slim 4-line barrel (does NOT re-export db.ts)
│                                 #   db.ts                     — getDatabaseClient, buildSeasonGameWhere
│                                 #   games/                    — getGamesList, getGamesListByDate, getGameData, getAllGamesData, getGameDatesList
│                                 #                               types.ts (GameSummary, UIGameData, UIPlayerData, etc.)
│                                 #                               winCalculator.ts (calculateWinnerFromStats)
│                                 #   players/                  — getPlayerStats, getPlayersList, getUserProfileStats, etc.
│                                 #                               types.ts (PlayerStats, UserProfileStats, etc.)
│                                 #   rankings/                 — generatePlayerRankingStats, generateRoleRankingStats
│                                 #                               types.ts (PlayerRankingStats, RoleRankingStats)
│                                 #   season/                   — getRanking, getGameDatesLightweight, getSessionSummaryByDate, etc.
│                                 #   settings/                 — getDramaAferaSettings, rotateDramaAferaSettings, replaceDramaAferaSettings
│                                 #                               (read + atomic write helpers for DramaAferaSettings rows)
│   ├── dramaafera-old/           # LEGACY — do not modify
│   ├── tajemniczy/               # Tajemniczy Pasażer mini-game page
│   └── custom/                   # Custom roles page
├── constants/                    # Teams, RoleOrModifierTypes, SettingTypes, abilities
├── data/games/                   # LEGACY static game data — superseded by D1, do not modify
├── roles/                        # 60 role definitions (snake_case filenames), exported from index.ts
└── modifiers/                    # 24 modifier definitions, same structure as roles
```

## Patterns

### API routes
Split HTTP methods: get.ts / post.ts / put.ts / delete.ts + route.ts composing middleware.

Always wrap in route.ts:
```
  Protected:  export const GET = withCors(withAuth(getHandler));  // all /api/* except /api/dramaafera/* GET
  Public:     export const GET = withCors(handler);               // /api/dramaafera/* read endpoints (GET)
```

`/api/dramaafera/*` reads (GET) are public so they can be consumed by client
components and embeddable widgets. Destructive endpoints under the same prefix
(POST/PUT/DELETE, e.g. `/api/dramaafera/settings` POST upload) MUST still wrap
with `withAuth` — the public-prefix rule applies to read shape only.

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
- All `_services/` files are Server-Component-only — never call from **client components**;
  calling from Server Components or API route handlers is fine.
  all domain subdirectory files and `_services/index.ts`
- Utility functions (`getRoleColor`, `formatDisplayDate`, `normalizeRoleName`, `determineTeam`,
  `convertRoleNameForDisplay`, `convertRoleToUrlSlug`, `convertUrlSlugToRole`, `convertNickToUrlSlug`,
  `getRoleIconPath`, `getTeamColor`, `getModifierColor`, `formatDuration`, `extractDateFromGameId`,
  `getPlayerAvatarPath`)
  live in `src/app/dramaafera/_utils/gameUtils.ts` — import directly from there, NOT from `_services`
- `formatPlayerStatsWithColors` lives in `src/app/dramaafera/_utils/formatPlayerStats.ts` — safe for
  client components; import directly from there, NOT from `_services`
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

**`GamePlayerStatistics` has no soft-delete**: The `game_player_statistics` table was NOT included
in the soft-delete migration (`0002_soft_delete_and_indexes.sql`). Never add `deletedAt: null`
directly to a `gamePlayerStatistics` where clause — the column does not exist and TypeScript will
catch it at build time. To exclude stats for soft-deleted players, use the relation filter:
  // Wrong — GamePlayerStatistics has no deletedAt:
  gamePlayerStatistics: { where: { deletedAt: null, player: withoutDeleted } }

  // Correct — filter via the relation to players:
  gamePlayerStatistics: { where: { player: withoutDeleted } }

**D1 SQL variable limit**: D1 enforces a strict limit on bound parameters per SQL statement
(much lower than SQLite's default 999). `where: { id: { in: largeArray } }` breaks on it — even
batching at 100 entries can fail once Prisma adds variables for joins/includes. Failures are
caught by try/catch and **silently return empty results**, so when a query returns unexpectedly
empty data, check for IN clauses.

  // Breaks the parameter cap once the array is large:
  prisma.meeting.findMany({ where: { id: { in: meetingIds } }, include: { meetingVotes: true } })

A relation filter fixes the cap. **It does not follow that it is cheap** — this repo learned that
the expensive way:

  // Stays under the cap, and cost 39% of the monthly D1 allowance on its own:
  prisma.meeting.findMany({
    where: { OR: [{ meetingVotes: { some: { voterId: id } } },
                  { skipVotes:    { some: { playerId: id } } }] },
    select: { id: true, wasTie: true },
  })

`some:` compiles to a **correlated EXISTS**, evaluated once per candidate row, and its cost is
whatever index the planner finds for the inner predicate. Here that was `meeting_votes(voterId)`
— an index on `voterId` alone — so for each of ~2,800 meetings it walked every vote that player
had ever cast: **2,319,983 rows read, 656 ms**.

The shape that solves both problems is a **subquery**: a subquery contributes no bound
parameters, and the inner query keeps its own selective plan.

  // 11,515 rows, 11 ms — 201× fewer, identical results
  prisma.$queryRaw`
    SELECT m.id, m.wasTie FROM meetings m JOIN games g ON g.id = m.gameId
    WHERE m.deletedAt IS NULL AND g.deletedAt IS NULL AND g.season = ${season}
      AND m.id IN (SELECT meetingId FROM meeting_votes      WHERE voterId  = ${playerId}
                   UNION
                   SELECT meetingId FROM meeting_skip_votes WHERE playerId = ${playerId})
  `

So: **the cap is about parameter count, cost is about index selectivity, and they are separate
questions.** `chunkedInQuery` remains right when you genuinely hold a list of ids in JS.

### Measure before believing any of this

D1 bills **rows read**, and the only reliable source is production itself:

```
wrangler d1 insights townofus-pl --env production --time-period 7d --sort-by reads
wrangler d1 execute townofus-pl --remote --env production --json --command "EXPLAIN QUERY PLAN <sql>"
```

`--json` on `d1 execute` returns `meta.rows_read` per statement, which is the number being
billed. Two traps this found that reading the code would not have:

- **An index can make reads worse.** `player_roles(order)` matched ~11,400 rows and the planner
  preferred it over the selective `gamePlayerStatisticsId` index, costing 40× — see migration
  `0010`.
- **Moving aggregation into SQL does not reduce rows read.** The rows must be read wherever the
  sum happens; a window-function rewrite measured *worse* than aggregating in JS. Optimise by
  reading fewer rows, not by moving the arithmetic.

## Proposing New Rules

When you notice a pattern used 2+ times, a decision made in this session, or a convention
not documented here, output a suggestion block:

---RULE SUGGESTION---
File: [AGENTS.md | .github/instructions/api.instructions.md | .agents/skills/X/SKILL.md | etc.]
Section: [section name]
Content: [proposed rule text]
Reason: [why this should be captured]
---END SUGGESTION---

Routing guide:
- Universal/architectural → AGENTS.md
- File-type-specific → .github/instructions/<relevant>.instructions.md
- Complex active feature → .agents/skills/<feature>/SKILL.md
