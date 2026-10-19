# Discord bot

A separate Cloudflare Worker that automates the Emperor poll and the signup list for the
Wednesday session. It uses the same D1 databases as the site. Migrations stay in the site's
Prisma setup (`prisma/migrations`). This Worker never applies them.

The Worker has two entry points:

| Entry point | What it does |
|---|---|
| `fetch` | Receives Discord interactions over HTTP. Verifies the Ed25519 signature on the raw body, returns `401` for a bad signature and PONG for PING, then routes `/ankieta` and the signup buttons. |
| `scheduled` | Runs on the cron `*/10 15-22 * * WED` (UTC). Calculates the Europe/Warsaw time and runs one step: 17:00 close the poll, 18:00 close the signups, from 22:00 create the poll. |

The handlers and the steps are stubs in this version.

## Layout

```
src/index.ts         fetch + scheduled entry points
src/verify.ts        Ed25519 signature check (WebCrypto)
src/interactions.ts  routing of commands and buttons to handlers
src/schedule.ts      Warsaw time and the choice of the cron step
src/steps.ts         the cron steps
src/commands.ts      command definitions and button custom_ids
scripts/registerCommands.ts
test/                Jest tests (run in Node, no Workers runtime)
```

The bot has no own dependencies. It uses the packages installed at the repo root, so run
`npm ci` there first. All commands below run in `workers/discord-bot/`.

## Configuration

`wrangler.toml` has three environments. Always give `--env`.

| Env | Discord application | Server and channel | D1 |
|---|---|---|---|
| `dev` | dev | your test server | local copy of `townofus-pl` |
| `staging` | staging | production server, test channel | `townofus_pl_preview` |
| `production` | prod | production server, production channel | `townofus-pl` |

Each environment declares its own vars. Named environments do not inherit them.

| Var | Value |
|---|---|
| `DISCORD_APPLICATION_ID` | Application ID from the Developer Portal |
| `DISCORD_PUBLIC_KEY` | Public key (hex) from the Developer Portal |
| `DISCORD_GUILD_ID` | Server ID |
| `DISCORD_CHANNEL_ID` | Channel for the poll and the signup message |
| `DISCORD_HOST_ROLE_ID` | ID of the "Host" role |
| `TEXT_POLL_QUESTION` | Poll question |
| `TEXT_SIGNUP` | Signup message. `{date}` becomes DD.MM of the session. |
| `TEXT_SIGNUP_CLOSED` | Text added to the signup message at 18:00 |
| `TEXT_SIGNUP_CLOSED_REPLY` | Reply to a click after 18:00 |

The IDs are empty placeholders until the deployment ticket fills them in. They are not secret.

### Secrets

| Name | Where |
|---|---|
| `DISCORD_BOT_TOKEN` | GitHub environment secret in `staging` and `production`. Local `.dev.vars` for dev. |
| `CLOUDFLARE_API_TOKEN` | GitHub environment secret, the same one the site's deploy uses. |

`DISCORD_BOT_TOKEN` is a required secret in `wrangler.toml`, so wrangler refuses a deploy
without it. If a token leaks or gets lost, reset it in the Developer Portal and update the
GitHub secret, then run the deploy again.

## Deploy

The workflow `.github/workflows/discord-bot.yml` runs only when files in `workers/discord-bot/`
(or the workflow) change.

- Pull request: typecheck, tests, `wrangler deploy --dry-run` for staging and production.
- Push to `main`: the same checks, then deploy to staging.
- `workflow_dispatch` with `action: deploy`: deploy to the environment you select.
- `workflow_dispatch` with `action: register-commands`: register the guild commands in the
  environment you select. Do this once per environment, and again when `src/commands.ts`
  changes.

The deploy job sends `DISCORD_BOT_TOKEN` with the deploy (`wrangler deploy --secrets-file`).

After the first deploy, set the Interactions Endpoint URL of the Discord application to the
Worker URL (`https://<worker name>.<subdomain>.workers.dev/`). Discord sends a PING to check it.

`/ankieta` has `default_member_permissions: "0"`, so only admins see it at first. A server admin
must allow the "Host" role in Server Settings > Integrations. For staging, also limit the command
to the test channel there.

## Local development

1. Copy the secret template and put the **dev** bot token in it:

   ```bash
   cp .dev.vars.example .dev.vars
   ```

2. Start the Worker. It uses the site's local D1 file (`../../.wrangler/state`):

   ```bash
   npm run dev
   ```

3. Run a cron step at a given time (milliseconds since epoch, UTC). Example: 2026-10-21 17:00 in
   Warsaw:

   ```bash
   curl "http://localhost:8787/cdn-cgi/handler/scheduled?time=1792594800000"
   ```

   The log shows the Warsaw time and the chosen step.

4. Run the tests and the typecheck:

   ```bash
   npm test
   npm run typecheck
   ```

### Testing interactions with a tunnel

Discord must reach the Worker over public HTTPS. Use a `cloudflared` quick tunnel **only while
you test interactions**, then stop it.

1. Start the Worker (`npm run dev`).
2. In a second terminal, start the tunnel:

   ```bash
   cloudflared tunnel --url http://localhost:8787
   ```

3. Copy the `https://<random>.trycloudflare.com` URL into the Interactions Endpoint URL of the
   **dev** application. Never use the staging or prod application for this.
4. Register the commands for dev:

   ```bash
   DISCORD_BOT_TOKEN=<dev token> npm run register-commands -- --env dev
   ```

5. Test the command and the buttons on your test server.
6. Stop the tunnel (Ctrl+C). The URL stops working, and the next tunnel gets a new one.
