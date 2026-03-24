---
applyTo: "src/app/dramaafera/**"
---
# Dramaafera Section Patterns

## Data layer

gameDataService.ts is the ONLY data access layer for Dramaafera pages:
- Location: src/app/dramaafera/_services/gameDataService.ts (~2100 lines)
- Called directly from Server Components — never from client components or API routes
- Internally calls getCloudflareContext() + getPrismaClient(env.DB) per function
- Handles build-time gracefully (no Cloudflare context at build time)

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
- Game.season and PlayerRanking.season columns (Int, default 1) added via migration 0003
  NOTE: @default(1) is temporary for migration backfill — Phase 3 removes it via a
  second migration (0004) after all create code sets season explicitly

## Component structure

  dramaafera/
  ├── _components/          # Shared across Dramaafera pages
  ├── _constants/           # seasons.ts
  ├── _hooks/               # useSeason.ts
  ├── _utils/               # seasonHelpers.ts
  ├── _services/            # gameDataService.ts
  └── (pages)/              # Page-local components co-located in page directory
