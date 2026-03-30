---
applyTo: "src/app/dramaafera/**"
---
# Dramaafera Section Patterns

## Data layer

The `_services/` directory is organized into domain-grouped subdirectories. All functions are
server-component-only — never call from client components:

- `src/app/dramaafera/_utils/gameUtils.ts` — domain-agnostic utility functions
  (`formatDuration`, `formatDisplayDate`, `extractDateFromGameId`, `convertRoleNameForDisplay`,
  `normalizeRoleName`, `getRoleIconPath`, `getTeamColor`, `getRoleColor`, `getModifierColor`,
  `determineTeam`, `convertRoleToUrlSlug`, `convertUrlSlugToRole`, `convertNickToUrlSlug`,
  `getPlayerAvatarPath`).
  **Consumers import directly from here — NOT from `_services`.**
- `src/app/dramaafera/_services/index.ts` — slim barrel; re-exports everything from
  db, games, players, rankings, season. Primary import path for consumers.
  Does NOT re-export `gameUtils` utilities.
- `src/app/dramaafera/_services/db.ts` — `getDatabaseClient()` + `buildSeasonGameWhere()`
- `src/app/dramaafera/_services/games/` — `getGamesList`, `getGamesListByDate`, `getGameDatesList`,
  `getGameData`, `getAllGamesData`; private helper `_buildPlayerStats.ts`
- `src/app/dramaafera/_services/players/` — `getPlayerStats`, `getPlayersList`,
  `getUserProfileStats`, `getPlayerRankingHistory`, `getPlayerTopGames`,
  `getPlayerVotingStats`, `getPlayerStars`
- `src/app/dramaafera/_services/rankings/` — `generatePlayerRankingStats`, `generateRoleRankingStats`
- `src/app/dramaafera/_services/season/` — one file per function; private helpers use `_` prefix:
  - `_rankingHelpers.ts` — `getRankingSnapshots`, `buildRankPositionMap` (internal, not re-exported from barrel)
  - `getRanking.ts`, `getGameDatesLightweight.ts`, `getSessionSummaryByDate.ts`, `getWeeklyStats.ts`,
    `getTopSigmas.ts`, `getRankingAfterSession.ts`, `getEmperorHistory.ts`, `getHostInfo.ts`
  - `index.ts` — barrel re-exporting all public functions and interfaces

Exported season functions (via `_services/season/index.ts` → `_services/index.ts`):
  getRanking(seasonId?, limit?, offset?)        — supports both current and past seasons
                                                  (past seasons use raw SQL to find final scores)
  getGameDatesLightweight(includePlayers?, seasonId?)
  getSessionSummaryByDate(date, seasonId?)
  getWeeklyStats(date, seasonId?)
  getTopSigmas(date, seasonId?)                 — uses internal _rankingHelpers
  getRankingAfterSession(date, seasonId?)        — uses internal getRankingTableAtSession
  getEmperorHistory(seasonId?)
  getHostInfo(date, seasonId?)                  — uses internal _rankingHelpers

All files handle build-time gracefully (no Cloudflare context at build time) via
`if (!prisma) return <empty>` guards.

## Public API routes (/api/dramaafera/*)

These are intentionally public — withCors only, no withAuth:
  export const GET = withCors(handler);          // correct
  export const GET = withCors(withAuth(handler)); // wrong — breaks public access

## Ranking system

ELO-like: START_RATING=2000, W=9 (game influence), PEN=5 (absence penalty)
Calculator: src/app/api/_utils/rankingCalculator.ts → calculateRankingForGame(prisma, gameId)
PlayerRanking.reason: typed as PlayerRankingReason (src/app/api/_constants/rankingTypes.ts)
  base_value | initial_value | game_result | absence_penalty | absence_no_penalty |
  penalty | reward | season_reset

## Seasons (fully implemented)

Season 3 started 2026-03-23. Season 1 predates the season system (data accessible via
`season=1` DB column only — not in the SEASONS array). See SEASONS_IMPLEMENTATION_PLAN.md
for historical context.

### Configuration (`_constants/seasons.ts`)
- `CURRENT_SEASON = 3`
- `SEASONS` array: `[{ id: 2, startDate: null }, { id: 3, startDate: '2026-03-23' }]`
  Season 1 intentionally excluded — no startDate boundary, predates the system.
  `Season` interface has `id` + `startDate` only; endDate derived from next season's startDate.
- `getSeasonById(id)`, `getSeasonForDate(date)` — helpers for lookup and game-creation tagging

### URL helpers (`_utils/seasonHelpers.ts`)
- `extractDramaAferaSubPath(pathname)` — strips `/dramaafera` and `/sezon/\d+` prefixes
- `buildSeasonUrl(path, seasonId)` — builds URL: bare path for CURRENT_SEASON, `/sezon/{id}/` for others

### Client hook (`_hooks/useSeason.ts`)
- `useSeason()` — reads `params.seasonId`, validates against `getSeasonById`, falls back to CURRENT_SEASON
- Only used by `SeasonSwitcher` and `Navigation` (URL construction) — NOT for data fetching

### Database
- `Game.season` and `PlayerRanking.season` — Int columns, required (no default), added via
  migrations 0003 (`add_season_column`) + 0004 (`remove_season_default`)
- Indexes: `@@index([season])`, `@@index([season, deletedAt])`, `@@index([season, winnerTeam])`
  on Game; `@@index([season])`, `@@index([playerId, season, createdAt])` on PlayerRanking
- `rankingCalculator.ts` — selects `game.season`, passes it to `playerRanking.create()`
- `createGame.ts` — sets `season: getSeasonForDate(startTime)` on game creation
- `players/post.ts` — sets `season: CURRENT_SEASON` on initial ranking row

### Season reset
Explicit admin endpoint: `POST /api/season/reset` (protected: `withCors(withAuth(...))`).
Must be called before the first game of a new season. Creates `season_reset` PlayerRanking
rows (score=2000) for all active players and updates `currentRankingId`. Guarded against
double-execution (returns 409 if target season already has games or non-reset rankings).

`getRanking.ts` has a display fallback: if `player.currentRanking.season !== targetSeason`,
shows `START_RATING` (2000) instead. This covers the window between season start and reset.

### Routing
```
/dramaafera/ranking              → CURRENT_SEASON (bare path)
/dramaafera/sezon/2/ranking      → season 2 (explicit)
/dramaafera/sezon/3/ranking      → same as bare path while S3 is current
```

Season route tree: `sezon/[seasonId]/` with wrappers for ranking, wyniki, historia-gier
(+ [date], [date]/[gameId], [date]/podsumowanie), role (+ [nazwa]), user/[nick].
No `sezon/[seasonId]/host/` — host page is current-season-only.

`sezon/_utils/parseSeasonId.ts` — shared validation: `parseAndValidateSeasonId(str)` calls
`notFound()` for invalid/unknown season IDs. All season wrapper pages use this.

Layout files: season wrappers re-export original layouts (`export { default, metadata }`).
Exception: `podsumowanie/layout.tsx` has its own `generateMetadata` (different param depth).

Canonical URLs: all season wrapper pages include `alternates.canonical` via `generateMetadata`
pointing to bare `/dramaafera/*` path for CURRENT_SEASON or explicit `/sezon/{id}/*` for past.

`generateStaticParams`: all dynamic-segment season wrappers return `[]` (Cloudflare context
unavailable at build time — pages rendered on-demand).

### UI
- `SeasonSwitcher.tsx` — 'use client' dropdown in Header, navigates via `buildSeasonUrl()`
- `Header.tsx` — flat CSS grid (lg: 2-col 1fr/auto, 3 rows) with SeasonSwitcher
- `Navigation.tsx` — `seasonDependent` flag per item; `buildSeasonUrl()` for season-dependent
  links (/ranking, /wyniki, /historia-gier); `extractDramaAferaSubPath()` + prefix matching
  for active-page detection

### Data layer (season-aware)
- All `_services/` list/stats functions accept optional `seasonId?: number`, default to
  `CURRENT_SEASON` via `buildSeasonGameWhere()` helper in `_services/db.ts`
- `getGameData(gameId)` intentionally has no seasonId — season is a stored game property
- `getRanking()` supports both current season (Prisma ORM) and past seasons (raw SQL)
- `getRankingSnapshots` return type: `{ before: Map<string, number>; after: Map<string, number> }`
  keyed by playerName (string), value is score (number)

### Page architecture (server+client pairs)
- **Server pages** fetch data with `seasonId`, pass to client components as props
- **Bare-path pages** use `CURRENT_SEASON`; **season wrapper pages** read `seasonId` from params
- **Server actions** (`_actions/seasonActions.ts`): `getSessionResults`, `getHostInfoAction`,
  `getRankingAction`, `getGameDatesAction` — used by client components for dynamic data (date
  switching, auto-refresh). Always pass `seasonId` to keep data season-scoped.
- **Auto-refresh** (ranking, wyniki): uses server actions — NOT `fetch('/api/...')`.
  API routes have no season filter; fetching from them would return cross-season data.
- **File upload** (host): continues to POST `/api/games/upload` — game creation sets season
  from `startTime` automatically.
- **Emperor poll data**: read via `env.ASSETS.fetch()` (Cloudflare Workers), not `fs.readFile`

### Shared content components (co-located with pages)
- `user/[nick]/UserProfileContent.tsx` — accepts `{ nick, seasonId }`
- `role/[nazwa]/RoleDetailContent.tsx` — accepts `{ nazwa, seasonId }`
- `historia-gier/HistoriaGierContent.tsx` — accepts `{ seasonId }`
- `historia-gier/[date]/DateGamesContent.tsx` — accepts `{ date, seasonId }`
- `historia-gier/[date]/[gameId]/GameDetailContent.tsx` — accepts `{ date, gameId, seasonId }`
- `historia-gier/[date]/podsumowanie/PodsumowaniePageContent.tsx` — server component fetching
  all data upfront, renders `<PodsumowanieClient>` with props

### Link handling
- All internal links use `buildSeasonUrl()` — no hardcoded `/dramaafera/` paths in content components
- `PlayerTable` and `RoleTable` (`src/app/_components/`): `seasonId: number` is **required** —
  all callers pass it explicitly
- Client components (`PlayerStatsSection`, `RankingChart`, `TopGamesDisplay`, `RankingClient`,
  `HostClient`) accept `seasonId` prop for link construction

## Component structure

  dramaafera/
  ├── _actions/             # Server actions ('use server') for client components
  │                         # seasonActions.ts — getSessionResults, getHostInfoAction, getRankingAction, getGameDatesAction
  ├── _components/          # Shared across Dramaafera pages
  │                         # RankingClient.tsx, WynikiClient.tsx, HostClient.tsx,
  │                         # PodsumowanieClient/ (directory with ~15 sub-components),
  │                         # RankingChart.tsx, etc.
  │                         # NOTE: PlayerStatsSection.tsx is page-local, not here —
  │                         #   lives at historia-gier/[date]/[gameId]/PlayerStatsSection.tsx
  ├── _constants/           # seasons.ts
  ├── _hooks/               # useSeason.ts
  ├── _utils/               # seasonHelpers.ts, gameUtils.ts
  │                         # formatPlayerStats.ts (formatPlayerStatsWithColors — safe for client components)
  ├── _services/            # index.ts (barrel), db.ts
  │   ├── db.ts             # getDatabaseClient, buildSeasonGameWhere
  │   ├── games/            # getGamesList, getGameData, getAllGamesData, getGameDatesList
  │   │                     # types.ts (UIGameData, UIPlayerData, etc.), winCalculator.ts
  │   ├── players/          # getPlayerStats, getPlayersList, getUserProfileStats, etc.
  │   │                     # types.ts (PlayerStats, UserProfileStats, etc.)
  │   ├── rankings/         # generatePlayerRankingStats, generateRoleRankingStats
  │   │                     # types.ts (PlayerRankingStats, RoleRankingStats)
  │   └── season/           # getRanking, getGameDatesLightweight, getSessionSummaryByDate, etc.
  └── (pages)/              # Page-local components co-located in page directory
                            # user/[nick]/UserProfileContent.tsx — shared RSC content for user profile
                            # role/[nazwa]/RoleDetailContent.tsx — shared RSC content for role detail
                            # historia-gier/[date]/DateGamesContent.tsx — shared RSC content for date games
