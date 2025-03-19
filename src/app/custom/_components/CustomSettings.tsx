"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { RolesList } from "@/app/_components";
import { Roles } from "../_roles";
import { Modifiers } from "@/modifiers";
import { SettingTypes } from "@/constants/settings";
import { useSearchParams } from "next/navigation";

// Komponent kliencki który używa useSearchParams
function CustomSettingsContent() {
    const searchParams = useSearchParams();
    const fileName = searchParams.get("settings") || "townofus.pl"; // Domyślnie "townofus.pl"
    const filePath = `/settings/${fileName}.txt`;

    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true); // Początkowo ustawione na true
    const [fileNotFound, setFileNotFound] = useState(false);

    useEffect(() => {
        fetch(filePath)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("File not found");
                }
                return response.text();
            })
            .then((text) => {
                setFileContent(text);
            })
            .catch(() => {
                setFileContent(""); // Ustaw domyślną zawartość w przypadku błędu
                setFileNotFound(true);
            })
            .finally(() => {
                setIsLoading(false); // Zakończ ładowanie nawet w przypadku błędu
            });
    }, [filePath]);

    const { filteredRoles } = useMemo(() => {
        if (!fileContent) {
            return {
                roles: [],
                filteredRoles: {}
            };
        }

        // Tworzymy mapę z zawartości pliku
        const fileContentMap = new Map(
            (fileContent || '')
                .split("\n")
                .reduce((acc, current, index, array) => {
                    if (current && current.trim() !== '') {
                        if (index % 2 === 0 && array[index + 1] !== undefined) {
                            acc.push([current, array[index + 1]]);
                        } else {
                            if (acc.length > 0) {
                                acc[acc.length - 1].push(current);
                            }
                        }
                    }
                    return acc;
                }, [] as [string, string][])
        );

        // Funkcja do usuwania tagów <color=...>...</color>
        const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");

        // Mapa oczyszczonych nazw postaci i ich szans na wystąpienie
        const cleanedFileContentMap = new Map<string, number>();
        fileContentMap.forEach((value, key) => {
            cleanedFileContentMap.set(extractName(key), Number(value));
        });


        // **Filtrowanie ról**
        const filteredRoles = Roles
            .filter(
                (char) =>
                    cleanedFileContentMap.has(char.name) &&
                    (cleanedFileContentMap.get(char.name) ?? 0) > 1
            )
            .reduce((acc, char) => {
                acc[char.id] = char;
                return acc;
            }, {} as Record<string, (typeof Roles)[number]>);


        // **Przetwarzanie ról**
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
                            case SettingTypes.Multiplier:
                                setting.value = Number(value);
                                break;
                            case SettingTypes.Text:
                                setting.value = value;
                                break;
                        }
                    }
                }
            });

            // **Nowa logika: Aktualizacja Probability Of Appearing**
            if (role.settings["Probability Of Appearing"]) {
                const probability = cleanedFileContentMap.get(role.name);
                if (probability !== undefined) {
                    role.settings["Probability Of Appearing"].value = probability;
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
        // Jeśli fileContent jest null lub undefined, zwróć domyślne wartości
        if (!fileContent) {
            return {
                modifiers: [],
                filteredModifiers: {}
            };
        }

        // Tworzymy mapę z zawartości pliku
        const fileContentMap = new Map(
            fileContent
                .split("\n")
                .reduce((acc, current, index, array) => {
                    if (current && current.trim() !== '') {
                        if (index % 2 === 0 && array[index + 1] !== undefined) {
                            acc.push([current, array[index + 1]]); // Klucz (nazwa postaci z tagami)
                        } else {
                            if (acc.length > 0) {
                                acc[acc.length - 1].push(current); // Wartość (szansa na wystąpienie)
                            }
                        }
                    }
                    return acc;
                }, [] as [string, string][])
        );

        // Funkcja do usuwania tagów <color=...>...</color>
        const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");

        // Mapa oczyszczonych nazw postaci i ich szans na wystąpienie
        const cleanedFileContentMap = new Map<string, number>();
        fileContentMap.forEach((value, key) => {
            cleanedFileContentMap.set(extractName(key), Number(value));
        });

        // **Filtrowanie Modifiers**
        const filteredModifiers = Modifiers
            .filter(
                (char) =>
                    cleanedFileContentMap.has(char.name) &&
                    (cleanedFileContentMap.get(char.name) ?? 0) > 1
            )
            .reduce((acc, char) => {
                acc[char.id] = char;
                return acc;
            }, {} as Record<string, (typeof Modifiers)[number]>);

        // **Przetwarzanie Modifiers**
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
                            case SettingTypes.Multiplier:
                                setting.value = Number(value);
                                break;
                            case SettingTypes.Text:
                                setting.value = value;
                                break;
                        }
                    }
                }
            });

            // **Nowa logika: Aktualizacja Probability Of Appearing**
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
        return (<div className="grid grid-cols-1 gap-y-5">
            <div className="relative text-center text-white">
                <p className="text-yellow-300 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    Trwa ładowanie ustawień...
                </p>
            </div>
            <Suspense fallback={<div className="p-4">Ładowanie...</div>}>
                <RolesList
                    roles={Object.values(filteredRoles) || []}
                    modifiers={Object.values(filteredModifiers) || []}
                />
            </Suspense>
        </div>
        )
    }

    if (fileNotFound) {
        return (
            <div className="grid grid-cols-1 gap-y-5">
                <div className="relative text-center text-white">
                    <p className="text-gray-300 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                        <span className="p-4 text-red-500">Nie znaleziono pliku ustawień dla<span className="p-4 text-yellow-500">{fileName}</span></span>
                    </p>
                </div>

                <Suspense fallback={<div className="p-4">Ładowanie...</div>}>
                    <RolesList
                        roles={Object.values(filteredRoles) || []}
                        modifiers={Object.values(filteredModifiers) || []}
                    />
                </Suspense>

            </div>

        )
    }

    return (
        <div className="grid grid-cols-1 gap-y-5">
            <div className="relative text-center text-white">
                <p className="text-gray-300 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    Among Us ustawienia dla<span className="p-4 text-pink-500">{fileName}</span>
                </p>
            </div>
            <Suspense fallback={<div className="p-4">Ładowanie...</div>}>
                <RolesList
                    roles={Object.values(filteredRoles) || []}
                    modifiers={Object.values(filteredModifiers) || []}
                />
            </Suspense>
        </div>
    );
}

// Komponent główny, który używa Suspense do opakowania komponentu korzystającego z useSearchParams
export function CustomSettings() {
    return (
        <Suspense fallback={
            <div className="grid grid-cols-1 gap-y-5">
                <div className="relative text-center text-white">
                    <p className="text-yellow-300 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                        Trwa ładowanie...
                    </p>
                </div>
            </div>
        }>
            <CustomSettingsContent />
        </Suspense>
    );
}