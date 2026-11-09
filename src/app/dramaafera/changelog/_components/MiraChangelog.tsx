"use client";

import { useMemo, useState } from "react";
import { SettingsChangesCard } from "../../_components/SettingsChangesCard";
import { formatValue, normalizeSettingValue } from "../../_utils/formatSettingValue";
import { MiraModifiers, MiraRoles, MiraSettings } from "@/mira";
import { RoleOrModifierTypes } from "@/constants/rolesAndModifiers";
import { SettingTypes, type Setting } from "@/constants/settings";
import { Teams } from "@/constants/teams";
import { REVIEW_CATEGORIES, type ChangelogCategories, type ReviewCategory } from "../_categories";
import { parseSections, settingId } from "../_miraConfigSections";

type GroupKind = "role" | "modifier" | "section";

type MiraEntity = (typeof MiraRoles)[number] | (typeof MiraModifiers)[number];
type MiraSettingGroup = (typeof MiraSettings)[number];

interface Change {
    category: ReviewCategory | undefined;
    groupName: string;
    settingName: string;
    oldValue: string;
    newValue: string;
    groupKind: GroupKind;
    groupTeam: Teams | null;
    groupColor: string;
    groupIcon: string | null;
    groupOrder: number;
}

interface ParsedEntry {
    fieldId?: string;
    groupName: string;
    settingName: string;
    comparisonKey: string;
    value: string;
    groupKind: GroupKind;
    groupTeam: Teams | null;
    groupColor: string;
    groupIcon: string | null;
    groupOrder: number;
    settingType: SettingTypes;
    description?: Record<number, string>;
}

const miraEntities: readonly MiraEntity[] = [...MiraRoles, ...MiraModifiers];
const rolePreferredNames = new Set(["investigator", "spy"]);

const entityLookup = new Map<string, MiraEntity>();

for (const entity of miraEntities) {
    const candidates = [
        entity.name,
        entity.name.replace(/\s+/g, ""),
        entity.id,
        entity.id.replace(/^mira_/, ""),
        entity.id.replace(/^mira_/, "").replace(/_/g, ""),
    ];

    for (const candidate of candidates) {
        entityLookup.set(normalizeLookupKey(candidate), entity);
    }
}

const settingGroupLookup = new Map<string, MiraSettingGroup>();

for (const group of MiraSettings) {
    for (const candidate of [group.cfgKey, group.name, group.id]) {
        settingGroupLookup.set(normalizeLookupKey(candidate), group);
    }
}

function normalizeLookupKey(value: string): string {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
}

function humanizeIdentifier(value: string): string {
    const withSpaces = value
        .replace(/_/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");

    return withSpaces.replace(/\s+/g, " ").trim();
}

function stripConfigAffixes(value: string): string {
    return value
        .replace(/Options$/i, "")
        .replace(/Modifier$/i, "")
        .replace(/Role$/i, "")
        .replace(/Tou$/i, "");
}

function isHideAndSeekSection(sectionName: string): boolean {
    return sectionName.split(".").some((part) => part === "HideAndSeek" || /^Hns/i.test(part));
}

function getEntityFromToken(token: string): MiraEntity | undefined {
    const strippedToken = stripConfigAffixes(token);
    const normalizedToken = normalizeLookupKey(strippedToken);

    if (rolePreferredNames.has(normalizedToken)) {
        const roleMatch = MiraRoles.find((role) => normalizeLookupKey(role.name) === normalizedToken);
        if (roleMatch) {
            return roleMatch;
        }
    }

    const directMatch = entityLookup.get(normalizeLookupKey(strippedToken));

    if (directMatch) {
        return directMatch;
    }

    return entityLookup.get(normalizeLookupKey(token));
}

function getSectionLabel(sectionName: string): string {
    const lastToken = sectionName.split(".").at(-1) ?? sectionName;
    return humanizeIdentifier(stripConfigAffixes(lastToken));
}

function getSettingGroupFromSection(sectionName: string): MiraSettingGroup | undefined {
    const lastToken = sectionName.split(".").at(-1) ?? sectionName;
    const cfgKey = lastToken.replace(/Options$/i, "");

    return settingGroupLookup.get(normalizeLookupKey(cfgKey));
}

function isRoleOrModifierSection(sectionName: string): boolean {
    return sectionName.includes(".Roles.") || sectionName.includes(".Modifiers.");
}

function getEntityFromSection(sectionName: string): MiraEntity | undefined {
    const lastToken = sectionName.split(".").at(-1) ?? sectionName;
    const entityToken = stripConfigAffixes(lastToken);

    if (rolePreferredNames.has(normalizeLookupKey(entityToken))) {
        const roleMatch = MiraRoles.find((role) => normalizeLookupKey(role.name) === normalizeLookupKey(entityToken));
        if (roleMatch) {
            return roleMatch;
        }
    }

    return getEntityFromToken(entityToken);
}

function getOrderedSettingDefinitions(entity: MiraEntity): Array<[string, Setting]> {
    return Object.entries(entity.settings).filter(([label]) => label !== "Probability Of Appearing");
}

function createEntityEntry(params: {
    fieldId?: string;
    entity: MiraEntity;
    sectionOrder: number;
    settingName: string;
    settingType: SettingTypes;
    description?: Record<number, string>;
    value: string;
}): ParsedEntry {
    return {
        fieldId: params.fieldId,
        groupName: params.entity.name,
        settingName: params.settingName,
        comparisonKey: `${params.entity.id}::${normalizeLookupKey(params.settingName)}`,
        value: params.value,
        groupKind: params.entity.type === RoleOrModifierTypes.Role ? "role" : "modifier",
        groupTeam: params.entity.team,
        groupColor: params.entity.color,
        groupIcon: params.entity.icon,
        groupOrder: params.sectionOrder,
        settingType: params.settingType,
        description: params.description,
    };
}

function createSectionEntry(params: {
    groupName: string;
    groupId: string;
    sectionOrder: number;
    settingName: string;
    settingType: SettingTypes;
    description?: Record<number, string>;
    value: string;
}): ParsedEntry {
    return {
        groupName: params.groupName,
        settingName: params.settingName,
        comparisonKey: `${params.groupId}::${normalizeLookupKey(params.settingName)}`,
        value: params.value,
        groupKind: "section",
        groupTeam: null,
        groupColor: "#4B5563",
        groupIcon: null,
        groupOrder: params.sectionOrder,
        settingType: params.settingType,
        description: params.description,
    };
}

function parseConfigFile(content: string): Map<string, ParsedEntry> {
    const sections = parseSections(content);
    const entries = new Map<string, ParsedEntry>();

    sections.forEach((section, sectionOrder) => {
        if (section.name === "Roles") {
            for (const entry of section.entries) {
                const match = entry.key.match(/^(Num|Chance)\s+(.+)$/);
                if (!match) {
                    continue;
                }

                if (match[2].split(".").includes("HideAndSeek")) {
                    continue;
                }

                const roleToken = match[2].split(".").at(-1) ?? match[2];
                const entity = getEntityFromToken(roleToken);
                if (!entity) {
                    continue;
                }

                const settingName = "Probability Of Appearing";
                entries.set(
                    `${entity.id}::${normalizeLookupKey(settingName)}`,
                    createEntityEntry({
                        fieldId: settingId(section.name, entry.key),
                        entity,
                        sectionOrder,
                        settingName,
                        settingType: SettingTypes.Percentage,
                        value: entry.value,
                    })
                );
            }

            return;
        }

        if (isHideAndSeekSection(section.name)) {
            return;
        }

        if (section.name.endsWith("ModifierOptions")) {
            for (const entry of section.entries) {
                const probabilityMatch = entry.key.match(/^(.+?)Chance$/);
                if (!probabilityMatch) {
                    continue;
                }

                const modifier = MiraModifiers.find(
                    (candidate) => normalizeLookupKey(candidate.name) === normalizeLookupKey(probabilityMatch[1])
                );
                if (!modifier) {
                    continue;
                }

                const settingName = "Probability Of Appearing";
                entries.set(
                    `${modifier.id}::${normalizeLookupKey(settingName)}`,
                    createEntityEntry({
                        entity: modifier,
                        sectionOrder,
                        settingName,
                        settingType: SettingTypes.Percentage,
                        value: entry.value,
                    })
                );
            }

            return;
        }

        if (!isRoleOrModifierSection(section.name)) {
            const settingGroup = getSettingGroupFromSection(section.name);

            if (settingGroup) {
                const orderedSettings = Object.entries(settingGroup.settings);

                section.entries.forEach((entry, entryIndex) => {
                    const setting = orderedSettings[entryIndex];
                    const settingName = setting?.[0] ?? humanizeIdentifier(entry.key);
                    const settingDefinition = setting?.[1];

                    entries.set(
                        `${settingGroup.id}::${normalizeLookupKey(settingName)}`,
                        createSectionEntry({
                            groupName: settingGroup.name,
                            groupId: settingGroup.id,
                            sectionOrder,
                            settingName,
                            settingType: settingDefinition?.type ?? inferTypeFromValue(entry.value),
                            description: settingDefinition?.description,
                            value: entry.value,
                        })
                    );
                });

                return;
            }
        }

        const sectionEntity = getEntityFromSection(section.name);

        if (sectionEntity && !section.name.endsWith("ModifierOptions")) {
            const orderedSettings = getOrderedSettingDefinitions(sectionEntity);

            section.entries.forEach((entry, entryIndex) => {
                const setting = orderedSettings[entryIndex];
                const settingName = setting?.[0] ?? humanizeIdentifier(entry.key);
                const settingDefinition = setting?.[1];

                entries.set(
                    `${sectionEntity.id}::${normalizeLookupKey(settingName)}`,
                    createEntityEntry({
                        fieldId: settingId(section.name, entry.key),
                        entity: sectionEntity,
                        sectionOrder,
                        settingName,
                        settingType: settingDefinition?.type ?? inferTypeFromValue(entry.value),
                        description: settingDefinition?.description,
                        value: entry.value,
                    })
                );
            });

            return;
        }

        for (const entry of section.entries) {
            const probabilityMatch = entry.key.match(/^(.+?)(Chance|Amount)$/);

            if (probabilityMatch) {
                const entity = getEntityFromToken(probabilityMatch[1]);
                if (entity) {
                    const settingName = probabilityMatch[2] === "Chance" ? "Probability Of Appearing" : humanizeIdentifier(probabilityMatch[2]);
                    entries.set(
                        `${entity.id}::${normalizeLookupKey(settingName)}`,
                        createEntityEntry({
                            entity,
                            sectionOrder,
                            settingName,
                            settingType: probabilityMatch[2] === "Chance" ? SettingTypes.Percentage : SettingTypes.Number,
                            value: entry.value,
                        })
                    );
                    continue;
                }
            }

            entries.set(
                `${section.name}::${normalizeLookupKey(entry.key)}`,
                createSectionEntry({
                    groupName: getSectionLabel(section.name),
                    groupId: section.name,
                    sectionOrder,
                    settingName: humanizeIdentifier(entry.key),
                    settingType: inferTypeFromValue(entry.value),
                    value: entry.value,
                })
            );
        }
    });

    return entries;
}

function inferTypeFromValue(value: string): SettingTypes {
    if (/^(true|false)$/i.test(value)) {
        return SettingTypes.Boolean;
    }

    if (/^-?\d+(?:[.,]\d+)?$/.test(value)) {
        return SettingTypes.Number;
    }

    return SettingTypes.Text;
}

const categoryTitles: Record<ReviewCategory, string> = {
    emperor_decree: "DEKRET EMPERORA",
    buff: "Buffs",
    nerf: "Nerfs",
    adjustment: "Adjustments",
};

/**
 * The TOU:Mira view of the changelog. Rendered by `/dramaafera/changelog` when the settings pair
 * is a TOU:Mira config; there is no `/changelog/mira` URL.
 *
 * Takes the pair as props rather than fetching it. The page reads the database server-side and
 * decides which era to render, so this component has no loading or error state of its own — one
 * source of truth for "which changelog", and no second round trip from the browser.
 */
export function MiraChangelog({ current, old, categories }: { current: string; old: string; categories?: ChangelogCategories }) {
    const [showProbabilities, setShowProbabilities] = useState(false);
    const changes = useMemo<Change[]>(() => {
        const currentData = parseConfigFile(current);
        const oldData = parseConfigFile(old);
        const detected: Change[] = [];

        for (const [comparisonKey, currentEntry] of currentData.entries()) {
            const oldEntry = oldData.get(comparisonKey);

            if (!oldEntry || oldEntry.value === currentEntry.value) {
                continue;
            }

            const processedOldValue = normalizeSettingValue(oldEntry.value, currentEntry.settingType);
            const processedNewValue = normalizeSettingValue(currentEntry.value, currentEntry.settingType);

            detected.push({
                category: currentEntry.fieldId ? categories?.[currentEntry.fieldId] : undefined,
                groupName: currentEntry.groupName,
                settingName: currentEntry.settingName,
                oldValue: formatValue(processedOldValue, currentEntry.settingType, currentEntry.description),
                newValue: formatValue(processedNewValue, currentEntry.settingType, currentEntry.description),
                groupKind: currentEntry.groupKind,
                groupTeam: currentEntry.groupTeam,
                groupColor: currentEntry.groupColor,
                groupIcon: currentEntry.groupIcon,
                groupOrder: currentEntry.groupOrder,
            });
        }

        return detected;
    }, [current, old, categories]);

    const groupedChanges = useMemo(() => {
        const grouped = changes.reduce((accumulator, change) => {
            if (!showProbabilities && change.settingName === "Probability Of Appearing") return accumulator;
            if (!accumulator[change.groupName]) {
                accumulator[change.groupName] = [];
            }

            accumulator[change.groupName].push(change);
            return accumulator;
        }, {} as Record<string, Change[]>);

        Object.values(grouped).forEach((groupChanges) => {
            groupChanges.sort((left, right) => {
                const leftIsProbability = left.settingName === "Probability Of Appearing";
                const rightIsProbability = right.settingName === "Probability Of Appearing";

                if (leftIsProbability !== rightIsProbability) {
                    return leftIsProbability ? -1 : 1;
                }

                return 0;
            });
        });

        return Object.entries(grouped).sort(([, leftChanges], [, rightChanges]) => {
            const left = leftChanges[0];
            const right = rightChanges[0];

            if (left.groupKind !== right.groupKind) {
                const order: Record<GroupKind, number> = {
                    role: 1,
                    modifier: 2,
                    section: 3,
                };

                return order[left.groupKind] - order[right.groupKind];
            }

            if (left.groupKind === "role" && right.groupKind === "role") {
                const teamOrder: Record<Teams, number> = {
                    [Teams.Crewmate]: 1,
                    [Teams.Neutral]: 2,
                    [Teams.Assailant]: 3,
                    [Teams.Impostor]: 4,
                    [Teams.All]: 5,
                };

                const leftTeamOrder = left.groupTeam ? teamOrder[left.groupTeam] : 999;
                const rightTeamOrder = right.groupTeam ? teamOrder[right.groupTeam] : 999;

                if (leftTeamOrder !== rightTeamOrder) {
                    return leftTeamOrder - rightTeamOrder;
                }
            }

            if (left.groupOrder !== right.groupOrder) {
                return left.groupOrder - right.groupOrder;
            }

            return left.groupName.localeCompare(right.groupName, "pl");
        });
    }, [changes, showProbabilities]);

    return (
        <div className="container mx-auto">
            <label className="mb-6 flex w-fit cursor-pointer items-center gap-3 font-barlow text-white">
                <input type="checkbox" role="switch" checked={showProbabilities} onChange={event => setShowProbabilities(event.target.checked)}
                    className="peer sr-only" />
                <span aria-hidden="true" className="relative h-6 w-11 rounded-full bg-zinc-700 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-blue-600 peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-yellow-400" />
                Show Probabilities of Appearing
            </label>
            {groupedChanges.length === 0 ? (
                <div className="text-center text-2xl text-gray-600">
                    Brak zmian do wyświetlenia
                </div>
            ) : (
                <div className="space-y-8">
                    {[...REVIEW_CATEGORIES, undefined].map(category => {
                        const groups = groupedChanges.map(([, changes]) => changes.filter(change => change.category === category))
                            .filter(changes => changes.length > 0);
                        if (!groups.length) return null;
                        return (
                            <section key={category ?? "other"} className="space-y-4">
                                <h2 className="font-brook text-4xl text-white">{category ? categoryTitles[category] : "Pozostałe zmiany"}</h2>
                                {groups.map(groupChanges => {
                                    const group = groupChanges[0];
                                    return <SettingsChangesCard key={group.groupName} name={group.groupName} color={group.groupColor} icon={group.groupIcon}
                                        changes={groupChanges.map(change => ({ name: change.settingName, before: change.oldValue, after: change.newValue }))} />;
                                })}
                            </section>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
