"use client";

import { useEffect, useMemo, useState } from "react";
import { RolesList } from "@/app/_components";
import { Roles } from "../_roles";
import { Modifiers } from "@/modifiers";
import { SettingTypes } from "@/constants/settings";

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

    const { filteredRoles } = useMemo(() => {
        if (!fileContent) {
            return {
                roles: [],
                filteredRoles: {}
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

        // Filtrowanie ról: tylko te z szansą > 0
        const filteredRoles = Roles
            .filter(
                (char) =>
                    cleanedFileContentMap.has(char.name) &&
                    (cleanedFileContentMap.get(char.name) ?? 0) > 0
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
                const probability = cleanedFileContentMap.get(role.name);
                if (probability !== undefined) {
                    role.settings["Probability Of Appearing"].value = Number.isInteger(probability) ? probability : Number(probability.toFixed(2));
                }
            }
            return role;
        });

        ["Mod Settings", "Impostor Settings"].forEach(roleName => {
            const role = Roles.find(r => r.name === roleName);
            if (role) {
                filteredRoles[role.id] = role;
            }
        });

        return { roles, filteredRoles };
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
        const filteredModifiers = Modifiers
            .filter(
                (char) =>
                    cleanedFileContentMap.has(char.name) &&
                    (cleanedFileContentMap.get(char.name) ?? 0) > 0
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
                const probability = cleanedFileContentMap.get(modifier.name);
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
        <RolesList
            roles={Object.values(filteredRoles) || []}
            modifiers={Object.values(filteredModifiers) || []}
        />
    );
}
