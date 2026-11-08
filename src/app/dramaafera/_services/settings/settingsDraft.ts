import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';
import { parseCfgDocument, validateCfgValue } from '../../host/_utils/cfgDocument';

interface SettingsRow { id: number; versionType: string; content: string; revision: number }
export interface SettingsDraft { content: string; token: string; exists: boolean }

function snapshot(row: SettingsRow): SettingsDraft {
    return { content: row.content, token: `${row.versionType}:${row.id}:${row.revision}`, exists: row.versionType === 'draft' };
}

/** Reads never create a draft. The first edit copies the current preset. */
export async function getSettingsDraft(): Promise<SettingsDraft> {
    const { env } = await getCloudflareContext();
    const row = await env.DB.prepare(`SELECT id, versionType, content, revision FROM drama_afera_settings
        WHERE versionType IN ('current', 'draft') AND deletedAt IS NULL
        ORDER BY CASE versionType WHEN 'draft' THEN 0 ELSE 1 END LIMIT 1`).first<SettingsRow>();
    if (!row) throw new Error('Brak aktualnych ustawień. Wgraj najpierw aktualny zestaw.');
    parseCfgDocument(row.content);
    return snapshot(row);
}

/** Compare-and-swap protects edits from every entry point, including other host tabs. */
export function prepareSettingsDraftWrite(db: D1Database, content: string, token: string, afterPreviousWrite = false): D1PreparedStatement {
    const document = parseCfgDocument(content);
    for (const field of document.fields) {
        const error = validateCfgValue(field, field.value);
        if (error) throw new Error(`Nieprawidłowa wartość ${field.key}: ${error}`);
    }
    const match = /^(current|draft):(\d+):(\d+)$/.exec(token);
    if (!match) throw new Error('Nieprawidłowa wersja draftu.');
    const [, type, id, revision] = match;
    const guard = afterPreviousWrite ? ' AND changes() = 1' : '';
    return type === 'draft'
        ? db.prepare(`UPDATE drama_afera_settings SET content = ?, revision = revision + 1,
            updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND revision = ? AND versionType = 'draft' AND deletedAt IS NULL${guard}
            RETURNING id, versionType, content, revision`).bind(content, Number(id), Number(revision))
        : db.prepare(`INSERT INTO drama_afera_settings (versionType, content, revision, uploadedAt, createdAt, updatedAt)
            SELECT 'draft', ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            FROM drama_afera_settings WHERE id = ? AND revision = ? AND versionType = 'current' AND deletedAt IS NULL${guard}
            ON CONFLICT (versionType) WHERE deletedAt IS NULL DO NOTHING
            RETURNING id, versionType, content, revision`).bind(content, Number(id), Number(revision));
}

export async function saveSettingsDraft(content: string, token: string): Promise<SettingsDraft> {
    const { env } = await getCloudflareContext();
    const row = await prepareSettingsDraftWrite(env.DB, content, token).first<SettingsRow>();
    if (!row) throw new Error('Draft lub aktualne ustawienia zmieniły się w innym miejscu. Pobierz swoje zmiany do pliku, a następnie wczytaj draft ponownie.');
    return snapshot(row);
}
