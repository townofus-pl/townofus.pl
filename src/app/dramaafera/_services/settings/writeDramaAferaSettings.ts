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
 * Advanced mode: replace one live preset and preserve its previous content in history.
 * Executed atomically via D1 batch().
 */
export async function replaceDramaAferaSettings(
  content: string,
  version: 'current' | 'old',
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Cloudflare context not available');

  if (version === 'old') {
    // Archive a copy before replacing the live slot so its publication date can
    // be inherited atomically, even when another upload happens in the same second.
    await batchStatements(db, [
      db.prepare(
        `INSERT INTO ${TABLE} ("versionType", "content", "revision", "uploadedAt", "publishedAt", "createdAt", "updatedAt", "deletedAt")
         SELECT "versionType", "content", "revision", "uploadedAt", "publishedAt", "createdAt", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
         FROM ${TABLE} WHERE "versionType" = 'old' AND "deletedAt" IS NULL`,
      ),
      db.prepare(
        `INSERT INTO ${TABLE} ("versionType", "content", "uploadedAt", "createdAt", "updatedAt")
         VALUES ('old', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT ("versionType") WHERE "deletedAt" IS NULL DO UPDATE SET
           "publishedAt" = COALESCE("publishedAt", "uploadedAt"),
           "content" = excluded."content", "uploadedAt" = excluded."uploadedAt", "updatedAt" = excluded."updatedAt"`,
      ).bind(content),
    ]);
    return;
  }

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
