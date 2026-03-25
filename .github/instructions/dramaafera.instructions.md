---
applyTo: "src/app/dramaafera/**"
---
# Dramaafera Section Patterns

## Data layer

The `_services/` directory is organized into domain-grouped subdirectories. All functions are
server-component-only — never call from client components or API routes:

- `src/app/dramaafera/_utils/gameUtils.ts` — domain-agnostic utility functions
  (`formatDuration`, `formatDisplayDate`, `extractDateFromGameId`, `convertRoleNameForDisplay`,
  `normalizeRoleName`, `getTeamColor`, `getRoleColor`, `getModifierColor`, `determineTeam`).
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
  getRanking(seasonId?, limit?, offset?)        — current season only; past season returns []
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

## Seasons (active feature)

Season 2 started 2026-03-23. See SEASONS_IMPLEMENTATION_PLAN.md for full plan.

Phase 1 complete:
- CURRENT_SEASON = 2 (src/app/dramaafera/_constants/seasons.ts)
- SEASONS array + getSeasonById(id) + getSeasonForDate(date) in seasons.ts
- extractDramaAferaSubPath(pathname) + buildSeasonUrl(path, seasonId) in _utils/seasonHelpers.ts
- useSeason() hook in _hooks/useSeason.ts — reads params.seasonId, falls back to CURRENT_SEASON
- Game.season and PlayerRanking.season columns (Int, no default) added via migrations 0003+0004
- rankingCalculator.ts — selects game.season and sets PlayerRanking.season on create
- players/post.ts — sets PlayerRanking.season = CURRENT_SEASON on initial ranking create

Phase 2 complete:
- SeasonSwitcher.tsx in _components/Header/ — 'use client' dropdown, uses useSeason() +
  buildSeasonUrl() + extractDramaAferaSubPath() to navigate between seasons while
  preserving the current sub-path
- Header.tsx rewritten as a flat CSS grid (lg: 2-col 1fr/auto, 3 rows; below lg: single column)
  with all 5 elements (title, subtitle, nav, SeasonSwitcher, credits) as direct grid children,
  explicitly placed via lg:col-start-* / lg:row-start-* — no nested column divs
- Navigation.tsx updated: seasonDependent flag per nav item, buildSeasonUrl() applied to
  season-dependent links (/ranking, /wyniki, /historia-gier), currentPage detection uses
  extractDramaAferaSubPath() + prefix matching instead of exact path comparison

Phase 3 complete:
- _services/ game/player/ranking functions — most list/stats functions accept optional
  seasonId?: number, default to CURRENT_SEASON via buildSeasonGameWhere() helper;
  getGameData(gameId) intentionally has no seasonId (season is a stored property of the
  game record, not a filter criterion); PlayerRanking queries filter by season column directly
- createGame.ts — sets season: getSeasonForDate(startTime) on prisma.game.create()
- @default(1) removed from Game.season and PlayerRanking.season via migration 0004
- TODO comments in user/[nick]/page.tsx and role/[nazwa]/page.tsx flagging deferred
  seasonId pass-through (Phase 5)

Phase 4 complete:
- 8 season service functions extracted: getRanking, getGameDatesLightweight,
  getSessionSummaryByDate, getWeeklyStats, getTopSigmas, getRankingAfterSession,
  getEmperorHistory, getHostInfo — each in its own file under _services/season/
- getDatabaseClient and buildSeasonGameWhere live in _services/db.ts (exported)
- getRanking past-season support deferred — returns { ranking: [], total: 0 } with TODO comment
- getRankingSnapshots (internal helper in _rankingHelpers.ts) return type:
  { before: Map<string, number>; after: Map<string, number> } keyed by playerName (string)
- _services/ monolith eliminated — split into domain subdirectories (see Data layer above)
- _utils/gameUtils.ts created — utility functions NOT re-exported from _services

## Component structure

  dramaafera/
  ├── _components/          # Shared across Dramaafera pages
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
