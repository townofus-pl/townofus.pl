import Link from "next/link";
import Image from "next/image";
import { getAllGamesData } from "@/data/games";
import { getRoleColor } from "@/data/games/converter";
import { notFound } from "next/navigation";
import { RoleImage } from "../_components/RoleImage";

// Funkcja pomocnicza do konwersji nazwy roli na format URL-friendly
function convertRoleToUrlSlug(role: string): string {
    return role.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
}

// Funkcja pomocnicza do konwersji URL slug z powrotem na nazwę roli
function convertUrlSlugToRole(slug: string, allRoles: string[]): string {
    // Najpierw spróbuj znaleźć dokładne dopasowanie przez konwersję wszystkich ról
    const slugLower = slug.toLowerCase();
    for (const role of allRoles) {
        if (convertRoleToUrlSlug(role) === slugLower) {
            return role;
        }
    }
    
    // Fallback - konwertuj myślniki na spacje i zdekoduj
    return decodeURIComponent(slug.replace(/-/g, ' '));
}

// Funkcja pomocnicza do generowania ścieżki obrazka roli

// Interface dla statystyk roli
interface RoleStats {
    roleName: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    players: PlayerRoleStats[];
    // Specjalne statystyki dla ról zabijających
    totalCorrectKills?: number;
    totalIncorrectKills?: number;
    killAccuracy?: number;
    isKillerRole: boolean;
}

// Interface dla statystyk gracza z daną rolą
interface PlayerRoleStats {
    name: string;
    gamesWithRole: number;
    winsWithRole: number;
    winRateWithRole: number;
    // Specjalne statystyki dla ról zabijających
    correctKills?: number;
    incorrectKills?: number;
    killAccuracy?: number;
}

// Funkcja do sprawdzania czy rola jest rolą zabijającą
function isKillerRole(roleName: string): boolean {
    const killerRoles = [
        // Impostorzy (wszyscy mogą zabijać)
        'Impostor', 'Miner', 'Shapeshifter', 'Camouflager', 'Morphling', 'Swooper', 
        'Escapist', 'Grenadier', 'Venerer', 'Blackmailer', 'Janitor', 'Bomber',
        'Warlock', 'Hypnotist', 'Eclipsal', 'Undertaker', 'Scavenger',
        // Neutralne role zabijające
        'Arsonist', 'Glitch', 'Juggernaut', 'Pestilence', 'Soul Collector', 'Vampire', 'Werewolf',
        // Crewmate role zabijające
        'Sheriff', 'Hunter', 'Veteran'
    ];
    return killerRoles.includes(roleName);
}

// Typy dla gracza i gry
type UIGamePlayer = {
    nickname: string;
    win: boolean;
    role?: string;
    roleHistory?: string[];
    originalStats?: {
        correctKills?: number;
        incorrectKills?: number;
    };
};
type UIGameData = {
    id: string;
    winner?: string;
    detailedStats: {
        playersData: UIGamePlayer[];
    };
};

// Funkcja do generowania statystyk roli
function generateRoleStats(allGames: UIGameData[], targetRole: string): RoleStats {
    let totalGamesPlayed = 0;
    let totalWins = 0;
    let totalCorrectKills = 0;
    let totalIncorrectKills = 0;
    const isKiller = isKillerRole(targetRole);

    const playerStats = new Map<string, {
        games: number;
        wins: number;
        correctKills: number;
        incorrectKills: number;
    }>();

    allGames.forEach(game => {
        game.detailedStats.playersData.forEach((player: UIGamePlayer) => {
            // Sprawdź czy gracz miał tę rolę (sprawdzaj zarówno końcową rolę jak i historię ról)
            const hasRole = player.role === targetRole ||
                (player.roleHistory && player.roleHistory.includes(targetRole));

            if (hasRole) {
                totalGamesPlayed++;

                // Aktualizuj statystyki gracza
                const current = playerStats.get(player.nickname) || {
                    games: 0,
                    wins: 0,
                    correctKills: 0,
                    incorrectKills: 0
                };
                current.games++;

                if (player.win) {
                    totalWins++;
                    current.wins++;
                }

                // Dodaj statystyki zabójstw jeśli to rola zabijająca
                if (isKiller && player.originalStats) {
                    const correctKills = player.originalStats.correctKills || 0;
                    const incorrectKills = player.originalStats.incorrectKills || 0;

                    current.correctKills += correctKills;
                    current.incorrectKills += incorrectKills;
                    totalCorrectKills += correctKills;
                    totalIncorrectKills += incorrectKills;
                }

                playerStats.set(player.nickname, current);
            }
        });
    });

    // Konwertuj mapę na tablicę z winratio i posortuj według winratio (malejąco)
    const players: PlayerRoleStats[] = Array.from(playerStats.entries())
        .map(([name, stats]) => {
            const baseStats = {
                name,
                gamesWithRole: stats.games,
                winsWithRole: stats.wins,
                winRateWithRole: stats.games > 0 ? parseFloat(((stats.wins / stats.games) * 100).toFixed(1)) : 0
            };

            // Dodaj statystyki zabójstw jeśli to rola zabijająca
            if (isKiller) {
                const totalKills = stats.correctKills + stats.incorrectKills;
                return {
                    ...baseStats,
                    correctKills: stats.correctKills,
                    incorrectKills: stats.incorrectKills,
                    killAccuracy: totalKills > 0 ? parseFloat(((stats.correctKills / totalKills) * 100).toFixed(1)) : 0
                };
            }

            return baseStats;
        })
        .sort((a, b) => {
            // Sortuj według winratio (malejąco), potem według liczby gier (malejąco)
            if (b.winRateWithRole !== a.winRateWithRole) {
                return b.winRateWithRole - a.winRateWithRole;
            }
            return b.gamesWithRole - a.gamesWithRole;
        });

    const baseStats = {
        roleName: targetRole,
        gamesPlayed: totalGamesPlayed,
        wins: totalWins,
        winRate: totalGamesPlayed > 0 ? parseFloat(((totalWins / totalGamesPlayed) * 100).toFixed(1)) : 0,
        players,
        isKillerRole: isKiller
    };

    // Dodaj statystyki zabójstw jeśli to rola zabijająca
    if (isKiller) {
        const totalKills = totalCorrectKills + totalIncorrectKills;
        return {
            ...baseStats,
            totalCorrectKills,
            totalIncorrectKills,
            killAccuracy: totalKills > 0 ? parseFloat(((totalCorrectKills / totalKills) * 100).toFixed(1)) : 0
        };
    }

    return baseStats;
}

interface RolePageProps {
    params: Promise<{
        nazwa: string;
    }>;
}

export async function generateStaticParams() {
    const games = await getAllGamesData();
    const allRoles = new Set<string>();
    
    games.forEach(game => {
        game.detailedStats.playersData.forEach(player => {
            // Dodaj końcową rolę
            allRoles.add(player.role);
            
            // Dodaj wszystkie role z historii
            if (player.roleHistory) {
                player.roleHistory.forEach(role => allRoles.add(role));
            }
        });
    });
    
    return Array.from(allRoles).map(role => ({
        nazwa: convertRoleToUrlSlug(role),
    }));
}

export default async function RoleStatsPage({ params }: RolePageProps) {
    const {nazwa} = await params;
    
    // Pobierz wszystkie gry
    const games = await getAllGamesData();
    
    // Pobierz listę wszystkich ról
    const allRoles: string[] = [];
    games.forEach(game => {
        game.detailedStats.playersData.forEach(player => {
            if (!allRoles.includes(player.role)) {
                allRoles.push(player.role);
            }
            if (player.roleHistory) {
                player.roleHistory.forEach(role => {
                    if (!allRoles.includes(role)) {
                        allRoles.push(role);
                    }
                });
            }
        });
    });
    
    const roleName = convertUrlSlugToRole(nazwa, allRoles);
    
    // Wygeneruj statystyki dla roli
    const roleStats = generateRoleStats(games, roleName);
    
    if (roleStats.gamesPlayed === 0) {
        notFound();
    }
    
    const roleColor = getRoleColor(roleName);

    return (
        <div className="min-h-screen bg-zinc-900/50 text-white">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-700/50 p-6">
                <div className="max-w-4xl mx-auto">
                    <Link 
                        href="/dramaafera"
                        className="text-white hover:text-gray-300 transition-colors mb-4 inline-flex items-center gap-2"
                    >
                        ← Powrót do Drama Afera
                    </Link>
                    <h1 className="text-4xl font-bold text-white">
                        Statystyki roli
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {/* Główna sekcja roli */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Obrazek roli */}
                        <div className="flex-shrink-0">
                            <div className="relative">
                                <RoleImage
                                    roleName={roleName}
                                    width={128}
                                    height={128}
                                    className="scale-[1.7]"
                                />
                            </div>
                        </div>

                        {/* Informacje o roli */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 
                                className="text-5xl font-bold mb-4"
                                style={{ color: roleColor }}
                            >
                                {roleName}
                            </h2>
                            
                            {/* Link do opisu roli - prowadzi do głównej strony z opisem wszystkich ról */}
                            <Link 
                                href={`/#${convertRoleToUrlSlug(roleName)}`}
                                className="inline-block mb-6 px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-white hover:text-gray-300 hover:bg-zinc-700/50 transition-colors"
                            >
                                📖 Zobacz opis roli
                            </Link>
                            
                            {/* Podstawowe statystyki roli */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Liczba gier */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">
                                        {roleStats.gamesPlayed}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Gier tej roli
                                    </div>
                                </div>

                                {/* Liczba zwycięstw */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-green-400 mb-1">
                                        {roleStats.wins}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Zwycięstw
                                    </div>
                                </div>

                                {/* Win ratio */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-purple-400 mb-1">
                                        {roleStats.winRate}%
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Współczynnik wygranych
                                    </div>
                                </div>
                            </div>

                            {/* Statystyki zabójstw - tylko dla ról zabijających */}
                            {roleStats.isKillerRole && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Poprawne zabójstwa */}
                                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                        <div className="text-3xl font-bold text-green-500 mb-1">
                                            {roleStats.totalCorrectKills || 0}
                                        </div>
                                        <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                            Poprawne zabójstwa
                                        </div>
                                    </div>

                                    {/* Niepoprawne zabójstwa */}
                                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                        <div className="text-3xl font-bold text-red-500 mb-1">
                                            {roleStats.totalIncorrectKills || 0}
                                        </div>
                                        <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                            Niepoprawne zabójstwa
                                        </div>
                                    </div>

                                    {/* Skuteczność zabójstw */}
                                    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                        <div 
                                            className="text-3xl font-bold mb-1"
                                            style={{ 
                                                color: (roleStats.killAccuracy || 0) >= 70 ? '#10B981' : 
                                                       (roleStats.killAccuracy || 0) >= 50 ? '#F59E0B' : '#EF4444'
                                            }}
                                        >
                                            {roleStats.killAccuracy || 0}%
                                        </div>
                                        <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                            Skuteczność zabójstw
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ranking graczy którzy grali jako ta rola */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6">
                    <h3 className="text-2xl font-bold mb-4 text-center">
                        Gracze którzy grali jako {roleName}
                    </h3>
                    
                    {roleStats.players.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead>
                                    <tr className="border-b border-gray-600">
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Pozycja</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Gracz</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Gry</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Wygrane</th>
                                        <th className="text-left py-3 px-4 text-yellow-400 font-semibold">Win Rate</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roleStats.players.map((playerStats, index) => (
                                        <tr key={playerStats.name} className="border-b border-gray-700/30 hover:bg-zinc-800/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="text-gray-300 font-medium">#{index + 1}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link
                                                    href={`/dramaafera/user/${convertNickToUrlSlug(playerStats.name)}`}
                                                    className="flex items-center space-x-3 hover:text-gray-300 transition-colors"
                                                >
                                                    <Image
                                                        src={`/images/avatars/${playerStats.name}.png`}
                                                        alt={playerStats.name}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full border border-gray-600"
                                                    />
                                                    <span className="text-white font-medium">
                                                        {playerStats.name}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-blue-400 font-semibold">
                                                    {playerStats.gamesWithRole}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-green-400 font-semibold">
                                                    {playerStats.winsWithRole}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span 
                                                    className="font-bold text-lg"
                                                    style={{ 
                                                        color: playerStats.winRateWithRole >= 70 ? '#10B981' : 
                                                               playerStats.winRateWithRole >= 50 ? '#F59E0B' : '#EF4444'
                                                    }}
                                                >
                                                    {playerStats.winRateWithRole}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-gray-400 text-lg">Nikt jeszcze nie grał tą rolą</p>
                        </div>
                    )}
                    
                    <div className="mt-4 text-center text-zinc-400">
                        Łącznie {roleStats.players.length} różnych graczy grało tą rolą
                    </div>
                </div>
            </div>
        </div>
    );
}

// Funkcja pomocnicza do konwersji nicku na format URL-friendly (kopiujemy z user page)
function convertNickToUrlSlug(nick: string): string {
    return nick.replace(/\s+/g, '-').toLowerCase();
}
