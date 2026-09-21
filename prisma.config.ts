import { defineConfig } from 'prisma/config';
import { resolveLocalD1Path } from './scripts/lib/localD1';

// `prisma migrate diff --from-config-datasource ...` needs a SQLite file URL.
// `listLocalDatabases()` scans `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`
// for local D1 SQLite files created by `wrangler d1 ... --local`.
//
// Resolution is lazy via a getter so commands that don't actually need a local
// datasource (e.g. `prisma generate`, `prisma migrate apply:remote` in CI) do
// not trip the no-local-DB check at module load.
function resolveLocalD1Url(): string {
  return `file:${resolveLocalD1Path()}`;
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
