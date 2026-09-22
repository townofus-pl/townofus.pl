-- Migration number: 0008 	 2026-09-20T16:03:01.114Z
-- CreateIndex
CREATE INDEX "game_player_statistics_gameId_playerId_win_idx" ON "game_player_statistics"("gameId", "playerId", "win");

-- CreateIndex
CREATE INDEX "player_rankings_season_playerId_gameId_id_idx" ON "player_rankings"("season", "playerId", "gameId", "id") WHERE "deletedAt" IS NULL;

