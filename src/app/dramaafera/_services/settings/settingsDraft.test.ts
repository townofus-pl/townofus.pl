import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSettingsDraft, saveSettingsDraft } from './settingsDraft';

jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));
jest.mock('server-only', () => ({}), { virtual: true });
let db: DatabaseSync;
const preset = '[Roles]\nChance Sheriff = 50\n[Options]\n# Setting type: Int32\n# Acceptable value range: From 1 to 10\nCount = 2\n';
const edited = preset.replace('Count = 2', 'Count = 3');
const binding = {
    prepare: (sql: string) => {
        let values: SQLInputValue[] = [];
        const statement = {
            bind: (...args: SQLInputValue[]) => { values = args; return statement; },
            first: async () => db.prepare(sql).get(...values) ?? null,
        };
        return statement;
    },
};
beforeEach(() => {
    db = new DatabaseSync(':memory:');
    db.exec(`CREATE TABLE drama_afera_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT, versionType TEXT NOT NULL, content TEXT NOT NULL,
        uploadedAt TEXT DEFAULT CURRENT_TIMESTAMP, createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT NOT NULL, deletedAt TEXT);
        CREATE UNIQUE INDEX idx_drama_afera_settings_version_type ON drama_afera_settings(versionType) WHERE deletedAt IS NULL;`);
    db.exec(readFileSync('prisma/migrations/0015_settings_draft.sql', 'utf8'));
    db.prepare("INSERT INTO drama_afera_settings (versionType,content,updatedAt) VALUES ('current',?,CURRENT_TIMESTAMP),('old','previous',CURRENT_TIMESTAMP)").run(preset);
    (getCloudflareContext as jest.Mock).mockReturnValue({ env: { DB: binding } });
});
afterEach(() => db.close());

it('starts from current without writes, persists a full draft and leaves live presets unchanged', async () => {
    const original = await getSettingsDraft();
    expect(original).toMatchObject({ content: preset, exists: false });
    expect(db.prepare("SELECT COUNT(*) AS n FROM drama_afera_settings WHERE versionType='draft'").get()?.n).toBe(0);
    const saved = await saveSettingsDraft(edited, original.token);
    expect(saved.exists).toBe(true);
    expect(await getSettingsDraft()).toEqual(saved);
    expect(saved.content).toBe(edited);
    expect(db.prepare("SELECT content FROM drama_afera_settings WHERE versionType='current'").get()?.content).toBe(preset);
    expect(db.prepare("SELECT content FROM drama_afera_settings WHERE versionType='old'").get()?.content).toBe('previous');
});

it('rejects competing creation and stale updates without losing the first write', async () => {
    const first = await getSettingsDraft();
    const created = await saveSettingsDraft(edited, first.token);
    await expect(saveSettingsDraft(preset, first.token)).rejects.toThrow('zmieniły się');
    const newer = await saveSettingsDraft(preset, created.token);
    await expect(saveSettingsDraft(edited, created.token)).rejects.toThrow('zmieniły się');
    expect(await getSettingsDraft()).toEqual(newer);
});

it('accepts the complete shipped Mira preset as a draft', async () => {
    const initial = await getSettingsDraft();
    const content = readFileSync('public/settings/mira.cfg', 'utf8');
    expect((await saveSettingsDraft(content, initial.token)).content).toBe(content);
});

it('rejects invalid values before writing and preserves cfg text verbatim', async () => {
    const initial = await getSettingsDraft();
    await expect(saveSettingsDraft(preset.replace('Count = 2', 'Count = 99'), initial.token)).rejects.toThrow('Nieprawidłowa wartość');
    const content = '\ufeff' + edited.replaceAll('\n', '\r\n') + '# preserved comment\r\n';
    expect((await saveSettingsDraft(content, initial.token)).content).toBe(content);
});

it('ignores deleted drafts, rejects a changed current base and keeps drafts across live rotations', async () => {
    const initial = await getSettingsDraft();
    db.prepare("INSERT INTO drama_afera_settings (versionType,content,updatedAt,deletedAt) VALUES ('draft','deleted',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)").run();
    expect(await getSettingsDraft()).toEqual(initial);
    db.exec("UPDATE drama_afera_settings SET deletedAt=CURRENT_TIMESTAMP WHERE versionType='current'");
    db.prepare("INSERT INTO drama_afera_settings (versionType,content,updatedAt) VALUES ('current',?,CURRENT_TIMESTAMP)").run(edited);
    await expect(saveSettingsDraft(preset, initial.token)).rejects.toThrow('zmieniły się');
    const draft = await saveSettingsDraft(preset, (await getSettingsDraft()).token);
    db.exec("UPDATE drama_afera_settings SET deletedAt=CURRENT_TIMESTAMP WHERE versionType='current'");
    expect(await getSettingsDraft()).toEqual(draft);
});
