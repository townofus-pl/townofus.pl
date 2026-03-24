---
name: create-migration
description: Perform a database schema change — edit the Prisma schema, generate migrations, and apply them to the local Cloudflare D1 database. Use this skill when asked to add a column, create a new table, modify the database schema, or run migrations.
---

# Create Database Migration

This skill guides the process of changing the database schema in a Prisma + Cloudflare D1 project. D1 uses SQLite under the hood with specific constraints that must be respected.

## Prerequisites

Gather from the user:

| Data              | Required | Example                                         |
|-------------------|----------|-------------------------------------------------|
| What to change    | Yes      | "Add a `seasonId` column to the `Game` model"   |
| New model?        | If yes   | Model name, fields, and relations               |
| Default values    | If column added | Default for existing rows                 |

## Step 1: Edit Prisma Schema

Edit `prisma/schema.prisma`.

### Adding a new model

Every model MUST include these standard fields:

```prisma
model NewModel {
  id        Int       @id @default(autoincrement())
  // ... domain fields ...
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?  // MANDATORY — enables soft deletes
}
```

### Adding a column to an existing model

```prisma
model Game {
  // ... existing fields ...
  seasonId  Int?      // New nullable column (safe for existing data)
  // ...
}
```

Rules:
- New columns on existing models should be **nullable** (`?`) or have a `@default()` to avoid breaking existing rows
- Always include `deletedAt DateTime?` on new models
- Relations must reference valid models and use `@relation` with explicit field/reference names

### Common field patterns in this project

```prisma
// Soft-delete field (MANDATORY on every model)
deletedAt DateTime?

// Timestamps
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

// Relations
player    Player @relation(fields: [playerId], references: [id])
playerId  Int

// Optional relation
season    Season? @relation(fields: [seasonId], references: [id])
seasonId  Int?
```

## Step 2: Generate Prisma Client + Zod Schemas

Run:

```bash
npm run db:generate
```

This regenerates:
- Prisma client types
- Auto-generated Zod schemas in `src/generated/zod/`

The `src/generated/` directory is excluded from TypeScript type-checking — changes there are safe to commit as-is.

## Step 3: Create Migration SQL

Run:

```bash
npm run db:migrate:create
```

This will:
1. Diff the schema against the current local D1 database
2. Generate a SQL migration file in `migrations/`
3. Prompt for a migration name — use a descriptive name like `add_season_id_to_game`

Review the generated SQL to ensure it's correct. D1 (SQLite) has limitations:
- No `ALTER TABLE ... DROP COLUMN` in older versions
- No `ALTER TABLE ... RENAME COLUMN` — must recreate the table
- No concurrent schema changes

## Step 4: Apply Migration Locally

Run:

```bash
npm run db:migrate:apply:local
```

This applies the migration to your local D1 database. Verify it succeeds without errors.

## Step 5: Test

After migration:

1. Run `npm run build` to verify TypeScript compilation with the new Prisma types
2. Test affected API routes or services manually
3. If existing queries touch the modified model, ensure they still work

## Step 6: Deployment Notes

- **Do NOT run remote migrations manually** — CI auto-runs `db:migrate:apply:remote` on deployment
- For preview testing: `npm run db:migrate:apply:preview`
- Migration files in `migrations/` must be committed to git

## D1 Constraints Cheat Sheet

### No interactive transactions

Prisma `$transaction()` with callbacks does NOT work with D1. Each Prisma query auto-commits.

For atomic multi-statement operations, use D1's native batch API:

```typescript
import { batchStatements } from '@/app/api/_database';

await batchStatements(env.DB, [
  env.DB.prepare('UPDATE players SET rating = ? WHERE id = ?').bind(newRating, playerId),
  env.DB.prepare('INSERT INTO player_rankings (...) VALUES (?, ...)').bind(...),
]);
```

`batch()` requires raw SQL, not Prisma ORM calls. All statements execute atomically.

### Soft deletes are mandatory

Every model has `deletedAt DateTime?`. All queries MUST filter with:

```typescript
import { withoutDeleted } from '@/app/api/schema/common';
await prisma.newModel.findMany({ where: { ...withoutDeleted } });
```

### Pagination

```typescript
import { buildPaginationQuery } from '@/app/api/_database';
const pagination = buildPaginationQuery({ skip: 0, take: 20, orderBy: { createdAt: 'desc' } });
// Max take is capped at 100
```

## Validation Checklist

- [ ] New models have `deletedAt DateTime?` field
- [ ] New models have `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`
- [ ] New columns on existing models are nullable or have defaults
- [ ] `npm run db:generate` succeeds
- [ ] `npm run db:migrate:create` generates valid SQL
- [ ] `npm run db:migrate:apply:local` applies without errors
- [ ] `npm run build` compiles successfully
- [ ] Migration SQL file is committed to git
- [ ] No usage of `$transaction()` callback style in new code touching this model
