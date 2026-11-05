# DB snapshot Worker

A Worker with a Workflow. Once a week it exports the production D1 to a private R2 bucket. The
Preview job reads `latest.sql` from that bucket. The repo is public: do not write secrets, signed
URLs or exact point values here.

## Flow

Schedule: `20 3 * * 4` (Thursday), production only. Staging has no schedule.

1. `export and upload`: `POST /d1/database/<id>/export` with `output_format: "polling"`. The step
   polls until the API gives a `signed_url`, then streams the download to R2 as `prod-<date>.sql`.
   The step output holds the file name and size only.
2. `check dump`: fails if the file is under 1 MB or has no `d1_migrations` text.
3. `promote latest`: streams `prod-<date>.sql` to `latest.sql`.

`latest.sql` changes last. A failure in step 1 or 2 keeps the old file. The export step retries at
most 2 times with a 5 minute delay, because each export blocks the D1 for a short time.

Rules in the code: the signed URL never goes to a log, a step output or an error message. The dump
is never held in memory. `fetch` returns 404 (`workers_dev = false`, `preview_urls = false`).
Instance state is kept for 7 days (`default_retention`).

| | staging | production |
|---|---|---|
| Worker | `townofus-db-snapshot-staging` | `townofus-db-snapshot` |
| Source D1 | `townofus_pl_preview` | `townofus-pl` |
| R2 bucket | `townofus-pl-db-snapshots-staging` | `townofus-pl-db-snapshots` |

R2 lifecycle: delete `prod-*` after 30 days. `latest.sql` stays. Set it on the bucket by hand.

## Secret

`D1_EXPORT_TOKEN`: a Cloudflare API token that can export the D1 (start with `D1 Read`). It is a
Worker secret, not a GitHub secret. Set it once per environment:

```bash
npx wrangler@4.157.0 secret put D1_EXPORT_TOKEN --env staging
```

`wrangler deploy` is refused if the secret is unset (`[env.*.secrets] required`).

## Commands

Run in this directory. The root `npm ci` installs the dependencies. The config needs wrangler 4.157
or newer (`schedules` and `default_retention`), so the scripts use `npx wrangler@4.157.0`.

```bash
npm run typecheck
npm test
npm run dry-run           # bundles and validates both environments, uploads nothing
```

## Manual trigger

```bash
npx wrangler@4.157.0 workflows trigger townofus-db-snapshot-staging --env staging
npx wrangler@4.157.0 workflows instances list townofus-db-snapshot-staging
npx wrangler@4.157.0 workflows instances describe townofus-db-snapshot-staging latest
```

Do the same with `townofus-db-snapshot` and `--env production` for production. A production run
exports the production D1 and blocks it for a short time: run it at night.

## Restore a snapshot into a test D1

Never restore into the production D1.

```bash
# 1. Download the file (needs access to the bucket).
npx wrangler@4.157.0 r2 object get townofus-pl-db-snapshots/latest.sql --file /tmp/latest.sql --remote
# 2. Create an empty test database and import the file.
npx wrangler@4.157.0 d1 create snapshot-restore-test
npx wrangler@4.157.0 d1 execute snapshot-restore-test --remote --file /tmp/latest.sql
# 3. Check it, then delete the test database.
npx wrangler@4.157.0 d1 execute snapshot-restore-test --remote --command "SELECT count(*) FROM d1_migrations"
npx wrangler@4.157.0 d1 delete snapshot-restore-test
```

The dump holds production data. Delete `/tmp/latest.sql` when done.

## Failure signal

The Preview job checks the age of `latest.sql`. If it is older than 8 days, the PR comment shows a
warning. A failed Workflow instance also shows `errored` in `workflows instances list`.
