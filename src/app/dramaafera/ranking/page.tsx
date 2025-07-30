
"use client";

// Funkcja do wyznaczania rangi na podstawie punktów rankingowych
function getRankTitle(points?: number): string {
    if (typeof points !== "number") return "";
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

// Typ dla statystyk gracza
type PlayerRankingStats = {
    name: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    rankingPoints?: number; // Dodane pole na punkty rankingowe
};
import Link from "next/link";
import Image from "next/image";


import { getAllGamesData } from "@/data/games";
import { generatePlayerRankingStats } from "@/data/games/converter";
import playerRankingPoints from "@/data/games/playerRankingPoints";

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    // Każdy gracz ma swój avatar na podstawie nicku
    return `/images/avatars/${playerName}.png`;
}

// Funkcja pomocnicza do konwersji nicku na format URL-friendly
function convertNickToUrlSlug(nick: string): string {
    return nick.replace(/\s+/g, '-').toLowerCase();
}


import { useEffect, useState as useClientState } from "react";

function sortPlayers(players: PlayerRankingStats[], sortBy: keyof PlayerRankingStats, sortOrder: "asc" | "desc") {
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

export default function RankingPageWrapper() {
    // Użyj stanu po stronie klienta do sortowania
    const [playerStats, setPlayerStats] = useClientState<PlayerRankingStats[]>([]);
    const [sortBy, setSortBy] = useClientState<keyof PlayerRankingStats>("rankingPoints");
    const [sortOrder, setSortOrder] = useClientState<"asc" | "desc">("desc");

    useEffect(() => {
        (async () => {
            const games = await getAllGamesData();
            let stats = generatePlayerRankingStats(games);
            // Dodaj rankingPoints z playerRankingPoints lub domyślnie 2000
            stats = stats.map(player => ({
                ...player,
                rankingPoints: playerRankingPoints[player.name]
            }));
            setPlayerStats(stats);
        })();
        // setPlayerStats is a stable setter from useState, so it does not need to be in the dependency array
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    // Rozszerz sortowanie o rankingPoints
    const sortPlayersWithRanking = (players: PlayerRankingStats[], sortBy: keyof PlayerRankingStats, sortOrder: "asc" | "desc") => {
        if (sortBy === "rankingPoints") {
            return [...players].sort((a, b) => {
                const valA = typeof a.rankingPoints === "number" ? a.rankingPoints : 0;
                const valB = typeof b.rankingPoints === "number" ? b.rankingPoints : 0;
                if (valA < valB) return sortOrder === "asc" ? -1 : 1;
                if (valA > valB) return sortOrder === "asc" ? 1 : -1;
                return 0;
            });
        }
        return sortPlayers(players, sortBy, sortOrder);
    };



    const sortedStats = sortPlayersWithRanking(playerStats, sortBy, sortOrder);



    function handleSort(column: keyof PlayerRankingStats) {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    }
    // Wyznacz top rankingujących graczy (najwyższy ranking) - tylko jedna deklaracja przed return
    const topRanking = Math.max(...playerStats.map(p => typeof p.rankingPoints === "number" ? p.rankingPoints : -Infinity));
    const topPlayerNames = playerStats.filter(p => p.rankingPoints === topRanking && typeof p.rankingPoints === "number").map(p => p.name);

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

                <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="border-b border-gray-600">
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Pozycja</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Gracz</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("rankingPoints")}>Ranking {sortBy === "rankingPoints" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("gamesPlayed")}>Gry {sortBy === "gamesPlayed" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("wins")}>Wygrane {sortBy === "wins" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                    <th className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none" onClick={() => handleSort("winRate")}>Procent wygranych {sortBy === "winRate" && (sortOrder === "asc" ? "▲" : "▼")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStats.map((player, index) => {
                                    const hasRanking = typeof player.rankingPoints === "number";
                                    // Żółty nick jeśli gracz jest jednym z top rankingujących
                                    const isTopRank = hasRanking && topPlayerNames.includes(player.name);
                                    return (
                                        <tr
                                            key={player.name}
                                            className={`border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors${!hasRanking ? " opacity-50" : ""}`}
                                        >
                                            <td className="py-2 px-2">
                                                <div className="flex items-center">
                                                    <span className="font-semibold text-lg">#{index + 1}</span>
                                                </div>
                                            </td>
                                            <td className="py-2 px-2">
                                                <Link href={`/dramaafera/user/${convertNickToUrlSlug(player.name)}`}>
                                                    <div className="flex items-center space-x-3 hover:bg-gray-700/30 rounded-lg p-2 transition-colors cursor-pointer">
                                                        <Image
                                                            src={getPlayerAvatarPath(player.name)}
                                                            alt={`Avatar ${player.name}`}
                                                            width={40}
                                                            height={40}
                                                            className="rounded-full border-2 border-gray-600"
                                                        />
                                                        <span className={`font-semibold text-lg transition-colors ${isTopRank ? "text-yellow-400" : "text-white hover:text-gray-300"}`}>
                                                            {player.name}
                                                            {getRankTitle(player.rankingPoints) && (
                                                                <span className="italic font-normal text-base text-gray-400 ml-2">
                                                                    ({getRankTitle(player.rankingPoints)})
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="py-2 px-2 text-yellow-300 font-bold">{hasRanking ? player.rankingPoints : '-'}</td>
                                            <td className="py-2 px-2 text-gray-300">{player.gamesPlayed}</td>
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
            </div>
        </div>
    );
}
