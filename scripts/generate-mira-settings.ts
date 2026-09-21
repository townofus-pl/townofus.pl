/**
 * Derives TOU-Mira's per-role settings from the mod source, so the site never hand-transcribes
 * them again.
 *
 * Two facts make this possible, both visible in one declaration:
 *
 *   [ModdedToggleOption("TouOptionSheriffCanSelfReport")]   <- locale key -> display label
 *   public bool SheriffBodyReport { get; set; } = false;    <- property name -> .cfg key
 *
 * and `Locale/en_US.xml` maps the locale key to the English label.
 *
 * Why this exists: the labels in src/mira/roles were transcribed from that locale file by hand
 * and had already drifted — the source says "Can Shoot Neutral Benign Roles", the registry says
 * "Can Shot". That typo is also why only 41% of .cfg keys could be matched to a label. See #317.
 *
 * The TOU-Mira submodule is synced manually, so run this when it is bumped:
 *   npx tsx scripts/generate-mira-settings.ts [--mod-path <dir>]
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const DEFAULT_MOD_PATH = path.join(os.homedir(), 'Projects/dramaafera-stats-mod');

function parseArgs(argv: string[]): { modPath: string } {
    const i = argv.indexOf('--mod-path');
    return { modPath: i === -1 ? DEFAULT_MOD_PATH : argv[i + 1] };
}

function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
        const full = path.join(dir, entry);
        return statSync(full).isDirectory() ? walk(full) : [full];
    });
}

/** `<string name="Key">Label</string>` -> Map. */
function readLocale(file: string): Map<string, string> {
    const out = new Map<string, string>();
    const re = /<string\s+name="([^"]+)"\s*>([^<]*)<\/string>/g;
    for (const m of readFileSync(file, 'utf8').matchAll(re)) {
        out.set(m[1], m[2].trim());
    }
    return out;
}

interface RoleSetting {
    /** The property name, which is what appears as a key in the .cfg. */
    cfgKey: string;
    label: string;
    /** Matches the SettingTypes enum, so the existing SettingsList renders it unchanged. */
    type: 'Percentage' | 'Time' | 'Number' | 'Multiplier' | 'Boolean' | 'Text';
    /** Enum options carry a label per value; that is exactly Setting.description. */
    description?: Record<number, string>;
}

/** `MiraNumberSuffixes.Seconds` and friends decide how a number is formatted. */
function numberType(args: string): RoleSetting['type'] {
    if (/MiraNumberSuffixes\.Seconds/.test(args)) return 'Time';
    if (/MiraNumberSuffixes\.Multiplier/.test(args)) return 'Multiplier';
    if (/MiraNumberSuffixes\.Percent/.test(args)) return 'Percentage';
    return 'Number';
}

/** Type, plus per-value labels for enums. */
function describe(
    kind: string,
    args: string,
    resolve: (token: string) => string | null,
): Pick<RoleSetting, 'type' | 'description'> {
    if (/^Toggle$/i.test(kind)) return { type: 'Boolean' };

    if (/^Enum$/i.test(kind)) {
        // The attribute lists a locale key per enum value, in order.
        const arr = args.match(/\[([^\]]*"[^\]]*)\]/);
        const description: Record<number, string> = {};
        if (arr) {
            const tokens = [...arr[1].matchAll(/"([^"]+)"/g)].map((t) => t[1]);
            tokens.forEach((token, index) => {
                const label = resolve(token);
                if (label) description[index] = label;
            });
        }
        return Object.keys(description).length > 0
            ? { type: 'Number', description }
            : { type: 'Number' };
    }

    return { type: numberType(args) };
}

function main(): void {
    const { modPath } = parseArgs(process.argv.slice(2));
    const optionsDir = path.join(modPath, 'TOU-Mira/TownOfUs/Options/Roles');
    const localeFile = path.join(modPath, 'TOU-Mira/TownOfUs/Resources/Locale/en_US.xml');

    for (const [label, p] of [['options', optionsDir], ['locale', localeFile]] as const) {
        if (!existsSync(p)) {
            throw new Error(
                `TOU-Mira ${label} not found at ${p}.\n` +
                    `Pass --mod-path <dir> pointing at a dramaafera-stats-mod checkout with its submodule initialised.`,
            );
        }
    }

    const locale = readLocale(localeFile);
    const byRole = new Map<string, RoleSetting[]>();
    let fromAttribute = 0;
    let fromInline = 0;
    let literalLabels = 0;
    const unresolved: string[] = [];

    for (const file of walk(optionsDir).filter((f) => f.endsWith('.cs'))) {
        const src = readFileSync(file, 'utf8');

        // `class SheriffOptions : AbstractRoleOptionGroup<SheriffRole>` -> Sheriff
        const cls = src.match(/class\s+\w+\s*:\s*AbstractRoleOptionGroup<(\w+?)(?:Role)?>/);
        if (!cls) continue;
        const role = cls[1];

        const settings: RoleSetting[] = [];

        const resolve = (token: string): string | null => {
            // A `Tou…` token is a locale key; anything else is already the label.
            if (!token.startsWith('Tou')) {
                literalLabels += 1;
                return token;
            }
            const hit = locale.get(token);
            if (!hit) unresolved.push(`${role}: ${token}`);
            return hit ?? null;
        };

        // [ModdedNumberOption("Key", …)] \n public float PropName
        for (const m of src.matchAll(
            /\[Modded(\w+)Option\(\s*"([^"]+)"([\s\S]*?)\]\s*public\s+[\w<>.?]+\s+(\w+)\s*\{/g,
        )) {
            const label = resolve(m[2]);
            if (!label) continue;
            settings.push({ cfgKey: m[4], label, ...describe(m[1], m[3], resolve) });
            fromAttribute += 1;
        }

        // public ModdedToggleOption PropName { get; set; } = new("Key", …)
        // …and the setter-less form, with `new(` on the following line:
        // public ModdedEnumOption ReviveMode { get; } =
        //     new("TouOptionAltruistReviveType", …);
        for (const m of src.matchAll(
            /public\s+Modded(\w+)Option\s+(\w+)\s*\{\s*get;(?:\s*set;)?\s*\}\s*=\s*new\(\s*"([^"]+)"([^;]*)/g,
        )) {
            const label = resolve(m[3]);
            if (!label) continue;
            settings.push({ cfgKey: m[2], label, ...describe(m[1], m[4], resolve) });
            fromInline += 1;
        }

        if (settings.length > 0) {
            byRole.set(role, [...(byRole.get(role) ?? []), ...settings]);
        }
    }

    const sorted = [...byRole.entries()].sort(([a], [b]) => a.localeCompare(b));
    const out = `// GENERATED by scripts/generate-mira-settings.ts — do not edit by hand.
// Re-run it after bumping the TOU-Mira submodule; the submodule is synced manually.
//
// Maps each TOU-Mira role to the settings it declares: the .cfg key (the C# property name) and
// the English label (from Locale/en_US.xml, via the locale key in the option attribute). Derived
// rather than transcribed — the hand-written labels in src/mira/roles had already drifted from
// the source. See #317.

export interface MiraRoleSetting {
    /** Key as it appears in a BepInEx .cfg. */
    cfgKey: string;
    label: string;
    /** Name of a SettingTypes member. */
    type: 'Percentage' | 'Time' | 'Number' | 'Multiplier' | 'Boolean' | 'Text';
    /** Enum values, indexed as they appear in the config. */
    description?: Record<number, string>;
}

export const MIRA_ROLE_SETTINGS: Readonly<Record<string, readonly MiraRoleSetting[]>> = ${JSON.stringify(
        Object.fromEntries(sorted),
        null,
        4,
    )};
`;

    writeFileSync('src/roles/_generated/miraSettings.ts', out);

    const total = sorted.reduce((n, [, v]) => n + v.length, 0);
    console.log(`mira settings written: ${sorted.length} roles, ${total} settings`);
    console.log(`  from attributes: ${fromAttribute}   inline: ${fromInline}   literal labels: ${literalLabels}`);
    if (unresolved.length) {
        console.log(`  ⚠ ${unresolved.length} locale keys not found in en_US.xml:`);
        for (const u of unresolved.slice(0, 10)) console.log(`      ${u}`);
    }
}

main();
