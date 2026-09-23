---
applyTo: "**/*.test.ts,**/*.spec.ts"
---
# Testing Patterns

## Framework

Jest with ts-jest.
  npm test                # Run all tests
  npm run test:watch      # Watch mode
  npm run test:coverage   # Coverage report

`jest.config.js` exists and CI runs `npm test`, so a test written here gates a merge. It matches
`src/**/*.test.ts` only, and ignores `.next/`, `.open-next/` and `.claude/worktrees/` — each of
those carries a `package.json` named `townofus.pl`, which jest-haste-map reports as a collision.

**`@opennextjs/cloudflare` is ESM and breaks under ts-jest.** Anything importing it is
unreachable from a test. When logic needs covering, split the pure part into its own module and
leave only the I/O behind the binding — `pickMiraPair` in `_utils/miraConfig.ts` versus
`_resolvePair.ts` is the worked example.

The ingest is the best-covered area precisely because `aggregate.ts` is pure: payload in,
counters out, no database. Keep it that way.

## File location

Co-locate test files with the module:
  src/app/api/_utils/rankingCalculator.ts
  src/app/api/_utils/rankingCalculator.test.ts

## TypeScript

Same strict rules as production code. No `any`.
Use jest.Mocked<T> and jest.SpyInstance for typed mocks.

## Mocking Cloudflare context

  jest.mock('@opennextjs/cloudflare', () => ({
    getCloudflareContext: jest.fn().mockResolvedValue({
      env: { DB: mockD1Database }
    })
  }));
