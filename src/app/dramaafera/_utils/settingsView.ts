/**
 * Turns an uploaded settings file into the role and modifier lists the settings page renders.
 *
 * Pure, and out of the component on purpose: this is the part with the rules in it, and it used
 * to live inline in `SettingsDramaAfera.tsx` as two copies of a parser that had drifted from
 * `settingsParser.ts` and from each other.
 *
 * Nothing here writes to the imported registries. The old code did — `setting.value = …` on a
 * module-level object mutated `Roles`/`Modifiers` for every other consumer in the tab, so the
 * changelog and the role pages saw whatever this page had last parsed. Every value lands on a
 * copy. See #317.
 */
import { Roles } from "../_roles";
import { Modifiers } from "@/modifiers";
import { MiraModifiers, MiraRoles } from "@/mira";
import type { Modifier, Role } from "@/constants/rolesAndModifiers";
import { SettingTypes, type Setting } from "@/constants/settings";
import { parseSettingsFile, getMatchingFileName, updateSettingValue } from "./settingsParser";
import { buildMiraRoleSettings, getMiraModifierOdds, looksLikeMiraConfig, normalizeLookupKey } from "./miraConfig";
import { FIRST_MIRA_SEASON } from "../_constants/seasons";

export type Populated = { roles: Role[]; modifiers: Modifier[] };

/** A shallow copy with fresh settings, so the imported registry object is never written to. */
function withSettings<T extends Role | Modifier>(entry: T, settings: Record<string, Setting>): T {
    return { ...entry, settings };
}

function chanceOf(settings: Record<string, Setting>): number {
    const value = settings["Probability Of Appearing"]?.value;
    return typeof value === "number" ? value : Number(value ?? 0);
}

/** Legacy `.txt`: two lines per entry, role lines wrapped in `<color=…>`. */
export function populateLegacy(fileContent: string): Populated & {
    modSettings: Role | null;
    impostorSettings: Role | null;
} {
    const { fileContentMap, cleanedFileContentMap } = parseSettingsFile(fileContent);

    const applyTo = <T extends Role | Modifier>(entry: T): T => {
        const settings: Record<string, Setting> = {};

        for (const [key, setting] of Object.entries(entry.settings)) {
            const raw = fileContentMap.get(key);
            // `Setting` is a union discriminated on `type`, and a spread widens `value` back to
            // string | number | boolean. `updateSettingValue` is keyed on the same `type`, so the
            // pair is consistent by construction — the same cast `buildMiraRoleSettings` makes.
            settings[key] =
                raw === undefined
                    ? setting
                    : ({ ...setting, value: updateSettingValue(setting.type, raw) } as Setting);
        }

        const declaredChance = settings["Probability Of Appearing"];
        if (declaredChance) {
            const fileName = getMatchingFileName(entry.name, cleanedFileContentMap);
            const probability = fileName ? cleanedFileContentMap.get(fileName) : undefined;
            if (probability !== undefined) {
                settings["Probability Of Appearing"] = {
                    ...declaredChance,
                    value: Number.isInteger(probability) ? probability : Number(probability.toFixed(2)),
                } as Setting;
            }
        }

        return withSettings(entry, settings);
    };

    // "Mod Settings" and "Impostor Settings" are pseudo-roles in the legacy registry: they carry
    // global options rather than a playable role, so they get their own accordion and are kept
    // out of the role list.
    const isPseudoRole = (name: string) => name === "Mod Settings" || name === "Impostor Settings";

    const populatedRoles = Roles.map(applyTo);
    const populatedModifiers = Modifiers.map(applyTo);

    const activeByChance = <T extends Role | Modifier>(entry: T): boolean => {
        const fileName = getMatchingFileName(entry.name, cleanedFileContentMap);
        return !!fileName && (cleanedFileContentMap.get(fileName) ?? 0) > 0;
    };

    return {
        roles: populatedRoles.filter((role) => !isPseudoRole(role.name) && activeByChance(role)),
        modifiers: populatedModifiers.filter(activeByChance),
        modSettings: populatedRoles.find((role) => role.name === "Mod Settings") ?? null,
        impostorSettings: populatedRoles.find((role) => role.name === "Impostor Settings") ?? null,
    };
}

/** TOU-Mira `.cfg`: INI sections, values keyed by the mod's own option property names. */
export function populateMira(cfgContent: string): Populated {
    const roles = MiraRoles
        .map((role) => withSettings(role, buildMiraRoleSettings(cfgContent, role.name)))
        .filter((role) => chanceOf(role.settings) > 0);

    // Modifiers get their odds only. Their own options live in `Modifiers.<Team>.<Name>Options`
    // but nothing generates labels for those yet, so the registry's declared settings are left
    // as they are rather than half-filled from keys we cannot name.
    const odds = getMiraModifierOdds(cfgContent);
    const modifiers = MiraModifiers
        .map((modifier) => {
            const entry = odds.get(normalizeLookupKey(modifier.name));
            if (!entry) return modifier;

            const settings = { ...modifier.settings };
            if (entry.chance !== undefined) {
                settings["Probability Of Appearing"] = {
                    value: entry.chance,
                    type: SettingTypes.Percentage,
                };
            }
            if (entry.amount !== undefined) {
                settings["Maximum"] = { value: entry.amount, type: SettingTypes.Number };
            }
            return withSettings(modifier, settings);
        })
        .filter((modifier) => chanceOf(modifier.settings) > 0);

    return { roles, modifiers };
}

export type SettingsView =
    | ({ kind: 'legacy'; modSettings: Role | null; impostorSettings: Role | null } & Populated)
    | ({ kind: 'mira'; modSettings: null; impostorSettings: null } & Populated)
    /** Nothing to show: no file, or a file from the wrong era. */
    | { kind: 'awaiting' };

/**
 * Which era's data to show, decided by the **file** rather than the season.
 *
 * A `.cfg` is TOU-Mira and a `.txt` is legacy, so a season-3 page keeps working however it is
 * routed. The season only settles the disagreement: a legacy file in a TOU-Mira season is last
 * season's leftover, not this season's settings, and presenting it would show the wrong role list
 * as if it were current. Settings are zeroed at the boundary and the first `.cfg` arrives later.
 */
export function resolveSettingsView(fileContent: string | null, season: number): SettingsView {
    if (!fileContent) return { kind: 'awaiting' };

    if (looksLikeMiraConfig(fileContent)) {
        return { kind: 'mira', modSettings: null, impostorSettings: null, ...populateMira(fileContent) };
    }

    if (season >= FIRST_MIRA_SEASON) return { kind: 'awaiting' };

    return { kind: 'legacy', ...populateLegacy(fileContent) };
}
