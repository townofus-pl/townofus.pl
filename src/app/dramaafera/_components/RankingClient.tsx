"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { RankingPlayer, SeasonRankingHistory } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { getRankingAction, getSeasonRankingHistoriesAction } from "@/app/dramaafera/_actions/seasonActions";
import { getRankName, getRankIcon } from "@/app/dramaafera/_constants/rankTiers";
import { buildSeasonUrl } from "@/app/dramaafera/_utils/seasonHelpers";
import { convertNickToUrlSlug } from "@/app/dramaafera/_utils/gameUtils";
import { RankingChart } from "./RankingChart";

type NumericRankingKey = {
    [K in keyof RankingPlayer]: RankingPlayer[K] extends number ? K : never;
}[keyof RankingPlayer];

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    return `/images/avatars/${playerName}.png`;
}

function sortPlayers(players: RankingPlayer[], sortBy: NumericRankingKey, sortOrder: "asc" | "desc") {
    const sorted = [...players];
    sorted.sort((a, b) => {
        let valA: number = a[sortBy];
        let valB: number = b[sortBy];
        if (sortBy === "winRate") {
            valA = parseFloat(String(valA ?? 0));
            valB = parseFloat(String(valB ?? 0));
        } else {
            valA = valA ?? 0;
            valB = valB ?? 0;
        }
        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });
    return sorted;
}

interface RankingClientProps {
    initialData: RankingPlayer[];
    initialEmperorId: number | null;
    seasonId: number;
}

export default function RankingClient({ initialData, initialEmperorId, seasonId }: RankingClientProps) {
    const [emperorId, setEmperorId] = useState(initialEmperorId);
    const [playerStats, setPlayerStats] = useState<RankingPlayer[]>(initialData);
    const [sortBy, setSortBy] = useState<NumericRankingKey>("currentRating");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [lastUpdateHash, setLastUpdateHash] = useState<string>(() =>
        JSON.stringify(initialData.map(p => ({
            id: p.playerId,
            rating: p.currentRating,
            games: p.totalGames,
            dap: p.dap,
        })))
    );
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showChart, setShowChart] = useState(false);
    const showChartRef = useRef(false);
    const [rankingHistories, setRankingHistories] = useState<SeasonRankingHistory[] | null>(null);
    const [isLoadingChart, setIsLoadingChart] = useState(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const chartHistories = rankingHistories;

    const handleChartToggle = async () => {
        if (showChart) {
            showChartRef.current = false;
            setShowChart(false);
            return;
        }
        showChartRef.current = true;
        setShowChart(true);
        if (rankingHistories) return;
        setIsLoadingChart(true);
        setChartError(null);
        try {
            setRankingHistories(await getSeasonRankingHistoriesAction(seasonId));
        } catch {
            setChartError("Nie udało się wczytać wykresu. Spróbuj ponownie.");
        } finally {
            setIsLoadingChart(false);
        }
    };

    // Ref to access lastUpdateHash inside useCallback without making it a dependency
    const lastUpdateHashRef = useRef(lastUpdateHash);
    useEffect(() => { lastUpdateHashRef.current = lastUpdateHash; }, [lastUpdateHash]);

    // Auto-refresh: tylko dla bieżącego sezonu, co 30 sekund
    const fetchRankingData = useCallback(async () => {
        try {
            setIsRefreshing(true);

            const result = await getRankingAction(seasonId);
            setEmperorId(result.latestEmperorId);

            // Oblicz hash danych aby sprawdzić czy się zmieniły
            const dataHash = JSON.stringify(result.ranking.map(p => ({
                id: p.playerId,
                rating: p.currentRating,
                games: p.totalGames,
                dap: p.dap
            })));

            // Aktualizuj tylko jeśli dane się zmieniły
            if (dataHash !== lastUpdateHashRef.current) {
                setPlayerStats(result.ranking);
                setLastUpdateHash(dataHash);
                setLastUpdateTime(new Date());
                if (showChartRef.current) {
                    try {
                        setRankingHistories(await getSeasonRankingHistoriesAction(seasonId));
                        setChartError(null);
                    } catch {
                        setChartError("Nie udało się odświeżyć wykresu. Spróbuj ponownie.");
                    }
                }
            }
        } catch (error) {
            console.error('Błąd ładowania danych rankingu:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [seasonId]);

    // Auto-odświeżanie co 5 minut (tylko bieżący sezon).
    // Było 30 s, co przy ~157 tys. odczytanych wierszy na wywołanie zjadało ~19 mln wierszy
    // na godzinę z jednej otwartej karty — przy dziennym limicie D1 wynoszącym 5 mln. Dane
    // zmieniają się wyłącznie po wrzuceniu gry, czyli kilka razy w trakcie wieczoru. Zob. #299.
    useEffect(() => {
        if (seasonId !== CURRENT_SEASON) return;

        const interval = setInterval(() => {
            fetchRankingData();
        }, 300000);

        return () => clearInterval(interval);
    }, [seasonId, fetchRankingData]);

    // Sortowanie z obsługą currentRating
    const sortedStats = sortPlayers(playerStats, sortBy, sortOrder);
    function handleSort(column: NumericRankingKey) {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    }

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Ranking Graczy
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        Najlepsi gracze Drama Afera Among Us
                    </p>
                    {/* Informacja o auto-odświeżaniu (tylko bieżący sezon) */}
                    {seasonId === CURRENT_SEASON && (
                        <div className="text-center mt-3 flex items-center justify-center gap-2">
                            <span className={`inline-block w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
                            <span className="text-sm text-gray-400">
                                {isRefreshing ? 'Sprawdzanie aktualizacji...' : lastUpdateTime ? `Ostatnia aktualizacja: ${lastUpdateTime.toLocaleTimeString('pl-PL')}` : 'Auto-odświeżanie włączone'}
                            </span>
                        </div>
                    )}
                </div>

                <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-gray-400">DAP — suma punktów w sezonie, aktualizuje się na początku każdej sesji.</p>
                        <button type="button" onClick={handleChartToggle} disabled={isLoadingChart}
                            className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-white transition-colors hover:bg-zinc-700 disabled:cursor-wait disabled:opacity-60">
                            {isLoadingChart ? "Wczytywanie wykresu…" : showChart ? "Pokaż ranking w tabeli" : "Pokaż ranking w formie wykresu"}
                        </button>
                    </div>
                    {showChart ? (
                        <div className="min-h-80">
                            {chartError && <p role="alert" className="py-8 text-center text-red-400">{chartError}</p>}
                            {isLoadingChart && <p role="status" className="py-8 text-center text-gray-400">Wczytywanie historii rankingu…</p>}
                            {rankingHistories && rankingHistories.length === 0 && <p className="py-8 text-center text-gray-400">Brak historii rankingu w tym sezonie.</p>}
                            {rankingHistories && rankingHistories.length > 0 && <>
                                <p className="mb-6 text-center text-sm text-gray-400">Ostatnie {chartHistories?.[0]?.data.length ?? 0} gier sezonu</p>
                                <div className="w-full overflow-x-auto overflow-y-hidden">
                                    <div className="h-[72rem] min-w-[1200px]">
                                        <RankingChart data={[]} seasonId={seasonId} includeStartingPoint={false} comparison={chartHistories ?? []} expanded />
                                    </div>
                                </div>
                            </>}
                        </div>
                    ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Pozycja</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Gracz</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Ranga</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("currentRating")}>Ranking {sortBy === "currentRating" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("dap")} title="Suma punktów w sezonie, bez najnowszego dnia z grami">DAP {sortBy === "dap" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("totalGames")}>Gry {sortBy === "totalGames" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("wins")}>Wygrane {sortBy === "wins" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("winRate")}>Procent wygranych {sortBy === "winRate" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStats.map((player, index) => {
                                    const hasRanking = typeof player.currentRating === "number";
                                    const rankIcon = hasRanking ? getRankIcon(Math.round(player.currentRating)) : undefined;
                                    const isEmperor = player.playerId === emperorId;
                                    return (
                                        <tr
                                            key={player.playerName}
                                            className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors${!hasRanking ? " opacity-50" : ""}`}
                                        >
                                            <td className="py-2 px-2">
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-lg">#{index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-2">
                                            <Link href={buildSeasonUrl(`/user/${convertNickToUrlSlug(player.playerName)}`, seasonId)}>
                                                    <div className="flex items-center space-x-3 hover:bg-gray-700/30 rounded-lg p-2 transition-colors cursor-pointer">
                                                        <Image
                                                            src={hasRanking && Math.round(player.currentRating) === 2137 ? "/images/avatars/papaj.jpg" : getPlayerAvatarPath(player.playerName)}
                                                            alt={`Avatar ${player.playerName}`}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full border-2 border-gray-600"
                                                        />
                                                        <span className={`font-semibold text-lg transition-colors ${isEmperor ? "text-yellow-400" : "text-white hover:text-gray-300"}`}>
                                                            {isEmperor && (
                                                                <Image
                                                                    src="/images/ranks/emperor.webp"
                                                                    alt="Emperor"
                                                                    title="Emperor"
                                                                    width={28}
                                                                    height={28}
                                                                    className="mr-2 inline-block h-7 w-7 align-middle object-contain"
                                                                />
                                                            )}
                                                            {player.playerName}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-2 px-2 text-gray-400">
                                                {hasRanking ? (
                                                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                                        {rankIcon && (
                                                            <Image
                                                                src={rankIcon}
                                                                alt={getRankName(Math.round(player.currentRating))}
                                                                title={getRankName(Math.round(player.currentRating))}
                                                                width={28}
                                                                height={28}
                                                                className="h-7 w-7 shrink-0 object-contain"
                                                            />
                                                        )}
                                                        <span className={rankIcon ? "hidden sm:inline" : undefined}>{getRankName(Math.round(player.currentRating))}</span>
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="py-2 px-2 text-yellow-300 font-bold">{hasRanking ? Math.round(player.currentRating) : '-'}</td>
                                            <td className="py-2 px-2 text-gray-300">{player.dap.toFixed(1)}</td>
                                            <td className="py-2 px-2 text-gray-300">{player.totalGames}</td>
                                            <td className="py-2 px-2 text-green-400 font-semibold">{player.wins}</td>
                                            <td className="py-2 px-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-20 bg-gray-600 rounded-full h-2">
                                                        <div
                                                            className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full"
                                                            style={{ width: `${Math.min(100, Math.max(0, player.winRate))}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-sm font-semibold">{player.winRate}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>

                {sortedStats.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">Brak dostępnych danych</p>
                    </div>
                )}
            </div>
        </div>
    );
}
