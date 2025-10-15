-- CreateTable
CREATE TABLE "games" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "map" TEXT NOT NULL,
    "maxTasks" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "currentRankingId" INTEGER,
    CONSTRAINT "players_currentRankingId_fkey" FOREIGN KEY ("currentRankingId") REFERENCES "player_rankings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_player_statistics" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "win" BOOLEAN NOT NULL DEFAULT false,
    "disconnected" BOOLEAN NOT NULL DEFAULT false,
    "initialRolePoints" INTEGER NOT NULL DEFAULT 0,
    "correctKills" INTEGER NOT NULL DEFAULT 0,
    "incorrectKills" INTEGER NOT NULL DEFAULT 0,
    "correctProsecutes" INTEGER NOT NULL DEFAULT 0,
    "incorrectProsecutes" INTEGER NOT NULL DEFAULT 0,
    "correctGuesses" INTEGER NOT NULL DEFAULT 0,
    "incorrectGuesses" INTEGER NOT NULL DEFAULT 0,
    "correctDeputyShoots" INTEGER NOT NULL DEFAULT 0,
    "incorrectDeputyShoots" INTEGER NOT NULL DEFAULT 0,
    "correctJailorExecutes" INTEGER NOT NULL DEFAULT 0,
    "incorrectJailorExecutes" INTEGER NOT NULL DEFAULT 0,
    "correctMedicShields" INTEGER NOT NULL DEFAULT 0,
    "incorrectMedicShields" INTEGER NOT NULL DEFAULT 0,
    "correctWardenFortifies" INTEGER NOT NULL DEFAULT 0,
    "incorrectWardenFortifies" INTEGER NOT NULL DEFAULT 0,
    "janitorCleans" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "survivedRounds" INTEGER NOT NULL DEFAULT 0,
    "correctAltruistRevives" INTEGER NOT NULL DEFAULT 0,
    "incorrectAltruistRevives" INTEGER NOT NULL DEFAULT 0,
    "correctSwaps" INTEGER NOT NULL DEFAULT 0,
    "incorrectSwaps" INTEGER NOT NULL DEFAULT 0,
    "totalPoints" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "game_player_statistics_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_player_statistics_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "player_roles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gamePlayerStatisticsId" INTEGER NOT NULL,
    "roleName" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "player_roles_gamePlayerStatisticsId_fkey" FOREIGN KEY ("gamePlayerStatisticsId") REFERENCES "game_player_statistics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "player_modifiers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gamePlayerStatisticsId" INTEGER NOT NULL,
    "modifierName" TEXT NOT NULL,
    CONSTRAINT "player_modifiers_gamePlayerStatisticsId_fkey" FOREIGN KEY ("gamePlayerStatisticsId") REFERENCES "game_player_statistics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "game_events" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "timestamp" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventType" TEXT,
    "playerId" INTEGER,
    "targetId" INTEGER,
    CONSTRAINT "game_events_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "game_events_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "game_events_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "players" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meetings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gameId" INTEGER NOT NULL,
    "meetingNumber" INTEGER NOT NULL,
    "deathsSinceLastMeeting" TEXT NOT NULL,
    "wasTie" BOOLEAN NOT NULL DEFAULT false,
    "wasBlessed" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "meetings_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_skip_votes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    CONSTRAINT "meeting_skip_votes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_skip_votes_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_no_votes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    CONSTRAINT "meeting_no_votes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_no_votes_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_blackmailed_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    CONSTRAINT "meeting_blackmailed_players_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_blackmailed_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_jailed_players" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    CONSTRAINT "meeting_jailed_players_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_jailed_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "meeting_votes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meetingId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "voterId" INTEGER NOT NULL,
    CONSTRAINT "meeting_votes_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "meetings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_votes_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "meeting_votes_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "player_rankings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "playerId" INTEGER NOT NULL,
    "gameId" INTEGER,
    "score" REAL NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "player_rankings_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "player_rankings_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "games_startTime_idx" ON "games"("startTime");

-- CreateIndex
CREATE INDEX "games_createdAt_idx" ON "games"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "players_name_key" ON "players"("name");

-- CreateIndex
CREATE UNIQUE INDEX "players_currentRankingId_key" ON "players"("currentRankingId");

-- CreateIndex
CREATE INDEX "players_name_idx" ON "players"("name");

-- CreateIndex
CREATE INDEX "players_currentRankingId_idx" ON "players"("currentRankingId");

-- CreateIndex
CREATE INDEX "game_player_statistics_gameId_idx" ON "game_player_statistics"("gameId");

-- CreateIndex
CREATE INDEX "game_player_statistics_playerId_idx" ON "game_player_statistics"("playerId");

-- CreateIndex
CREATE INDEX "game_player_statistics_win_idx" ON "game_player_statistics"("win");

-- CreateIndex
CREATE INDEX "game_player_statistics_disconnected_idx" ON "game_player_statistics"("disconnected");

-- CreateIndex
CREATE INDEX "game_player_statistics_totalPoints_idx" ON "game_player_statistics"("totalPoints");

-- CreateIndex
CREATE INDEX "game_player_statistics_correctKills_idx" ON "game_player_statistics"("correctKills");

-- CreateIndex
CREATE INDEX "game_player_statistics_correctGuesses_idx" ON "game_player_statistics"("correctGuesses");

-- CreateIndex
CREATE INDEX "game_player_statistics_completedTasks_idx" ON "game_player_statistics"("completedTasks");

-- CreateIndex
CREATE INDEX "game_player_statistics_survivedRounds_idx" ON "game_player_statistics"("survivedRounds");

-- CreateIndex
CREATE INDEX "game_player_statistics_gameId_win_idx" ON "game_player_statistics"("gameId", "win");

-- CreateIndex
CREATE INDEX "game_player_statistics_playerId_win_idx" ON "game_player_statistics"("playerId", "win");

-- CreateIndex
CREATE UNIQUE INDEX "game_player_statistics_gameId_playerId_key" ON "game_player_statistics"("gameId", "playerId");

-- CreateIndex
CREATE INDEX "player_roles_gamePlayerStatisticsId_idx" ON "player_roles"("gamePlayerStatisticsId");

-- CreateIndex
CREATE INDEX "player_roles_roleName_idx" ON "player_roles"("roleName");

-- CreateIndex
CREATE INDEX "player_roles_roleName_order_idx" ON "player_roles"("roleName", "order");

-- CreateIndex
CREATE INDEX "player_roles_order_idx" ON "player_roles"("order");

-- CreateIndex
CREATE INDEX "player_modifiers_gamePlayerStatisticsId_idx" ON "player_modifiers"("gamePlayerStatisticsId");

-- CreateIndex
CREATE INDEX "player_modifiers_modifierName_idx" ON "player_modifiers"("modifierName");

-- CreateIndex
CREATE INDEX "game_events_gameId_idx" ON "game_events"("gameId");

-- CreateIndex
CREATE INDEX "game_events_timestamp_idx" ON "game_events"("timestamp");

-- CreateIndex
CREATE INDEX "game_events_eventType_idx" ON "game_events"("eventType");

-- CreateIndex
CREATE INDEX "game_events_playerId_idx" ON "game_events"("playerId");

-- CreateIndex
CREATE INDEX "game_events_targetId_idx" ON "game_events"("targetId");

-- CreateIndex
CREATE INDEX "meetings_gameId_idx" ON "meetings"("gameId");

-- CreateIndex
CREATE INDEX "meetings_meetingNumber_idx" ON "meetings"("meetingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "meetings_gameId_meetingNumber_key" ON "meetings"("gameId", "meetingNumber");

-- CreateIndex
CREATE INDEX "meeting_skip_votes_meetingId_idx" ON "meeting_skip_votes"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_skip_votes_playerId_idx" ON "meeting_skip_votes"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_skip_votes_meetingId_playerId_key" ON "meeting_skip_votes"("meetingId", "playerId");

-- CreateIndex
CREATE INDEX "meeting_no_votes_meetingId_idx" ON "meeting_no_votes"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_no_votes_playerId_idx" ON "meeting_no_votes"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_no_votes_meetingId_playerId_key" ON "meeting_no_votes"("meetingId", "playerId");

-- CreateIndex
CREATE INDEX "meeting_blackmailed_players_meetingId_idx" ON "meeting_blackmailed_players"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_blackmailed_players_playerId_idx" ON "meeting_blackmailed_players"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_blackmailed_players_meetingId_playerId_key" ON "meeting_blackmailed_players"("meetingId", "playerId");

-- CreateIndex
CREATE INDEX "meeting_jailed_players_meetingId_idx" ON "meeting_jailed_players"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_jailed_players_playerId_idx" ON "meeting_jailed_players"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "meeting_jailed_players_meetingId_playerId_key" ON "meeting_jailed_players"("meetingId", "playerId");

-- CreateIndex
CREATE INDEX "meeting_votes_meetingId_idx" ON "meeting_votes"("meetingId");

-- CreateIndex
CREATE INDEX "meeting_votes_targetId_idx" ON "meeting_votes"("targetId");

-- CreateIndex
CREATE INDEX "meeting_votes_voterId_idx" ON "meeting_votes"("voterId");

-- CreateIndex
CREATE INDEX "player_rankings_playerId_createdAt_idx" ON "player_rankings"("playerId", "createdAt");

-- CreateIndex
CREATE INDEX "player_rankings_score_idx" ON "player_rankings"("score");

-- CreateIndex
CREATE INDEX "player_rankings_gameId_idx" ON "player_rankings"("gameId");

-- CreateIndex
CREATE INDEX "player_rankings_createdAt_idx" ON "player_rankings"("createdAt");

-- CreateIndex
CREATE INDEX "player_rankings_reason_idx" ON "player_rankings"("reason");
