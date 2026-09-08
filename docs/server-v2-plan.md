# Plan: v2 Game-Data API + Discord Notifications

Status: **PLAN ONLY — not yet implemented.**
Owner: townofus.pl (Next.js on Cloudflare Workers / OpenNext, Prisma + D1).
Companion: the Drama Afera Stats mod (`dramaafera-stats-mod`) now emits an **event-based
schema v2.1.0** that the current `/api/games` endpoints cannot accept.

---

## 1. Why v2 is needed (the breaking change)

The mod produces an **event-based** payload; the existing server consumes an **aggregated**
payload. They are incompatible — the mod's JSON fails the current `GameDataSchema` (Zod) with
HTTP 400. We therefore freeze everything currently under `/api/games` as **v1** and add a
parallel **v2** that natively accepts the mod's schema.

### Field-level differences (mod v2 vs server v1)

| Concern | Mod v2 (event) | Server v1 (aggregated) | Action |
|---|---|---|---|
| Time fields | `gameStart` / `gameEnd` (ISO-8601 round-trip `"o"`) | `metadata.startTime` / `endTime` (`"YYYY-MM-DD HH:MM:SS"`) | v2 parses ISO directly |
| Player stats | none — derived from `actions[]` | 24 explicit counters + `totalPoints` | **aggregate server-side** |
| Player identity | `name` + `friendCode` + `hashedProductUserId` | `name` only (`Player.name @unique`) | **add identity columns** |
| Per-action detail | `actions[]` (performer/target/isCorrect/pointsChange/subtype) | `gameEvents[].description` (string) | **store raw in new table** |
| Meeting votes | `voterName → [targetName]` | `targetName → [voterName]` (inverted) | invert during ingest |
| `win` | boolean | `0|1` int | convert |
| `meeting.exiledPlayer` | present | not stored | store (optional) |
| `abnormalEnd` | boolean (new in 2.1.0) | n/a | reject or flag (see §7) |

### The mod's v2 schema (authoritative shape)

Top-level:
```jsonc
{
  "schemaVersion": "2.1.0",
  "gameStart": "2025-08-27T21:56:26.0000000Z",
  "gameEnd":   "2025-08-27T22:09:25.0000000Z",
  "mapName":   "Polus",
  "playerCount": 12,
  "maxTasks": 9,
  "abnormalEnd": false,
  "players": { "<displayName>": { /* player */ } },
  "actions": [ /* action */ ],
  "meetings": [ /* meeting */ ],
  "gameEvents": [ { "timestamp": 42, "message": "…" } ]
}
```
player:
```jsonc
{
  "name": "brubel", "playerId": 3,
  "friendCode": "abc#1234", "hashedProductUserId": "1a2b3c4d5",
  "roleHistory": ["Sheriff"], "imitatorRoles": [], "modifiersHistory": ["Torch"],
  "win": true, "disconnected": false, "initialRolePoints": 2
}
```
action (the key new bit is **`subtype`**, used to fill the fine-grained counters):
```jsonc
{
  "type": "kill",            // coarse: kill|protect|revive|swap|janitor_clean|task_completed|round_survived|role_assigned
  "subtype": "guess",        // fine:   see §3 mapping table
  "isCorrect": true,         // bool | null
  "pointsChange": 1.0,
  "timestamp": 42,           // seconds since intro end
  "performer": { "name": "brubel", "friendCode": "…", "role": "Vigilante", "isImitating": false, "imitatedRole": null },
  "target":    { "name": "Malkiz", "friendCode": "…", "role": "Impostor" }   // or null
}
```
meeting:
```jsonc
{
  "meetingNumber": 1,
  "deathsSinceLastMeeting": ["Malkiz"],
  "votes": { "brubel": ["Malkiz"] },          // voter → [targets]  (NOTE: inverted vs v1)
  "skipVotes": [], "noVotes": [],
  "blackmailedPlayers": [], "jailedPlayers": [],
  "wasTie": false, "wasBlessed": false,
  "exiledPlayer": "Malkiz"                     // or null
}
```

> Canonical JSON Schema: `dramaafera-stats-mod/DramaAferaStats/Export/game_data.schema.json`
> (draft-07, `schemaVersion` const `2.1.0`). Mirror it as the v2 Zod schema.

---

## 2. Database changes (Prisma migration)

Additive only — v1 tables/endpoints untouched.

### 2a. New `GameAction` table (raw event storage)
```prisma
model GameAction {
  id           Int      @id @default(autoincrement())
  gameId       Int
  // coarse + fine type
  type         String
  subtype      String
  isCorrect    Boolean?
  pointsChange Float
  timestamp    Int
  // performer
  performerName        String
  performerRole        String
  performerIsImitating Boolean  @default(false)
  performerImitatedRole String?
  // target (nullable)
  targetName   String?
  targetRole   String?

  game Game @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@index([gameId])
  @@index([gameId, subtype])
  @@map("game_actions")
}
```
Add `gameActions GameAction[]` to the `Game` model.

### 2b. `Player` identity columns
```prisma
model Player {
  // … existing …
  hashedProductUserId String?  // stable-ish anti-alt hint from the mod (9 hex chars)
  friendCode          String?
}
```
- Keep `name @unique` as the primary lookup key (per league rule: constant, non-conflicting nicks).
- Backfill `hashedProductUserId`/`friendCode` opportunistically on each v2 ingest (update if currently null).

### Migration mechanics (D1 + Prisma 7)
```sh
# create migration scaffold + diff
npm run db:migrate:create --name=add_v2_game_actions_and_player_identity
# review generated SQL in prisma/migrations/*.sql, then apply:
npm run db:migrate:apply:local      # local
npm run db:migrate:apply:preview    # preview/remote-preview
npm run db:migrate:apply:remote     # production
# regenerate Prisma client + zod
npm run db:generate
```

---

## 3. Subtype → counter mapping (the core of v2 aggregation)

The mod now emits `subtype` per action so the server can fill the **exact** counter. Map as:

| action.subtype | DB counter (by `isCorrect`) |
|---|---|
| `kill` | `correctKills` / `incorrectKills` |
| `guess` | `correctGuesses` / `incorrectGuesses` |
| `deputy_shoot` | `correctDeputyShoots` / `incorrectDeputyShoots` |
| `jailor_execute` | `correctJailorExecutes` / `incorrectJailorExecutes` |
| `prosecute` | `correctProsecutes` / `incorrectProsecutes` |
| `medic_shield` | `correctMedicShields` / `incorrectMedicShields` |
| `warden_fortify` | `correctWardenFortifies` / `incorrectWardenFortifies` |
| `revive` | `correctAltruistRevives` / `incorrectAltruistRevives` |
| `swap` | `correctSwaps` / `incorrectSwaps` |
| `janitor_clean` | `janitorCleans` (count, no correctness) |
| `task` | `completedTasks` (count) |
| `round_survived` | `survivedRounds` (count) |
| `role_assigned` | `initialRolePoints` (take its `pointsChange`) |

Rules:
- `correct*` counter ← `isCorrect === true`; `incorrect*` ← `isCorrect === false`. `null` → neither.
- `totalPoints` (per player) = **sum of every action's `pointsChange`** for that performer
  (+ the win bonus the ranking pipeline already applies, if applicable — keep v1 parity).
- `win` ← `player.win`; `disconnected` ← `player.disconnected`; `initialRolePoints` ← from the
  `role_assigned` action's `pointsChange` (or the player's `initialRolePoints` field).

> `calculateRankingForGame` consumes **only** `totalPoints`, so correct `totalPoints` is the
> ranking-critical field. The split counters drive stats/UI and must match v1 semantics.

---

## 4. New endpoint (`POST /api/v2/games`)

Follow the repo's two-file convention exactly.

```
src/app/api/v2/games/
  route.ts        # withCors(withAuth(POST)) + openApiRegistry.registerPath (tag 'Games v2')
  post.ts         # handler (request, _authContext, …)
  _utils/
    createGameV2.ts        # createGameFromDataV2(prisma, env, gameData)
    aggregate.ts           # actions[] -> per-player counters (pure, unit-testable)
src/app/api/schema/
  gamesV2.ts      # GameDataV2Schema (mirror of game_data.schema.json 2.1.0) + response schemas
```

`post.ts` shape (mirrors `games/post.ts`):
```ts
export async function POST(request: NextRequest, _authContext: { user: { username: string } }) {
  const { env } = await getCloudflareContext();
  const prisma = getPrismaClient(env.DB);
  const body = await request.json();
  const parsed = GameDataV2Schema.safeParse(body);
  if (!parsed.success) {
    const res = createErrorResponse('Invalid v2 game data: ' + JSON.stringify(formatZodError(parsed.error)), 400);
    await notifyDiscord(env, { ok: false, stage: 'validation', error: parsed.error });   // §5
    return res;
  }
  try {
    const result = await createGameFromDataV2(prisma, env, parsed.data);
    await notifyDiscord(env, { ok: true, result, game: parsed.data });                    // §5
    return createSuccessResponse({ message: 'Game (v2) uploaded successfully', ...result }, 201);
  } catch (err) {
    const status = /already exists/.test(String(err)) ? 409 : 500;
    await notifyDiscord(env, { ok: false, stage: 'persist', error: err, status });        // §5
    return createErrorResponse(`Failed to upload v2 game: ${(err as Error).message}`, status);
  }
}
```

`createGameFromDataV2`:
1. Parse `gameStart`/`gameEnd` (ISO) → `Date`; derive `gameIdentifier = YYYYMMDD_HHMM` (same as v1).
2. Reject duplicate `gameIdentifier` (409), as v1 does.
3. Upsert players by `name`; set `hashedProductUserId`/`friendCode` when null.
4. Create `Game` (winnerTeam/winCondition derived from `players[].win` + final `roleHistory`,
   reuse v1 `determineTeam`/`calculateWinnerFromStats` semantics).
5. **Aggregate** `actions[]` → `GamePlayerStatistics` counters (§3) and create `PlayerRole`/`PlayerModifier`.
6. **Store raw** `actions[]` → `game_actions` rows.
7. Create meetings (invert votes: mod is voter→targets, v1 store expects per-vote rows).
8. Create `gameEvents` (map `{timestamp:int, message}` → DB `{timestamp:string, description}`; or
   keep numeric — confirm with existing GameEvent consumers).
9. `await calculateRankingForGame(prisma, game.id)` (best-effort, as v1).

> Keep all DB writes mindful of D1: no interactive transactions; use `batchStatements` for
> atomic groups and `chunkedInQuery` for the 98-bound-param cap (see `_database/index.ts`).

---

## 5. Discord notification (v2 only)

Best-effort, never fails the upload.

`src/app/api/_utils/discord.ts`:
```ts
export async function notifyDiscord(env: CloudflareEnv, payload: Notification): Promise<void> {
  const url = env.DISCORD_WEBHOOK_URL;
  if (!url) return;                         // not configured → no-op
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toEmbed(payload)),   // green embed on success, red on failure
    });
  } catch (e) {
    console.warn('Discord notify failed (ignored):', e);
  }
}
```
- **Success embed:** game identifier, map, player count, winner team/condition, players created,
  `rankingCalculated` (+ `rankingError` if present), abnormalEnd flag.
- **Failure embed:** stage (`validation` | `persist`), HTTP status, short error, game identifier
  if known. This is how we track *all* errors and successes.

### Wiring `DISCORD_WEBHOOK_URL`
- Local: add to `.dev.vars` and `.dev.vars.example` (placeholder).
- Prod: `npx wrangler secret put DISCORD_WEBHOOK_URL` (do **not** commit the value).
- Re-run `npm run cf-typegen` so `env.DISCORD_WEBHOOK_URL` is typed on `CloudflareEnv`.

---

## 6. Creating the Discord destination (you will provide the secret)

You can use either a **plain Incoming Webhook** (simplest, recommended) or a **Bot/App**.

### Option A — Incoming Webhook (recommended, no app needed)
1. Discord → target server → **Server Settings → Integrations → Webhooks → New Webhook**.
2. Pick the channel (e.g. `#stats-uploads`), name it (e.g. `Drama Afera Stats`), **Copy Webhook URL**.
3. Store it: `npx wrangler secret put DISCORD_WEBHOOK_URL` (paste the URL).
   - The webhook URL already encodes channel + auth; posting is `fetch(url, {method:'POST', body})`.
4. Payload: `{ "content": "…" }` or `{ "embeds": [ … ] }` (we use embeds).

### Option B — Discord Application + Bot (only if you need richer interactions)
1. https://discord.com/developers/applications → **New Application** → name it.
2. **Bot** tab → **Add Bot** → copy the **Bot Token** (this is the secret).
3. **OAuth2 → URL Generator**: scopes `bot`, permission `Send Messages`; open the URL to invite
   the bot to the server/channel.
4. Get the target channel id (Developer Mode → right-click channel → Copy ID).
5. Post via REST: `POST https://discord.com/api/v10/channels/{CHANNEL_ID}/messages` with header
   `Authorization: Bot {TOKEN}` and JSON body `{ "embeds": [...] }`.
6. Store secrets: `DISCORD_BOT_TOKEN` and `DISCORD_CHANNEL_ID` via `wrangler secret put`.

> Default plan uses **Option A**. Switch to B only if a bot identity/interactions are required.

---

## 7. `abnormalEnd` handling

The mod marks incomplete matches `abnormalEnd: true` and **never** submits those to the API
(disk-only). So in practice v2 should rarely receive one. Decision:
- **Reject** `abnormalEnd === true` with HTTP 422 + a Discord warning (preferred — keeps ranking clean), **or**
- Accept but **skip ranking** and tag the game. Recommend **reject** unless you want the record.

---

## 8. Tests (greenfield — no jest config/tests exist yet)

1. Add `jest.config.ts`: `preset: 'ts-jest'`, `testEnvironment: 'node'`, `moduleNameMapper` for
   the `@/` alias from `tsconfig.json`.
2. Mocks: `@opennextjs/cloudflare` `getCloudflareContext` (env + DB), the Prisma client, and
   global `fetch` (Discord).
3. Cases:
   - `aggregate.ts`: every subtype → correct counter; `totalPoints` = Σ pointsChange; null isCorrect ignored.
   - `POST /api/v2/games` happy path → 201 + Discord success called once.
   - Validation failure → 400 + Discord failure called.
   - Duplicate `gameIdentifier` → 409 + Discord failure called.
   - Discord throwing does **not** fail the upload.
   - `abnormalEnd` → 422 (per §7).

---

## 9. Rollout order

1. Prisma migration (`game_actions` + Player identity) → apply local/preview.
2. `gamesV2.ts` schema + `aggregate.ts` (+ unit tests).
3. `createGameV2.ts` + `route.ts`/`post.ts`.
4. `discord.ts` + env wiring + `cf-typegen`.
5. Point the mod at `/api/v2/games` (already done in the mod: `ApiClient.SubmitPath`).
6. Deploy; set `DISCORD_WEBHOOK_URL` secret; smoke-test with a sample 2.1.0 payload.

## 10. Open questions to confirm before implementing
- §7: reject vs accept `abnormalEnd`?
- `gameEvents.timestamp`: keep numeric (seconds) or convert to `HH:MM:SS` to match the v1 DB column?
- Winner/team derivation for v2: reuse v1 `calculateWinnerFromStats`, or trust the mod's per-player
  `win` (which now comes from TOU-Mira's authoritative `CachedWinners`/`DidWin`)? Recommend trusting
  the mod's `win` and only deriving `winnerTeam` for display.
