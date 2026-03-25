"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { RankingPlayer } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { getRankingAction } from "@/app/dramaafera/_actions/seasonActions";

type NumericRankingKey = {
    [K in keyof RankingPlayer]: RankingPlayer[K] extends number ? K : never;
}[keyof RankingPlayer];

// Funkcja do wyznaczania rangi na podstawie punktów rankingowych
function getRankTitle(points: number): string {
    if (points >= 2500) return "PIERDOLONA LEGENDA";
    if (points >= 2400) return "CELESTIAL OVERLORD";
    if (points >= 2300) return "GRANDMASTER";
    if (points >= 2200) return "MASTER";
    if (points >= 2150) return "VIRTUOSO";
    if (points >= 2100) return "THE SPECIALIST";
    if (points >= 2050) return "THE CAPTAIN";
    if (points >= 1975) return "THE CREWMATE";
    if (points >= 1875) return "THE CADET";
    if (points >= 1750) return "THE PISSLOW";
    return "CWEL";
}

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    return `/images/avatars/${playerName}.png`;
}

// Funkcja pomocnicza do konwersji nicku na format URL-friendly
function convertNickToUrlSlug(nick: string): string {
    return nick.replace(/\s+/g, '-').toLowerCase();
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
    seasonId: number;
}

export default function RankingClient({ initialData, seasonId }: RankingClientProps) {
    const [playerStats, setPlayerStats] = useState<RankingPlayer[]>(initialData);
    const [sortBy, setSortBy] = useState<NumericRankingKey>("currentRating");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [lastUpdateHash, setLastUpdateHash] = useState<string>(() =>
        JSON.stringify(initialData.map(p => ({
            id: p.playerId,
            rating: p.currentRating,
            games: p.totalGames,
        })))
    );
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Ref to access lastUpdateHash inside useCallback without making it a dependency
    const lastUpdateHashRef = useRef(lastUpdateHash);
    useEffect(() => { lastUpdateHashRef.current = lastUpdateHash; }, [lastUpdateHash]);

    // Auto-refresh: tylko dla bieżącego sezonu, co 30 sekund
    const fetchRankingData = useCallback(async () => {
        try {
            setIsRefreshing(true);

            const result = await getRankingAction(seasonId);

            // Oblicz hash danych aby sprawdzić czy się zmieniły
            const dataHash = JSON.stringify(result.ranking.map(p => ({
                id: p.playerId,
                rating: p.currentRating,
                games: p.totalGames
            })));

            // Aktualizuj tylko jeśli dane się zmieniły
            if (dataHash !== lastUpdateHashRef.current) {
                setPlayerStats(result.ranking);
                setLastUpdateHash(dataHash);
                setLastUpdateTime(new Date());
            }
        } catch (error) {
            console.error('Błąd ładowania danych rankingu:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [seasonId]);

    // Auto-odświeżanie co 30 sekund (tylko bieżący sezon)
    useEffect(() => {
        if (seasonId !== CURRENT_SEASON) return;

        const interval = setInterval(() => {
            fetchRankingData();
        }, 30000);

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

    // Wyznacz top rankingujących graczy (najwyższy ranking)
    const topRanking = playerStats.length > 0
        ? Math.max(...playerStats.map(p => typeof p.currentRating === "number" ? p.currentRating : -Infinity))
        : null;
    const topPlayerNames = topRanking !== null
        ? playerStats.filter(p => p.currentRating === topRanking && typeof p.currentRating === "number").map(p => p.playerName)
        : [];

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
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Pozycja</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Gracz</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("currentRating")}>Ranking {sortBy === "currentRating" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("totalGames")}>Gry {sortBy === "totalGames" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("wins")}>Wygrane {sortBy === "wins" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("winRate")}>Procent wygranych {sortBy === "winRate" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStats.map((player, index) => {
                                    const hasRanking = typeof player.currentRating === "number";
                                    // Żółty nick jeśli gracz jest jednym z top rankingujących
                                    const isTopRank = hasRanking && topPlayerNames.includes(player.playerName);
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
                                                {/* TODO Phase 7: make season-aware */}
                                                <Link href={`/dramaafera/user/${convertNickToUrlSlug(player.playerName)}`}>
                                                    <div className="flex items-center space-x-3 hover:bg-gray-700/30 rounded-lg p-2 transition-colors cursor-pointer">
                                                        <Image
                                                            src={getPlayerAvatarPath(player.playerName)}
                                                            alt={`Avatar ${player.playerName}`}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full border-2 border-gray-600"
                                                        />
                                                        <span className={`font-semibold text-lg transition-colors ${isTopRank ? "text-yellow-400" : "text-white hover:text-gray-300"}`}>
                                                            {player.playerName}
                                                            {hasRanking && (
                                                                <span className="italic font-normal text-base text-gray-400 ml-2">
                                                                    ({getRankTitle(Math.round(player.currentRating))})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-2 px-2 text-yellow-300 font-bold">{hasRanking ? Math.round(player.currentRating) : '-'}</td>
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
