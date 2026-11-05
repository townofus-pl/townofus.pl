# TownOfUs.pl

Polish Among Us community site. Two things live here:

- a **role search engine** for the Town of Us mod — 60 legacy roles plus 77 from TOU:Mira, with
  each role's live lobby settings;
- the **Drama Afera** league tracker — games, players, per-season ELO rankings, session
  summaries and a host panel, fed by a companion mod that uploads a match the moment it ends.

All user-facing text is Polish. Code, commits and issues are English.

## Stack

Next.js 16.2 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind 3.4 · Zod 4
Cloudflare Workers via `@opennextjs/cloudflare` · Cloudflare D1 (SQLite) · R2
Prisma 7 with `@prisma/adapter-d1` · Jest 30

## Quick start

```bash
npm ci                    # also runs cf-typegen + prisma generate
cp .dev.vars.example .dev.vars
npm run dev               # :3000
```

That is enough for **most of the site**. The role search engine reads its 60 legacy and 77 Mira
roles from plain TypeScript files, so the home page, the role pages, `/custom` and `/tajemniczy`
need no database at all.

The 25 pages under `/dramaafera` read real games out of D1 and do need data. `db-backups/` is
gitignored, so a fresh clone has no dump to seed from — see
[**First time on this repo**](docs/ops/LOCAL_TESTING.md#first-time-on-this-repo) for how to get
one and which commands are safe to run.

`npm run preview` builds through OpenNext and serves the real Worker on `:8787`. Use it whenever
the thing you are testing touches a Cloudflare binding — `npm run dev` fakes those.

## How work lands

`main` is protected: **open a pull request**, do not push to it directly.

1. Branch, commit, open a PR.
2. `pr.yml` runs typecheck and tests. **Copilot reviews every PR** — that is an enforced rule, not
   a courtesy, and its instructions live in `.github/copilot-instructions.md`.
3. Merge. That deploys **staging** automatically.
4. Production is a separate, manual `workflow_dispatch` on the Deploy workflow. Releasing is a
   deliberate act; nothing reaches players because a PR merged.

Commit messages and code are English; everything a player sees is Polish.

## Where the data comes from

The league's stats are **not** entered by hand. The mod's host uploads a JSON payload at the end
of every match:

`POST /api/v2/games` takes an event-based payload — a flat `actions[]` the server aggregates itself.
The old aggregated endpoint (`POST /api/games`) was removed. The 735 games played before the
cutover stay in the database, and their rows are never rewritten.

Two rules govern ingest, and breaking either corrupts data silently:

1. **The era comes from the data, never from the request.** A game's season is derived from its
   own timestamp, and which role registry applies follows from that — never from "what season is
   it now".
2. **Ingest must be chronological.** The ranking calculator refuses a game older than one already
   processed, because a ranking row's `previousRating` is only meaningful in order.

`POST /api/v2/games` is idempotent on `gameIdentifier`: a re-submit returns 409 and writes
nothing, across all five tables.

## Environments

`wrangler.toml`'s top level is a **dev** config that deploys nowhere useful. Every real target is
a named environment, so nothing ships by accident.

| | worker | D1 | R2 `HOST_FILES` |
|---|---|---|---|
| staging | `townofus-pl-staging` | `townofus_pl_preview` | `townofus-pl-host-files-staging` |
| production | `townofus-pl` | `townofus-pl` | `townofus-pl-host-files` |

Named environments **do not inherit bindings** — `[[d1_databases]]`, `[[r2_buckets]]`, `[assets]` and `[vars]` are
redeclared in full in each `[env.*]` block. `[env.*.secrets] required` is enforced: a deploy is
refused outright if a listed secret is unset.

**Push to `main` deploys to staging. Production is `workflow_dispatch` only.** Both run
`check.yml` (typecheck, tests, manifest check) first, and migrations run in the same job as the
deploy — so a failed migration means no code ships against a half-migrated database.

## Commands

```bash
npm run dev / build / preview
npm test                             # Jest
npm run typecheck                    # tsc --noEmit

npm run validate                     # integrity checks; --target local|staging|production
npm run ranking:oracle               # replay a season's ELO and diff it against what is stored
npm run replay -- --file <p.json>    # POST a payload and print the per-table row delta

npm run db:migrate:create            # scaffold a migration + diff it against local D1
npm run db:migrate:apply:local       # …:staging, …:production
npm run db:import:local              # seed local D1 from a dump
npm run db:seed:staging              # wipe and reseed staging

npm run mod:publish                  # does latest.json match the files beside it?
npm run mod:publish -- --write       # rewrite latest.json from public/mod/client/
```

`validate` prints one `PASS`/`FAIL` line per check and exits non-zero on any failure. Its
thresholds are deliberately **loose floors, not exact counts** — read the real totals from its
output, never from a document.

## API

Interactive docs at `/api/docs` (production: https://townofus.pl/api/docs). The OpenAPI JSON is at
`/api/schema`. Both are public.

The public data API is `GET /api/v2/*`: seasons, sessions, games, game events, ranking, players,
roles, settings and the AUnlocker download. It needs no login and gives what a visitor sees on
the site. Only `POST /api/v2/games` (the mod), `GET /api/mod/host/[name]` and
`POST /api/season/reset` use HTTP Basic Auth (`API_USERNAME` / `API_PASSWORD`, from `.dev.vars`
locally and wrangler secrets per environment).

`npx tsx scripts/check-api-v2.ts http://localhost:3000` checks the real responses of a running
local server against the response schemas, the rules (no point fields, delayed `dap`, latest-day
order, `null` for missing action data, 404 for `season=1`) and the data of the local D1 copy.
CI does not run it, because it needs a running server and a seeded local D1. Route tests in
`src/app/api/v2/routes.test.ts` run in CI (response schema, blocked-field scan, 401 and 200).

## Documentation

- `AGENTS.md` (symlinked as `CLAUDE.md`) — conventions, structure, the D1 and Prisma traps
- `docs/ops/LOCAL_TESTING.md` — the local loop, and a symptom → cause → fix table
- `docs/v2-role-counter-mapping.md` — the action → counter spec `aggregate.ts` implements
- `docs/agents/` — issue tracker, triage labels, domain docs
- `.agents/skills/` — reusable agent workflows, symlinked into `.claude/skills/`

Issues live on GitHub.

## License

MIT
