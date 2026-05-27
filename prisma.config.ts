import { defineConfig } from 'prisma/config';
import { listLocalDatabases } from '@prisma/adapter-d1';

// `prisma migrate diff --from-config-datasource ...` needs a SQLite file URL.
// `listLocalDatabases()` scans `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`
// for local D1 SQLite files created by `wrangler d1 ... --local`.
//
// We resolve eagerly here (at module-load time) so the failure mode for fresh
// checkouts is a clear message, not an opaque ENOENT or "wrong DB" silent diff.
function resolveLocalD1Url(): string {
  let candidates: string[];
  try {
    candidates = listLocalDatabases();
  } catch (err) {
    throw new Error(
      'No local D1 directory found at .wrangler/state/v3/d1/miniflare-D1DatabaseObject/. ' +
        'Run `npm run db:migrate:apply:local` first to create the local database. ' +
        `(${(err as Error).message})`,
    );
  }

  if (candidates.length === 0) {
    throw new Error(
      'No local D1 database files found. Run `npm run db:migrate:apply:local` first.',
    );
  }

  if (candidates.length > 1) {
    throw new Error(
      `Multiple local D1 databases found — expected exactly one for this project, got ${candidates.length}:\n` +
        candidates.map((c) => `  - ${c}`).join('\n') +
        '\nRemove stale databases or filter explicitly before continuing.',
    );
  }

  return `file:${candidates[0]}`;
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: resolveLocalD1Url(),
  },
});
