"use client";

import { useState, useEffect } from "react";

// Mapowanie ustawień ról
const ROLE_SETTINGS = {
    "Who Can Click Haunter": {
        0: "All",
        1: "Non-Crew", 
        2: "Imps Only"
    },
    "Who Sees Dead Bodies On Admin": {
        0: "Nobody",
        1: "Spy",
        2: "Everyone But Spy",
        3: "Everyone"
    },
    "Show Barriered Player": {
        0: "Self",
        1: "Cleric",
        2: "Self+Cleric"
    },
    "Show Shielded Player": {
        0: "Self",
        1: "Medic",
        2: "Self+Medic"
    },
    "Who Gets Murder Attempt Indicator": {
        0: "Medic",
        1: "Shielded",
        2: "Nobody"
    },
    "Show Fortified Player": {
        0: "Self",
        1: "Warden",
        2: "Self+Warden"
    },
    "Who Is Revealed With Mediate": {
        0: "Oldest Dead",
        1: "Newest Dead",
        2: "All Dead"
    }
};

// Kolory dla różnych typów ustawień
const SETTING_COLORS = {
    "Who Can Click Haunter": "#9333EA",
    "Who Sees Dead Bodies On Admin": "#1E40AF",
    "Show Barriered Player": "#059669",
    "Show Shielded Player": "#0891B2",
    "Who Gets Murder Attempt Indicator": "#DC2626",
    "Show Fortified Player": "#EA580C",
    "Who Is Revealed With Mediate": "#7C2D12"
};

interface RoleSetting {
    name: string;
    value: number;
    description: string;
    color: string;
}

interface RoleSettingsDisplayProps {
    fileContent: string | null;
}

export function RoleSettingsDisplay({ fileContent }: RoleSettingsDisplayProps) {
    const [settings, setSettings] = useState<RoleSetting[]>([]);

    useEffect(() => {
        if (!fileContent) return;

        const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
        const settingsData: RoleSetting[] = [];

        for (let i = 0; i < lines.length - 1; i += 2) {
            const settingName = lines[i];
            const settingValue = parseInt(lines[i + 1]);

            if (ROLE_SETTINGS[settingName as keyof typeof ROLE_SETTINGS]) {
                const settingOptions = ROLE_SETTINGS[settingName as keyof typeof ROLE_SETTINGS];
                const description = settingOptions[settingValue as keyof typeof settingOptions] || "Unknown";
                const color = SETTING_COLORS[settingName as keyof typeof SETTING_COLORS] || "#64748B";

                settingsData.push({
                    name: settingName,
                    value: settingValue,
                    description,
                    color
                });
            }
        }

        setSettings(settingsData);
    }, [fileContent]);

    if (settings.length === 0) {
        return null;
    }

    return (
        <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                Ustawienia ról
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {settings.map((setting, index) => (
                    <div 
                        key={index}
                        className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-700/30 hover:bg-zinc-700/30 transition-colors"
                    >
                        <div className="text-sm font-semibold text-zinc-300 mb-2">
                            {setting.name}
                        </div>
                        <div 
                            className="text-xs px-2 py-1 rounded text-white font-medium inline-block"
                            style={{ 
                                backgroundColor: setting.color,
                                opacity: 0.9
                            }}
                        >
                            {setting.description}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
