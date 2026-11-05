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

`latest.sql` changes last. A failure in step 1 or 2 keeps the old file.

Retries: each export blocks the D1 for a short time, so the export step retries at most 2 times with
a 5 minute delay, and only for errors a retry can fix (HTTP 5xx, 408 or 429 from the API, a network
error, a failed download or upload, a missing `signed_url`). These errors end the step at once, with
no new export (`NonRetryableError`): HTTP 4xx from the API (for example a wrong token), a refusal by
the API, a missing config value, a file under 1 MB, a file without `d1_migrations`.

Upload to R2: with `Content-Length` and no `Content-Encoding` the Worker uses one `put`. Otherwise it
uses a multipart upload in parts of 8 MiB (one part in memory at a time) and aborts it on a failure.
The reason: in workerd, `R2Bucket.put` rejects a stream of unknown length (chunked download, or a
download with `Content-Encoding`). The tests in `test/r2.workerd.test.ts` measure this.

Rules in the code: the signed URL never goes to a log, a step output or an error message. The dump
is never held in memory. The Worker has no `fetch` handler and no route (`workers_dev = false`,
`preview_urls = false`).
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
npm run types             # regenerate worker-configuration.d.ts after a change in wrangler.toml
npm run types:check       # fails when the generated file is stale (CI runs it)
npm run typecheck
npm test
npm run dry-run           # bundles and validates both environments, uploads nothing
```

`worker-configuration.d.ts` is generated and committed. It holds the `SnapshotEnv` type. Do not edit it.
The top-level `name` in `wrangler.toml` is `townofus-db-snapshot-dev` and has no bindings: always
pass `--env`.

The tests have two parts. `test/snapshot.test.ts` uses a fake `fetch` and a fake R2 bucket.
`test/r2.workerd.test.ts` runs the same code in real workerd through Miniflare, with a local HTTP
server as the download side. It cannot show the real headers of the signed URL from the D1 export:
the staging test answers that.

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
