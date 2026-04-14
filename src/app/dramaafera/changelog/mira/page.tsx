"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { MiraModifiers, MiraRoles } from "@/mira";
import { RoleOrModifierTypes } from "@/constants/rolesAndModifiers";
import { SettingTypes, type Setting } from "@/constants/settings";
import { Teams } from "@/constants/teams";

type GroupKind = "role" | "modifier" | "section";

type MiraEntity = (typeof MiraRoles)[number] | (typeof MiraModifiers)[number];

interface Change {
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
        .replace(/Tou$/i, "")
        .replace(/^Hns/i, "");
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

function normalizeSettingValue(value: string, type: SettingTypes): string | number | boolean {
    switch (type) {
        case SettingTypes.Boolean:
            return value.toLowerCase() === "true";
        case SettingTypes.Number:
        case SettingTypes.Percentage:
        case SettingTypes.Time:
        case SettingTypes.Multiplier: {
            const parsed = Number(value.replace(/,/g, "."));
            if (Number.isNaN(parsed)) {
                return value;
            }

            return Number.isInteger(parsed) ? parsed : Number(parsed.toFixed(2));
        }
        case SettingTypes.Text:
        default:
            return value;
    }
}

function formatValue(value: string | number | boolean, type: SettingTypes, description?: Record<number, string>): string {
    if (description) {
        let valueToCheck: number | null = null;

        if (typeof value === "number") {
            valueToCheck = value;
        } else if (typeof value === "string") {
            const parsed = Number(value);
            if (!Number.isNaN(parsed)) {
                valueToCheck = parsed;
            }
        }

        if (valueToCheck !== null && description[valueToCheck]) {
            return description[valueToCheck];
        }
    }

    switch (type) {
        case SettingTypes.Percentage:
            if (typeof value === "number" && value < 0) {
                return "x%";
            }

            return `${value}%`;
        case SettingTypes.Time:
            return `${value}s`;
        case SettingTypes.Boolean:
            return value ? "✓" : "✗";
        case SettingTypes.Number:
            return value.toString();
        case SettingTypes.Multiplier:
            return `${value}x`;
        case SettingTypes.Text:
        default:
            return value.toString();
    }
}

function resolveSettingDefinition(entity: MiraEntity, rawSettingKey: string): { label: string; setting: Setting } | null {
    const normalizedKey = normalizeLookupKey(rawSettingKey);

    for (const [label, setting] of Object.entries(entity.settings)) {
        if (normalizeLookupKey(label) === normalizedKey) {
            return { label, setting };
        }
    }

    return null;
}

function getSectionLabel(sectionName: string): string {
    const lastToken = sectionName.split(".").at(-1) ?? sectionName;
    return humanizeIdentifier(stripConfigAffixes(lastToken));
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

function parseSections(content: string): Array<{ name: string; entries: Array<{ key: string; value: string }> }> {
    const lines = content.split(/\r?\n/).map((line) => line.trim());
    const sections: Array<{ name: string; entries: Array<{ key: string; value: string }> }> = [];
    let currentSectionName = "";

    for (const line of lines) {
        if (!line || line.startsWith("#")) {
            continue;
        }

        if (line.startsWith("[") && line.endsWith("]")) {
            currentSectionName = line.slice(1, -1).trim();
            sections.push({ name: currentSectionName, entries: [] });
            continue;
        }

        const equalsIndex = line.indexOf("=");
        if (equalsIndex === -1 || sections.length === 0) {
            continue;
        }

        sections[sections.length - 1].entries.push({
            key: line.slice(0, equalsIndex).trim(),
            value: line.slice(equalsIndex + 1).trim(),
        });
    }

    return sections;
}

function getOrderedSettingDefinitions(entity: MiraEntity): Array<[string, Setting]> {
    return Object.entries(entity.settings).filter(([label]) => label !== "Probability Of Appearing");
}

function createEntityEntry(params: {
    entity: MiraEntity;
    sectionOrder: number;
    settingName: string;
    settingType: SettingTypes;
    description?: Record<number, string>;
    value: string;
}): ParsedEntry {
    return {
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
    sectionName: string;
    sectionOrder: number;
    settingName: string;
    settingType: SettingTypes;
    value: string;
}): ParsedEntry {
    return {
        groupName: getSectionLabel(params.sectionName),
        settingName: params.settingName,
        comparisonKey: `${params.sectionName}::${normalizeLookupKey(params.settingName)}`,
        value: params.value,
        groupKind: "section",
        groupTeam: null,
        groupColor: "#4B5563",
        groupIcon: null,
        groupOrder: params.sectionOrder,
        settingType: params.settingType,
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

                const roleToken = match[2].split(".").at(-1) ?? match[2];
                const entity = getEntityFromToken(roleToken);
                if (!entity) {
                    continue;
                }

                const settingName = "Probability Of Appearing";
                entries.set(
                    `${entity.id}::${normalizeLookupKey(settingName)}`,
                    createEntityEntry({
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
                    sectionName: section.name,
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

export default function MiraChangelogPage() {
    const [changes, setChanges] = useState<Change[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadChanges = async () => {
            try {
                const [currentResponse, oldResponse] = await Promise.all([
                    fetch("/settings/mira.cfg"),
                    fetch("/settings/mira_old.cfg"),
                ]);

                if (!currentResponse.ok || !oldResponse.ok) {
                    throw new Error("Brak plików cfg Mira");
                }

                const [currentContent, oldContent] = await Promise.all([
                    currentResponse.text(),
                    oldResponse.text(),
                ]);

                const currentData = parseConfigFile(currentContent);
                const oldData = parseConfigFile(oldContent);
                const detectedChanges: Change[] = [];

                for (const [comparisonKey, currentEntry] of currentData.entries()) {
                    const oldEntry = oldData.get(comparisonKey);

                    if (!oldEntry || oldEntry.value === currentEntry.value) {
                        continue;
                    }

                    const processedOldValue = normalizeSettingValue(oldEntry.value, currentEntry.settingType);
                    const processedNewValue = normalizeSettingValue(currentEntry.value, currentEntry.settingType);

                    detectedChanges.push({
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

                setChanges(detectedChanges);
            } catch (loadError) {
                console.error("Błąd podczas ładowania zmian Mira:", loadError);
                setError("Nie udało się załadować plików `mira.cfg` i `mira_old.cfg` z `public/settings/`.");
            } finally {
                setLoading(false);
            }
        };

        loadChanges();
    }, []);

    const groupedChanges = useMemo(() => {
        const grouped = changes.reduce((accumulator, change) => {
            if (!accumulator[change.groupName]) {
                accumulator[change.groupName] = [];
            }

            accumulator[change.groupName].push(change);
            return accumulator;
        }, {} as Record<string, Change[]>);

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
                    [Teams.Impostor]: 3,
                    [Teams.All]: 4,
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
    }, [changes]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="font-brook text-8xl mb-8 text-center">Ładowanie...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="font-brook text-5xl mb-4">Changelog Mira</h1>
                <p className="text-xl text-gray-300">{error}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto">
            {changes.length === 0 ? (
                <div className="text-center text-2xl text-gray-600">
                    Brak zmian do wyświetlenia
                </div>
            ) : (
                <div className="space-y-6">
                    {groupedChanges.map(([groupName, groupChanges]) => {
                        const groupInfo = groupChanges[0];

                        return (
                            <div key={groupName} className="bg-zinc-900/50 rounded-xl text-white p-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex-shrink-0 w-[80px] h-[80px] flex items-center justify-center">
                                        {groupInfo.groupIcon ? (
                                            <Image
                                                src={groupInfo.groupIcon}
                                                alt={groupName}
                                                width={80}
                                                height={80}
                                                quality={100}
                                                unoptimized={true}
                                                className="rounded-lg flex-shrink-0 scale-[1.3]"
                                                style={{ width: "80px", height: "80px" }}
                                            />
                                        ) : (
                                            <span className="text-6xl">⚙️</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-brook text-4xl mb-4" style={{ color: groupInfo.groupColor }}>
                                            {groupName}
                                        </h2>
                                        <ul className="space-y-2">
                                            {groupChanges.map((change, index) => (
                                                <li key={`${change.settingName}-${index}`} className="text-xl">
                                                    <span className="font-semibold">{change.settingName}:</span>{" "}
                                                    <span className="text-red-600">{change.oldValue}</span>{" "}
                                                    →{" "}
                                                    <span className="text-green-600">{change.newValue}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}