-- Migration number: 0013 	 2026-10-21T00:00:00.000Z
-- The Recorder of a v2 game (#377): the friend code of the machine that recorded the match, and
-- the player it names. Both are NULL on every older game.
--
-- Hand-written rather than taken from `prisma migrate diff`. The diff rebuilds "games" (CREATE
-- new_games, INSERT..SELECT, DROP TABLE) only to add a foreign key. SQLite adds a column with a
-- REFERENCES clause in place when its default is NULL, so no row moves.

-- AlterTable
ALTER TABLE "games" ADD COLUMN "recorderFriendCode" TEXT;
ALTER TABLE "games" ADD COLUMN "recorderPlayerId" INTEGER REFERENCES "players" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "games_recorderPlayerId_idx" ON "games"("recorderPlayerId");
