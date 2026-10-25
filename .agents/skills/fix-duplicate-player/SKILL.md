---
name: fix-duplicate-player
description: Fix a duplicate player that the Discord bot created at signup, when a player's Discord name differs from their in-game nick. Analyses read-only, proposes the exact fix, and writes only after the user confirms that plan. Moves the Discord link and the signup lists to the real player and deletes the duplicate. Use this skill when a signup list shows an unknown name for a known player, or when a weekly check finds a new player with no games and a Discord link.
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
the bot creates a **new player** (name only, one `initial_value` ranking row) and links the
account to it. The bot never changes a link after that.

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
| `player_rankings` | delete the duplicate's one `initial_value` row |
| `players` | delete the duplicate row |

**Why a hard delete.** `players.name` is unique for all rows, also for soft-deleted ones
(`players_name_key`). A soft-deleted duplicate keeps its name. If the real player later uses that
name in game, the ingest tries to rename them (`createGameV2.ts`) and the game upload fails. The
duplicate has no game data (the stop checks prove it), so a hard delete loses nothing.

The skill does **not** merge game data. A duplicate with any game row, or with any ranking row
other than its `initial_value` row, is out of scope: stop.

## Commands

Run from the repo root. `<env>` is `production` or `staging`. `<db>` is `townofus-pl` for
production and `townofus_pl_preview` for staging. Write SQL without double quotes around table
and column names. Put a SQL query on one line, with no `--` comments, when you pass it with
`--command`.

```bash
export CLOUDFLARE_ACCOUNT_ID=d1287f321cc95882fc773ab71241b51a
npx wrangler d1 execute DB --remote --env <env> --json --command "SELECT id, name FROM players WHERE id = 98"
```

Run each command as one plain command. Do not put `$(...)` inside a `wrangler` command. Some
sessions block that.

A name can contain `'`, `"`, `%`, `_` or `\`. Compare names only with `=`, never with `LIKE`. Find a
name in a list with `json_each` (below). Escape `'` in a SQL string as `''`.

---

## Phase A: Analysis (read-only)

### A1. Find candidates

Live players with no games, no Among Us hash, and a Discord link:

```sql
SELECT p.id, p.name, p.createdAt, d.id AS accountId, d.username, d.discordUserId FROM players p JOIN discord_accounts d ON d.playerId = p.id AND d.deletedAt IS NULL WHERE p.deletedAt IS NULL AND p.hashedProductUserId IS NULL AND NOT EXISTS (SELECT 1 FROM game_player_statistics s WHERE s.playerId = p.id) ORDER BY p.createdAt DESC
```

For each candidate, look for a real player with a similar name and with games. `LIKE` is fine
here, because this is only a search and the user confirms the pair:

```sql
SELECT id, name, friendCode, createdAt, (SELECT COUNT(*) FROM game_player_statistics s WHERE s.playerId = players.id) AS games FROM players WHERE deletedAt IS NULL AND lower(name) LIKE lower('%<part of the name>%')
```

A candidate with no similar real player is probably a new person. Report it and do not fix it.

### A2. Write down the IDs

- `DUP` = duplicate player id. `REAL` = real player id (the one with games).
- `ACC` = `discord_accounts.id` of the duplicate's link.
- `DUPNAME`, `REALNAME` = the two names, exactly as stored.

### A3. Run the stop checks

`dupExists`, `realLive` and `accOnDup` must be 1. `dupRankings` must be 1 (the `initial_value`
row). Every other value must be 0.

```sql
SELECT (SELECT COUNT(*) FROM players WHERE id = DUP AND name = 'DUPNAME' AND deletedAt IS NULL) AS dupExists, (SELECT COUNT(*) FROM players WHERE id = REAL AND deletedAt IS NULL) AS realLive, (SELECT COUNT(*) FROM discord_accounts WHERE id = ACC AND playerId = DUP) AS accOnDup, (SELECT COUNT(*) FROM discord_accounts WHERE playerId = REAL) AS realHasAccount, (SELECT COUNT(*) FROM player_rankings WHERE playerId = DUP) AS dupRankings, (SELECT COUNT(*) FROM player_rankings WHERE playerId = DUP AND (gameId IS NOT NULL OR reason <> 'initial_value')) AS dupOtherRankings, (SELECT COUNT(*) FROM players WHERE currentRankingId IN (SELECT id FROM player_rankings WHERE playerId = DUP) AND id <> DUP) AS otherPlayersOnDupRanking, (SELECT COUNT(*) FROM game_player_statistics WHERE playerId = DUP) AS dupGames, (SELECT COUNT(*) FROM game_actions WHERE performerId = DUP OR targetId = DUP) AS dupActions, (SELECT COUNT(*) FROM game_events WHERE playerId = DUP OR targetId = DUP) AS dupEvents, (SELECT COUNT(*) FROM meeting_votes WHERE voterId = DUP OR targetId = DUP) AS dupVotes, (SELECT COUNT(*) FROM meeting_skip_votes WHERE playerId = DUP) + (SELECT COUNT(*) FROM meeting_no_votes WHERE playerId = DUP) + (SELECT COUNT(*) FROM meeting_blackmailed_players WHERE playerId = DUP) + (SELECT COUNT(*) FROM meeting_jailed_players WHERE playerId = DUP) AS dupMeetingRows, (SELECT COUNT(*) FROM games WHERE recorderPlayerId = DUP) AS dupRecorder, (SELECT COUNT(*) FROM emperor_poll_candidates WHERE playerId = DUP) AS dupPollCandidate, (SELECT COUNT(*) FROM players WHERE id = DUP AND hashedProductUserId IS NOT NULL) AS dupHasHash
```

| Check fails | Meaning |
|---|---|
| `dupExists` = 0 | wrong id, a typo in `DUPNAME`, or the duplicate is already deleted |
| `realLive` = 0 | wrong real player id |
| `accOnDup` = 0 | wrong account id, or someone already moved the link |
| `realHasAccount` > 0 | the real player already has a Discord link. `playerId` is unique, so the move fails. Ask the user which account is right. |
| `dupRankings` ≠ 1 or `dupOtherRankings` > 0 | the duplicate has a penalty, a reward or game rows. An admin may have used it. Stop. |
| any other value > 0 | the duplicate has game data or came from the ingest, not from a click. This needs a real merge. Stop. |

### A4. Read the lists that hold the duplicate name

```sql
SELECT l.id, l.date, l.playerNames FROM lista_cweli l WHERE l.deletedAt IS NULL AND EXISTS (SELECT 1 FROM json_each(l.playerNames) j WHERE j.value = 'DUPNAME')
```

In each list, the fix replaces `DUPNAME` with `REALNAME`. If `REALNAME` is already in the list,
the fix removes `DUPNAME` instead. The order stays the same.

### A5. Read the rows the fix deletes

```sql
SELECT * FROM players WHERE id = DUP
SELECT * FROM player_rankings WHERE playerId = DUP
```

Keep both results. They are the manual undo: an `INSERT` of these rows puts them back.

---

## Phase B: Proposal (read-only)

### B1. Write the SQL file

Write the statements to a file outside the repo (the job's `tmp/` folder). Do not change the
statements. Only put in the values from A2.

- The account move runs only if the account still points to the duplicate.
- The list update works on the **current** JSON, so a click after phase A cannot break it.
- The 3 delete statements run only if the account now points to the real player.

```sql
UPDATE discord_accounts SET playerId = REAL, version = version + 1, updatedAt = strftime('%Y-%m-%dT%H:%M:%f+00:00','now') WHERE id = ACC AND playerId = DUP;

UPDATE lista_cweli SET playerNames = (SELECT json_group_array(v) FROM (SELECT CASE WHEN j.value = 'DUPNAME' THEN 'REALNAME' ELSE j.value END AS v FROM json_each(lista_cweli.playerNames) j WHERE NOT (j.value = 'DUPNAME' AND EXISTS (SELECT 1 FROM json_each(lista_cweli.playerNames) k WHERE k.value = 'REALNAME')) ORDER BY j.key)), updatedAt = strftime('%Y-%m-%dT%H:%M:%f+00:00','now') WHERE deletedAt IS NULL AND EXISTS (SELECT 1 FROM json_each(lista_cweli.playerNames) j WHERE j.value = 'DUPNAME');

UPDATE players SET currentRankingId = NULL WHERE id = DUP AND EXISTS (SELECT 1 FROM discord_accounts WHERE id = ACC AND playerId = REAL);

DELETE FROM player_rankings WHERE playerId = DUP AND EXISTS (SELECT 1 FROM discord_accounts WHERE id = ACC AND playerId = REAL);

DELETE FROM players WHERE id = DUP AND name = 'DUPNAME' AND EXISTS (SELECT 1 FROM discord_accounts WHERE id = ACC AND playerId = REAL);
```

### B2. Show the plan and stop

Show the user, in one message:

1. the pair: `DUP` name and id → `REAL` name, id and number of games,
2. the Discord account (`username`),
3. the result of every stop check,
4. each list: date, old array, expected new array,
5. the rows from A5 that the fix deletes,
6. the full SQL file and the environment.

End the message with the question "Wykonać ten plan na <env>?". Then **stop and wait**.

---

## Phase C: Fix (only after "tak" to the plan from B2)

### C1. Run the stop checks again

Run A3 and A4 again. If a stop check now fails, do not write. If only a list changed, the SQL
still works. Tell the user about the change and go on.

### C2. Get the undo bookmark

Take the bookmark now, just before the write, so a restore removes as few other writes as
possible. Use 2 separate commands:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
npx wrangler d1 time-travel info <db> --env <env> --timestamp=<time from above>
```

### C3. Write

```bash
npx wrangler d1 execute DB --remote --env <env> --yes --file <file.sql>
```

`--yes` stops wrangler from asking again. The user already confirmed in phase B.

A remote `--file` runs through the D1 import API. It is all-or-nothing: an error, for example a
foreign key, rolls back the whole file. A statement that changes 0 rows is not an error, and the
output does not show changes per statement. C4 is the only proof.

### C4. Verify

`accountPlayer` must be `REAL`. Every other value must be 0.

```sql
SELECT (SELECT playerId FROM discord_accounts WHERE id = ACC) AS accountPlayer, (SELECT COUNT(*) FROM players WHERE id = DUP) AS dupRow, (SELECT COUNT(*) FROM players WHERE name = 'DUPNAME') AS nameTaken, (SELECT COUNT(*) FROM player_rankings WHERE playerId = DUP) AS dupRankings, (SELECT COUNT(*) FROM lista_cweli l WHERE l.deletedAt IS NULL AND EXISTS (SELECT 1 FROM json_each(l.playerNames) j WHERE j.value = 'DUPNAME')) AS dupOnLists
```

| Result | Action |
|---|---|
| all as expected | go to C5 |
| `accountPlayer` = `DUP` | nothing changed (a guard stopped the file). Run A3 again and find out why. |
| `dupOnLists` > 0 | a list still has the name. Run the list `UPDATE` from B1 again. It is safe to repeat. |
| anything else | stop. Give the user the result and the bookmark from C2. |

### C5. Tell the user

- The result of C4.
- The signup message on Discord shows the old name until the next click on that message. Any
  click renders the list again from D1.
- The fixed player is now safe: the bot uses the linked player's name, not the Discord name.
- Undo, right after the fix: `npx wrangler d1 time-travel restore <db> --env <env> --bookmark=<bookmark>`.
  A restore also removes every other write after the bookmark. Later, use the rows from A5 and a
  reverse `UPDATE` of the account and the lists.

## Prevention

A new account gets its name from the server nick first. Ask league players to set their
**server nickname** to their in-game nick before their first click. This does not matter after an
account has a link.
