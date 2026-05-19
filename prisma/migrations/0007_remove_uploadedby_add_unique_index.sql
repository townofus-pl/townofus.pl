-- Drop uploadedBy column and add unique index on versionType
ALTER TABLE drama_afera_settings DROP COLUMN uploadedBy;

-- Add unique index to prevent multiple active versions
CREATE UNIQUE INDEX idx_drama_afera_settings_version_type 
  ON drama_afera_settings(versionType) 
  WHERE deletedAt IS NULL;
