---
name: fix-duplicate-player
description: Fix a duplicate player that the Discord bot created at signup, when a player's Discord name differs from their in-game nick. Analyses read-only, proposes the exact fix, and writes only after the user confirms that plan. Moves the Discord link and the signup lists to the real player and soft-deletes the duplicate. Use this skill when a signup list shows an unknown name for a known player, or when a weekly check finds a new player with no games and a Discord link.
---

# Fix a Duplicate Player from a Discord Signup

The skill has 3 phases. Do them in this order. Never skip a phase.

| Phase | What happens | Writes |
|---|---|---|
| A. Analysis | find the pair, run the stop checks, read the lists | none |
| B. Proposal | show the user the result of A and the exact SQL | none |
| C. Fix | only after the user confirms the plan from B | yes |

**Consent gate.** Stop at the end of phase B. Start phase C only when the user replies "tak" (or
"yes") to the plan you showed. The request to run this skill is **not** consent. "Run it now",
"odpal", "napraw" and a "tak" from earlier in the conversation are **not** consent. If you are
not sure that the user saw the plan, show it again and wait.

## Why duplicates happen

The signup buttons (`workers/discord-bot/src/signup/identity.ts`) first look for a linked
Discord account and use that player's name. Only an account with no link uses the name that
Discord shows: server nick, then `global_name`, then `username`. If that name matches no player,
the bot creates a **new player** (name only, initial ranking row) and links the account to it.
The bot never changes a link after that.

Two cases make a duplicate:

1. **Discord name ≠ in-game nick of a known player.** Example (2026-10-21): `Kyoya` (id 98,
   251 games) has the Discord name `Kyoya Tategami`. One click created player 127
   `Kyoya Tategami`. Every later click put that name on the list again.
2. **A new league player with different names.** The click creates player X from the Discord
   name. The first game creates player Y from the in-game nick, with the Among Us hash. X stays
   with no games. The real player is Y, the one with games.

Games are never affected. The ingest finds a player by the Among Us account hash first.

**Not a duplicate:** a new person who clicks before their first game. That player has no games
and no hash too. Leave it alone. It becomes a real player at its first game if the in-game nick
is the same.

## What the fix changes

| Table | Change |
|---|---|
| `discord_accounts` | `playerId`: duplicate → real player |
| `lista_cweli` | the duplicate name → the real name, in every live list |
| `players` | soft-delete the duplicate |
| `player_rankings` | soft-delete the duplicate's rows |

The skill does **not** merge game data. A duplicate with any game row is out of scope: stop.

## Commands

Run from the repo root. `<env>` is `production` or `staging`. Write SQL without double quotes
around names, so the shell needs no escaping.

```bash
export CLOUDFLARE_ACCOUNT_ID=d1287f321cc95882fc773ab71241b51a
npx wrangler d1 execute DB --remote --env <env> --json --command "SELECT id, name FROM players WHERE id = 98"
```

Run each command as one plain command. Do not put `$(...)` inside a `wrangler` command. Some
sessions block that.

---

## Phase A: Analysis (read-only)

### A1. Find candidates

Live players with no games, no Among Us hash, and a Discord link:

```sql
SELECT p.id, p.name, p.createdAt, d.id AS accountId, d.username, d.discordUserId
FROM players p
JOIN discord_accounts d ON d.playerId = p.id AND d.deletedAt IS NULL
WHERE p.deletedAt IS NULL
  AND p.hashedProductUserId IS NULL
  AND NOT EXISTS (SELECT 1 FROM game_player_statistics s WHERE s.playerId = p.id)
ORDER BY p.createdAt DESC;
```

For each candidate, look for a real player with a similar name and with games:

```sql
SELECT id, name, friendCode, createdAt,
       (SELECT COUNT(*) FROM game_player_statistics s WHERE s.playerId = players.id) AS games
FROM players
WHERE deletedAt IS NULL AND lower(name) LIKE lower('%<part of the name>%');
```

A candidate with no similar real player is probably a new person. Report it and do not fix it.

### A2. Write down the IDs

- `DUP` = duplicate player id. `REAL` = real player id (the one with games).
- `ACC` = `discord_accounts.id` of the duplicate's link.
- `DUPNAME`, `REALNAME` = the two names, exactly as stored.

### A3. Run the stop checks

Every value must be 0, except `realLive` = 1 and `accOnDup` = 1.

```sql
SELECT
  (SELECT COUNT(*) FROM players WHERE id = REAL AND deletedAt IS NULL)              AS realLive,
  (SELECT COUNT(*) FROM discord_accounts WHERE id = ACC AND playerId = DUP)         AS accOnDup,
  (SELECT COUNT(*) FROM discord_accounts WHERE playerId = REAL)                     AS realHasAccount,
  (SELECT COUNT(*) FROM game_player_statistics WHERE playerId = DUP)                AS dupGames,
  (SELECT COUNT(*) FROM game_actions WHERE performerId = DUP OR targetId = DUP)     AS dupActions,
  (SELECT COUNT(*) FROM game_events WHERE playerId = DUP OR targetId = DUP)         AS dupEvents,
  (SELECT COUNT(*) FROM meeting_votes WHERE voterId = DUP OR targetId = DUP)        AS dupVotes,
  (SELECT COUNT(*) FROM games WHERE recorderPlayerId = DUP)                         AS dupRecorder,
  (SELECT COUNT(*) FROM emperor_poll_candidates WHERE playerId = DUP)               AS dupPollCandidate,
  (SELECT COUNT(*) FROM players WHERE id = DUP AND hashedProductUserId IS NOT NULL) AS dupHasHash;
```

| Check fails | Meaning |
|---|---|
| `realLive` = 0 | wrong real player id |
| `accOnDup` = 0 | wrong account id, or someone already moved the link |
| `realHasAccount` > 0 | the real player already has a Discord link. `playerId` is unique, so the move fails. Ask the user which account is right. |
| any `dup*` > 0 | the duplicate has game data or came from the ingest, not from a click. This needs a real merge. Stop. |

### A4. Read the lists that hold the duplicate name

```sql
SELECT id, date, playerNames FROM lista_cweli
WHERE deletedAt IS NULL AND playerNames LIKE '%"DUPNAME"%';
```

For each row, build the new JSON array: replace `DUPNAME` with `REALNAME`. If `REALNAME` is
already in the array, remove `DUPNAME` instead. Keep the order.

---

## Phase B: Proposal (read-only)

### B1. Get the undo bookmark

Get the current UTC time first, then the bookmark, as 2 separate commands:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
npx wrangler d1 time-travel info townofus-pl --env production --timestamp=<time from above>
```

On staging the database is `townofus_pl_preview`.

### B2. Write the SQL file

Write the exact statements to a file outside the repo (the job's `tmp/` folder). Escape `'` in
names as `''`. Each statement has a guard, so it changes nothing if the state is no longer the
one from phase A.

```sql
UPDATE discord_accounts
   SET playerId = REAL, version = version + 1,
       updatedAt = strftime('%Y-%m-%dT%H:%M:%f+00:00','now')
 WHERE id = ACC AND playerId = DUP;

UPDATE lista_cweli
   SET playerNames = '<new JSON>', updatedAt = strftime('%Y-%m-%dT%H:%M:%f+00:00','now')
 WHERE id = <list id> AND playerNames = '<old JSON>';

UPDATE players SET deletedAt = CURRENT_TIMESTAMP, updatedAt = CURRENT_TIMESTAMP
 WHERE id = DUP AND deletedAt IS NULL;

UPDATE player_rankings SET deletedAt = CURRENT_TIMESTAMP
 WHERE playerId = DUP AND deletedAt IS NULL;
```

### B3. Show the plan and stop

Show the user, in one message:

1. the pair: `DUP` name and id → `REAL` name, id and number of games,
2. the Discord account (`username`),
3. the result of every stop check,
4. each list: date, old array, new array,
5. the full SQL file,
6. the environment and the undo bookmark.

End the message with the question "Wykonać ten plan na <env>?". Then **stop and wait**.

---

## Phase C: Fix (only after "tak" to the plan from B3)

### C1. Run the stop checks again

Run A3 and A4 again. If any value differs from phase B, do not write. Go back to phase B with the
new values.

### C2. Write

```bash
npx wrangler d1 execute DB --remote --env <env> --yes --file <file.sql>
```

`--yes` stops wrangler from asking again. The user already confirmed in phase B.

### C3. Verify

```sql
SELECT
  (SELECT playerId FROM discord_accounts WHERE id = ACC)                                  AS accountPlayer, -- = REAL
  (SELECT COUNT(*) FROM players WHERE id = DUP AND deletedAt IS NULL)                      AS dupLive,       -- = 0
  (SELECT COUNT(*) FROM player_rankings WHERE playerId = DUP AND deletedAt IS NULL)        AS dupRankings,   -- = 0
  (SELECT COUNT(*) FROM lista_cweli WHERE deletedAt IS NULL AND playerNames LIKE '%"DUPNAME"%') AS dupOnLists; -- = 0
```

If a value is wrong, tell the user at once. Give the result and the undo bookmark.

### C4. Tell the user

- The result of C3.
- The signup message on Discord shows the old name until the next click on that message. Any
  click renders the list again from D1.
- The fixed player is now safe: the bot uses the linked player's name, not the Discord name.
- Undo: `npx wrangler d1 time-travel restore townofus-pl --env production --bookmark=<bookmark>`.
  A restore also removes every other write after the bookmark, so use it only right after the fix.

## Prevention

A new account gets its name from the server nick first. Ask league players to set their
**server nickname** to their in-game nick before their first click. This does not matter after an
account has a link.
