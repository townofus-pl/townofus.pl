import { defineConfig } from 'prisma/config';
import { listLocalDatabases } from '@prisma/adapter-d1';

// `prisma migrate diff --from-config-datasource ...` needs a SQLite file URL.
// `listLocalDatabases()` scans `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`
// for local D1 SQLite files created by `wrangler d1 ... --local`.
//
// Resolution is lazy via a getter so commands that don't actually need a local
// datasource (e.g. `prisma generate`, `prisma migrate apply:remote` in CI) do
// not trip the no-local-DB check at module load.
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
    get url() {
      return resolveLocalD1Url();
    },
  },
});
