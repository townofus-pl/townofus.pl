"use client";

import { useEffect, useMemo, useState } from "react";
import { RolesList } from "@/app/_components";
import { CURRENT_SEASON } from "../_constants/seasons";
import { resolveSettingsView } from "../_utils/settingsView";
import { SlotsDisplay } from "./SlotsDisplay";
import { SpecialSettingsAccordion } from "./SpecialSettingsAccordion";
import { GetDramaAferaSettingsResponseSchema } from "@/app/api/dramaafera/settings/schema";

/**
 * The settings landing page. Fetch, then render whatever `resolveSettingsView` makes of the file —
 * the era rules and the parsing live in `_utils/settingsView.ts`, which used to be two inline
 * copies of a parser in here. See #317.
 */

export function SettingsDramaAfera() {
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();

        fetch("/api/dramaafera/settings", { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const parsed = GetDramaAferaSettingsResponseSchema.parse(await response.json());
                if (!parsed.success) throw new Error(parsed.error ?? 'API error');
                setFileContent(parsed.data.current);
            })
            .catch((err) => {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setFileContent("");
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            });

        return () => controller.abort();
    }, []);

    const view = useMemo(() => resolveSettingsView(fileContent, CURRENT_SEASON), [fileContent]);

    if (isLoading) {
        return <div className="p-4">Ładowanie ustawień...</div>;
    }

    if (view.kind === 'awaiting') {
        return (
            <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6 text-center">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                    Ustawienia nowego sezonu nie zostały jeszcze wgrane
                </h3>
                <p className="text-gray-300">
                    Sezon {CURRENT_SEASON} gramy na TOU:Mira. Lista ról pojawi się tutaj, gdy host wgra
                    pierwszy plik <span className="font-mono">.cfg</span>.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Reads `Slot N` lines, which only a legacy file has — it renders nothing for a .cfg. */}
            <SlotsDisplay fileContent={fileContent} />
            <SpecialSettingsAccordion
                modSettings={view.modSettings}
                impostorSettings={view.impostorSettings}
            />
            {/* scaleRoleIcons={false} to match the main page. The default is 1.5, and a
                transform: scale() on a w-28 icon grows it about its centre — so it overflows the
                card's padding on both sides rather than just looking bigger. */}
            <RolesList roles={view.roles} modifiers={view.modifiers} scaleRoleIcons={false} />
        </div>
    );
}
