-- CreateTable
CREATE TABLE "role_balance_cycles" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season" INTEGER NOT NULL,
    "roleName" TEXT NOT NULL,
    "afterTime" TEXT NOT NULL,
    "afterGameId" INTEGER NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "startedBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateTable
CREATE TABLE "role_balance_reviews" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season" INTEGER NOT NULL,
    "roleName" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "fromTime" TEXT NOT NULL,
    "fromGameId" INTEGER NOT NULL,
    "throughTime" TEXT NOT NULL,
    "throughGameId" INTEGER NOT NULL,
    "decision" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "snapshot" TEXT NOT NULL,
    "formulaVersion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "role_balance_cycles_season_roleName_key" ON "role_balance_cycles"("season", "roleName") WHERE "deletedAt" IS NULL;

-- CreateIndex
CREATE INDEX "role_balance_reviews_season_roleName_deletedAt_idx" ON "role_balance_reviews"("season", "roleName", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "role_balance_reviews_season_roleName_revision_key" ON "role_balance_reviews"("season", "roleName", "revision");
