import { normalizeLookupKey, parseCfgSections, stripConfigAffixes } from './miraConfig';
import { parseCfgRoleInteger } from './cfgNumber';
import type { RoleProbabilityData } from './roleProbabilities';

export const MIRA_PRESET_PATH = '%USERPROFILE%\\AppData\\LocalLow\\Innersloth\\Among Us\\mira_presets\\auavengers.tou.mira';
export const MAX_ROLE_CONFIG_BYTES = 1024 * 1024;

export interface UpdatedRoleConfig {
    content: string;
    updated: number;
    disabled: number;
    unmatched: string[];
}

/** Only changes integer Chance values in [Roles], preserving all other text verbatim. */
export function updateRoleProbabilityConfig(content: string, roles: RoleProbabilityData['roles']): UpdatedRoleConfig {
    if (content.includes('\0')) throw new Error('Plik musi być tekstowym plikiem .cfg w kodowaniu UTF-8.');
    const sections = parseCfgSections(content).filter(section => section.name === 'Roles');
    if (!sections.length) throw new Error('W pliku brakuje sekcji [Roles] z ustawieniami TOU-Mira.');
    const entries = sections.flatMap(section => section.entries);
    const values = new Map<string, string>();
    for (const entry of entries) {
        if (!/^(Num|Chance)\s/.test(entry.key)) continue;
        if (values.has(entry.key)) throw new Error('Plik zawiera powielone ustawienia ról.');
        values.set(entry.key, entry.value);
    }
    const weights = new Map(roles.map(role => [`${role.team}:${normalizeLookupKey(role.name)}`, role.weight]));
    const parts = content.split(/(\r\n|\n|\r)/);
    const result: UpdatedRoleConfig = { content: '', updated: 0, disabled: 0, unmatched: [] };
    let inRoles = false;
    let matched = 0;
    for (let index = 0; index < parts.length; index += 2) {
        const line = parts[index];
        const section = line.trim().match(/^\[([^\]]+)\]$/);
        if (section) inRoles = section[1] === 'Roles';
        if (!inRoles || !/^\s*Chance\s/.test(line)) continue;
        const match = line.match(/^(\s*Chance\s+(TownOfUs\.Roles\.[A-Za-z0-9_.]+)\s*=\s*)([^#;]*?)([ \t]*(?:[#;].*)?)$/);
        if (!match) throw new Error('Nieprawidłowy wpis Chance w sekcji [Roles].');
        const [, prefix, qualifiedName, currentText, suffix] = match;
        const current = parseCfgRoleInteger(currentText);
        if (current === undefined) throw new Error('Nieprawidłowy wpis Chance w sekcji [Roles].');
        const roleClass = qualifiedName.match(/^TownOfUs\.Roles\.(Crewmate|Impostor|Neutral)\.([A-Za-z0-9_]+)$/);
        if (!roleClass) continue; // Other game modes are outside the calculated role pools.
        const [, team, className] = roleClass;
        const token = normalizeLookupKey(stripConfigAffixes(className));
        const weight = weights.get(`${team}:${token}`);
        if (weight === undefined) {
            result.unmatched.push(stripConfigAffixes(className));
            continue;
        }
        matched++;
        if (!Number.isFinite(weight) || weight < 0 || weight > 1) throw new Error('Wyliczona waga roli jest nieprawidłowa. Odśwież stronę.');
        const maximumText = values.get(`Num ${qualifiedName}`)?.split(/[#;]/, 1)[0];
        const maximum = maximumText === undefined ? undefined : parseCfgRoleInteger(maximumText);
        if (maximum === undefined) throw new Error(`Brakuje poprawnej wartości Num dla roli ${stripConfigAffixes(className)}.`);
        if (maximum === 0) {
            result.disabled++;
            continue;
        }
        const next = Math.round(weight * 100);
        if (current !== next) result.updated++;
        parts[index] = `${prefix}${next}${suffix}`;
    }
    if (!matched) throw new Error('Nie znaleziono pasujących wpisów Chance ról TOU-Mira.');
    result.content = parts.join('');
    return result;
}
