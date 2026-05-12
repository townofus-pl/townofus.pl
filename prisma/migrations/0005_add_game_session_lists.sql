-- CreateTable game_session_lists
CREATE TABLE "game_session_lists" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season" integer NOT NULL,
    "date" datetime NOT NULL,
    "playerNames" text NOT NULL,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL,
    "deletedAt" datetime,
    CONSTRAINT "game_session_lists_season_date_key" UNIQUE ("season", "date")
);

-- CreateIndex
CREATE INDEX "game_session_lists_season_idx" on "game_session_lists"("season");

-- CreateIndex
CREATE INDEX "game_session_lists_date_idx" on "game_session_lists"("date");

-- CreateIndex
CREATE INDEX "game_session_lists_deletedAt_idx" on "game_session_lists"("deletedAt");
