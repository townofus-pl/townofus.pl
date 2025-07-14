import Link from "next/link";
import Image from "next/image";
import { getAllGamesData } from "@/data/games";
import { generateUserProfileStats } from "@/data/games/converter";
import { notFound } from "next/navigation";

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    return `/images/avatars/${playerName}.png`;
}

// Funkcja pomocnicza do konwersji nicku na format URL-friendly
function convertNickToUrlSlug(nick: string): string {
    return nick.replace(/\s+/g, '-').toLowerCase();
}

// Funkcja pomocnicza do konwersji URL slug z powrotem na nick
function convertUrlSlugToNick(slug: string, allPlayerNames: string[]): string {
    // Najpierw spróbuj znaleźć dokładne dopasowanie przez konwersję wszystkich nicków
    const slugLower = slug.toLowerCase();
    for (const nick of allPlayerNames) {
        if (convertNickToUrlSlug(nick) === slugLower) {
            return nick;
        }
    }
    
    // Fallback - konwertuj myślniki na spacje i zdekoduj
    return decodeURIComponent(slug.replace(/-/g, ' '));
}

interface UserProfileProps {
    params: Promise<{ nick: string }>;
}

export async function generateStaticParams() {
    const games = await getAllGamesData();
    const allPlayerNames = new Set<string>();
    
    games.forEach(game => {
        game.detailedStats.playersData.forEach(player => {
            allPlayerNames.add(player.nickname);
        });
    });
    
    return Array.from(allPlayerNames).map(nick => ({
        nick: convertNickToUrlSlug(nick),
    }));
}


export default async function UserProfilePage({ params }: UserProfileProps) {
    // Pobierz wszystkie gry
    const { nick } = await params;
    const games = await getAllGamesData();

    // Pobierz listę wszystkich nicków
    const allPlayerNames: string[] = [];
    games.forEach(game => {
        game.detailedStats.playersData.forEach(player => {
            if (!allPlayerNames.includes(player.nickname)) {
                allPlayerNames.push(player.nickname);
            }
        });
    });

    const playerNick = convertUrlSlugToNick(nick, allPlayerNames);

    // Wygeneruj statystyki dla wszystkich graczy
    const allStats = generateUserProfileStats(games);

    // Znajdź statystyki dla konkretnego gracza
    const playerStats = allStats.find(stats => stats.name === playerNick);

    if (!playerStats) {
        notFound();
    }

    // Oblicz winratio (już jest obliczone w generateUserProfileStats)
    const winRatio = playerStats.winRate;

    return (
        <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md rounded-t-xl border-b border-zinc-700/50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link 
                        href="/dramaafera/ranking"
                        className="text-white hover:text-gray-300 transition-colors mb-4 inline-flex items-center gap-2"
                    >
                        ← Powrót do rankingu
                    </Link>
                    <h1 className="text-4xl font-bold text-white">
                        Profil gracza
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Główna sekcja profilu */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <Image
                                    src={getPlayerAvatarPath(playerNick)}
                                    alt={playerNick}
                                    width={128}
                                    height={128}
                                    className="rounded-full border-4 border-white/50"
                                />
                            </div>
                        </div>

                        {/* Informacje o graczu */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-5xl font-bold mb-4 text-white">
                                {playerNick}
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Liczba zagranych gier */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">
                                        {playerStats.gamesPlayed}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Zagranych gier
                                    </div>
                                </div>

                                {/* Liczba wygranych gier */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-green-400 mb-1">
                                        {playerStats.wins}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Wygranych gier
                                    </div>
                                </div>

                                {/* Win ratio */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-purple-400 mb-1">
                                        {winRatio}%
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Współczynnik wygranych
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dodatkowe statystyki */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">Szczegółowe statystyki</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.impostorGames}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Gier jako Impostor
                            </div>
                        </div>
                        
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-cyan-400">
                                {playerStats.crewmateGames}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Gier jako Crewmate
                            </div>
                        </div>
                        
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-yellow-400">
                                {playerStats.neutralGames}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Gier jako Neutral
                            </div>
                        </div>
                        
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-pink-400">
                                {playerStats.totalTasks}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Wykonanych tasków
                            </div>
                        </div>

                        {/* Nowe statystyki */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctKills}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Poprawnych zabójstw
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectKills}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Niepoprawnych zabójstw
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctGuesses}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Poprawnych guessów
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectGuesses}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Niepoprawnych guessów
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
