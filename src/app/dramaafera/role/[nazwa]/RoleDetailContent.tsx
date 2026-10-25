import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RoleImage } from "../_components/RoleImage";
import { getAllGamesData, getDramaAferaSettings } from "../../_services";
import { FIRST_MIRA_SEASON, getRoleColor, convertUrlSlugToRole, convertNickToUrlSlug, getPlayerAvatarPath } from "@/app/dramaafera/_utils/gameUtils";
import { buildSeasonUrl } from "@/app/dramaafera/_utils/seasonHelpers";
import { findFullRole } from "@/app/dramaafera/_utils/roleRegistry";
import type { Role } from "@/constants/rolesAndModifiers";
import { SettingsList } from "@/app/_components/RolesList/RoleCard/SettingsList";
import { parseSettingsFile, getMatchingFileName, updateSettingValue } from '../../_utils/settingsParser';
import { buildMiraRoleSettings, looksLikeMiraConfig } from "@/app/dramaafera/_utils/miraConfig";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import CollapsibleSection from '@/app/dramaafera/_components/CollapsibleSection';
import RoleTopPerformances from './RoleTopPerformances';
import { getRoleTopPerformances } from './_getRoleTopPerformances';
import RoleDetailedStats from './RoleDetailedStats';
import { normalizeRoleName } from '@/app/dramaafera/_utils/gameUtils';
import { isKnownRole } from '@/app/dramaafera/_utils/gameUtils';
import { generateRoleStats } from './_generateRoleStats';

interface RoleDetailContentProps {
    nazwa: string;
    seasonId: number;
}

export async function RoleDetailContent({ nazwa, seasonId }: RoleDetailContentProps) {
    const roleName = normalizeRoleName(convertUrlSlugToRole(nazwa, []), seasonId);
    if (!isKnownRole(roleName, seasonId)) notFound();
    const games = await getAllGamesData(seasonId, roleName);

    // Wygeneruj statystyki dla roli
    const roleStats = generateRoleStats(games, roleName, seasonId);
    const topPerformances = getRoleTopPerformances(games, roleName, role => normalizeRoleName(role, seasonId));

    // A role nobody has played this season is not a missing page — same distinction #310 drew
    // for user profiles. A role that exists in neither registry for this era still 404s, which
    // is handled by findFullRole returning undefined below.
    if (roleStats.totalAppearances === 0) {
        const known = findFullRole(roleName, seasonId);
        if (!known) {
            notFound();
        }
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <h1 className="font-brook text-4xl mb-4">{known.name}</h1>
                <p className="font-barlow text-gray-400 mb-8">
                    Nikt nie zagrał tą rolą w sezonie {seasonId}.
                </p>
                <Link
                    href={buildSeasonUrl('/ranking', seasonId)}
                    className="font-barlow text-cyan-400 hover:text-cyan-300 underline"
                >
                    Wróć do rankingu sezonu {seasonId}
                </Link>
            </div>
        );
    }

    const roleColor = getRoleColor(roleName, seasonId);

    // Era-aware, and the ' / ' bundled-name fallback only applies to legacy seasons — see
    // findFullRole for why that restriction matters.
    const roleDefinition: Role | undefined = findFullRole(roleName, seasonId);

    // Settings come from whichever source matches the era.
    //
    // Season >= 4 reads TOU-Mira's own .cfg and the labels generated from the mod source, not
    // the hand-written `settings` on the role — those had drifted (a typo in four labels, 55
    // entries for options the mod no longer has, 59% of config keys unmatchable). Season <= 3
    // keeps the database upload and the legacy parser, unchanged. See #317.
    let roleDefinitionWithSettings = roleDefinition;

    if (roleDefinition && seasonId >= FIRST_MIRA_SEASON) {
        try {
            // The host panel uploads a .cfg to the database, so prefer that. Until the first
            // upload of a season it still holds the previous era's legacy file, which is not a
            // config at all — fall back to the snapshot committed at public/settings/mira.cfg.
            const { current } = await getDramaAferaSettings();
            let cfg = looksLikeMiraConfig(current) ? current : null;

            if (!cfg) {
                const { env } = await getCloudflareContext();
                if (env.ASSETS) {
                    const response = await env.ASSETS.fetch(new Request('http://localhost/settings/mira.cfg'));
                    if (response.ok) cfg = await response.text();
                }
            }

            if (cfg) {
                const settings = buildMiraRoleSettings(cfg, roleDefinition.name);
                if (Object.keys(settings).length > 0) {
                    roleDefinitionWithSettings = { ...roleDefinition, settings };
                }
            }
        } catch {
            // Settings are decoration; the rest of the page stands without them.
        }
    } else if (roleDefinition) {
        try {
            const { current: fileContent } = await getDramaAferaSettings();

            const { fileContentMap, cleanedFileContentMap } = parseSettingsFile(fileContent);

            roleDefinitionWithSettings = {
                ...roleDefinition,
                settings: { ...roleDefinition.settings }
            };

            Object.keys(roleDefinitionWithSettings.settings).forEach(key => {
                if (fileContentMap.has(key)) {
                    const value = fileContentMap.get(key);
                    if (value !== undefined) {
                        const setting = { ...roleDefinitionWithSettings!.settings[key] };
                        setting.value = updateSettingValue(setting.type, value);
                        roleDefinitionWithSettings!.settings[key] = setting;
                    }
                }
            });

            if (roleDefinitionWithSettings.settings["Probability Of Appearing"]) {
                const fileName = getMatchingFileName(roleDefinition.name, cleanedFileContentMap);
                const probability = fileName ? cleanedFileContentMap.get(fileName) : undefined;
                if (probability !== undefined) {
                    const setting = { ...roleDefinitionWithSettings.settings["Probability Of Appearing"] };
                    setting.value = Number.isInteger(probability) ? probability : Number(probability.toFixed(2));
                    roleDefinitionWithSettings.settings["Probability Of Appearing"] = setting;
                }
            }
        } catch (error) {
            console.error('Error loading settings from API:', error);
        }
    }

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-700/50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link href={buildSeasonUrl('/role', seasonId)} className="mb-4 inline-flex items-center gap-2 text-white transition-colors hover:text-gray-300">← Powrót do wyników ról</Link>
                    <h1 className="text-4xl font-bold text-white">
                        Statystyki roli
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Główna sekcja roli */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Obrazek roli */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <RoleImage
                                    roleName={roleName}
                                    seasonId={seasonId}
                                    width={128}
                                    height={128}
                                />
                            </div>
                        </div>

                        {/* Informacje o roli */}
                        <div className="flex-1 text-center md:text-left">
                            <h2
                                className="text-5xl font-bold mb-4"
                                style={{ color: roleColor }}
                            >
                                {roleName}
                            </h2>

                            {/* Podstawowe statystyki roli */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-cyan-400 mb-1">
                                        {roleStats.totalAppearances}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Wystąpienia
                                    </div>
                                </div>

                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">
                                        {roleStats.gamesPlayed}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide" title="Każdy gracz rozpoczynający grę tą rolą liczy się jako jeden występ.">
                                        Gier jako pierwotna rola
                                    </div>
                                </div>

                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-green-400 mb-1">
                                        {roleStats.wins}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Zwycięstw
                                    </div>
                                </div>

                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-purple-400 mb-1">
                                        {roleStats.winRate}%
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Współczynnik wygranych
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Opis roli i ustawienia */}
                {roleDefinitionWithSettings && (
                    <CollapsibleSection title="Opis i ustawienia roli" defaultOpen={false} icon="⚙️">
                    <div className="grid grid-cols-1 gap-y-5 p-5 bg-zinc-900/50 rounded-xl border-l-5 mb-6"
                         style={{borderColor: roleColor}}>
                        <div className="grid grid-cols-1 md:grid-cols-2/1 gap-5">
                            <div className="bg-zinc-900/50 rounded-xl p-4 flex flex-col gap-10 justify-between">
                                <div className="text-xl">{roleDefinitionWithSettings.description}</div>
                                <SettingsList settings={roleDefinitionWithSettings.settings}/>
                            </div>
                            <div className="bg-zinc-900/50 rounded-xl p-4">
                                <h5 className="font-brook text-5xl mb-5">Umiejętności</h5>
                                <ul className="text-xl">
                                    {roleDefinitionWithSettings.abilities.map(ability => (
                                        <li key={ability.name}
                                            className="my-2.5 font-brook text-3xl bg-zinc-800/75 p-2 rounded flex items-center justify-start gap-2">
                                            <Image src={ability.icon} alt={ability.name} width={64} height={64} className="w-8"/>
                                            {ability.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {roleDefinitionWithSettings.tip && (
                            <div className="bg-zinc-900/50 p-4 rounded-lg flex gap-5 items-center justify-start">
                                <h5 className="font-brook text-3xl">Porada: {roleDefinitionWithSettings.tip}</h5>
                            </div>
                        )}
                    </div>
                    </CollapsibleSection>
                )}

                <RoleDetailedStats
                    key={`${roleName}-${seasonId}`}
                    roleName={roleName}
                    seasonId={seasonId}
                    games={games.map(game => ({
                        id: game.id,
                        hasActionData: game.hasActionData,
                        maxTasks: game.maxTasks,
                        detailedStats: { playersData: game.detailedStats.playersData
                            .filter(player => (player.roleHistory?.length ? player.roleHistory : [player.role])
                                .some(role => normalizeRoleName(role, seasonId) === normalizeRoleName(roleName, seasonId)))
                            .map(player => ({ nickname: player.nickname, role: player.role, roleHistory: player.roleHistory, win: player.win, originalStats: player.originalStats })) },
                    })).filter(game => game.detailedStats.playersData.length > 0)}
                />
                <CollapsibleSection title="Najlepsze występy" defaultOpen={false} icon="🏆">
                    <RoleTopPerformances key={`${roleName}-${seasonId}`} performances={topPerformances} seasonId={seasonId} />
                </CollapsibleSection>

                {/* Ranking graczy którzy grali jako ta rola */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">
                        Gracze którzy grali jako {roleName}
                    </h3>

                    {roleStats.players.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Pozycja</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Gracz</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Gry</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Wygrane</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Porażki</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roleStats.players.map((playerStats, index) => (
                                        <tr key={playerStats.name} className="border-b border-gray-700/30 hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="text-gray-300 font-medium">#{index + 1}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={buildSeasonUrl(`/user/${convertNickToUrlSlug(playerStats.name)}`, seasonId)}
                                                    className="flex items-center space-x-3 hover:text-gray-300 transition-colors"
                                                >
                                                    <Image
                                                        src={getPlayerAvatarPath(playerStats.name)}
                                                        alt={playerStats.name}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full border border-gray-600"
                                                    />
                                                    <span className="text-white font-medium">
                                                        {playerStats.name}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-blue-400 font-semibold">
                                                    {playerStats.gamesWithRole}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-green-400 font-semibold">
                                                    {playerStats.winsWithRole}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-red-400 font-semibold">
                                                {playerStats.gamesWithRole - playerStats.winsWithRole}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className="font-bold text-lg"
                                                    style={{
                                                        color: playerStats.winRateWithRole >= 70 ? '#10B981' :
                                                               playerStats.winRateWithRole >= 50 ? '#F59E0B' : '#EF4444'
                                                    }}
                                                >
                                                    {playerStats.winRateWithRole}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-lg">Nikt jeszcze nie grał tą rolą</p>
                        </div>
                    )}

                    <div className="mt-4 text-center text-zinc-400">
                        Łącznie {roleStats.players.length} różnych graczy grało tą rolą
                    </div>
                </div>



            </div>
        </div>
    );
}
