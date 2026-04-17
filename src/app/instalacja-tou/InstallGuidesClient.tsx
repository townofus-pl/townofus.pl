'use client';

import Image from "next/image";
import {useState} from "react";
import {installGuides} from "./installGuides";

const windowsGuide = installGuides.find((guide) => guide.key === "windows");
const TOU_RELEASES_LATEST_PAGE = "https://github.com/AU-Avengers/TOU-Mira/releases/latest";
const TOU_RELEASES_LATEST_API = "https://api.github.com/repos/AU-Avengers/TOU-Mira/releases/latest";

const platformAssetHints: Record<string, string[]> = {
    steam: ["steam-itch", "steam", "itch"],
    "itch-io": ["steam-itch", "itch", "steam"],
    "epic-games": ["epic-msstore", "epic", "msstore"],
    "microsoft-store": ["epic-msstore", "msstore", "epic"],
};

interface GitHubReleaseAsset {
    name: string;
    browser_download_url: string;
}

interface GitHubRelease {
    assets: GitHubReleaseAsset[];
}

export default function InstallGuidesClient() {
    const platforms = windowsGuide?.platforms ?? [];
    const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]?.key ?? "");
    const currentPlatform = platforms.find((platform) => platform.key === selectedPlatform) ?? platforms[0];

    async function handleTouDownloadClick(event: React.MouseEvent<HTMLAnchorElement>, platformKey: string) {
        event.preventDefault();

        try {
            const response = await fetch(TOU_RELEASES_LATEST_API, {
                headers: {
                    Accept: "application/vnd.github+json",
                },
            });

            if (!response.ok) {
                window.location.assign(TOU_RELEASES_LATEST_PAGE);
                return;
            }

            const release = (await response.json()) as GitHubRelease;
            const hints = platformAssetHints[platformKey] ?? [];

            const matchingAsset = release.assets.find((asset) => {
                const assetName = asset.name.toLowerCase();
                return hints.some((hint) => assetName.includes(hint));
            }) ?? release.assets.find((asset) => asset.name.toLowerCase().endsWith(".zip"));

            window.location.assign(matchingAsset?.browser_download_url ?? TOU_RELEASES_LATEST_PAGE);
        } catch {
            window.location.assign(TOU_RELEASES_LATEST_PAGE);
        }
    }

    if (!currentPlatform) {
        return null;
    }

    return (
        <div className="mb-5 grid grid-cols-1 gap-6 rounded-xl border border-zinc-700/70 bg-zinc-900/60 p-4 md:p-6">
            <header className="rounded-xl border border-zinc-700/80 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-5">
                <h1 className="font-brook text-4xl leading-tight text-red-400 md:text-6xl">Instalacja Town of Us: Mira</h1>
                <p className="mt-3 max-w-4xl text-sm text-zinc-200 md:text-base">
                    Instrukcja dla Windows. Wybierz platformę, aby zobaczyć odpowiedni przewodnik instalacji.
                </p>
            </header>

            <div className="rounded-lg border border-zinc-700/80 bg-zinc-900/70 p-4 text-center">
                <p className="font-barlow text-2xl text-zinc-100 md:text-3xl">
                    Wypróbuj również: {" "}
                    <a href="/susmodder" className="font-semibold text-cyan-300 decoration-cyan-400/70 underline-offset-2 hover:text-cyan-200">
                        SUSModder
                    </a>
                </p>
            </div>

            <section className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => {
                        const isActive = currentPlatform.key === platform.key;
                        const platformIconSrc = platform.key === "steam"
                            ? "/images/steam-logo.svg"
                            : platform.key === "epic-games"
                                ? "/images/epic-games-logo.svg"
                                : platform.key === "itch-io"
                                    ? "/images/itch-io-logo.svg"
                                    : platform.key === "microsoft-store"
                                        ? "/images/microsoft-logo.svg"
                                        : "/images/globe.svg";

                        return (
                            <button
                                key={platform.key}
                                type="button"
                                onClick={() => setSelectedPlatform(platform.key)}
                                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition md:text-base inline-flex items-center ${isActive
                                    ? "border-cyan-400 bg-cyan-500/20 text-cyan-100"
                                    : "border-zinc-600 bg-zinc-800/70 text-zinc-200 hover:border-zinc-400 hover:bg-zinc-700/70"}`}
                            >
                                <Image src={platformIconSrc} width={16} height={16} alt={platform.label} className="brightness-0 invert" />
                                <span className="ml-2">{platform.label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <article className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4 md:p-6">
                <div className="mb-4 border-b border-zinc-700 pb-4">
                    <h2 className="font-brook text-3xl text-yellow-300">{currentPlatform.guide.title}</h2>
                    <p className="mt-2 text-zinc-100">{currentPlatform.guide.subtitle}</p>
                    {currentPlatform.guide.status ? (
                        <p className="mt-2 inline-block rounded-md border border-yellow-500/50 bg-yellow-500/10 px-2 py-1 text-sm text-yellow-200">
                            {currentPlatform.guide.status}
                        </p>
                    ) : null}
                </div>

                <div className="space-y-5">
                    <section>
                        <h3 className="font-brook text-2xl text-white">Wymagania</h3>
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-100">
                            {currentPlatform.guide.wymagania.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-brook text-2xl text-white">Kroki instalacji</h3>
                        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-100">
                            {currentPlatform.guide.kroki.map((step) => (
                                <li key={step}>{step}</li>
                            ))}
                        </ol>
                    </section>

                    {currentPlatform.guide.kod ? (
                        <section>
                            <h3 className="font-brook text-2xl text-white">Komenda / ścieżka</h3>
                            <pre className="mt-3 overflow-x-auto rounded-md border border-zinc-700 bg-zinc-900 p-3 text-sm text-zinc-100">
                                <code>{currentPlatform.guide.kod}</code>
                            </pre>
                        </section>
                    ) : null}

                    {currentPlatform.guide.notatki?.length ? (
                        <section>
                            <h3 className="font-brook text-2xl text-white">Dodatkowe uwagi</h3>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-zinc-100">
                                {currentPlatform.guide.notatki.map((note) => (
                                    <li key={note}>{note}</li>
                                ))}
                            </ul>
                        </section>
                    ) : null}

                    <section>
                        <div className="mt-1 flex flex-wrap gap-3">
                            {currentPlatform.guide.linki.map((link) => {
                                const isTouDownload = link.label === "Pobierz najnowszy TOU: Mira";
                                const isGitHubLink = link.label.toLowerCase().includes("github");
                                const isMicrosoftLink = link.label.toLowerCase().includes("microsoft");
                                const isSteamLink = link.label.toLowerCase().includes("steam");
                                const isEpicLink = link.label.toLowerCase().includes("epic");
                                const isItchLink = link.label.toLowerCase().includes("itch");
                                const iconSrc = isTouDownload
                                    ? "/images/download-button.svg"
                                    : isGitHubLink
                                        ? "/images/github-logo.svg"
                                        : isMicrosoftLink
                                            ? "/images/microsoft-logo.svg"
                                        : isEpicLink
                                            ? "/images/epic-games-logo.svg"
                                            : isSteamLink
                                                ? "/images/steam-logo.svg"
                                                : isItchLink
                                                    ? "/images/itch-io-logo.svg"
                                        : "/images/globe.svg";
                                const iconAlt = isTouDownload
                                    ? "pobierz"
                                    : isGitHubLink
                                        ? "github"
                                        : isMicrosoftLink
                                            ? "microsoft"
                                        : isEpicLink
                                            ? "epic"
                                            : isSteamLink
                                                ? "steam"
                                                : isItchLink
                                                    ? "itch"
                                        : "link";

                                const buttonClassName = isTouDownload
                                    ? "px-4 py-3 bg-[rgba(0,167,0)] hover:bg-[rgba(0,167,0,0.85)]"
                                    : isMicrosoftLink
                                        ? "px-4 py-3 bg-white text-black hover:bg-zinc-300"
                                    : isItchLink
                                        ? "px-4 py-3 bg-white text-black hover:bg-zinc-300"
                                    : isSteamLink
                                        ? "px-4 py-3 bg-[#0f2045] hover:bg-[#09132a]"
                                    : isEpicLink
                                        ? "px-4 py-3 bg-black hover:bg-zinc-900"
                                    : isGitHubLink
                                        ? "px-4 py-3 bg-[rgba(63,63,63)] hover:bg-[rgba(63,63,63,0.85)]"
                                        : "px-4 py-3 bg-[rgba(86,98,246)] hover:bg-[rgba(86,98,246,0.85)]";

                                return (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        target={isTouDownload ? undefined : "_blank"}
                                        rel={isTouDownload ? undefined : "noopener noreferrer"}
                                        onClick={(event) => isTouDownload ? handleTouDownloadClick(event, currentPlatform.key) : undefined}
                                        className={`${buttonClassName} ${isMicrosoftLink || isItchLink ? "text-black" : "text-white"} text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center justify-center`}
                                    >
                                        <Image src={iconSrc} width={16} height={16} alt={iconAlt} className={isMicrosoftLink || isItchLink ? undefined : "brightness-0 invert"} />
                                        <span className="ml-2">{link.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </article>

            <p className="text-center text-sm text-zinc-300 md:text-base">
                Wszyscy gracze w lobby muszą mieć kompatybilną wersję moda, aby wspólna rozgrywka działała poprawnie.
            </p>
        </div>
    );
}
