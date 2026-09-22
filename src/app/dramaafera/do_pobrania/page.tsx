import React from 'react';
import { MIRA_VERSION, MIRA_RELEASE_URL, miraDownloadUrl } from '@/roles/_generated/miraVersion';
import clientManifest from '../../../../public/mod/client/latest.json';

/**
 * What a player installs to play the league's season.
 *
 * The previous version of this page told players to copy a "Town of Us 5.3.1" folder and install
 * `TownOfUs.dll` from `MalkizH3/malkizToU`. Season 4 runs on TOU:Mira with a separate league
 * plugin, and the host kicks anyone without it — so following that page would have got a player
 * kicked rather than merely confused. See #316.
 *
 * The plugin's version and hash are read from the manifest the auto-updater uses, so the page
 * cannot advertise a file other than the one being served. The TOU:Mira version comes from the
 * submodule tag the league's mod is built against, so the link can never point at a release the
 * plugin was not compiled for.
 */

/** Upstream ships one archive per store, because the game's architecture differs between them. */
const MIRA_BUILDS = [
    { label: 'Steam / itch.io', asset: `TouMira.v${MIRA_VERSION}-x86-steam-itch.zip` },
    { label: 'Epic / Microsoft Store', asset: `TouMira.v${MIRA_VERSION}-x64-epic-msstore.zip` },
    { label: 'macOS (x86) / Linux', asset: `TouMira.v${MIRA_VERSION}-x86-macOS-linux.zip` },
];

const PLUGIN_NAME = 'DramaAferaStats.Client.dll';

const plugin = clientManifest.files.find((file) => file.name === PLUGIN_NAME);

export default function DoPobraniaPage() {
    return (
        <main className="min-h-screen rounded-xl bg-zinc-900/50 text-white px-4 py-8 flex flex-col items-center">
            <div className="max-w-2xl w-full">
                <div className="mb-8">
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Do pobrania
                    </h1>
                </div>

                <h2 className="text-xl font-semibold mb-3">1. TOU:Mira {MIRA_VERSION}</h2>
                <p className="text-[#b0aeb8] mb-4">
                    Wybierz paczkę dla swojego sklepu i rozpakuj ją do <strong>osobnej kopii</strong>{' '}
                    folderu Among Us. Nasz mod ligowy jest zbudowany dokładnie pod {MIRA_VERSION}.
                </p>

                <div className="space-y-2 mb-3">
                    {MIRA_BUILDS.map((build) => (
                        <a
                            key={build.asset}
                            href={miraDownloadUrl(build.asset)}
                            className="flex items-center justify-between bg-[#23202a] hover:bg-[#2d2936] transition rounded-lg px-4 py-3 shadow border border-[#23202a] gap-4"
                        >
                            <span className="font-medium">{build.label}</span>
                            <span className="text-xs text-[#6b6874] font-mono truncate">{build.asset}</span>
                        </a>
                    ))}
                </div>

                <p className="text-xs text-[#b0aeb8] mb-6">
                    Source: {' '}
                    <a href={MIRA_RELEASE_URL} className="underline hover:text-white">
                        TOU:Mira {MIRA_VERSION}
                    </a>
                </p>

                <h2 className="text-xl font-semibold mb-3">2. Wtyczka ligowa</h2>
                <p className="text-[#b0aeb8] mb-4">
                    Wrzuć poniższy plik do{' '}
                    <code className="bg-[#23202a] px-1 rounded">BepInEx/plugins</code> w tej kopii.
                    Bez niego zostaniesz automatycznie wyrzucony z lobby. Plugin ma funkcję auto-update,{' '}
                    więc przyszłe wersje i pliki czapek/skinów pobiera samodzielnie.
                </p>

                {plugin && (
                    <a
                        href={`/mod/client/${plugin.name}`}
                        className="flex items-center bg-[#23202a] hover:bg-[#2d2936] transition rounded-lg px-4 py-3 gap-4 shadow border border-[#23202a] mb-6"
                        download
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-8 h-8 text-[#b0aeb8] shrink-0"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19.5 14.25v2.25A2.25 2.25 0 0 1 17.25 18.75H6.75A2.25 2.25 0 0 1 4.5 16.5V14.25m15-6V6.75A2.25 2.25 0 0 0 17.25 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v1.5m7.5 3.75v6m0 0l-2.25-2.25m2.25 2.25l2.25-2.25"
                            />
                        </svg>
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium text-base">{plugin.name}</span>
                            <span className="text-xs text-[#b0aeb8]">
                                wersja {clientManifest.version}
                            </span>
                            <span className="text-xs text-[#6b6874] font-mono truncate">
                                sha256 {plugin.sha256}
                            </span>
                        </div>
                    </a>
                )}
            </div>
        </main>
    );
}
