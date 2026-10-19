-- Migration number: 0012 	 2026-10-19T15:26:55.792Z
-- Discord bot, stage 1 (#354, spec in #351). Additive: no existing row is rewritten.
--
-- Column names match the `Discord` branch (PR #346, its 0012 and 0014) so stage 3 only adds
-- columns. Left out on purpose: `retryBlocked`, `isHost`, the session, request, audit and
-- command tables, `emperor_poll_votes`, and every trigger.
-- CreateTable
CREATE TABLE "discord_accounts" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "discordUserId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "avatar" TEXT,
    "playerId" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "discord_accounts_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "emperor_polls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "closesAt" BIGINT NOT NULL,
    "discordChannelId" TEXT,
    "discordMessageId" TEXT,
    "closedAt" BIGINT,
    "finalizedAt" BIGINT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "emperor_poll_candidates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pollId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "nickname" TEXT NOT NULL,
    "voteCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "emperor_poll_candidates_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "emperor_polls" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "emperor_poll_candidates_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "discord_accounts_discordUserId_key" ON "discord_accounts"("discordUserId");

-- CreateIndex
CREATE UNIQUE INDEX "discord_accounts_playerId_key" ON "discord_accounts"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "emperor_polls_date_key" ON "emperor_polls"("date");

-- CreateIndex
CREATE UNIQUE INDEX "emperor_poll_candidates_pollId_playerId_key" ON "emperor_poll_candidates"("pollId", "playerId");

