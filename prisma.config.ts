import { defineConfig } from 'prisma/config';
import { listLocalDatabases } from '@prisma/adapter-d1';

// `prisma migrate diff --from-config-datasource ...` needs a SQLite file URL.
// `listLocalDatabases()` scans `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`
// and returns the local D1 SQLite paths created by `wrangler d1 ... --local`.
// Run `npm run db:migrate:apply:local` at least once before the first diff so a
// `.sqlite` file exists.
const localD1 = listLocalDatabases().pop();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: localD1 ? `file:${localD1}` : 'file:./.no-local-d1.sqlite',
  },
});
