// Reading a TOU-Mira BepInEx `.cfg`.
//
// Extracted from `changelog/mira/page.tsx`, which had the only working parser embedded in a page
// component. The role pages need the same thing, and a second copy would drift exactly the way
// the four role→icon maps already had. See #317.

import { MIRA_ROLE_SETTINGS } from '@/roles/_generated/miraSettings';

export interface CfgSection {
    name: string;
    entries: Array<{ key: string; value: string }>;
}

/** Case-, space- and accent-insensitive key. `KillCooldown` and `Kill Cooldown` both collapse to `killcooldown`. */
export function normalizeLookupKey(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

/** `TownOfUs.Options.Roles.Crewmate.SheriffOptions` → `Sheriff`. */
export function stripConfigAffixes(value: string): string {
    return value
        .replace(/Options$/i, '')
        .replace(/Modifier$/i, '')
        .replace(/Role$/i, '')
        .replace(/Tou$/i, '');
}

export function parseCfgSections(content: string): CfgSection[] {
    const sections: CfgSection[] = [];

    for (const raw of content.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;

        if (line.startsWith('[') && line.endsWith(']')) {
            sections.push({ name: line.slice(1, -1).trim(), entries: [] });
            continue;
        }

        const eq = line.indexOf('=');
        if (eq === -1 || sections.length === 0) continue;

        sections[sections.length - 1].entries.push({
            key: line.slice(0, eq).trim(),
            value: line.slice(eq + 1).trim(),
        });
    }

    return sections;
}

/**
 * The settings a `.cfg` records for one role, keyed by the label TOU-Mira itself uses.
 *
 * The bridge is generated from the mod source (`MIRA_ROLE_SETTINGS`), not guessed: the option
 * attribute in the C# carries the locale key, the property name is the `.cfg` key, and
 * `en_US.xml` turns the locale key into a label. Matching on the hand-written labels in
 * `src/mira/roles` only reached 41%, because those were transcribed by hand and had drifted —
 * the source says "Can Shoot Neutral Benign Roles", the registry says "Can Shot". See #317.
 *
 * Two sources, because the config splits them:
 *   [Roles]                                       `Num`/`Chance <FQN>` — how often it appears
 *   [TownOfUs.Options.Roles.<Team>.<Role>Options] everything else, keyed by property name
 */
export function getMiraRoleSettings(cfgContent: string, roleName: string): Record<string, string> {
    const sections = parseCfgSections(cfgContent);
    const roleToken = normalizeLookupKey(stripConfigAffixes(roleName));
    const out: Record<string, string> = {};

    const declared = MIRA_ROLE_SETTINGS[roleName] ?? [];
    const labelByCfgKey = new Map(declared.map((d) => [normalizeLookupKey(d.cfgKey), d.label]));

    for (const section of sections) {
        if (section.name === 'Roles') {
            for (const entry of section.entries) {
                const m = entry.key.match(/^(Num|Chance)\s+(.+)$/);
                if (!m) continue;
                const token = normalizeLookupKey(stripConfigAffixes(m[2].split('.').at(-1) ?? ''));
                if (token !== roleToken) continue;
                out[m[1] === 'Chance' ? 'Probability Of Appearing' : 'Maximum'] = entry.value;
            }
            continue;
        }

        const sectionToken = normalizeLookupKey(stripConfigAffixes(section.name.split('.').at(-1) ?? ''));
        if (sectionToken !== roleToken) continue;

        for (const entry of section.entries) {
            const label = labelByCfgKey.get(normalizeLookupKey(entry.key));
            if (label) out[label] = entry.value;
        }
    }

    return out;
}
