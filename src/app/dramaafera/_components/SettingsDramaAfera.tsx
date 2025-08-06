"use client";

import { useEffect, useMemo, useState } from "react";
import { RolesList } from "@/app/_components";
import { Roles } from "../_roles";
import { Modifiers } from "@/modifiers";
import { SettingTypes } from "@/constants/settings";
import { SlotsDisplay } from "./SlotsDisplay";
import { SpecialSettingsAccordion } from "./SpecialSettingsAccordion";

export function     SettingsDramaAfera() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Początkowo ustawione na true

    useEffect(() => {
        fetch("/settings/dramaafera.txt")
            .then((response) => {
                return response.text();
            })
            .then((text) => {
                setFileContent(text);
            })
            .catch(() => {
                setFileContent(""); // Ustaw domyślną zawartość w przypadku błędu
            })
            .finally(() => {
                setIsLoading(false); // Zakończ ładowanie nawet w przypadku błędu
            });
    }, []);

    const { filteredRoles, modSettings, impostorSettings } = useMemo(() => {
        if (!fileContent) {
            return {
                roles: [],
                filteredRoles: {},
                modSettings: null,
                impostorSettings: null
            };
        }


        // Parsowanie pliku: pary linia-klucz, linia-wartość
        const lines = (fileContent || '').split("\n").map(l => l.trim()).filter(Boolean);
        const fileContentMap = new Map<string, string>();
        for (let i = 0; i < lines.length - 1; i += 2) {
            fileContentMap.set(lines[i], lines[i + 1]);
        }

        // Usuwanie tagów <color=...>...</color>
        const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");

        // Mapa oczyszczonych nazw postaci i ich szans na wystąpienie
        const cleanedFileContentMap = new Map<string, number>();
        for (const [key, value] of fileContentMap.entries()) {
            // Zamień przecinki na kropki dla liczb
            const normalized = typeof value === 'string' ? value.replace(/,/g, '.') : value;
            cleanedFileContentMap.set(extractName(key), Number(normalized));
        }

        // Funkcja do mapowania nazw ról z pliku do nazw w kodzie
        const getMatchingFileName = (roleName: string): string | null => {
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
        };

        // Filtrowanie ról: tylko te z szansą > 0 i wyłącz Mod Settings oraz Impostor Settings
        const filteredRoles = Roles
            .filter(
                (char) => {
                    const fileName = getMatchingFileName(char.name);
                    return fileName &&
                        (cleanedFileContentMap.get(fileName) ?? 0) > 0 &&
                        char.name !== "Mod Settings" &&
                        char.name !== "Impostor Settings";
                }
            )
            .reduce((acc, char) => {
                acc[char.id] = char;
                return acc;
            }, {} as Record<string, (typeof Roles)[number]>);

        // Przetwarzanie ról
        const rolesArray = Array.isArray(Roles) ? Object.values(Roles) : [];
        const roles = rolesArray.map(role => {
            Object.keys(role.settings).forEach(key => {
                if (fileContentMap.has(key)) {
                    const value = fileContentMap.get(key);
                    if (value !== undefined) {
                        const setting = role.settings[key];
                        switch (setting.type) {
                            case SettingTypes.Boolean:
                                setting.value = value.toLowerCase() === 'true';
                                break;
                            case SettingTypes.Number:
                            case SettingTypes.Percentage:
                            case SettingTypes.Time:
                            case SettingTypes.Multiplier: {
                                const num = Number(value.replace(/,/g, '.'));
                                if (!isNaN(num)) {
                                    setting.value = Number.isInteger(num) ? num : Number(num.toFixed(2));
                                } else {
                                    setting.value = num;
                                }
                                break;
                            }
                            case SettingTypes.Text:
                                setting.value = value;
                                break;
                        }
                    }
                }
            });
            if (role.settings["Probability Of Appearing"]) {
                const fileName = getMatchingFileName(role.name);
                const probability = fileName ? cleanedFileContentMap.get(fileName) : undefined;
                if (probability !== undefined) {
                    role.settings["Probability Of Appearing"].value = Number.isInteger(probability) ? probability : Number(probability.toFixed(2));
                }
            }
            return role;
        });

        // Oddzielne przetwarzanie dla Mod Settings i Impostor Settings
        const modSettings = Roles.find(r => r.name === "Mod Settings");
        const impostorSettings = Roles.find(r => r.name === "Impostor Settings");
        
        // Przetwórz ustawienia dla specjalnych ról
        [modSettings, impostorSettings].forEach(role => {
            if (role) {
                Object.keys(role.settings).forEach(key => {
                    if (fileContentMap.has(key)) {
                        const value = fileContentMap.get(key);
                        if (value !== undefined) {
                            const setting = role.settings[key];
                            switch (setting.type) {
                                case SettingTypes.Boolean:
                                    setting.value = value.toLowerCase() === 'true';
                                    break;
                                case SettingTypes.Number:
                                case SettingTypes.Percentage:
                                case SettingTypes.Time:
                                case SettingTypes.Multiplier: {
                                    const num = Number(value.replace(/,/g, '.'));
                                    if (!isNaN(num)) {
                                        setting.value = Number.isInteger(num) ? num : Number(num.toFixed(2));
                                    } else {
                                        setting.value = num;
                                    }
                                    break;
                                }
                                case SettingTypes.Text:
                                    setting.value = value;
                                    break;
                            }
                        }
                    }
                });
            }
        });

        return { roles, filteredRoles, modSettings: modSettings || null, impostorSettings: impostorSettings || null };
    }, [fileContent]);



    const { filteredModifiers } = useMemo(() => {
        if (!fileContent) {
            return {
                modifiers: [],
                filteredModifiers: {}
            };
        }
        const lines = (fileContent || '').split("\n").map(l => l.trim()).filter(Boolean);
        const fileContentMap = new Map<string, string>();
        for (let i = 0; i < lines.length - 1; i += 2) {
            fileContentMap.set(lines[i], lines[i + 1]);
        }
        const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");
        const cleanedFileContentMap = new Map<string, number>();
        for (const [key, value] of fileContentMap.entries()) {
            const normalized = typeof value === 'string' ? value.replace(/,/g, '.') : value;
            cleanedFileContentMap.set(extractName(key), Number(normalized));
        }

        // Funkcja do mapowania nazw modifierów z pliku do nazw w kodzie
        const getMatchingModifierName = (modifierName: string): string | null => {
            // Bezpośrednie dopasowanie
            if (cleanedFileContentMap.has(modifierName)) {
                return modifierName;
            }
            
            // Mapowanie specjalnych przypadków (jeśli będą potrzebne w przyszłości)
            const nameMapping: Record<string, string> = {
                // Dodaj tutaj mapowania jeśli będą potrzebne
            };
            
            if (nameMapping[modifierName] && cleanedFileContentMap.has(nameMapping[modifierName])) {
                return nameMapping[modifierName];
            }
            
            return null;
        };

        const filteredModifiers = Modifiers
            .filter(
                (char) => {
                    const fileName = getMatchingModifierName(char.name);
                    return fileName && (cleanedFileContentMap.get(fileName) ?? 0) > 0;
                }
            )
            .reduce((acc, char) => {
                acc[char.id] = char;
                return acc;
            }, {} as Record<string, (typeof Modifiers)[number]>);
        const modifiersArray = Array.isArray(Modifiers) ? Object.values(Modifiers) : [];
        const modifiers = modifiersArray.map(modifier => {
            Object.keys(modifier.settings).forEach(key => {
                if (fileContentMap.has(key)) {
                    const value = fileContentMap.get(key);
                    if (value !== undefined) {
                        const setting = modifier.settings[key];
                        switch (setting.type) {
                            case SettingTypes.Boolean:
                                setting.value = value.toLowerCase() === 'true';
                                break;
                            case SettingTypes.Number:
                            case SettingTypes.Percentage:
                            case SettingTypes.Time:
                            case SettingTypes.Multiplier: {
                                const num = Number(value.replace(/,/g, '.'));
                                if (!isNaN(num)) {
                                    setting.value = Number.isInteger(num) ? num : Number(num.toFixed(2));
                                } else {
                                    setting.value = num;
                                }
                                break;
                            }
                            case SettingTypes.Text:
                                setting.value = value;
                                break;
                        }
                    }
                }
            });
            if (modifier.settings["Probability Of Appearing"]) {
                const fileName = getMatchingModifierName(modifier.name);
                const probability = fileName ? cleanedFileContentMap.get(fileName) : undefined;
                if (probability !== undefined) {
                    modifier.settings["Probability Of Appearing"].value = probability;
                }
            }
            return modifier;
        });
        return { modifiers, filteredModifiers };
    }, [fileContent]);

    if (isLoading) {
        return <div className="p-4">
            Ładowanie ustawień...
        </div> // Możesz zastąpić to spinnerem lub innym komunikatem
    }

    return (
        <div>
            <SlotsDisplay fileContent={fileContent} />
            <SpecialSettingsAccordion 
                modSettings={modSettings} 
                impostorSettings={impostorSettings} 
            />
            <RolesList
                roles={Object.values(filteredRoles) || []}
                modifiers={Object.values(filteredModifiers) || []}
            />
        </div>
    );
}
