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
 *   npx tsx scripts/generate-mira-settings.ts [--mod-path <dir>] [--allow-drop]
 *
 * `--allow-drop` lets the run remove settings that are in the committed file (use it only when TOU
 * itself removed options). Without it, a lost setting key stops the run before anything is written.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';

const GENERATED_SETTINGS = 'src/roles/_generated/miraSettings.ts';
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
        // Since 1.7.9 the locale writes `&` as the placeholder `[and]`, so turn it back.
        out.set(m[1], m[2].trim().replaceAll('[and]', '&'));
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
    /**
     * Enum member names in ordinal order. Since TOU-Mira 1.7.9-beta2 the .cfg writes an enum option
     * as its member name (`ReviveMode = GroupRevive`), not as its number. Left out when the enum is
     * not declared in the TOU-Mira source (for example the game's own `SystemTypes`).
     */
    names?: string[];
}

/** Enum name -> member names in declaration order. `null` when two enums share a name but differ. */
type EnumIndex = Map<string, string[] | null>;

/**
 * Enums the options use but TOU-Mira does not declare, because they belong to the game.
 * Read from `Assembly-CSharp.dll` of AmongUs.GameLibs.Steam 2026.9.29 (members 0 to 58, no gaps,
 * so the index is the value). Check it again when the game library is bumped.
 */
const GAME_ENUMS: Record<string, string[]> = {
    SystemTypes: ["Hallway", "Storage", "Cafeteria", "Reactor", "UpperEngine", "Nav", "Admin", "Electrical", "LifeSupp", "Shields", "MedBay", "Security", "Weapons", "LowerEngine", "Comms", "ShipTasks", "Doors", "Sabotage", "Decontamination", "Launchpad", "LockerRoom", "Laboratory", "Balcony", "Office", "Greenhouse", "Dropship", "Decontamination2", "Outside", "Specimens", "BoilerRoom", "VaultRoom", "Cockpit", "Armory", "Kitchen", "ViewingDeck", "HallOfPortraits", "CargoBay", "Ventilation", "Showers", "Engine", "Brig", "MeetingRoom", "Records", "Lounge", "GapRoom", "MainHall", "Medical", "Decontamination3", "Zipline", "MiningPit", "FishingDock", "RecRoom", "Lookout", "Beach", "Highlands", "Jungle", "SleepingQuarters", "MushroomMixupSabotage", "HeliSabotage"],
};

/** Reads every `enum X { A, B = 3, C }` under `dir`. Enums with explicit values are skipped. */
function readEnums(dir: string, skipped: string[]): EnumIndex {
    const index: EnumIndex = new Map();
    for (const file of walk(dir).filter((f) => f.endsWith('.cs'))) {
        const src = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
        for (const m of src.matchAll(/\benum\s+(\w+)\s*(?::\s*\w+\s*)?\{([^}]*)\}/g)) {
            const members = m[2]
                .split(',')
                .map((x) => x.replace(/\[[^\]]*\]/g, '').trim())
                .filter(Boolean);
            if (members.some((x) => x.includes('='))) {
                skipped.push(`${m[1]} (explicit values)`);
                index.set(m[1], null);
                continue;
            }
            const names = members;
            const known = index.get(m[1]);
            if (known === undefined) index.set(m[1], names);
            else if (known === null || known.join() !== names.join()) index.set(m[1], null);
        }
    }
    return index;
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
    enumType: string | undefined,
    enums: EnumIndex,
    noNames: string[],
): Pick<RoleSetting, 'type' | 'description' | 'names'> {
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
        const names = enumType ? (enums.get(enumType) ?? GAME_ENUMS[enumType]) : undefined;
        if (!names) noNames.push(`${enumType ?? '?'}`);
        return {
            type: 'Number',
            ...(Object.keys(description).length > 0 ? { description } : {}),
            ...(names ? { names } : {}),
        };
    }

    return { type: numberType(args) };
}

/**
 * The TOU-Mira release these settings describe, read from the submodule's own tag.
 *
 * Emitted here rather than typed by hand so the version always names the build the generated
 * settings come from: whoever bumps the submodule re-runs this and the version follows.
 * No page reads it for links: `/dramaafera/do_pobrania` uses the pinned league version in
 * `src/constants/miraRelease.ts` (which can lag behind the submodule) and `/instalacja-tou`
 * follows `releases/latest`. See #316.
 */
function writeMiraVersion(modPath: string): void {
    const submodule = path.join(modPath, 'TOU-Mira');
    let tag: string;
    try {
        tag = execFileSync('git', ['-C', submodule, 'describe', '--tags'], { encoding: 'utf8' }).trim();
    } catch {
        throw new Error(
            `Could not read a tag from ${submodule}. The submodule must be checked out at a ` +
                `released tag, because the settings must come from a released build.`,
        );
    }

    const version = tag.replace(/^v/, '');
    // Allow a pre-release suffix (for example `1.7.9-beta2`). `git describe` returns
    // `<tag>-<n>-g<hash>` for a commit past a tag, so that result is still rejected.
    if (!/^\d+\.\d+(\.\d+)?(-(?:alpha|beta|rc)\.?\d+)?$/.test(version)) {
        throw new Error(
            `TOU-Mira is at "${tag}", which is not a release tag (X.Y.Z or X.Y.Z-betaN). The ` +
                `settings must come from a released build, so the submodule has to sit on one.`,
        );
    }

    writeFileSync(
        'src/roles/_generated/miraVersion.ts',
        [
            '// GENERATED by scripts/generate-mira-settings.ts — do not edit by hand.',
            "// Read from the TOU-Mira submodule's tag, so it always names the build these role",
            '// settings were derived from. No page links it (see src/constants/miraRelease.ts).',
            '',
            `export const MIRA_VERSION = '${version}';`,
            '',
        ].join('\n'),
    );
    console.log(`mira version written: ${version}`);
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
    const skippedEnums: string[] = [];
    const enums = readEnums(path.join(modPath, 'TOU-Mira/TownOfUs'), skippedEnums);
    const noNames: string[] = [];
    const byRole = new Map<string, RoleSetting[]>();
    let fromAttribute = 0;
    let fromInline = 0;
    let fromList = 0;
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
            /\[Modded(\w+)Option(?:<([\w.]+)>)?\(\s*"([^"]+)"([\s\S]*?)\]\s*public\s+[\w<>.?]+\s+(\w+)\s*\{/g,
        )) {
            const label = resolve(m[3]);
            if (!label) continue;
            settings.push({ cfgKey: m[5], label, ...describe(m[1], m[4], resolve, m[2], enums, noNames) });
            fromAttribute += 1;
        }

        // Since 1.7.9 enum options are generic: `ModdedEnumOption<JestWinOptions>`, hence `(?:<…>)?`.
        // public ModdedToggleOption PropName { get; set; } = new("Key", …)
        // …and the setter-less form, with `new(` on the following line:
        // public ModdedEnumOption ReviveMode { get; } =
        //     new("TouOptionAltruistReviveType", …);
        for (const m of src.matchAll(
            /public\s+Modded(\w+)Option(?:<([\w.]+)>)?\s+(\w+)\s*\{\s*get;(?:\s*set;)?\s*\}\s*=\s*new\(\s*\$?"([^"]+)"([^;]*)/g,
        )) {
            const label = resolve(m[4]);
            if (!label) continue;
            settings.push({ cfgKey: m[3], label, ...describe(m[1], m[5], resolve, m[2], enums, noNames) });
            fromInline += 1;
        }

        // Option list: `ModdedOptionList<ModdedEnumOption<SystemTypes>> X { get; } = new(10, i => new($"TouOptionSentryBlindspot{i + 1}Room", …)) { ConfigName = i => $"Blindspot{i + 1}Room" }`
        // One declaration gives N settings, so the plain patterns do not see it. Handle it explicitly.
        for (const m of src.matchAll(
            /ModdedOptionList<Modded(\w+)Option<([\w.]+)>>\s+\w+\s*\{\s*get;\s*\}\s*=\s*new\(\s*(\d+)\s*,\s*i\s*=>\s*new\(\$"([^"]*)\{i \+ 1\}([^"]*)"[\s\S]*?ConfigName\s*=\s*i\s*=>\s*\$"([^"]*)\{i \+ 1\}([^"]*)"/g,
        )) {
            for (let i = 1; i <= Number(m[3]); i += 1) {
                const label = resolve(`${m[4]}${i}${m[5]}`);
                if (!label) continue;
                settings.push({
                    cfgKey: `${m[6]}${i}${m[7]}`,
                    label,
                    ...describe(m[1], '', resolve, m[2], enums, noNames),
                });
                fromList += 1;
            }
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
    /**
     * Enum member names in ordinal order. Since 1.7.9-beta2 the .cfg writes an enum option as its
     * member name (ReviveMode = GroupRevive), older builds as its number. Absent when the enum is not
     * declared in the TOU-Mira source.
     */
    names?: readonly string[];
}

export const MIRA_ROLE_SETTINGS: Readonly<Record<string, readonly MiraRoleSetting[]>> = ${JSON.stringify(
        Object.fromEntries(sorted),
        null,
        4,
    )};
`;

    const total = sorted.reduce((n, [, v]) => n + v.length, 0);

    // Guard: the patterns above are regexes, so a syntax change in TOU-Mira can silently lose
    // dozens of settings (as with generic `ModdedEnumOption<T>` in 1.7.9). Compare the SETS of
    // `Role.cfgKey` keys, not only the count: 10 new settings must not hide 10 lost ones.
    // A lost key stops the run before anything is written. If TOU really removed options,
    // run with `--allow-drop`.
    const keyOf = (role: string, cfgKey: string) => `${role}.${cfgKey}`;
    const current = new Set(sorted.flatMap(([role, list]) => list.map((x) => keyOf(role, x.cfgKey))));
    const previous = new Set<string>();
    if (existsSync(GENERATED_SETTINGS)) {
        const prev = readFileSync(GENERATED_SETTINGS, 'utf8');
        const start = prev.indexOf('MIRA_ROLE_SETTINGS');
        const body = prev.slice(start).replace(/^[^=]*=\s*/, '').replace(/;\s*$/, '');
        const parsed = JSON.parse(body) as Record<string, { cfgKey: string }[]>;
        for (const [role, list] of Object.entries(parsed)) {
            for (const x of list) previous.add(keyOf(role, x.cfgKey));
        }
    }
    const lost = [...previous].filter((k) => !current.has(k));
    if (lost.length > 0 && !process.argv.includes('--allow-drop')) {
        throw new Error(
            `${lost.length} setting(s) in the committed file are missing from the new output ` +
                `(${lost.slice(0, 10).join(', ')}${lost.length > 10 ? ', …' : ''}). A regex probably no ` +
                `longer matches the TOU-Mira source. Fix the generator, or pass --allow-drop if TOU removed options.`,
        );
    }

    writeFileSync(GENERATED_SETTINGS, out);
    writeMiraVersion(modPath);

    console.log(`mira settings written: ${sorted.length} roles, ${total} settings`);
    console.log(`  from attributes: ${fromAttribute}   inline: ${fromInline}   list: ${fromList}   literal labels: ${literalLabels}`);
    const withNames = sorted.reduce((n, [, v]) => n + v.filter((x) => x.names).length, 0);
    console.log(`  enum options with member names: ${withNames}   without: ${noNames.length} (${[...new Set(noNames)].join(', ') || '-'})`);
    if (skippedEnums.length) console.log(`  enums skipped: ${skippedEnums.join(', ')}`);
    if (unresolved.length) {
        console.log(`  ⚠ ${unresolved.length} locale keys not found in en_US.xml:`);
        for (const u of unresolved.slice(0, 10)) console.log(`      ${u}`);
    }
}

main();
