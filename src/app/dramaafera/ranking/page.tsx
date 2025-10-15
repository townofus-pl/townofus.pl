"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Interfejs dla danych rankingu z API
interface RankingPlayer {
    rank: number;
    playerId: number;
    playerName: string;
    currentRating: number;
    totalGames: number;
    wins: number;
    losses: number;
    winRate: number;
    lastUpdated: string;
}

interface RankingApiResponse {
    success: boolean;
    data: {
        ranking: RankingPlayer[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    };
}

// Funkcja do wyznaczania rangi na podstawie punktów rankingowych
function getRankTitle(points: number): string {
    if (points >= 2222) return "CELESTIAL OVERLORD";
    if (points >= 2200) return "GRANDMASTER";
    if (points >= 2175) return "MASTER";
    if (points >= 2125) return "VIRTUOSO";
    if (points >= 2075) return "THE SPECIALIST";
    if (points >= 2025) return "THE CAPTAIN";
    if (points >= 1975) return "THE CREWMATE";
    if (points >= 1925) return "THE CADET";
    if (points >= 1850) return "THE PISSLOW";
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

function sortPlayers(players: RankingPlayer[], sortBy: keyof RankingPlayer, sortOrder: "asc" | "desc") {
    const sorted = [...players];
    sorted.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
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

export default function RankingPage() {
    const [playerStats, setPlayerStats] = useState<RankingPlayer[]>([]);
    const [sortBy, setSortBy] = useState<keyof RankingPlayer>("currentRating");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/ranking');
                if (!response.ok) {
                    throw new Error('Failed to fetch ranking data');
                }
                const data: RankingApiResponse = await response.json();
                setPlayerStats(data.data.ranking);
            } catch (error) {
                console.error('Błąd ładowania danych rankingu:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    // Rozszerz sortowanie o currentRating (zastępuje rankingPoints)
    const sortPlayersWithRanking = (players: RankingPlayer[], sortBy: keyof RankingPlayer, sortOrder: "asc" | "desc") => {
        if (sortBy === "currentRating") {
            return [...players].sort((a, b) => {
                const valA = typeof a.currentRating === "number" ? a.currentRating : 0;
                const valB = typeof b.currentRating === "number" ? b.currentRating : 0;
                if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortPlayers(players, sortBy, sortOrder);
    };

    const sortedStats = sortPlayersWithRanking(playerStats, sortBy, sortOrder);

    function handleSort(column: keyof RankingPlayer) {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    }

    // Wyznacz top rankingujących graczy (najwyższy ranking)
    const topRanking = Math.max(...playerStats.map(p => typeof p.currentRating === "number" ? p.currentRating : -Infinity));
    const topPlayerNames = playerStats.filter(p => p.currentRating === topRanking && typeof p.currentRating === "number").map(p => p.playerName);

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
                </div>

                {/* Loading state */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                        <p className="mt-4 text-gray-300">Ładowanie danych gier...</p>
                    </div>
                )}

                {/* Content - only show when not loading */}
                {!isLoading && (
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
                                                            {getRankTitle(Math.round(player.currentRating)) && (
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
                                                            style={{ width: `${player.winRate}%` }}
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
                )}

                {!isLoading && sortedStats.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">Brak dostępnych danych</p>
                    </div>
                )}
            </div>
        </div>
    );
}