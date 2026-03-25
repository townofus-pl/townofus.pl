-- Migration number: 0003 	 2026-03-24T01:42:57.178Z
-- Add season column to games and player_rankings.
--
-- SAFE APPROACH: ALTER TABLE ADD COLUMN
-- The original Prisma-generated migration used RedefineTables (CREATE new →
-- INSERT → DROP old → RENAME). In Cloudflare D1 every migration runs inside an
-- implicit transaction, which makes PRAGMA foreign_keys=OFF a no-op (SQLite
-- silently ignores that PRAGMA when a transaction is already open). DROP TABLE
-- therefore fires all ON DELETE CASCADE actions and wipes child table data.
-- ALTER TABLE ADD COLUMN avoids DROP TABLE entirely, so cascade is never triggered.

ALTER TABLE "games" ADD COLUMN "season" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "player_rankings" ADD COLUMN "season" INTEGER NOT NULL DEFAULT 1;

CREATE INDEX "games_season_idx" ON "games"("season");
CREATE INDEX "games_season_deletedAt_idx" ON "games"("season", "deletedAt");
CREATE INDEX "games_season_winnerTeam_idx" ON "games"("season", "winnerTeam");

CREATE INDEX "player_rankings_season_idx" ON "player_rankings"("season");
CREATE INDEX "player_rankings_playerId_season_createdAt_idx" ON "player_rankings"("playerId", "season", "createdAt");
