"use client";

import { useState } from "react";
import { Role } from "@/constants/rolesAndModifiers";
import { getValue } from "@/app/_components/RolesList/RoleCard/SettingsList";

interface SpecialSettingsAccordionProps {
    modSettings: Role | null;
    impostorSettings: Role | null;
}

export function SpecialSettingsAccordion({ modSettings, impostorSettings }: SpecialSettingsAccordionProps) {
    const [modSettingsOpen, setModSettingsOpen] = useState(false);
    const [impostorSettingsOpen, setImpostorSettingsOpen] = useState(false);

    if (!modSettings && !impostorSettings) {
        return null;
    }

    return (
        <div className="mb-6 space-y-4">
            {modSettings && (
                <div className="border border-zinc-700/50 rounded-lg overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/50 text-white hover:text-gray-300 hover:bg-zinc-700/50 transition-colors font-semibold text-lg"
                        onClick={() => setModSettingsOpen(v => !v)}
                        type="button"
                        aria-expanded={modSettingsOpen}
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-2xl">⚙️</span>
                            <span>Mod Settings</span>
                        </span>
                        <span className="text-xl">{modSettingsOpen ? "▲" : "▼"}</span>
                    </button>
                    {modSettingsOpen && (
                        <div className="p-4 bg-zinc-900/70 border-t border-zinc-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(modSettings.settings).map(([name, setting]) => (
                                    <div key={name} className="bg-zinc-800/30 p-2 rounded border border-zinc-600/30">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-300 truncate mr-2">{name}</span>
                                            <span className="text-white font-medium text-sm">{getValue(setting)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {impostorSettings && (
                <div className="border border-zinc-700/50 rounded-lg overflow-hidden">
                    <button
                        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-800/50 text-white hover:text-gray-300 hover:bg-zinc-700/50 transition-colors font-semibold text-lg"
                        onClick={() => setImpostorSettingsOpen(v => !v)}
                        type="button"
                        aria-expanded={impostorSettingsOpen}
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-2xl">🔪</span>
                            <span>Impostor Settings</span>
                        </span>
                        <span className="text-xl">{impostorSettingsOpen ? "▲" : "▼"}</span>
                    </button>
                    {impostorSettingsOpen && (
                        <div className="p-4 bg-zinc-900/70 border-t border-zinc-700/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {Object.entries(impostorSettings.settings).map(([name, setting]) => (
                                    <div key={name} className="bg-zinc-800/30 p-2 rounded border border-zinc-600/30">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-300 truncate mr-2">{name}</span>
                                            <span className="text-white font-medium text-sm">{getValue(setting)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
