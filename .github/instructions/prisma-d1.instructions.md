---
applyTo: "**/*.prisma,**/migrations/**,**/prisma/**"
---
# Prisma + Cloudflare D1 Patterns

## Client initialization

  import { getCloudflareContext } from '@opennextjs/cloudflare';
  import { getPrismaClient } from '@/app/api/_database';

  const { env } = await getCloudflareContext();
  const prisma = getPrismaClient(env.DB);  // singleton per D1 binding

## Soft deletes (mandatory on every query)

Every model has deletedAt DateTime?. Always include:

  import { withoutDeleted } from '@/app/api/schema/common'; // = { deletedAt: null }

  // Correct:
  await prisma.game.findMany({ where: { ...withoutDeleted, map: 'Skeld' } });
  // Wrong:
  await prisma.game.findMany({ where: { map: 'Skeld' } }); // returns deleted records

## Transactions

Prisma `$transaction` interactive callback style does NOT work with the D1 adapter — do not use it.

D1 operates in auto-commit: each Prisma query commits immediately. For atomic multi-statement
operations, use D1's native `batch()` API with raw prepared statements:

  import { batchStatements } from '@/app/api/_database';

  await batchStatements(env.DB, [
    env.DB.prepare('UPDATE players SET rating = ? WHERE id = ?').bind(newRating, playerId),
    env.DB.prepare('INSERT INTO player_rankings (...) VALUES (?, ...)').bind(...),
  ]);
  // All statements execute atomically — failure rolls back the entire batch.

Note: batch() requires raw SQL, not Prisma ORM calls. For most writes (single-model creates/updates),
auto-commit is fine and Prisma ORM can be used normally.

If you need atomic operations involving complex Prisma-generated queries (e.g. with computed where
clauses), you must extract the SQL manually via $queryRaw/$executeRaw, or accept that multi-step
Prisma writes are not atomic on D1. This is a D1 adapter constraint with no ORM-level workaround.

## Pagination

  import { buildPaginationQuery } from '@/app/api/_database';
  const pagination = buildPaginationQuery({ skip: 0, take: 20, orderBy: { createdAt: 'desc' } });
  // Max take is capped at 100. Default: skip=0, take=10, orderBy={createdAt:'desc'}
  await prisma.player.findMany({ where: { ...withoutDeleted }, ...pagination });

## Schema change workflow

1. Edit prisma/schema.prisma
2. npm run db:migrate:create         — creates migration SQL
3. npm run db:migrate:apply:local    — apply to local D1
4. Test thoroughly
5. Deploy — CI auto-runs db:migrate:apply:remote

## Auto-generated Zod schemas

  // Generated to src/generated/zod/ by npm run db:generate
  // Excluded from TypeScript type-checking (safe to import)
  import { GameModelSchema } from '@/generated/zod/schemas/variants/pure';

## D1 env binding

  wrangler.toml: binding = "DB"      → env.DB in Cloudflare context
  Type: CloudflareEnv.DB             → regenerate with npm run cf-typegen
  Three databases: local (dev) · preview · production (separate IDs in wrangler.toml)
