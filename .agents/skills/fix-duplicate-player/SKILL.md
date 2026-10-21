---
name: fix-duplicate-player
description: Fix a duplicate player that the Discord bot created at signup, when a player's Discord name differs from their in-game nick. Moves the Discord link and the signup lists to the real player and soft-deletes the duplicate. Use this skill when a signup list shows an unknown name for a known player, or when a weekly check finds a new player with no games and a Discord link.
---

# Fix a Duplicate Player from a Discord Signup

## Why duplicates happen

The signup buttons (`workers/discord-bot/src/signup/identity.ts`) read the name that Discord
shows: server nick, then `global_name`, then `username`. An account with no link and a name that
matches no player gets a **new player** (name only, initial ranking row) and a link to it.

Example (2026-10-21): the player `Kyoya` (id 98, 251 games) has the Discord name
`Kyoya Tategami`. One click created player 127 `Kyoya Tategami` and linked the account to it.

The link never changes after that ("An existing link is never changed"). Every later click puts
the duplicate name on the list again. Games are not affected: the ingest finds the real player by
the Among Us account hash.

## What the fix changes

| Table | Change |
|---|---|
| `discord_accounts` | `playerId` duplicate → real player |
| `lista_cweli` | the duplicate name → the real name, in every live list |
| `players` | soft-delete the duplicate |
| `player_rankings` | soft-delete the duplicate's rows |

The skill does **not** merge game data. A duplicate with any game row is out of scope: stop.

## Rules

- Production writes need the user's explicit "tak" for this exact plan. Show the plan first.
- Run every check in step 3 before you write. One failed check: stop and tell the user.
- Write all changes in one `--file` run, so D1 applies them together.
- Note a Time Travel bookmark before the write. It is the undo.
- Do not use `DELETE`. Do not touch a player that has games.

## Commands

Run from the repo root. `<env>` is `production` or `staging`.

```bash
export CLOUDFLARE_ACCOUNT_ID=d1287f321cc95882fc773ab71241b51a
q() { npx wrangler d1 execute DB --remote --env "$1" --json --command "$2"; }
```

## Steps

### 1. Find the duplicate and the real player

Candidates: live players with no games, a Discord link, and an `initial_value` ranking row from
the same moment as the link.

```sql
SELECT p."id", p."name", p."createdAt", d."id" AS accountId, d."username", d."discordUserId"
FROM "players" p
JOIN "discord_accounts" d ON d."playerId" = p."id" AND d."deletedAt" IS NULL
WHERE p."deletedAt" IS NULL
  AND p."hashedProductUserId" IS NULL
  AND NOT EXISTS (SELECT 1 FROM "game_player_statistics" s WHERE s."playerId" = p."id")
ORDER BY p."createdAt" DESC;
```

Find the real player by a similar name. Then ask the user to confirm the pair. Never guess the
real player alone.

```sql
SELECT "id", "name", "friendCode",
       (SELECT COUNT(*) FROM "game_player_statistics" s WHERE s."playerId" = "players"."id") AS games
FROM "players"
WHERE "deletedAt" IS NULL AND lower("name") LIKE lower('%<part of the name>%');
```

### 2. Write down the IDs

- `DUP` = duplicate player id
- `REAL` = real player id
- `ACC` = `discord_accounts.id` of the duplicate's link
- `DUPNAME`, `REALNAME` = the two names, exactly as stored

### 3. Run the stop checks

Every value must be 0, except `realLive` = 1.

```sql
SELECT
  (SELECT COUNT(*) FROM "players" WHERE "id" = REAL AND "deletedAt" IS NULL)                AS realLive,
  (SELECT COUNT(*) FROM "discord_accounts" WHERE "playerId" = REAL)                         AS realHasAccount,
  (SELECT COUNT(*) FROM "game_player_statistics" WHERE "playerId" = DUP)                    AS dupGames,
  (SELECT COUNT(*) FROM "game_actions" WHERE "performerId" = DUP OR "targetId" = DUP)       AS dupActions,
  (SELECT COUNT(*) FROM "game_events" WHERE "playerId" = DUP OR "targetId" = DUP)           AS dupEvents,
  (SELECT COUNT(*) FROM "meeting_votes" WHERE "voterId" = DUP OR "targetId" = DUP)          AS dupVotes,
  (SELECT COUNT(*) FROM "games" WHERE "recorderPlayerId" = DUP)                             AS dupRecorder,
  (SELECT COUNT(*) FROM "emperor_poll_candidates" WHERE "playerId" = DUP)                   AS dupPollCandidate,
  (SELECT COUNT(*) FROM "players" WHERE "id" = DUP AND "hashedProductUserId" IS NOT NULL)   AS dupHasHash;
```

| Check fails | Meaning |
|---|---|
| `realLive` = 0 | wrong real player id |
| `realHasAccount` > 0 | the real player already has a Discord link. `playerId` is unique, so the move fails. Ask the user which account is the right one. |
| any `dup*` > 0 | the duplicate has game data or came from the ingest, not from a click. This needs a real merge. Stop. |

### 4. Read the lists that hold the duplicate name

```sql
SELECT "id", "date", "playerNames" FROM "lista_cweli"
WHERE "deletedAt" IS NULL AND "playerNames" LIKE '%"DUPNAME"%';
```

For each row, build the new JSON array: replace `DUPNAME` with `REALNAME`. If `REALNAME` is
already in the array, remove `DUPNAME` instead. Keep the order.

### 5. Show the plan and get consent

Show the user: the two players, the account (`username`), the lists with old and new arrays, and
the bookmark from step 6. Wait for "tak".

### 6. Note the undo bookmark

```bash
npx wrangler d1 time-travel info townofus-pl --env production --timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

On staging the database is `townofus_pl_preview`.

### 7. Write

Put the statements in one file and run it with `--file`. Escape `'` in names as `''`.
The `AND "playerNames" = '<old JSON>'` guard makes a list update a no-op if a click changed the
list after step 4. Then read the list again and repeat step 4 for it.

```sql
UPDATE "discord_accounts"
   SET "playerId" = REAL, "version" = "version" + 1,
       "updatedAt" = strftime('%Y-%m-%dT%H:%M:%f+00:00','now')
 WHERE "id" = ACC AND "playerId" = DUP;

UPDATE "lista_cweli"
   SET "playerNames" = '<new JSON>', "updatedAt" = strftime('%Y-%m-%dT%H:%M:%f+00:00','now')
 WHERE "id" = <list id> AND "playerNames" = '<old JSON>';

UPDATE "players" SET "deletedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
 WHERE "id" = DUP AND "deletedAt" IS NULL;

UPDATE "player_rankings" SET "deletedAt" = CURRENT_TIMESTAMP
 WHERE "playerId" = DUP AND "deletedAt" IS NULL;
```

```bash
npx wrangler d1 execute DB --remote --env <env> --file <file.sql>
```

### 8. Verify

```sql
SELECT
  (SELECT "playerId" FROM "discord_accounts" WHERE "id" = ACC)                                AS accountPlayer, -- = REAL
  (SELECT COUNT(*) FROM "players" WHERE "id" = DUP AND "deletedAt" IS NULL)                     AS dupLive,       -- = 0
  (SELECT COUNT(*) FROM "player_rankings" WHERE "playerId" = DUP AND "deletedAt" IS NULL)       AS dupRankings,   -- = 0
  (SELECT COUNT(*) FROM "lista_cweli" WHERE "deletedAt" IS NULL AND "playerNames" LIKE '%"DUPNAME"%') AS dupOnLists; -- = 0
```

### 9. Tell the user

- The signup message on Discord shows the old name until the next click on that message. Any
  click renders the list again from D1.
- To stop the next duplicate: ask the player to set their **server nickname** to their in-game
  nick. The bot reads the server nick first.
- Undo: `npx wrangler d1 time-travel restore townofus-pl --env production --bookmark=<bookmark>`.
  A restore also removes every other write after the bookmark, so use it only right after the fix.
