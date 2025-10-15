-- Migration number: 0002 	 2025-09-24T20:50:31.537Z
-- AlterTable
ALTER TABLE "game_events" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "meetings" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "player_rankings" ADD COLUMN "deletedAt" DATETIME;

-- AlterTable
ALTER TABLE "players" ADD COLUMN "deletedAt" DATETIME;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameIdentifier" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "map" TEXT NOT NULL,
    "maxTasks" INTEGER,
    "winnerTeam" TEXT,
    "winCondition" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_games" ("createdAt", "endTime", "id", "map", "maxTasks", "startTime", "updatedAt") SELECT "createdAt", "endTime", "id", "map", "maxTasks", "startTime", "updatedAt" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
CREATE UNIQUE INDEX "games_gameIdentifier_key" ON "games"("gameIdentifier");
CREATE INDEX "games_gameIdentifier_idx" ON "games"("gameIdentifier");
CREATE INDEX "games_startTime_idx" ON "games"("startTime");
CREATE INDEX "games_createdAt_idx" ON "games"("createdAt");
CREATE INDEX "games_deletedAt_idx" ON "games"("deletedAt");
CREATE INDEX "games_winnerTeam_idx" ON "games"("winnerTeam");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "game_events_deletedAt_idx" ON "game_events"("deletedAt");

-- CreateIndex
CREATE INDEX "meetings_deletedAt_idx" ON "meetings"("deletedAt");

-- CreateIndex
CREATE INDEX "player_rankings_deletedAt_idx" ON "player_rankings"("deletedAt");

-- CreateIndex
CREATE INDEX "players_deletedAt_idx" ON "players"("deletedAt");

