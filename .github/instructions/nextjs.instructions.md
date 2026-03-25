---
applyTo: "src/app/**/*.tsx,src/app/**/*.ts"
---
# Next.js App Router Patterns

## Server vs Client

- Default: Server Component (no directive needed)
- Add 'use client' only for: useState, useEffect, useRef, useRouter, useParams,
  usePathname, browser APIs, interactive event handlers
- Never call Prisma or getCloudflareContext from a client component

## Component location

| Scope                       | Location                              |
|-----------------------------|---------------------------------------|
| Used across 2+ pages        | src/app/_components/                  |
| Dramaafera section shared   | src/app/dramaafera/_components/       |
| Specific to one page        | Co-located in the page directory      |
| Custom hooks                | Co-located in feature directory       |

## Data fetching in Server Components

gameDataService functions are the RSC data layer — call them directly in server components:
  import { getGamesList } from '@/app/dramaafera/_services/gameDataService';
  const games = await getGamesList();  // handles build-time gracefully

## Fonts and colors

  <h1 className="font-brook">Heading</h1>         // BrookPL — all headings
  <p className="font-barlow">Body text</p>         // Barlow — body text

  className="text-role-crewmate"   // cyan  rgb(0,255,255)
  className="text-role-impostor"   // red   rgb(255,0,0)
  className="text-role-neutral"    // gray  rgb(167,167,167)
  // Also available as bg-role-*, border-role-*, etc.

## TypeScript

- @/* maps to ./src/* — prefer alias over deep relative paths
- src/generated/ excluded from type-checking — import generated Zod schemas freely
