---
name: import-d1-database
description: Import or refresh a Cloudflare D1 database locally from a remote export when direct SQL dump execution fails because of foreign key ordering, transaction limitations, or wrangler import quirks. Use this skill when syncing production D1 data into the local development database.
---

# Import D1 Database

This skill documents the safe import workflow for Cloudflare D1 in this project. It avoids the failure modes observed with raw SQL dumps:

- table creation order mismatches
- INSERT ordering mismatches
- wrangler transaction restrictions
- foreign key pragma behavior that D1/wrangler does not reliably honor

The preferred implementation is the repository script at [scripts/import-d1-database.ts](scripts/import-d1-database.ts), exposed as `npm run db:import:local`.

## When to use this skill

Use this skill when you need to:

- refresh the local database from production
- inspect production data locally
- restore a broken local D1 state
- create a repeatable import workflow for future syncs

If you just want the practical one-command path, use `npm run db:import:local` instead of performing the steps manually.

Do not use this skill for schema design or schema migrations. Use `create-migration` for that.

## Prerequisites

Gather or confirm:

| Data | Required | Example |
|---|---|---|
| Source database name | Yes | `townofus-pl` |
| Target state directory | Yes | `.wrangler/state/v3/d1-import-v3` |
| Fresh export file path | Yes | `db-backups/townofus-pl-remote.sql` |
| Whether the local dev server is running | Yes | stop it first if it locks the state files |

## Workflow

### 1. Stop anything that locks the D1 state

Before touching `.wrangler/state/`, stop:

- `npm run dev`
- any `workerd` process
- any background `wrangler` process using the same state directory

If the state files are locked, the import or copy step can fail or leave the database half-updated.

### 2. Export the remote database

Run:

```bash
wrangler d1 export townofus-pl --remote --output db-backups/townofus-pl-remote.sql
```

Keep the raw export intact. Do not try to import the full file directly into local D1.

### 3. Apply local migrations to a fresh state directory

Run migrations into a fresh persist path:

```bash
npm run db:migrate:apply:local
```

If you need a clean isolated import state, use a separate `--persist-to` directory for the import run.

Important: the local schema must come from migrations first. Do not import schema statements from the export file.

### 4. Build an INSERT-only import file

Extract only `INSERT INTO ...` statements from the export.

Rules:

- drop `PRAGMA` statements from the export file
- drop schema statements (`CREATE TABLE`, `CREATE INDEX`, etc.)
- drop `INSERT INTO "d1_migrations" ...` because migrations already populate this table

### 5. Reorder the data by dependency

The dump order is not safe for D1 import. Reorder the INSERTs so parent tables are loaded before child tables.

Recommended order for this project:

1. `players` with `currentRankingId` temporarily nulled
2. `games`
3. `meetings`
4. `player_rankings`
5. `game_player_statistics`
6. `player_roles`
7. `player_modifiers`
8. `game_events`
9. `meeting_votes`
10. `meeting_skip_votes`
11. `meeting_jailed_players`
12. `meeting_blackmailed_players`
13. `meeting_no_votes`
14. `sqlite_sequence`

The important circular dependency is:

- `players.currentRankingId` references `player_rankings.id`
- `player_rankings.playerId` references `players.id`

To break the cycle, import `players` with `currentRankingId = NULL` first, then restore the original values afterward.

### 6. Do not rely on SQL transactions or FK pragmas

Avoid these approaches:

- `BEGIN TRANSACTION`
- `COMMIT`
- `SAVEPOINT`
- `PRAGMA foreign_keys=OFF`
- `PRAGMA defer_foreign_keys=TRUE`

In this project, wrangler/D1 did not reliably honor them for the dump import workflow.

### 7. Import into a fresh local state

Run the cleaned import file against a fresh persist directory:

```bash
wrangler d1 execute townofus-pl --local --file db-backups/<clean-import-file>.sql --persist-to '.wrangler/state/v3/<fresh-state>'
```

The import should be done into an empty state directory.

### 8. Restore `players.currentRankingId`

After the bulk import succeeds, generate `UPDATE` statements from the original `players` rows and apply them to restore the original `currentRankingId` values.

### 9. Make the imported data visible to the app

The dev server reads the default local D1 state. If you imported into a separate persist path, sync the populated SQLite files into the default local D1 state used by `npm run dev`, or rerun the final import against the state the app actually reads.

If the app still shows no data, verify that the SQLite files under `.wrangler/state/v3/d1/...` are the populated ones, not the empty bootstrap state.

## Validation

After import, verify:

1. `SELECT COUNT(*)` on key tables (`players`, `games`, `player_rankings`, `game_player_statistics`, `meetings`, `game_events`)
2. `PRAGMA foreign_key_check;` returns no rows
3. `npm run dev` reads the populated local state

## Common failures and fixes

### `no such table: main.player_rankings`

The schema or dump order is wrong. Ensure the schema comes from migrations and the import file only contains INSERTs.

### `FOREIGN KEY constraint failed`

The INSERT order is still wrong, or `players.currentRankingId` was not nulled before importing.

### `UNIQUE constraint failed: d1_migrations.id`

Remove `INSERT INTO "d1_migrations"` from the import file. Migrations already created those rows.

### `SQLITE_ERROR: unrecognized token: "\\"`

The import file was damaged by a bad text transformation or encoding problem. Rebuild the file from a fresh export.

### App still shows no data after a successful import

The app is reading the default local D1 state, but the import was written to a different `--persist-to` directory.

## Checklist

- [ ] Remote export created successfully
- [ ] Local migrations applied to a fresh state
- [ ] Import file contains INSERTs only
- [ ] `d1_migrations` INSERTs removed
- [ ] `players.currentRankingId` nulled for the bulk import
- [ ] Bulk import completed successfully
- [ ] `players.currentRankingId` restored afterward
- [ ] `PRAGMA foreign_key_check` passes
- [ ] `npm run dev` sees the imported data
