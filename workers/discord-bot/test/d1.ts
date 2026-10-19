// A real D1 (workerd, in memory) with every migration from prisma/migrations applied.

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Miniflare } from 'miniflare';

const MIGRATIONS = join(__dirname, '../../../prisma/migrations');

export async function createTestD1(): Promise<{ db: D1Database; dispose: () => Promise<void> }> {
    const mf = new Miniflare({
        modules: true,
        script: 'export default { fetch() { return new Response("ok") } }',
        d1Databases: { DB: 'signup-test' },
        d1Persist: false,
        compatibilityDate: '2026-05-01',
    });
    const db = (await mf.getD1Database('DB')) as unknown as D1Database;
    for (const file of readdirSync(MIGRATIONS).filter((f) => f.endsWith('.sql')).sort()) {
        const sql = readFileSync(join(MIGRATIONS, file), 'utf8')
            .split('\n')
            .filter((line) => !line.trim().startsWith('--'))
            .join('\n');
        const statements = sql.split(/;\s*(?:\n|$)/).map((s) => s.trim()).filter(Boolean);
        await db.batch(statements.map((s) => db.prepare(s)));
    }
    return { db, dispose: () => mf.dispose() };
}
