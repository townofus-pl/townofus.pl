---
applyTo: "**/*.test.ts,**/*.spec.ts"
---
# Testing Patterns

## Framework

Jest with ts-jest.
  npm test                # Run all tests
  npm run test:watch      # Watch mode
  npm run test:coverage   # Coverage report

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
