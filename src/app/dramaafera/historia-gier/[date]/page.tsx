import Link from "next/link";
import Image from "next/image";
import { getGamesListByDate, formatDisplayDate, getGameDatesList } from "@/data/games";
import { TeamColors } from "@/constants/teams";
import { notFound } from "next/navigation";

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    return `/images/avatars/${playerName}.png`;
}

// Funkcja pomocnicza do wyciągania numeru partii z ID gry
function getGameNumber(gameId: string): string {
    // Format ID: "20250702_2156_14" -> zwraca "14."
    const parts = gameId.split('_');
    let number;
    if (parts.length >= 3) {
        number = parts[2];
    } else {
        // Fallback - ostatnia część po ostatnim podkreślniku
        number = gameId.split('_').pop() || gameId;
    }
    
    // Usuń zera z przodu i dodaj kropkę
    const cleanNumber = parseInt(number, 10).toString();
    return `${cleanNumber}.`;
}

interface DatePageProps {
    params: Promise<{
        date: string;
    }>;
}

export async function generateStaticParams() {
    const dates = await getGameDatesList();
    return dates.map((dateGroup) => ({
        date: dateGroup.date,
    }));
}

export default async function DateGamesPage({ params }: DatePageProps) {
    const {date} = await params;
    const games = await getGamesListByDate(date);
    
    if (games.length === 0) {
        notFound();
    }

    const displayDate = formatDisplayDate(date);

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link 
                        href="/dramaafera/historia-gier" 
                        className="text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-block"
                    >
                        ← Powrót do Historii Gier
                    </Link>
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        {displayDate}
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        {games.length} {games.length === 1 ? 'rozgrywka' : games.length < 5 ? 'rozgrywki' : 'rozgrywek'} z tego dnia
                    </p>
                    <div className="text-center mt-4">
                        <Link
                            href={`/dramaafera/historia-gier/${date}/wyniki`}
                            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg shadow transition-colors text-lg"
                        >
                            🏅 Zobacz wyniki dnia
                        </Link>
                    </div>
                </div>

                <div className="space-y-4">
                    {games.map((game) => (
                        <Link 
                            key={game.id}
                            href={`/dramaafera/historia-gier/${date}/${game.id}`}
                            className="block"
                        >
                            <div className="bg-zinc-900/50 rounded-xl p-6 border border-gray-700/50 hover:border-gray-600/50 hover:bg-zinc-900/70 transition-all duration-200 cursor-pointer">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1">                        <div className="flex items-center space-x-4 mb-3">
                            <span className="text-2xl font-bold text-blue-400">{getGameNumber(game.id)} partia</span>
                            <span className="text-gray-400">{game.date}</span>
                            <span className="bg-gray-700 px-2 py-1 rounded text-sm">{game.duration}</span>
                            <span className="bg-blue-600/30 text-blue-300 px-2 py-1 rounded text-sm">
                                {game.players} graczy
                            </span>
                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-yellow-400 font-semibold">🏆 Zwycięzca:</span>
                                                    <span 
                                                        className="font-semibold"
                                                        style={{
                                                            color: game.winnerColor || (
                                                                game.winner === 'Crewmate' ? TeamColors.Crewmate :
                                                                game.winner === 'Impostor' ? TeamColors.Impostor : TeamColors.Neutral
                                                            )
                                                        }}
                                                    >
                                                        {game.winner}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="text-green-400 font-semibold">🗺️ Mapa:</span>
                                                    <span className="text-gray-300">{game.map}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-700/50">
                                    <span className="text-gray-400 text-sm block mb-2">Zwycięzcy:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {game.winnerNames.map((nickname, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2 px-2 py-1 rounded text-sm border font-medium"
                                                style={{
                                                    backgroundColor: game.winnerColors[nickname] ? `${game.winnerColors[nickname]}20` :
                                                        game.winner === 'Crewmate' ? `${TeamColors.Crewmate}20` :
                                                        game.winner === 'Impostor' ? `${TeamColors.Impostor}20` : `${TeamColors.Neutral}20`,
                                                    borderColor: game.winnerColors[nickname] ? `${game.winnerColors[nickname]}50` :
                                                        game.winner === 'Crewmate' ? `${TeamColors.Crewmate}50` :
                                                        game.winner === 'Impostor' ? `${TeamColors.Impostor}50` : `${TeamColors.Neutral}50`
                                                }}
                                            >
                                                <Image
                                                    src={getPlayerAvatarPath(nickname)}
                                                    alt={`Avatar ${nickname}`}
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full border"
                                                    style={{
                                                        borderColor: game.winnerColors[nickname] ? game.winnerColors[nickname] :
                                                            game.winner === 'Crewmate' ? TeamColors.Crewmate :
                                                            game.winner === 'Impostor' ? TeamColors.Impostor : TeamColors.Neutral
                                                    }}
                                                />
                                                <span
                                                    style={{
                                                        color: game.winnerColors[nickname] ? game.winnerColors[nickname] :
                                                            game.winner === 'Crewmate' ? TeamColors.Crewmate :
                                                            game.winner === 'Impostor' ? TeamColors.Impostor : TeamColors.Neutral
                                                    }}
                                                >
                                                    {nickname}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-3 text-right">
                                    <span className="text-blue-400 text-sm hover:text-blue-300 transition-colors">
                                        Kliknij aby zobaczyć szczegóły →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
