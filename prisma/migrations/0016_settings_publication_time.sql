ALTER TABLE "drama_afera_settings" ADD COLUMN "publishedAt" DATETIME;

-- Recover the original date when a legacy replacement made the old preset newer
-- than the current one. Archived old rows are the history of this slot.
UPDATE "drama_afera_settings" AS old
SET "publishedAt" = (
    SELECT archived."uploadedAt"
    FROM "drama_afera_settings" AS archived
    JOIN "drama_afera_settings" AS current
      ON current."versionType" = 'current' AND current."deletedAt" IS NULL
    WHERE archived."versionType" = 'old'
      AND archived."deletedAt" IS NOT NULL
      AND julianday(old."uploadedAt") > julianday(current."uploadedAt")
      AND julianday(archived."uploadedAt") <= julianday(current."uploadedAt")
    ORDER BY julianday(archived."uploadedAt") DESC, archived."id" DESC
    LIMIT 1
)
WHERE old."versionType" = 'old' AND old."deletedAt" IS NULL;
