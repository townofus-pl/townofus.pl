# Local testing

Everything here runs against the **local** D1 database. Nothing in this document touches
production — with one exception, called out below.

## The loop

```bash
npm run db:import:local -- --no-export   # seed local D1 from db-backups/townofus-pl-remote.sql
npm run validate                         # 19 integrity checks, exits 1 on any failure
npm run ranking:oracle                   # replay the season's ELO and diff against stored

npm run dev                              # server on :3000  (or `npm run preview` on :8787)
npm run replay -- --file <payload.json> --twice
```

`npm run replay` restores nothing. After a POST that writes rows, re-seed with
`db:import:local -- --no-export` to get back to a known state.

## The scripts

### `npm run validate`

18 checks over the seeded database: row-count floors, orphan-FK queries for every relation,
`currentRankingId` consistency, and core-metadata completeness. One `PASS`/`FAIL` line each,
`exit 1` if any fail.

Thresholds are deliberately **loose floors, not exact counts** — real data drifts and an exact
assertion would go red every week. Read the actual totals from the tool's output, never from a
document (including this one).

### `npm run ranking:oracle`

Recomputes the ELO-like ranking from seeded `totalPoints` and diffs it against the rows already in
`player_rankings`. `PASS` means the replay reproduces the stored standings exactly.

This is the measuring instrument for any scoring change. Once v2 ingest writes different
`totalPoints`, re-run and the delta is the answer — no guessing. Dump standings with
`--json out.json` to diff two runs.

- `--season 3` (default) reproduces exactly. Season 3 opens from `season_reset` rows, so its
  starting point is inside the dataset.
- `--season 2` **cannot** reproduce and says so. Season 2's opening scores were carried in from
  season 1, which is deliberately excluded from `SEASONS`, so it is not in the dump.

The formula is duplicated from `src/app/api/_utils/rankingCalculator.ts` rather than imported —
that module needs a Prisma client and a Cloudflare context, neither of which exists offline. The
duplication is self-guarding: if the two drift, the replay stops reproducing and the script fails.

### `npm run replay`

POSTs a payload at a running server and prints the row-count delta per table, so you can see
exactly what an ingest wrote. `--twice` posts the same payload again and asserts the duplicate is
rejected with `409` having written nothing.

Auth comes from `API_USERNAME`/`API_PASSWORD` in `.dev.vars` (ingest is HTTP Basic).

Default URL is `/api/v2/games`, **which does not exist yet**. Until it does, point `--url` at
v1's `/api/games`.

## Staging

A deployed environment separate from production, used so the mod can POST v2 payloads at
something real while production still runs v1.

```bash
npm run db:seed:staging                  # wipe + reseed staging from the local dump
npm run db:migrate:apply:staging         # apply pending migrations to staging
npm run validate -- --target staging     # the same 18 checks, against the deployed DB
npm run deploy:staging                   # build + deploy
npm run replay -- --file <p.json> --url https://<staging-host>/api/v2/games --twice
```

**Every deploy target is explicit.** The top level of `wrangler.toml` is a dev config that
deploys nowhere useful; `npm run deploy` is `-e production` and `npm run deploy:staging` is
`-e staging`. Nothing deploys by accident.

**Named environments do not inherit bindings.** `[[d1_databases]]`, `[assets]` and `[vars]` are
redeclared in full inside each `[env.*]` block. A binding present only at the top level is simply
absent from the deployed environment.

**Staging uses the pre-existing `townofus_pl_preview` D1 database** (`44f0d77c-…`), which is a
genuinely separate database from production's `townofus-pl` (`0edadde7-…`).

**`db:seed:staging` wipes staging first**, in reverse FK order, breaking the
`players.currentRankingId` → `player_rankings` cycle before the deletes. Locally the whole
miniflare directory is deleted instead; remotely there is no directory to delete.

**The mod must authenticate against staging.** Its host build has the league's API credentials
compiled in (`Secrets.cs` in the mod repo, gitignored), so **staging needs the same
`API_USERNAME` / `API_PASSWORD` as production** — otherwise pointing the mod at staging returns
401. Point the mod with `DRAMAAFERA_API_URL`, or the BepInEx config key `Api.BaseUrl`.

## ⚠️ `db:import:local` reaches for production by default

Without `--no-export` the script first runs `wrangler d1 export townofus-pl --remote`, i.e. it
contacts the production database. It is a read-only export, but it is production.

**Always pass `--no-export`** unless you deliberately want a fresh dump. The existing
`db-backups/townofus-pl-remote.sql` is 20 MB and covers 642 games through 2026-08-05, which is
enough for everything in this document.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Multiple local D1 databases found` | Miniflare's `metadata.sqlite` sits beside the real D1 file and `listLocalDatabases()` returns both | Fixed in `scripts/lib/localD1.ts`, which filters it. If you see this again, something else created a second `.sqlite` there |
| `No local D1 database files found` | Local D1 was never created | `npm run db:migrate:apply:local` |
| `db:import:local` fails with `Authentication error [code: 10000]` | It tried to export from production and your wrangler is not authorised | Add `--no-export` |
| `npm run replay` → `Request failed` | No server running | `npm run dev` (:3000) or `npm run preview` (:8787) |
| `npm run replay` → `404` on `/api/v2/games` | The v2 endpoint does not exist yet | Expected. Use `--url http://localhost:3000/api/games` for v1 |
| `npm run replay` → `400 Invalid game data` posting a mod capture at `/api/games` | A v2 payload does not satisfy v1's `GameDataSchema` | Expected — that mismatch is the whole reason v2 exists |
| Ingest returns `409 Game with identifier … already exists` | `gameIdentifier` (`YYYYMMDD_HHMM`) is taken. The lookup **ignores `deletedAt`**, so a soft-deleted game still blocks re-upload | Re-seed, or change the payload's `startTime` |
| Ingest returns 201 but `rankingCalculated: false` | The ranking calculator refuses any game whose `startTime` is older than the newest already-ranked game | Give the payload a `startTime` after the newest seeded game |
| `npm test` finds nothing | There is no `jest.config.*` and no test files yet | Expected today |
| `npm run db:migrate:diff` errors about multiple databases | Same `metadata.sqlite` cause as above | Fixed; `prisma.config.ts` now shares `scripts/lib/localD1.ts` |
| A deploy fails with `The following required secrets have not been set` | The `[env.*.secrets] required` list is **enforced** by wrangler, not just documentation | `wrangler secret put <NAME> --env <env>` before deploying |
| Any remote wrangler command says `More than one account available` | The account is ambiguous for that subcommand | `export CLOUDFLARE_ACCOUNT_ID=d1287f321cc95882fc773ab71241b51a` |

## What does not exist yet

- **No test suite.** `jest`, `ts-jest` and `@types/jest` are installed and `npm test` is wired, but
  there is no config and no test files.
- **No schema-valid v2 fixture.** See [#293](https://github.com/townofus-pl/townofus.pl/issues/293) —
  no capture currently on disk validates against `game_data.schema.json`.
