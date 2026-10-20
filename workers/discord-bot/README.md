# Discord bot

A separate Cloudflare Worker that automates the Emperor poll and the signup list for the
Wednesday session. It uses the same D1 databases as the site. Migrations stay in the site's
Prisma setup (`prisma/migrations`). This Worker never applies them.

The Worker has two entry points:

| Entry point | What it does |
|---|---|
| `fetch` | Receives Discord interactions over HTTP. Verifies the Ed25519 signature on the raw body, returns `401` for a bad signature and PONG for PING, then routes `/ankieta` and the signup buttons. |
| `scheduled` | Runs on the cron `*/10 15-22 * * WED` (UTC). Calculates the Europe/Warsaw time and runs one step: 17:00 close the poll (19:00–21:59 read its result), 18:00 close the signups, from 22:00 create the poll. |

`/ankieta`, the 17:00 and 22:00 steps (see `src/poll/`), the signup buttons and the 18:00 step
work (see [Signups](#signups)).

The 17:00 step (`src/poll/closePoll.ts`) does two things on every tick:

1. End Poll for each poll of this environment's channel that is due (`closesAt` has passed) and
   not closed. Then it sets `closedAt`. A poll that Discord already ended also gets `closedAt`.
2. Read each closed poll that has no result yet. When `poll.results.is_finalized` is true, it
   writes `voteCount` of each candidate and `finalizedAt`. Until then, the next tick reads again.

The same step also runs from 19:00 to 21:59, so the bot can read a late tally or retry a failed
End Poll. A `401` or `403` stops the tick. A `429` gets one retry when the wait is 5 s or less.
Otherwise the next tick tries again. The step never touches polls of another channel.

If End Poll fails until `closesAt` + 2 h, the step sets `closedAt` without Discord, because by then
`duration` has ended the poll. An open row would block the next poll. The step reads a result for
8 days after `closedAt`. After that it logs `pollFinalizeGaveUp` once and stops.

## Layout

```
src/index.ts         fetch + scheduled entry points
src/verify.ts        Ed25519 signature check (WebCrypto)
src/interactions.ts  routing of commands and buttons to handlers
src/schedule.ts      Warsaw time and the choice of the cron step
src/steps.ts         the cron steps
src/commands.ts      command definitions and button custom_ids
src/signup/          signup buttons and the 18:00 step
src/poll/            Emperor poll: candidates, quiet rule, create flow, /ankieta
scripts/registerCommands.ts
test/                Jest tests (run in Node; D1 tests use a real D1 in Miniflare)
```

The bot has no own dependencies. It uses the packages installed at the repo root, so run
`npm ci` there first. All commands below run in `workers/discord-bot/`.

## Signups

The buttons on the signup message have the custom_ids `signup:join:YYYY-MM-DD` and
`signup:leave:YYYY-MM-DD`. The date is the Wednesday of the session. Build the message with
`renderSignupMessage` in `src/signup/message.ts`.

- A click changes only the clicker's name, with one SQL statement on the JSON in
  `lista_cweli.playerNames`. A host edit in the panel stays.
- The bot answers with UPDATE_MESSAGE (the new list on the message) and sends the confirmation
  as an ephemeral follow-up.
- After 18:00 Europe/Warsaw on the session day, a click gets `TEXT_SIGNUP_CLOSED_REPLY`.
- The 18:00 step finds the bot's own message with the button for that date in the channel
  history, then disables the buttons and adds `TEXT_SIGNUP_CLOSED`.
- The identity rules (link, new player, nick of a linked player) are at the top of
  `src/signup/identity.ts`. When the nick belongs to a player linked to another account, the
  click changes nothing and the clicker gets a reply that the host will check.
- The bot matches a nick to a player without regard to case, Polish letters included. On the
  list, the bot always writes the player's own spelling.
- **Known limit:** the list compare in SQL (`COLLATE NOCASE`) folds ASCII letters only. If the
  host types a name with Polish letters in another case ("łoś" for "Łoś"), the bot does not see
  that name as the same. A join can then add the name a second time, and a leave does not
  remove the host's version.

## Configuration

`wrangler.toml` has three environments. Always give `--env`.

| Env | Discord application | Server and channel | D1 |
|---|---|---|---|
| `dev` | dev | separate test server (not the league server), its own channel | local copy of `townofus-pl` |
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
| `DISCORD_PING_ROLE_ID` | Role that the first send of the poll message pings. The signup message pings nobody. Empty: no ping. The role must be "mentionable", or the bot needs the "Mention @everyone, @here and All Roles" permission. |
| `TEXT_POLL_QUESTION` | Poll question |
| `TEXT_SIGNUP` | Signup message. `{date}` becomes DD.MM of the session. |
| `TEXT_SIGNUP_LIST` | Bold heading above the list of names. `{date}` becomes DD.MM of the session. |
| `TEXT_SIGNUP_JOIN` | Label of the join button |
| `TEXT_SIGNUP_LEAVE` | Label of the leave button |
| `TEXT_SIGNUP_CLOSED` | Text added to the signup message at 18:00 |
| `TEXT_SIGNUP_CLOSED_REPLY` | Reply to a click after 18:00 |

The IDs are not secret. The values marked `TODO(#361)` stay empty until the deployment ticket
fills them in.

### Secrets

| Name | Where |
|---|---|
| `DISCORD_BOT_TOKEN` | GitHub environment secret in `staging` and `production`. Local `.dev.vars` for dev. |
| `CLOUDFLARE_API_TOKEN` | GitHub environment secret, the same one the site's deploy uses. |

`DISCORD_BOT_TOKEN` is a required secret in `wrangler.toml`, so wrangler refuses a deploy
without it. If a token leaks or gets lost, reset it in the Developer Portal and update the
GitHub secret, then run the deploy again.

## Deploy

The bot uses the site's pipeline. It has no deploy workflow of its own.

| Workflow | Job | What it does |
|---|---|---|
| `check.yml` (every PR, and before every deploy) | `bot` | Typecheck, tests, `wrangler deploy --dry-run` for staging and production. |
| `deploy.yml` (push to `main` → staging, `workflow_dispatch` → the environment you select) | `deploy-bot` | Runs after the site's `deploy` job (so after the migrations), then deploys the bot to the same environment. |
| `discord-bot.yml` (`workflow_dispatch` only) | `register-commands` | Registers the guild commands in the environment you select. Do this once per environment, and again when `src/commands.ts` changes. |

- A production deploy or production command registration runs only from `main`. A dispatch from
  another branch fails at the first step.
- `deploy-bot` sends `DISCORD_BOT_TOKEN` with the deploy (`wrangler deploy --secrets-file`).
- If `DISCORD_BOT_TOKEN` is not set in the GitHub environment yet, `deploy-bot` skips the deploy
  with a warning in the job summary. The site deploy is not affected.

After the first deploy, set the Interactions Endpoint URL of the Discord application to the
Worker URL. Production uses the custom domain `https://dramaafera-bot.townofus.pl`. Staging uses
`https://townofus-discord-bot-staging.<subdomain>.workers.dev/`. Discord sends a PING to check it.

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

3. Run a cron step at any wall-clock time. `GET /__dev/tick?now=<ISO 8601>` runs the cron logic
   as if the cron fired at `now`, and returns the Warsaw time and the step. The route works only
   when `ENVIRONMENT` is `"dev"`. In staging and production it does not exist (GET gets `405`).

   ```bash
   # Close the poll (Wednesday 17:xx Warsaw)
   curl -G "http://localhost:8787/__dev/tick" --data-urlencode "now=2026-10-21T17:10:00+02:00"

   # Close the signups (Wednesday 18:xx Warsaw)
   curl -G "http://localhost:8787/__dev/tick" --data-urlencode "now=2026-10-21T18:10:00+02:00"

   # Create the poll (Wednesday 22:xx Warsaw)
   curl -G "http://localhost:8787/__dev/tick" --data-urlencode "now=2026-10-21T22:10:00+02:00"
   ```

   The short form `curl "http://localhost:8787/__dev/tick?now=2026-10-21T22:10:00+02:00"` also
   works. Without `now`, the route uses the current time. The create-poll step uses `now` for
   all of its time checks: the 30-minute quiet rule, the stale-row repair and the poll close
   time. `/ankieta` always uses the real current time.

   `npm run dev` also passes `--test-scheduled`, so the real scheduled handler is available.
   It takes the time in milliseconds since epoch (UTC) and logs the step. Example: 2026-10-21
   17:00 in Warsaw:

   ```bash
   curl "http://localhost:8787/cdn-cgi/handler/scheduled?time=1792594800000"
   ```

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
