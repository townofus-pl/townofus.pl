-- Migration number: 0005 	 2026-05-06
-- Add lista_cweli table for Lista Cweli (session player roster) feature.

CREATE TABLE "lista_cweli" (
    "id"          INTEGER  NOT NULL PRIMARY KEY AUTOINCREMENT,
    "season"      INTEGER  NOT NULL,
    "date"        DATETIME NOT NULL,
    "playerNames" TEXT     NOT NULL,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL,
    "deletedAt"   DATETIME,
    CONSTRAINT "lista_cweli_season_date_key" UNIQUE ("season", "date")
);

CREATE INDEX "lista_cweli_season_idx"    ON "lista_cweli"("season");
CREATE INDEX "lista_cweli_date_idx"      ON "lista_cweli"("date");
CREATE INDEX "lista_cweli_deletedAt_idx" ON "lista_cweli"("deletedAt");
