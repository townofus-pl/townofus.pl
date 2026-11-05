import { normalizeLookupKey } from '../../_utils/miraConfig';
import { parseCfgDocument, exportCfgDocument } from './cfgDocument';
import { isHnsField, resolveEditorField } from './editorFields';

export interface RoleSettingChange {
    section: string; key: string; label: string; before: string; after: string;
}

export function getRoleSettingsFields(content: string, roleName: string) {
    return parseCfgDocument(content).fields.filter(field => !isHnsField(field)).map(resolveEditorField)
        .filter(field => field.category === 'roles' && normalizeLookupKey(field.groupName) === normalizeLookupKey(roleName));
}

export function updateRoleSettings(content: string, roleName: string, changes: Record<string, string>) {
    const fields = getRoleSettingsFields(content, roleName);
    const allowed = new Map(fields.map(field => [field.id, field]));
    for (const id of Object.keys(changes)) {
        if (!allowed.has(id)) throw new Error('Nieprawidłowe ustawienie wybranej roli.');
    }
    const updated = exportCfgDocument(parseCfgDocument(content), changes);
    const next = new Map(parseCfgDocument(updated).fields.map(field => [field.id, field.value]));
    const diff: RoleSettingChange[] = fields.flatMap(field => {
        const after = next.get(field.id)!;
        return after === field.value ? [] : [{ section: field.section, key: field.key, label: field.label, before: field.value, after }];
    });
    return { content: updated, changes: diff };
}
