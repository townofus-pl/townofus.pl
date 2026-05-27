-- Migration number: 0007 	 2026-05-27T08:21:11.390Z
-- DropIndex
DROP INDEX "idx_drama_afera_settings_version_type";

-- CreateIndex
CREATE UNIQUE INDEX "idx_drama_afera_settings_version_type" ON "drama_afera_settings"("versionType") WHERE "deletedAt" IS NULL;

