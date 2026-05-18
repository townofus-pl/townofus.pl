const fs = require('fs');
const path = require('path');

// Read the current and old files
const currentContent = fs.readFileSync(path.join(__dirname, '../../public/settings/dramaafera.txt'), 'utf-8');
const oldContent = fs.readFileSync(path.join(__dirname, '../../public/settings/dramaafera_old.txt'), 'utf-8');

// Escape single quotes for SQL
const escapeSql = (str) => str.replace(/'/g, "''");

// Generate the SQL migration
const now = new Date().toISOString();

const migration = `-- CreateTable
CREATE TABLE "drama_afera_settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "versionType" TEXT NOT NULL DEFAULT 'current',
    "content" TEXT NOT NULL,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "deletedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "drama_afera_settings_versionType_key" ON "drama_afera_settings"("versionType") WHERE deletedAt IS NULL;

-- CreateIndex
CREATE INDEX "drama_afera_settings_versionType_idx" ON "drama_afera_settings"("versionType");

-- CreateIndex
CREATE INDEX "drama_afera_settings_uploadedAt_idx" ON "drama_afera_settings"("uploadedAt");

-- CreateIndex
CREATE INDEX "drama_afera_settings_deletedAt_idx" ON "drama_afera_settings"("deletedAt");

-- InsertInitialData
INSERT INTO "drama_afera_settings" ("versionType", "content", "uploadedAt", "uploadedBy", "createdAt", "updatedAt") VALUES
('current', '${escapeSql(currentContent)}', '${now}', 'system', '${now}', '${now}'),
('old', '${escapeSql(oldContent)}', '${now}', 'system', '${now}', '${now}');
`;

// Write the migration file
const migrationDir = path.join(__dirname, '../../prisma/migrations/0006_add_drama_afera_settings');
if (!fs.existsSync(migrationDir)) {
  fs.mkdirSync(migrationDir, { recursive: true });
}

fs.writeFileSync(path.join(migrationDir, 'migration.sql'), migration, 'utf-8');

console.log('Migration file created successfully at:', path.join(migrationDir, 'migration.sql'));
