-- Migration number: 0004 	 2026-03-24T22:19:23.106Z
-- Remove DEFAULT 1 from games.season and player_rankings.season.
--
-- WHY THE ORIGINAL MIGRATION WAS UNSAFE:
-- Cloudflare D1 runs every migration inside an implicit transaction. SQLite
-- ignores PRAGMA foreign_keys=OFF when a transaction is already open, so
-- foreign key enforcement (including ON DELETE CASCADE) stays active. DROP TABLE
-- "games" therefore behaves as an implicit DELETE of all rows followed by schema
-- removal, cascading to game_player_statistics, game_events, meetings and all
-- their children, and player_rankings — wiping all game data.
-- PRAGMA defer_foreign_keys=ON also does not help: the D1 docs explicitly state
-- it does not prevent ON DELETE CASCADE actions from executing.
--
-- SAFE APPROACH: save / clear / redefine / restore
-- 1. Copy every cascade child of "games" into plain backup tables (no FK constraints).
-- 2. Delete from all child tables bottom-up so that "games" has zero referencing
--    rows before we drop it. DROP TABLE then triggers a CASCADE into nothing.
-- 3. Redefine "games" and "player_rankings" without DEFAULT on the season column.
-- 4. Restore all child data from backup tables (parent tables before children so
--    FK inserts are satisfied). Restore players.currentRankingId from backup.
-- 5. Drop backup tables.

-- ─── Step 1: Backup child data ───────────────────────────────────────────────

-- Save players.currentRankingId before DELETE FROM player_rankings fires SET NULL.
CREATE TABLE "_bak_current_rankings" AS
    SELECT "id" AS "playerId", "currentRankingId" AS "rankingId"
    FROM "players" WHERE "currentRankingId" IS NOT NULL;

CREATE TABLE "_bak_game_player_statistics" AS SELECT * FROM "game_player_statistics";
CREATE TABLE "_bak_player_roles"           AS SELECT * FROM "player_roles";
CREATE TABLE "_bak_player_modifiers"       AS SELECT * FROM "player_modifiers";
CREATE TABLE "_bak_game_events"            AS SELECT * FROM "game_events";
CREATE TABLE "_bak_meetings"               AS SELECT * FROM "meetings";
CREATE TABLE "_bak_meeting_skip_votes"         AS SELECT * FROM "meeting_skip_votes";
CREATE TABLE "_bak_meeting_no_votes"           AS SELECT * FROM "meeting_no_votes";
CREATE TABLE "_bak_meeting_blackmailed_players" AS SELECT * FROM "meeting_blackmailed_players";
CREATE TABLE "_bak_meeting_jailed_players"     AS SELECT * FROM "meeting_jailed_players";
CREATE TABLE "_bak_meeting_votes"              AS SELECT * FROM "meeting_votes";
CREATE TABLE "_bak_player_rankings"        AS SELECT * FROM "player_rankings";

-- ─── Step 2: Clear children bottom-up ────────────────────────────────────────
-- Delete leaves first so that when we delete their parents the CASCADE action
-- from the parent hits empty tables (a no-op) rather than live rows.

-- Leaf children of meetings
DELETE FROM "meeting_skip_votes";
DELETE FROM "meeting_no_votes";
DELETE FROM "meeting_blackmailed_players";
DELETE FROM "meeting_jailed_players";
DELETE FROM "meeting_votes";
-- meetings (cascades to meeting_* — already empty)
DELETE FROM "meetings";

-- Leaf children of game_player_statistics
DELETE FROM "player_roles";
DELETE FROM "player_modifiers";
-- game_player_statistics (cascades to player_roles/modifiers — already empty)
DELETE FROM "game_player_statistics";

-- game_events
DELETE FROM "game_events";

-- player_rankings — fires ON DELETE SET NULL on players.currentRankingId (backed up above)
DELETE FROM "player_rankings";

-- "games" now has zero referencing rows in every child table.
-- DROP TABLE "games" will trigger CASCADE into nothing.

-- ─── Step 3: Redefine games (no DEFAULT on season) ───────────────────────────
-- Note: unlike child tables, "games" is NOT backed up into a _bak_games table.
-- Its rows were NOT deleted in step 2 (only child rows were cleared), so the
-- live "games" table still holds all data when the INSERT below runs. Reading
-- directly from the live table avoids a redundant backup/restore round-trip.

CREATE TABLE "new_games" (
    "id"             INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameIdentifier" TEXT     NOT NULL,
    "startTime"      DATETIME NOT NULL,
    "endTime"        DATETIME NOT NULL,
    "map"            TEXT     NOT NULL,
    "maxTasks"       INTEGER,
    "winnerTeam"     TEXT,
    "winCondition"   TEXT,
    "season"         INTEGER  NOT NULL,
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      DATETIME NOT NULL,
    "deletedAt"      DATETIME
);

INSERT INTO "new_games" (
    "id", "gameIdentifier", "startTime", "endTime", "map", "maxTasks",
    "winnerTeam", "winCondition", "season", "createdAt", "updatedAt", "deletedAt"
) SELECT
    "id", "gameIdentifier", "startTime", "endTime", "map", "maxTasks",
    "winnerTeam", "winCondition", "season", "createdAt", "updatedAt", "deletedAt"
FROM "games";

DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";

-- Recreate all indexes that existed on "games" after migrations 0001–0003.
CREATE UNIQUE INDEX "games_gameIdentifier_key"      ON "games"("gameIdentifier");
CREATE INDEX        "games_gameIdentifier_idx"       ON "games"("gameIdentifier");
CREATE INDEX        "games_startTime_idx"            ON "games"("startTime");
CREATE INDEX        "games_createdAt_idx"            ON "games"("createdAt");
CREATE INDEX        "games_deletedAt_idx"            ON "games"("deletedAt");
CREATE INDEX        "games_winnerTeam_idx"           ON "games"("winnerTeam");
CREATE INDEX        "games_season_idx"               ON "games"("season");
CREATE INDEX        "games_season_deletedAt_idx"     ON "games"("season", "deletedAt");
CREATE INDEX        "games_season_winnerTeam_idx"    ON "games"("season", "winnerTeam");

-- ─── Step 4: Redefine player_rankings (no DEFAULT on season) ─────────────────
-- The table is now empty; DROP TABLE triggers SET NULL on players.currentRankingId
-- but currentRankingId is already NULL for all players (cleared in step 2).

CREATE TABLE "new_player_rankings" (
    "id"        INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId"  INTEGER  NOT NULL,
    "gameId"    INTEGER,
    "score"     REAL     NOT NULL,
    "reason"    TEXT,
    "season"    INTEGER  NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "player_rankings_playerId_fkey"
        FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_rankings_gameId_fkey"
        FOREIGN KEY ("gameId")   REFERENCES "games"   ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

DROP TABLE "player_rankings";
ALTER TABLE "new_player_rankings" RENAME TO "player_rankings";

-- Recreate all indexes that existed on "player_rankings" after migrations 0001–0003.
CREATE INDEX "player_rankings_playerId_createdAt_idx"        ON "player_rankings"("playerId", "createdAt");
CREATE INDEX "player_rankings_score_idx"                     ON "player_rankings"("score");
CREATE INDEX "player_rankings_gameId_idx"                    ON "player_rankings"("gameId");
CREATE INDEX "player_rankings_createdAt_idx"                 ON "player_rankings"("createdAt");
CREATE INDEX "player_rankings_reason_idx"                    ON "player_rankings"("reason");
CREATE INDEX "player_rankings_deletedAt_idx"                 ON "player_rankings"("deletedAt");
CREATE INDEX "player_rankings_season_idx"                    ON "player_rankings"("season");
CREATE INDEX "player_rankings_playerId_season_createdAt_idx" ON "player_rankings"("playerId", "season", "createdAt");

-- ─── Step 5: Restore child data ──────────────────────────────────────────────
-- Parent tables are inserted before their children so every FK reference is
-- satisfied at insert time (no need for defer_foreign_keys).

-- Direct children of "games"
INSERT INTO "game_player_statistics" SELECT * FROM "_bak_game_player_statistics";
INSERT INTO "game_events"            SELECT * FROM "_bak_game_events";
INSERT INTO "meetings"               SELECT * FROM "_bak_meetings";
-- Explicit column list because migration 0003 appended "season" last (ALTER TABLE ADD COLUMN),
-- so _bak_player_rankings column order is: id, playerId, gameId, score, reason, createdAt, deletedAt, season.
-- The new table definition places "season" before "createdAt"/"deletedAt", so SELECT * would
-- map columns positionally in the wrong order, causing a NOT NULL constraint failure on "createdAt".
INSERT INTO "player_rankings" ("id", "playerId", "gameId", "score", "reason", "season", "createdAt", "deletedAt")
SELECT                        "id", "playerId", "gameId", "score", "reason", "season", "createdAt", "deletedAt"
FROM "_bak_player_rankings";

-- Children of game_player_statistics
INSERT INTO "player_roles"           SELECT * FROM "_bak_player_roles";
INSERT INTO "player_modifiers"       SELECT * FROM "_bak_player_modifiers";

-- Children of meetings
INSERT INTO "meeting_skip_votes"             SELECT * FROM "_bak_meeting_skip_votes";
INSERT INTO "meeting_no_votes"               SELECT * FROM "_bak_meeting_no_votes";
INSERT INTO "meeting_blackmailed_players"    SELECT * FROM "_bak_meeting_blackmailed_players";
INSERT INTO "meeting_jailed_players"         SELECT * FROM "_bak_meeting_jailed_players";
INSERT INTO "meeting_votes"                  SELECT * FROM "_bak_meeting_votes";

-- Restore players.currentRankingId (was SET NULL when player_rankings was cleared)
UPDATE "players"
SET "currentRankingId" = (
    SELECT "rankingId"
    FROM "_bak_current_rankings"
    WHERE "_bak_current_rankings"."playerId" = "players"."id"
);

-- ─── Step 6: Drop backup tables ──────────────────────────────────────────────

DROP TABLE "_bak_current_rankings";
DROP TABLE "_bak_game_player_statistics";
DROP TABLE "_bak_player_roles";
DROP TABLE "_bak_player_modifiers";
DROP TABLE "_bak_game_events";
DROP TABLE "_bak_meetings";
DROP TABLE "_bak_meeting_skip_votes";
DROP TABLE "_bak_meeting_no_votes";
DROP TABLE "_bak_meeting_blackmailed_players";
DROP TABLE "_bak_meeting_jailed_players";
DROP TABLE "_bak_meeting_votes";
DROP TABLE "_bak_player_rankings";
