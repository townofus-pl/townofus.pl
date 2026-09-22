-- Migration number: 0009 	 2026-09-21T00:00:00.000Z
-- v2 ingest schema (#302). Everything here is additive and inert for v1 games, except the two
-- renames, which preserve their data.
--
-- Hand-written rather than taken from `prisma migrate diff`. The diff rebuilds
-- game_player_statistics to apply the renames and its INSERT..SELECT omits the two old columns,
-- which would silently zero the shield counters on all 735 existing games. SQLite has supported
-- ALTER TABLE .. RENAME COLUMN since 3.25; D1 is well past that.

-- AlterTable
ALTER TABLE "games" ADD COLUMN "modVersion" TEXT;
ALTER TABLE "games" ADD COLUMN "winningFaction" TEXT;

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN "exiledPlayer" TEXT;

-- AlterTable
ALTER TABLE "players" ADD COLUMN "friendCode" TEXT;
ALTER TABLE "players" ADD COLUMN "hashedProductUserId" TEXT;

-- AlterTable: these counters already collect Mercenary (Neutral) and Monarch (Crewmate), so the
-- Medic-specific name was wrong. Rename keeps every existing value.
ALTER TABLE "game_player_statistics" RENAME COLUMN "correctMedicShields" TO "correctProtects";
ALTER TABLE "game_player_statistics" RENAME COLUMN "incorrectMedicShields" TO "incorrectProtects";

-- AlterTable
ALTER TABLE "game_player_statistics" ADD COLUMN "imitatorRoles" TEXT;

-- CreateTable
CREATE TABLE "game_actions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "timestampMs" INTEGER NOT NULL,
    "pointsChange" REAL NOT NULL DEFAULT 0,
    "performerRole" TEXT NOT NULL,
    "performerId" INTEGER NOT NULL,
    "targetId" INTEGER,
    "targetRole" TEXT,
    "isCorrect" BOOLEAN,
    "detail" TEXT,
    "deletedAt" DATETIME,
    CONSTRAINT "game_actions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_actions_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_actions_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "players" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "game_actions_gameId_type_idx" ON "game_actions"("gameId", "type");
