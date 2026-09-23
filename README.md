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

| | endpoint | payload |
|---|---|---|
| v1 | `POST /api/games` | aggregated — 24 pre-computed counters per player |
| v2 | `POST /api/v2/games` | event-based — a flat `actions[]` the server aggregates itself |

**v2 is what the mod sends today.** Both are live: v1 still serves the 735 games played before
the cutover, and its rows are never rewritten.

Three rules govern ingest, and breaking any of them corrupts data silently:

1. **The mod scores, the server sums.** `totalPoints` is the sum of every action's `pointsChange`
   and nothing else. No bonus is added server-side, and the disconnect clamp arrives already
   applied. The 24 counters exist for display; the ranking reads `totalPoints` alone.
2. **The era comes from the data, never from the request.** A game's season is derived from its
   own timestamp, and which role registry applies follows from that — never from "what season is
   it now".
3. **Ingest must be chronological.** The ranking calculator refuses a game older than one already
   scored, because a ranking row's `previousRating` is only meaningful in order.

`POST /api/v2/games` is idempotent on `gameIdentifier`: a re-submit returns 409 and writes
nothing, across all five tables.

## Environments

`wrangler.toml`'s top level is a **dev** config that deploys nowhere useful. Every real target is
a named environment, so nothing ships by accident.

| | worker | D1 |
|---|---|---|
| staging | `townofus-pl-staging` | `townofus_pl_preview` |
| production | `townofus-pl` | `townofus-pl` |

Named environments **do not inherit bindings** — `[[d1_databases]]`, `[assets]` and `[vars]` are
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

Interactive docs at `/api/docs`, health at `/api/status`, OpenAPI JSON at `/api/schema`.

Endpoints are protected with HTTP Basic Auth (`API_USERNAME` / `API_PASSWORD`, from `.dev.vars`
locally and wrangler secrets per environment) — **except** `GET /api/dramaafera/*`, which is
public so client components and embeddable widgets can read it. Destructive methods under that
same prefix are still authenticated.

## Documentation

- `AGENTS.md` (symlinked as `CLAUDE.md`) — conventions, structure, the D1 and Prisma traps
- `docs/ops/LOCAL_TESTING.md` — the local loop, and a symptom → cause → fix table
- `docs/v2-role-counter-mapping.md` — the action → counter spec `aggregate.ts` implements
- `docs/agents/` — issue tracker, triage labels, domain docs
- `.agents/skills/` — reusable agent workflows, symlinked into `.claude/skills/`

Issues live on GitHub. The scoring **weights** the mod applies are deliberately not published
here or on the site: the site names which actions score, not what each is worth.

## License

MIT
