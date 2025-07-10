import Link from "next/link";
import Image from "next/image";
import { getGameDatesList } from "@/data/games";

// Funkcja pomocnicza do zbierania unikalnych nicków graczy z danej daty
function getUniquePlayersFromDate(dateGroup: any): string[] {
    const allPlayers = new Set<string>();
    dateGroup.games.forEach((game: any) => {
        game.allPlayerNames?.forEach((playerName: string) => {
            allPlayers.add(playerName);
        });
    });
    return Array.from(allPlayers).sort();
}

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    return `/images/avatars/${playerName}.png`;
}

export default async function HistoriaGierPage() {
    const dates = await getGameDatesList();

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
                        Historia Gier
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        Wybierz datę aby zobaczyć rozgrywki z danego dnia
                    </p>
                </div>

                {/* Link do wszystkich gier */}


                <div className="space-y-4">
                    {dates.map((dateGroup) => (
                        <Link 
                            key={dateGroup.date}
                            href={`/dramaafera/historia-gier/${dateGroup.date}`}
                            className="block"
                        >
                            <div className="bg-zinc-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 hover:bg-zinc-900/70 transition-all duration-200 cursor-pointer">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-4 mb-3">
                                            <span className="text-3xl font-bold text-blue-400">📅</span>
                                            <span className="text-2xl font-bold text-white">{dateGroup.displayDate}</span>
                                            <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded text-sm">
                                                {dateGroup.totalGames} {dateGroup.totalGames === 1 ? 'gra' : 'gier'}
                                            </span>
                                            <span className="bg-green-600/30 text-green-300 px-3 py-1 rounded text-sm">
                                                {getUniquePlayersFromDate(dateGroup).length} graczy
                                            </span>
                                        </div>
                                        
                                        <div className="text-gray-300">
                                            <div className="flex flex-wrap gap-1 items-center">
                                                <span className="text-sm mr-2">Gracze:</span>
                                                {getUniquePlayersFromDate(dateGroup).map((playerName) => (
                                                    <div key={playerName} className="relative group">
                                                        <Image
                                                            src={getPlayerAvatarPath(playerName)}
                                                            alt={playerName}
                                                            width={20}
                                                            height={20}
                                                            className="rounded-full border border-gray-600 hover:border-white transition-colors cursor-pointer"
                                                        />
                                                        {/* Tooltip z nickiem */}
                                                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                            {playerName}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 lg:mt-0">
                                        <span className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                                            Kliknij aby zobaczyć gry →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {dates.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 text-lg">Brak dostępnych gier</p>
                    </div>
                )}
            </div>
        </div>
    );
}
