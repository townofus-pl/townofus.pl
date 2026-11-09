import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getDatabaseClient } from '../_services/db';
import { replaceDramaAferaSettings } from '../_services/settings/writeDramaAferaSettings';
import { MiraChangelog } from './_components/MiraChangelog';
import { getCategorizedChangelogChanges } from './_getCategories';
import { settingId } from './_miraConfigSections';

jest.mock('server-only', () => ({}), { virtual: true });
jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
jest.mock('../_services/db', () => ({ getDatabaseClient: jest.fn() }));
jest.mock('@/app/api/_database', () => ({
    batchStatements: (db: D1Database, statements: D1PreparedStatement[]) => db.batch(statements),
}));

const key = 'Num TownOfUs.Roles.Impostor.AmbassadorRole';
const oldContent = `[Roles]\n${key} = 1\nChance TownOfUs.Roles.Impostor.AmbassadorRole = 50`;
const currentContent = oldContent.replace('= 1', '= 2');

test('replacing the old CFG keeps the category of a published Num change', async () => {
    const db = new DatabaseSync(':memory:');
    try {
        db.exec(`
            CREATE TABLE drama_afera_settings (
                id INTEGER PRIMARY KEY, versionType TEXT NOT NULL, content TEXT NOT NULL,
                revision INTEGER NOT NULL DEFAULT 0, uploadedAt TEXT NOT NULL, createdAt TEXT NOT NULL,
                updatedAt TEXT NOT NULL, deletedAt TEXT
            );
            CREATE UNIQUE INDEX active_settings ON drama_afera_settings(versionType) WHERE deletedAt IS NULL;
            CREATE TABLE role_balance_reviews (id INTEGER PRIMARY KEY, snapshot TEXT, decision TEXT, roleName TEXT, createdAt TEXT, deletedAt TEXT);
        `);
        const insertPreset = db.prepare('INSERT INTO drama_afera_settings (versionType, content, uploadedAt, createdAt, updatedAt, deletedAt) VALUES (?, ?, ?, ?, ?, ?)');
        insertPreset.run('old', oldContent, '2026-10-28', '2026-10-28', '2026-11-05', '2026-11-05');
        insertPreset.run('current', currentContent, '2026-11-04', '2026-11-04', '2026-11-04', null);
        insertPreset.run('old', oldContent, '2026-11-05', '2026-11-05', '2026-11-05', null);
        db.exec(readFileSync('prisma/migrations/0016_settings_publication_time.sql', 'utf8'));
        db.prepare("INSERT INTO role_balance_reviews VALUES (1, ?, 'buff', 'Ambassador', '2026-11-02', NULL)").run(
            JSON.stringify({ settingsChanges: [{ section: 'Roles', key, before: '1', after: '2' }] }),
        );
        const client = {
            $queryRaw: async (parts: TemplateStringsArray, ...values: SQLInputValue[]) => db.prepare(parts.join('?')).all(...values),
        };
        jest.mocked(getDatabaseClient).mockResolvedValue(client as unknown as NonNullable<Awaited<ReturnType<typeof getDatabaseClient>>>);
        jest.mocked(getCloudflareContext).mockReturnValue({ env: { DB: {
            prepare: (sql: string) => ({
                run: () => db.prepare(sql).run(),
                bind: (...values: SQLInputValue[]) => ({ run: () => db.prepare(sql).run(...values) }),
            }),
            batch: async (statements: { run: () => void }[]) => statements.forEach(statement => statement.run()),
        } } } as unknown as ReturnType<typeof getCloudflareContext>);

        await replaceDramaAferaSettings(oldContent, 'old');
        await replaceDramaAferaSettings(oldContent, 'old');
        const old = db.prepare("SELECT publishedAt, uploadedAt FROM drama_afera_settings WHERE versionType='old' AND deletedAt IS NULL").get()!;
        expect(old.publishedAt).toBe('2026-10-28');
        expect(old.uploadedAt).not.toBe(old.publishedAt);
        const changes = await getCategorizedChangelogChanges(
            { content: currentContent, uploadedAt: new Date('2026-11-04') },
            { content: oldContent, uploadedAt: new Date(String(old.uploadedAt)), publishedAt: new Date(String(old.publishedAt)) },
        );
        const id = settingId('Roles', key);
        expect(changes).toEqual([{ id, roleName: 'Ambassador', category: 'buff' }]);
        const html = renderToStaticMarkup(createElement(MiraChangelog, {
            current: currentContent, old: oldContent, categories: { [id]: 'buff' },
        }));
        expect(html).toContain('Buffs');
        expect(html).toContain('Maksymalna liczba');
        expect(html).toContain('Ambassador');
    } finally {
        db.close();
    }
});
