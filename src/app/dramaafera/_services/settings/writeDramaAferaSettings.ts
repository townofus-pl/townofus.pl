import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { batchStatements } from '@/app/api/_database';

const TABLE = '"drama_afera_settings"';

async function getDb(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext();
    return env.DB;
  } catch {
    return null;
  }
}

/**
 * Normal mode: new content becomes 'current', existing 'current' is demoted to 'old',
 * existing 'old' is soft-deleted. Executed atomically via D1 batch() — partial failure
 * is impossible and the partial unique index on (versionType WHERE deletedAt IS NULL)
 * stays consistent.
 */
export async function rotateDramaAferaSettings(content: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Cloudflare context not available');

  await batchStatements(db, [
    db
      .prepare(
        `UPDATE ${TABLE}
         SET "deletedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
         WHERE "versionType" = 'old' AND "deletedAt" IS NULL`,
      ),
    db
      .prepare(
        `UPDATE ${TABLE}
         SET "versionType" = 'old', "updatedAt" = CURRENT_TIMESTAMP
         WHERE "versionType" = 'current' AND "deletedAt" IS NULL`,
      ),
    db
      .prepare(
        `INSERT INTO ${TABLE} ("versionType", "content", "uploadedAt", "createdAt", "updatedAt")
         VALUES ('current', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      )
      .bind(content),
  ]);
}

/**
 * Advanced mode: soft-delete the existing record for `version` (current|old) and insert
 * a fresh row in its place. History is preserved via the soft-deleted previous row.
 * Executed atomically via D1 batch().
 */
export async function replaceDramaAferaSettings(
  content: string,
  version: 'current' | 'old',
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Cloudflare context not available');

  await batchStatements(db, [
    db
      .prepare(
        `UPDATE ${TABLE}
         SET "deletedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP
         WHERE "versionType" = ? AND "deletedAt" IS NULL`,
      )
      .bind(version),
    db
      .prepare(
        `INSERT INTO ${TABLE} ("versionType", "content", "uploadedAt", "createdAt", "updatedAt")
         VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      )
      .bind(version, content),
  ]);
}
