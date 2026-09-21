// Reading a TOU-Mira BepInEx `.cfg`.
//
// Extracted from `changelog/mira/page.tsx`, which had the only working parser embedded in a page
// component. The role pages need the same thing, and a second copy would drift exactly the way
// the four role→icon maps already had. See #317.

import { updateSettingValue } from './settingsParser';
import { MIRA_ROLE_SETTINGS } from '@/roles/_generated/miraSettings';
import { SettingTypes, type Setting } from '@/constants/settings';

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

// One-entry memo. The settings page resolves 77 roles and 37 modifiers against the same ~100 KB
// config in a single render, and re-parsing it 114 times is pure waste. Keyed on string identity,
// so a new upload misses and re-parses.
let lastParsedContent: string | null = null;
let lastParsedSections: CfgSection[] = [];

export function parseCfgSections(content: string): CfgSection[] {
    if (content === lastParsedContent) return lastParsedSections;

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

    lastParsedContent = content;
    lastParsedSections = sections;
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

/**
 * A TOU-Mira role's settings in the shape `SettingsList` already renders, so the role page needs
 * no new component.
 *
 * Built entirely from generated data plus the live `.cfg` — the hand-written `settings` on
 * `src/mira/roles/*` are not consulted. They were a transcription that had already drifted:
 * a typo in four labels, 55 entries describing options the mod no longer has, and no way to
 * match 59% of config keys. See #317.
 */
export function buildMiraRoleSettings(cfgContent: string, roleName: string): Record<string, Setting> {
    const values = getMiraRoleSettings(cfgContent, roleName);
    const declared = MIRA_ROLE_SETTINGS[roleName] ?? [];
    const out: Record<string, Setting> = {};

    // Probability first, so it heads the list as it does for legacy roles.
    const chance = values['Probability Of Appearing'];
    if (chance !== undefined) {
        out['Probability Of Appearing'] = {
            value: Number(chance),
            type: SettingTypes.Percentage,
        };
    }

    for (const def of declared) {
        const raw = values[def.label];
        if (raw === undefined) continue;

        const type = SettingTypes[def.type];
        out[def.label] = {
            value: updateSettingValue(type, raw),
            type,
            ...(def.description ? { description: def.description } : {}),
        } as Setting;
    }

    return out;
}

/** A BepInEx config always opens its role block with a `[Roles]` section. */
export function looksLikeMiraConfig(content: string): boolean {
    return /^\s*\[Roles\]\s*$/m.test(content);
}

/**
 * Appearance odds for every modifier, keyed by normalised name.
 *
 * Modifiers are not in `[Roles]` — TOU-Mira puts them in the per-team `*ModifierOptions`
 * sections as `<Name>Chance` and `<Name>Amount`. One pass over the config rather than a scan
 * per modifier.
 *
 * Only the odds, deliberately. A modifier's own options live in
 * `Modifiers.<Team>.<Name>Options`, but nothing generates their labels yet — `MIRA_ROLE_SETTINGS`
 * covers role option classes only — so naming them would mean guessing. The odds are what decides
 * whether a modifier is shown at all, which is the question this page answers. See #317.
 */
export function getMiraModifierOdds(cfgContent: string): Map<string, { chance?: number; amount?: number }> {
    const odds = new Map<string, { chance?: number; amount?: number }>();

    for (const section of parseCfgSections(cfgContent)) {
        if (!/ModifierOptions$/.test(section.name)) continue;

        for (const entry of section.entries) {
            const match = entry.key.match(/^(.*?)(Chance|Amount)$/);
            if (!match) continue;

            const token = normalizeLookupKey(match[1]);
            const parsed = Number(entry.value);
            if (!token || Number.isNaN(parsed)) continue;

            const field = match[2].toLowerCase();
            odds.set(token, { ...(odds.get(token) ?? {}), [field]: parsed });

            // A few modifiers are declared per team — ImpOverclockerChance / NeutOverclockerChance
            // — while the registry knows one "Overclocker". Index the bare name too, keeping the
            // higher of the two so a modifier enabled for either side shows as enabled. An exact
            // key always wins, because it is written last only if it exists.
            const bare = token.replace(/^(imp|neut)/, '');
            if (bare !== token && bare) {
                const previous = odds.get(bare) ?? {};
                const merged = Math.max(previous[field as 'chance' | 'amount'] ?? 0, parsed);
                odds.set(bare, { ...previous, [field]: merged });
            }
        }
    }

    return odds;
}

/**
 * Whether the uploaded pair can be diffed as TOU:Mira.
 *
 * Both sides have to be configs. Right after the first `.cfg` of a season `old` is still the
 * previous era's legacy `.txt`, and diffing a config against that yields nothing — so that case
 * falls through to the committed snapshot instead of rendering an empty changelog.
 */
export function pickMiraPair(
    current: string | null,
    old: string | null,
): { current: string; old: string } | null {
    if (!current || !old) return null;
    if (!looksLikeMiraConfig(current) || !looksLikeMiraConfig(old)) return null;
    return { current, old };
}
