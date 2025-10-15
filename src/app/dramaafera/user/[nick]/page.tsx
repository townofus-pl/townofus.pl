import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getUserProfileStats, getPlayersList, getPlayerRankingHistory } from "../../_services/gameDataService";
import { notFound } from "next/navigation";
import { RankingChart } from "../../_components/RankingChart";

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

export async function generateMetadata({ params }: UserProfileProps): Promise<Metadata> {
    const { nick } = await params;
    const playerName = decodeURIComponent(nick.replace(/-/g, ' '));
    
    return {
        title: `${playerName} - Profil gracza | Drama Afera`,
        description: `Statystyki gracza ${playerName} w Among Us Drama Afera. Historia rankingu, zagranych gier i szczegółowe statystyki.`,
    };
}

export default async function UserProfilePage({ params }: UserProfileProps) {
    const { nick } = await params;
    
    // Pobierz listę wszystkich graczy z bazy danych
    const allPlayerNames = await getPlayersList();
    
    if (allPlayerNames.length === 0) {
        notFound();
    }

    const playerNick = convertUrlSlugToNick(nick, allPlayerNames);

    // Pobierz statystyki dla konkretnego gracza z bazy danych
    const playerStats = await getUserProfileStats(playerNick);

    if (!playerStats) {
        notFound();
    }

    // Pobierz historię rankingu gracza
    const rankingHistory = await getPlayerRankingHistory(playerNick);

    // Oblicz winratio (już jest obliczone w generateUserProfileStats)
    const winRatio = playerStats.winRate;

    // Oblicz sumę poprawnych i niepoprawnych zagrań
    const totalCorrectPlays = playerStats.correctKills + playerStats.correctGuesses + 
                             playerStats.correctMedicShields + playerStats.correctJailorExecutes +
                             playerStats.correctDeputyShoots + playerStats.correctProsecutes +
                             playerStats.correctWardenFortifies + playerStats.correctAltruistRevives +
                             playerStats.correctSwaps;

    const totalIncorrectPlays = playerStats.incorrectKills + playerStats.incorrectGuesses + 
                               playerStats.incorrectMedicShields + playerStats.incorrectJailorExecutes +
                               playerStats.incorrectDeputyShoots + playerStats.incorrectProsecutes +
                               playerStats.incorrectWardenFortifies + playerStats.incorrectAltruistRevives +
                               playerStats.incorrectSwaps;

    const totalPlays = totalCorrectPlays + totalIncorrectPlays;
    const correctnessRatio = totalPlays > 0 ? Math.round((totalCorrectPlays / totalPlays) * 100) : 0;

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

                            {/* Dodatkowy rząd ze statystykami poprawności */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                {/* Poprawne zagrania */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-2xl font-bold text-green-400 mb-1">
                                        {totalCorrectPlays}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Poprawnych zagrań
                                    </div>
                                </div>

                                {/* Niepoprawne zagrania */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-2xl font-bold text-red-400 mb-1">
                                        {totalIncorrectPlays}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Niepoprawnych zagrań
                                    </div>
                                </div>

                                {/* Współczynnik poprawności */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-2xl font-bold text-yellow-400 mb-1">
                                        {correctnessRatio}%
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Współczynnik poprawności
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Historia rankingu */}
                {rankingHistory.length > 0 && (
                    <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6 mb-6">
                        <h3 className="text-2xl font-bold mb-6 text-center">Historia rankingu</h3>
                        
                        <div className="w-full h-80 rounded-lg p-2 md:p-4 overflow-hidden">
                            <RankingChart data={rankingHistory} playerName={playerNick} />
                        </div>
                        
                        {/* Podsumowanie rankingu */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-blue-400">
                                    {rankingHistory[rankingHistory.length - 1]?.score.toFixed(1) || '0'}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Obecny ranking
                                </div>
                            </div>
                            
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {Math.max(...rankingHistory.map(r => r.score)).toFixed(1)}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Najwyższy ranking
                                </div>
                            </div>
                            
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {Math.min(...rankingHistory.map(r => r.score)).toFixed(1)}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Najniższy ranking
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                {playerStats.maxTasks > 0 ? `${playerStats.totalTasks}/${playerStats.maxTasks}` : playerStats.totalTasks}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Wykonanych tasków
                            </div>
                        </div>

                        {/* Statystyki zabójstw */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctKills}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct kills
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectKills}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect kills
                            </div>
                        </div>

                        {/* Statystyki zgadywań */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctGuesses}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct guesses
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectGuesses}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect guesses
                            </div>
                        </div>

                        {/* Statystyki tarcz medyka */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctMedicShields}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct shields
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectMedicShields}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect shields
                            </div>
                        </div>

                        {/* Statystyki Jailor Executes */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctJailorExecutes}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct executions
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectJailorExecutes}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect executions
                            </div>
                        </div>

                        {/* Statystyki Deputy Shoots */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctDeputyShoots}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct Deputy shoots
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectDeputyShoots}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect Deputy shoots
                            </div>
                        </div>

                        {/* Statystyki Prosecutes */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctProsecutes}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct Prosecutes
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectProsecutes}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect Prosecutes
                            </div>
                        </div>

                        {/* Statystyki Warden Fortifies */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctWardenFortifies}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct Warden fortifies
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectWardenFortifies}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect Warden fortifies
                            </div>
                        </div>

                        {/* Statystyki Altruist Revives */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctAltruistRevives}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct Altruist revives
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectAltruistRevives}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect Altruist revives
                            </div>
                        </div>

                        {/* Statystyki Swaps */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-green-400">
                                {playerStats.correctSwaps}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Correct swaps
                            </div>
                        </div>

                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-red-400">
                                {playerStats.incorrectSwaps}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Incorrect swaps
                            </div>
                        </div>

                        {/* Janitor Cleans */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-purple-400">
                                {playerStats.janitorCleans}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Janitor cleans
                            </div>
                        </div>

                        {/* Statystyki przetrwanych rund */}
                        <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                            <div className="text-xl font-bold text-cyan-400">
                                {playerStats.survivedRounds}/{playerStats.totalRounds}
                            </div>
                            <div className="text-sm text-zinc-400">
                                Przeżytych rund
                            </div>
                            {playerStats.totalRounds > 0 && (
                                <div className="text-xs text-zinc-500 mt-1">
                                    {Math.round((playerStats.survivedRounds / playerStats.totalRounds) * 100)}% przeżywalności
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
