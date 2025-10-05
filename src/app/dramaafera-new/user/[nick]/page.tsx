import Link from "next/link";
import Image from "next/image";
import { getGamesList, getPlayerStats } from "../../_services/gameDataService";
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
    // Return empty array during build time as Cloudflare context is not available
    // This will be populated at runtime
    return [];
}

export default async function UserProfilePage({ params }: UserProfileProps) {
    const { nick } = await params;
    
    // Get all games to find player names
    const games = await getGamesList();
    const allPlayerNames: string[] = [];
    games.forEach(game => {
        game.allPlayerNames.forEach(playerName => {
            if (!allPlayerNames.includes(playerName)) {
                allPlayerNames.push(playerName);
            }
        });
    });

    const playerNick = convertUrlSlugToNick(nick, allPlayerNames);

    // Get player statistics from database
    const playerStats = await getPlayerStats(playerNick);

    if (!playerStats) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md rounded-t-xl border-b border-zinc-700/50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link 
                        href="/dramaafera-new/ranking"
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
                            <h2 className="text-5xl font-bold text-white mb-6">
                                {playerNick}
                            </h2>
                            
                            {/* Podstawowe statystyki */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {/* Liczba zagranych gier */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">
                                        {playerStats.totalGames}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Zagranych gier
                                    </div>
                                </div>

                                {/* Liczba zwycięstw */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-green-400 mb-1">
                                        {playerStats.wins}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Zwycięstw
                                    </div>
                                </div>

                                {/* Win ratio */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-purple-400 mb-1">
                                        {Math.round(playerStats.winRate)}%
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Współczynnik wygranych
                                    </div>
                                </div>

                                {/* Łączne punkty */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-yellow-400 mb-1">
                                        {Math.round(playerStats.totalPoints)}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Łączne punkty
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statystyki zespołowe */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6 mb-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">Statystyki zespołowe</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Crewmate */}
                        <div className="bg-cyan-900/20 rounded-lg p-6 border border-cyan-700/50">
                            <h4 className="text-xl font-bold text-cyan-300 mb-3 text-center">Crewmate</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Gry:</span>
                                    <span className="text-cyan-300 font-semibold">{playerStats.teamStats.crewmate.games}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Wygrane:</span>
                                    <span className="text-green-300 font-semibold">{playerStats.teamStats.crewmate.wins}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Win Rate:</span>
                                    <span className="text-purple-300 font-semibold">
                                        {playerStats.teamStats.crewmate.games > 0 
                                            ? Math.round((playerStats.teamStats.crewmate.wins / playerStats.teamStats.crewmate.games) * 100)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Impostor */}
                        <div className="bg-red-900/20 rounded-lg p-6 border border-red-700/50">
                            <h4 className="text-xl font-bold text-red-300 mb-3 text-center">Impostor</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Gry:</span>
                                    <span className="text-red-300 font-semibold">{playerStats.teamStats.impostor.games}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Wygrane:</span>
                                    <span className="text-green-300 font-semibold">{playerStats.teamStats.impostor.wins}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Win Rate:</span>
                                    <span className="text-purple-300 font-semibold">
                                        {playerStats.teamStats.impostor.games > 0 
                                            ? Math.round((playerStats.teamStats.impostor.wins / playerStats.teamStats.impostor.games) * 100)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Neutral */}
                        <div className="bg-gray-900/20 rounded-lg p-6 border border-gray-700/50">
                            <h4 className="text-xl font-bold text-gray-300 mb-3 text-center">Neutral</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Gry:</span>
                                    <span className="text-gray-300 font-semibold">{playerStats.teamStats.neutral.games}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Wygrane:</span>
                                    <span className="text-green-300 font-semibold">{playerStats.teamStats.neutral.wins}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-300">Win Rate:</span>
                                    <span className="text-purple-300 font-semibold">
                                        {playerStats.teamStats.neutral.games > 0 
                                            ? Math.round((playerStats.teamStats.neutral.wins / playerStats.teamStats.neutral.games) * 100)
                                            : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Ulubione role i dane */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6 mb-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">Preferencje gracza</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-zinc-800/30 rounded-lg">
                            <h4 className="text-lg font-semibold text-yellow-400 mb-2">Ulubiona rola</h4>
                            <div className="text-2xl font-bold text-white">
                                {playerStats.favoriteRole}
                            </div>
                        </div>
                        
                        <div className="text-center p-6 bg-zinc-800/30 rounded-lg">
                            <h4 className="text-lg font-semibold text-blue-400 mb-2">Ulubiony zespół</h4>
                            <div className="text-2xl font-bold text-white">
                                {playerStats.favoriteTeam}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Role i modyfikatory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Role */}
                    <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6">
                        <h3 className="text-xl font-bold mb-4 text-center">Role zagrane</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {Object.entries(playerStats.roles)
                                .sort(([,a], [,b]) => b - a)
                                .map(([role, count]) => (
                                    <div key={role} className="flex justify-between items-center p-2 bg-zinc-800/30 rounded">
                                        <span className="text-gray-300">{role}</span>
                                        <span className="text-blue-300 font-semibold">{count}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Modyfikatory */}
                    <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6">
                        <h3 className="text-xl font-bold mb-4 text-center">Modyfikatory</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {Object.entries(playerStats.modifiers).length > 0 ? 
                                Object.entries(playerStats.modifiers)
                                    .sort(([,a], [,b]) => b - a)
                                    .map(([modifier, count]) => (
                                        <div key={modifier} className="flex justify-between items-center p-2 bg-zinc-800/30 rounded">
                                            <span className="text-gray-300">{modifier}</span>
                                            <span className="text-purple-300 font-semibold">{count}</span>
                                        </div>
                                    ))
                                : (
                                    <div className="text-center text-gray-400 py-4">
                                        Brak modyfikatorów
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}