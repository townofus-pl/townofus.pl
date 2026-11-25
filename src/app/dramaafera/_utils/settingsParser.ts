import { SettingTypes } from "@/constants/settings";

export interface ParsedSettings {
    fileContentMap: Map<string, string>;
    cleanedFileContentMap: Map<string, number>;
}

// Funkcja do parsowania pliku dramaafera.txt
export function parseSettingsFile(fileContent: string): ParsedSettings {
    const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
    const fileContentMap = new Map<string, string>();
    
    for (let i = 0; i < lines.length - 1; i += 2) {
        fileContentMap.set(lines[i], lines[i + 1]);
    }

    // Tylko linie ról zaczynają się od <color=...> — pozostałe to globalne/mod settings
    // (np. "Airship Doors Are Polus Doors\nFalse"), które po Number(...) byłyby NaN
    // i — przez NaN !== NaN — pojawiałyby się jako fałszywe zmiany szansy w changelogu.
    const ROLE_LINE_REGEX = /^<color=[^>]+>(.*?)<\/color>$/;

    const cleanedFileContentMap = new Map<string, number>();
    for (const [key, value] of fileContentMap.entries()) {
        const match = key.match(ROLE_LINE_REGEX);
        if (!match) continue;
        const normalized = typeof value === 'string' ? value.replace(/,/g, '.') : value;
        const parsed = Number(normalized);
        if (Number.isNaN(parsed)) continue;
        cleanedFileContentMap.set(match[1], parsed);
    }

    return { fileContentMap, cleanedFileContentMap };
}

// Funkcja do mapowania nazw ról z pliku do nazw w kodzie
export function getMatchingFileName(roleName: string, cleanedFileContentMap: Map<string, number>): string | null {
    // Bezpośrednie dopasowanie
    if (cleanedFileContentMap.has(roleName)) {
        return roleName;
    }
    
    // Mapowanie specjalnych przypadków
    const nameMapping: Record<string, string> = {
        "Plaguebearer / Pestilence": "Plaguebearer"
    };
    
    if (nameMapping[roleName] && cleanedFileContentMap.has(nameMapping[roleName])) {
        return nameMapping[roleName];
    }
    
    return null;
}

/** Same collapse as `normalizeLookupKey` in miraConfig.ts (not imported: miraConfig imports this file). */
function collapseName(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

/**
 * TOU-Mira 1.7.9-beta2 writes an enum option as its member name (`GroupRevive`), older builds as
 * its number (`2`). Turns a name into the ordinal so the label map keeps working.
 * A number passes through. A name that is not in the list stays a string.
 */
export function enumNameToOrdinal(value: string, names: readonly string[] | undefined): string {
    if (!names || /^-?\d+(?:[.,]\d+)?$/.test(value.trim())) return value;
    const index = names.findIndex((name) => collapseName(name) === collapseName(value));
    return index === -1 ? value : String(index);
}

// Funkcja do aktualizacji wartości ustawienia na podstawie typu.
// `enumNames`: member names of an enum option, in ordinal order (see `enumNameToOrdinal`).
export function updateSettingValue(
    settingType: SettingTypes,
    rawValue: string,
    enumNames?: readonly string[],
): string | number | boolean {
    const value = enumNameToOrdinal(rawValue, enumNames);
    switch (settingType) {
        case SettingTypes.Boolean:
            return value.toLowerCase() === 'true';
        case SettingTypes.Number:
        case SettingTypes.Percentage:
        case SettingTypes.Time:
        case SettingTypes.Multiplier: {
            const num = Number(value.replace(/,/g, '.'));
            // A text that is not a number (an enum name with no known list) stays text, never NaN.
            if (isNaN(num)) return value;
            return Number.isInteger(num) ? num : Number(num.toFixed(2));
        }
        case SettingTypes.Text:
            return value;
        default:
            return value;
    }
}
