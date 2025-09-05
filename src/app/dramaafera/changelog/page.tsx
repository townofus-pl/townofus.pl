"use client";

import { useEffect, useState } from "react";
import { Roles } from "../_roles";
import { SettingTypes } from "@/constants/settings";

// Funkcja do znajdowania koloru i ikony roli
const getRoleInfo = (roleName: string): { color: string; icon: string | null } => {
    const role = Roles.find(r => r.name === roleName);
    return {
        color: role?.color || "#4B5563", // domyślny szary kolor dla Global Settings
        icon: role?.icon || null // brak ikony dla Global Settings
    };
};

// Pomocnicza funkcja do formatowania wartości
const formatValue = (value: any, type: SettingTypes, description?: Record<number, string>): string => {
    // Najpierw sprawdź czy istnieje opis dla wartości
    if (description) {
        let valueToCheck: number | null = null;
        
        if (typeof value === 'number') {
            valueToCheck = value;
        } else if (typeof value === 'string') {
            const parsed = parseInt(value);
            if (!isNaN(parsed)) {
                valueToCheck = parsed;
            }
        }
        
        if (valueToCheck !== null && description[valueToCheck]) {
            return description[valueToCheck];
        }
    }

    // Jeśli nie ma opisu lub wartość nie pasuje, użyj standardowego formatowania
    switch (type) {
        case SettingTypes.Percentage:
            if ((value as number) < 0) return 'x%';
            return `${value}%`;
        case SettingTypes.Time:
            return `${value}s`;
        case SettingTypes.Boolean:
            return value ? '✓' : '✗';
        case SettingTypes.Number:
            return value.toString();
        case SettingTypes.Multiplier:
            return `${value}x`;
        case SettingTypes.Text:
        default:
            return value.toString();
    }
};

interface Change {
    roleName: string;
    settingName: string;
    oldValue: string;
    newValue: string;
    type: 'role' | 'setting';
}

export default function ChangelogPage() {
    const [changes, setChanges] = useState<Change[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadChanges = async () => {
            try {
                // Załaduj oba pliki
                const [currentResponse, oldResponse] = await Promise.all([
                    fetch('/settings/dramaafera.txt'),
                    fetch('/settings/dramaafera_old.txt')
                ]);

                if (!currentResponse.ok || !oldResponse.ok) {
                    throw new Error('Nie udało się załadować plików ustawień');
                }

                const [currentContent, oldContent] = await Promise.all([
                    currentResponse.text(),
                    oldResponse.text()
                ]);

                // Parsowanie plików - ta sama logika co w SettingsDramaAfera
                const parseFile = (content: string) => {
                    const lines = content.split('\n').map(line => line.trim());
                    const fileContentMap = new Map<string, string>();
                    const cleanedFileContentMap = new Map<string, number>();

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        if (line.includes('<color=') && line.includes('</color>')) {
                            const extractName = (line: string): string => {
                                const match = line.match(/<color=#[A-F0-9]{8}>(.*?)<\/color>/);
                                return match ? match[1] : line;
                            };
                            
                            const name = extractName(line);
                            const nextLine = lines[i + 1];
                            if (nextLine && !isNaN(Number(nextLine))) {
                                const value = Number(nextLine);
                                cleanedFileContentMap.set(name, value);
                                i++; // Pomiń następną linię, która jest wartością
                            }
                        } else if (line && !line.includes('<color=') && i + 1 < lines.length) {
                            const nextLine = lines[i + 1];
                            if (nextLine && nextLine.trim() !== '') {
                                fileContentMap.set(line, nextLine);
                                i++; // Pomiń następną linię, która jest wartością
                            }
                        }
                    }

                    return { fileContentMap, cleanedFileContentMap };
                };

                const currentData = parseFile(currentContent);
                const oldData = parseFile(oldContent);

                const detectedChanges: Change[] = [];

                // Sprawdź zmiany w prawdopodobieństwach ról
                for (const [roleName, currentProb] of currentData.cleanedFileContentMap) {
                    const oldProb = oldData.cleanedFileContentMap.get(roleName);
                    if (oldProb !== undefined && oldProb !== currentProb) {
                        detectedChanges.push({
                            roleName,
                            settingName: 'Probability Of Appearing',
                            oldValue: `${oldProb}%`,
                            newValue: `${currentProb}%`,
                            type: 'role'
                        });
                    }
                }

                // Sprawdź zmiany w ustawieniach
                for (const [settingName, currentValue] of currentData.fileContentMap) {
                    const oldValue = oldData.fileContentMap.get(settingName);
                    if (oldValue !== undefined && oldValue !== currentValue) {
                        // Znajdź odpowiednią rolę i ustawienie, żeby określić typ
                        let settingType = SettingTypes.Text;
                        let description: Record<number, string> | undefined;
                        let roleName = 'Global Settings';

                        // Przeszukaj role, żeby znaleźć to ustawienie
                        for (const role of Roles) {
                            if (role.settings[settingName]) {
                                settingType = role.settings[settingName].type;
                                description = role.settings[settingName].description;
                                roleName = role.name;
                                break;
                            }
                        }

                        // Formatuj wartości z zaokrąglaniem
                        const processValue = (value: string, type: SettingTypes) => {
                            switch (type) {
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
                                default:
                                    return value;
                            }
                        };

                        const processedOldValue = processValue(oldValue, settingType);
                        const processedNewValue = processValue(currentValue, settingType);

                        const formattedOldValue = formatValue(processedOldValue, settingType, description);
                        const formattedNewValue = formatValue(processedNewValue, settingType, description);

                        detectedChanges.push({
                            roleName,
                            settingName,
                            oldValue: formattedOldValue,
                            newValue: formattedNewValue,
                            type: 'setting'
                        });
                    }
                }

                setChanges(detectedChanges);
            } catch (error) {
                console.error('Błąd podczas ładowania zmian:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChanges();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="font-brook text-8xl mb-8 text-center">Ładowanie...</h1>
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
                    {/* Grupuj zmiany po rolach */}
                    {Object.entries(
                        changes.reduce((acc, change) => {
                            if (!acc[change.roleName]) {
                                acc[change.roleName] = [];
                            }
                            acc[change.roleName].push(change);
                            return acc;
                        }, {} as Record<string, Change[]>)
                    ).map(([roleName, roleChanges]) => {
                        const roleInfo = getRoleInfo(roleName);
                        return (
                            <div key={roleName} className="bg-zinc-900/50 rounded-xl text-white p-6">
                                <div className="flex items-center gap-6">
                                    {roleInfo.icon && (
                                        <img 
                                            src={roleInfo.icon} 
                                            alt={roleName}
                                            className="w-20 h-20 rounded-lg flex-shrink-0 scale-[1.7]"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h2 
                                            className="font-brook text-4xl mb-4"
                                            style={{ color: roleInfo.color }}
                                        >
                                            {roleName}
                                        </h2>
                                        <ul className="space-y-2">
                                            {roleChanges.map((change, index) => (
                                                <li key={index} className="text-xl">
                                                    <span className="font-semibold">{change.settingName}:</span>{' '}
                                                    <span className="text-red-600">{change.oldValue}</span>{' '}
                                                    →{' '}
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
