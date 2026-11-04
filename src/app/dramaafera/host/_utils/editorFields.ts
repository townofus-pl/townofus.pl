import { MiraModifiers, MiraRoles, MiraSettings } from '@/mira';
import { SettingTypes, type Setting } from '@/constants/settings';
import { MIRA_ROLE_SETTINGS } from '@/roles/_generated/miraSettings';
import { normalizeLookupKey, stripConfigAffixes } from '../../_utils/miraConfig';
import { SETTING_BINDINGS } from './settingBindings';
import type { CfgField } from './cfgDocument';

export type EditorCategory = 'general' | 'roles' | 'modifiers' | 'advanced';
export interface EditorField extends CfgField {
    label: string;
    groupId: string;
    groupName: string;
    category: EditorCategory;
    icon?: string;
    color?: string;
    unit?: string;
    description?: Record<number, string>;
    mapped: boolean;
}

const humanize = (value: string) => value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/_/g, ' ');
const tokenOf = (value: string) => normalizeLookupKey(stripConfigAffixes(value.split('.').at(-1) ?? value));

/** HnS also has individual options inside ordinary role sections (e.g. MysticHnsPopUp). */
export function isHnsField(field: CfgField): boolean {
    return /hns|hide[\s_-]*and[\s_-]*seek/i.test(`${field.section} ${field.key}`);
}

function findEntity<T extends { name: string; id: string }>(entries: readonly T[], token: string): T | undefined {
    return entries.find(entry => normalizeLookupKey(entry.name) === token ||
        normalizeLookupKey(entry.id.replace(/^mira_/, '')) === token);
}

function unit(type?: SettingTypes): string | undefined {
    return type === SettingTypes.Time ? 's' : type === SettingTypes.Percentage ? '%' :
        type === SettingTypes.Multiplier ? '×' : undefined;
}

function registrySetting(field: CfgField, settings: Record<string, Setting>, generatedLabel?: string): [string, Setting] | undefined {
    const entries = Object.entries(settings).filter(([label]) => label !== 'Probability Of Appearing');
    const exact = entries.find(([label]) => normalizeLookupKey(label) === normalizeLookupKey(field.key) ||
        (generatedLabel !== undefined && normalizeLookupKey(label) === normalizeLookupKey(generatedLabel)));
    if (exact) return exact;
    const index = SETTING_BINDINGS[field.section]?.[field.key];
    return index === undefined ? undefined : entries[index];
}

/** Reuse display metadata, but keep the CFG section and key as the only write identity. */
export function resolveEditorField(field: CfgField): EditorField {
    const token = tokenOf(field.section);
    const result: EditorField = {
        ...field,
        label: humanize(field.key),
        groupId: field.section,
        groupName: humanize(stripConfigAffixes(field.section.split('.').at(-1) ?? field.section)),
        category: 'advanced',
        mapped: false,
    };
    if (isHnsField(field)) return result;

    const odds = field.section === 'Roles' ? field.key.match(/^(Num|Chance)\s+(.+)$/) : null;
    const role = findEntity(MiraRoles, odds ? tokenOf(odds[2]) : token);
    if (role && (odds || field.section.includes('.Roles.'))) {
        Object.assign(result, { groupId: `role:${role.id}`, groupName: role.name, category: 'roles', icon: role.icon, color: role.color });
        if (odds) {
            result.label = odds[1] === 'Num' ? 'Maksymalna liczba' : 'Szansa wystąpienia';
            result.unit = odds[1] === 'Chance' ? '%' : undefined;
            result.mapped = true;
            return result;
        }
        const definition = MIRA_ROLE_SETTINGS[role.name]?.find(setting => setting.cfgKey === field.key);
        const registry = registrySetting(field, role.settings, definition?.label);
        if (registry || definition) {
            result.label = registry?.[0] ?? definition!.label;
            result.description = registry?.[1].description ?? definition?.description;
            result.unit = unit(registry?.[1].type ?? (definition ? SettingTypes[definition.type] : undefined));
            result.mapped = true;
        }
        return result;
    }

    const modifier = field.section.includes('.Modifiers.') ? findEntity(MiraModifiers, token) : undefined;
    // Global cfgKey values are literal group names: RoleOptions must retain "Role".
    const groupToken = normalizeLookupKey((field.section.split('.').at(-1) ?? '').replace(/Options$/i, ''));
    const group = !field.section.includes('.Modifiers.') ? MiraSettings.find(entry => normalizeLookupKey(entry.cfgKey) === groupToken) : undefined;
    if (modifier) Object.assign(result, { groupName: modifier.name, category: 'modifiers', icon: modifier.icon, color: modifier.color });
    if (group) Object.assign(result, { groupName: group.name, category: 'general' });
    if (/ModifierOptions$/.test(field.section)) {
        result.category = 'modifiers';
        const match = field.key.match(/^(.*?)(Chance|Amount)$/);
        if (match) {
            const name = findEntity(MiraModifiers, normalizeLookupKey(match[1]));
            result.label = `${name?.name ?? humanize(match[1])} — ${match[2] === 'Chance' ? 'szansa wystąpienia' : 'maksymalna liczba'}`;
            result.unit = match[2] === 'Chance' ? '%' : undefined;
            result.mapped = true;
        }
        return result;
    }

    const settings: Record<string, Setting> | undefined = modifier?.settings ?? group?.settings;
    const registry = settings ? registrySetting(field, settings) : undefined;
    const label = registry?.[0];
    const definition = registry?.[1];
    if (label && definition) {
        result.label = label;
        result.description = definition.description;
        result.unit = unit(definition.type);
        result.mapped = true;
    }
    return result;
}

export function safeCfgFileName(name: string): string {
    const base = name.replace(/\.cfg$/i, '').replace(/[<>:"/\\|?*\x00-\x1F]/g, '').replace(/[. ]+$/g, '').trim().slice(0, 100);
    return `${base || 'moje-ustawienia'}.cfg`;
}

/** Use all fields so searching or showing only changed options cannot hide the role's Num. */
export function sortRoleGroups(groups: EditorField[][], fields: readonly EditorField[], changes: Readonly<Record<string, string>>): EditorField[][] {
    const disabledRoles = new Set(fields.filter(field => {
        if (field.category !== 'roles' || field.section !== 'Roles' || !/^Num\s+/.test(field.key)) return false;
        const value = (changes[field.id] ?? field.value).trim();
        return value !== '' && Number(value.replace(',', '.')) === 0;
    }).map(field => field.groupId));
    return [...groups].sort((left, right) => Number(disabledRoles.has(left[0].groupId)) - Number(disabledRoles.has(right[0].groupId)));
}
