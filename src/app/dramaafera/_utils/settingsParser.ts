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

    // Usuwanie tagów <color=...>...</color>
    const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");

    // Mapa oczyszczonych nazw postaci i ich szans na wystąpienie
    const cleanedFileContentMap = new Map<string, number>();
    for (const [key, value] of fileContentMap.entries()) {
        const normalized = typeof value === 'string' ? value.replace(/,/g, '.') : value;
        cleanedFileContentMap.set(extractName(key), Number(normalized));
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

// Funkcja do aktualizacji wartości ustawienia na podstawie typu
export function updateSettingValue(settingType: SettingTypes, value: string): any {
    switch (settingType) {
        case SettingTypes.Boolean:
            return value.toLowerCase() === 'true';
        case SettingTypes.Number:
        case SettingTypes.Percentage:
        case SettingTypes.Time:
        case SettingTypes.Multiplier: {
            const num = Number(value.replace(/,/g, '.'));
            return !isNaN(num) ? (Number.isInteger(num) ? num : Number(num.toFixed(2))) : num;
        }
        case SettingTypes.Text:
            return value;
        default:
            return value;
    }
}
