import Link from "next/link";
import Image from "next/image";
import { getAllGamesData } from "@/data/games";
import { generatePlayerRankingStats } from "@/data/games/converter";

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    // Każdy gracz ma swój avatar na podstawie nicku
    return `/images/avatars/${playerName}.png`;
}

// Funkcja pomocnicza do konwersji nicku na format URL-friendly
function convertNickToUrlSlug(nick: string): string {
    return nick.replace(/\s+/g, '-').toLowerCase();
}

export default async function RankingPage() {
    // Pobierz prawdziwe dane gier i wygeneruj statystyki
    const games = await getAllGamesData();
    const playerStats = generatePlayerRankingStats(games);

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link 
                        href="/dramaafera" 
                        className="text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-block"
                    >
                        ← Powrót do Drama Afera
                    </Link>
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
                                    <th className="text-left py-4 px-2 text-yellow-400 font-semibold">Pozycja</th>
                                    <th className="text-left py-4 px-2 text-yellow-400 font-semibold">Gracz</th>
                                    <th className="text-left py-4 px-2 text-yellow-400 font-semibold">Gry</th>
                                    <th className="text-left py-4 px-2 text-yellow-400 font-semibold">Wygrane</th>
                                    <th className="text-left py-4 px-2 text-yellow-400 font-semibold">Procent wygranych</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playerStats.map((player, index) => (
                                    <tr 
                                        key={player.name} 
                                        className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors"
                                    >
                                        <td className="py-4 px-2">
                                            <div className="flex items-center">
                                                {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                                                {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                                                {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                                                <span className="font-semibold text-lg">#{index + 1}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-2">
                                            <Link href={`/dramaafera/user/${convertNickToUrlSlug(player.name)}`}>
                                                <div className="flex items-center space-x-3 hover:bg-gray-700/30 rounded-lg p-2 transition-colors cursor-pointer">
                                                    <Image
                                                        src={getPlayerAvatarPath(player.name)}
                                                        alt={`Avatar ${player.name}`}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-full border-2 border-gray-600"
                                                    />
                                                    <span className="font-semibold text-lg text-white hover:text-gray-300 transition-colors">{player.name}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="py-4 px-2 text-gray-300">{player.gamesPlayed}</td>
                                        <td className="py-4 px-2 text-green-400 font-semibold">{player.wins}</td>
                                        <td className="py-4 px-2">
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30">
                        <h3 className="text-xl font-semibold text-yellow-400 mb-3">🏆 Najlepszy gracz</h3>
                        {playerStats[0] && (
                            <Link href={`/dramaafera/user/${convertNickToUrlSlug(playerStats[0].name)}`}>
                                <div className="flex items-center space-x-3 mb-2 hover:bg-yellow-500/10 rounded-lg p-2 transition-colors cursor-pointer">
                                    <Image
                                        src={getPlayerAvatarPath(playerStats[0].name)}
                                        alt={`Avatar ${playerStats[0].name}`}
                                        width={48}
                                        height={48}
                                        className="rounded-full border-2 border-yellow-400"
                                    />
                                    <p className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">{playerStats[0].name}</p>
                                </div>
                            </Link>
                        )}
                        <p className="text-gray-300">Procent wygranych: {playerStats[0]?.winRate || 0}%</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg p-6 border border-blue-500/30">
                        <h3 className="text-xl font-semibold text-blue-400 mb-3">🎮 Najwięcej gier</h3>
                        {(() => {
                            const mostActivePlayer = playerStats.find(p => p.gamesPlayed === Math.max(...playerStats.map(p => p.gamesPlayed)));
                            return mostActivePlayer ? (
                                <Link href={`/dramaafera/user/${convertNickToUrlSlug(mostActivePlayer.name)}`}>
                                    <div className="flex items-center space-x-3 mb-2 hover:bg-blue-500/10 rounded-lg p-2 transition-colors cursor-pointer">
                                        <Image
                                            src={getPlayerAvatarPath(mostActivePlayer.name)}
                                            alt={`Avatar ${mostActivePlayer.name}`}
                                            width={48}
                                            height={48}
                                            className="rounded-full border-2 border-blue-400"
                                        />
                                        <p className="text-2xl font-bold text-white hover:text-gray-300 transition-colors">{mostActivePlayer.name}</p>
                                    </div>
                                </Link>
                            ) : (
                                <p className="text-2xl font-bold">Brak danych</p>
                            );
                        })()}
                        <p className="text-gray-300">{Math.max(...playerStats.map(p => p.gamesPlayed))} gier</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg p-6 border border-green-500/30">
                        <h3 className="text-xl font-semibold text-green-400 mb-2">⭐ Średni winrate</h3>
                        <p className="text-2xl font-bold">
                            {playerStats.length > 0 ? (playerStats.reduce((acc: number, player) => acc + player.winRate, 0) / playerStats.length).toFixed(1) : '0.0'}%
                        </p>
                        <p className="text-gray-300">Wszystkich graczy</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
