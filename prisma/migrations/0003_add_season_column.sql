-- Migration number: 0003 	 2026-03-24T01:42:57.178Z
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
    "season" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);
INSERT INTO "new_games" ("createdAt", "deletedAt", "endTime", "gameIdentifier", "id", "map", "maxTasks", "startTime", "updatedAt", "winCondition", "winnerTeam") SELECT "createdAt", "deletedAt", "endTime", "gameIdentifier", "id", "map", "maxTasks", "startTime", "updatedAt", "winCondition", "winnerTeam" FROM "games";
DROP TABLE "games";
ALTER TABLE "new_games" RENAME TO "games";
CREATE UNIQUE INDEX "games_gameIdentifier_key" ON "games"("gameIdentifier");
CREATE INDEX "games_gameIdentifier_idx" ON "games"("gameIdentifier");
CREATE INDEX "games_startTime_idx" ON "games"("startTime");
CREATE INDEX "games_createdAt_idx" ON "games"("createdAt");
CREATE INDEX "games_deletedAt_idx" ON "games"("deletedAt");
CREATE INDEX "games_winnerTeam_idx" ON "games"("winnerTeam");
CREATE INDEX "games_season_idx" ON "games"("season");
CREATE INDEX "games_season_deletedAt_idx" ON "games"("season", "deletedAt");
CREATE INDEX "games_season_winnerTeam_idx" ON "games"("season", "winnerTeam");
CREATE TABLE "new_player_rankings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER,
    "score" REAL NOT NULL,
    "reason" TEXT,
    "season" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    CONSTRAINT "player_rankings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_rankings_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_player_rankings" ("createdAt", "deletedAt", "gameId", "id", "playerId", "reason", "score") SELECT "createdAt", "deletedAt", "gameId", "id", "playerId", "reason", "score" FROM "player_rankings";
DROP TABLE "player_rankings";
ALTER TABLE "new_player_rankings" RENAME TO "player_rankings";
CREATE INDEX "player_rankings_playerId_createdAt_idx" ON "player_rankings"("playerId", "createdAt");
CREATE INDEX "player_rankings_score_idx" ON "player_rankings"("score");
CREATE INDEX "player_rankings_gameId_idx" ON "player_rankings"("gameId");
CREATE INDEX "player_rankings_createdAt_idx" ON "player_rankings"("createdAt");
CREATE INDEX "player_rankings_reason_idx" ON "player_rankings"("reason");
CREATE INDEX "player_rankings_deletedAt_idx" ON "player_rankings"("deletedAt");
CREATE INDEX "player_rankings_season_idx" ON "player_rankings"("season");
CREATE INDEX "player_rankings_playerId_season_createdAt_idx" ON "player_rankings"("playerId", "season", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

