-- CreateTable drama_afera_settings
CREATE TABLE "drama_afera_settings" (
    "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    "versionType" text NOT NULL DEFAULT 'current',
    "content" text NOT NULL,
    "uploadedAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" text,
    "createdAt" datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" datetime NOT NULL,
    "deletedAt" datetime
);

-- CreateIndex
CREATE INDEX "drama_afera_settings_versionType_idx" ON "drama_afera_settings"("versionType");

-- CreateIndex
CREATE INDEX "drama_afera_settings_uploadedAt_idx" ON "drama_afera_settings"("uploadedAt");

-- CreateIndex
CREATE INDEX "drama_afera_settings_deletedAt_idx" ON "drama_afera_settings"("deletedAt");
