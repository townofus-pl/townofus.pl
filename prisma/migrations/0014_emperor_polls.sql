-- CreateTable
CREATE TABLE "emperor_polls" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "season" INTEGER NOT NULL,
    "closesAt" BIGINT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "emperor_poll_candidates" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pollId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "totalPoints" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "emperor_poll_candidates_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "emperor_polls" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "emperor_poll_candidates_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "emperor_poll_votes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pollId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "candidateId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    CONSTRAINT "emperor_poll_votes_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "emperor_polls" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "emperor_poll_votes_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "emperor_poll_votes_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "emperor_poll_candidates" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "emperor_polls_date_key" ON "emperor_polls"("date");

-- CreateIndex
CREATE UNIQUE INDEX "emperor_poll_candidates_pollId_playerId_key" ON "emperor_poll_candidates"("pollId", "playerId");

-- CreateIndex
CREATE INDEX "emperor_poll_votes_candidateId_id_idx" ON "emperor_poll_votes"("candidateId", "id");

-- CreateIndex
CREATE UNIQUE INDEX "emperor_poll_votes_pollId_playerId_key" ON "emperor_poll_votes"("pollId", "playerId");


-- Enforce candidate membership, self-vote prohibition and the deadline even for direct writes.
CREATE TRIGGER emperor_vote_insert_guard BEFORE INSERT ON emperor_poll_votes BEGIN
 SELECT CASE WHEN NOT EXISTS (
   SELECT 1 FROM emperor_polls p JOIN emperor_poll_candidates c ON c.pollId=p.id
   JOIN players voter ON voter.id=NEW.playerId JOIN players target ON target.id=c.playerId
   WHERE p.id=NEW.pollId AND c.id=NEW.candidateId AND c.playerId<>NEW.playerId
   AND p.deletedAt IS NULL AND c.deletedAt IS NULL AND voter.deletedAt IS NULL AND target.deletedAt IS NULL
   AND p.closesAt > CAST(unixepoch('subsec')*1000 AS INTEGER)
 ) THEN RAISE(ABORT,'poll_vote_invalid') END;
END;
CREATE TRIGGER emperor_vote_update_guard BEFORE UPDATE ON emperor_poll_votes BEGIN
 SELECT CASE WHEN NEW.pollId<>OLD.pollId OR NEW.playerId<>OLD.playerId OR NOT EXISTS (
   SELECT 1 FROM emperor_polls p JOIN emperor_poll_candidates c ON c.pollId=p.id
   JOIN players voter ON voter.id=NEW.playerId JOIN players target ON target.id=c.playerId
   WHERE p.id=NEW.pollId AND c.id=NEW.candidateId AND c.playerId<>NEW.playerId
   AND p.deletedAt IS NULL AND c.deletedAt IS NULL AND voter.deletedAt IS NULL AND target.deletedAt IS NULL
   AND p.closesAt > CAST(unixepoch('subsec')*1000 AS INTEGER)
 ) THEN RAISE(ABORT,'poll_vote_invalid') END;
END;
