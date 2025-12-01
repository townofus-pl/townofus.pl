import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RoleImage } from "../_components/RoleImage";
import { getAllGamesData, getRoleColor } from "../../_services/gameDataService";
import type { UIGameData, UIPlayerData } from "../../_services/gameDataService";
import { Roles } from "@/roles";
import type { Role } from "@/constants/rolesAndModifiers";
import { SettingsList } from "@/app/_components/RolesList/RoleCard/SettingsList";

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
    totalAppearances: number; // Dodane - całkowita liczba wystąpień roli
    wins: number;
    winRate: number;
    players: PlayerRoleStats[];
    // Specjalne statystyki dla ról zabijających
    totalCorrectKills?: number;
    totalIncorrectKills?: number;
    isKillerRole: boolean;
    // Dodatkowe szczegółowe statystyki
    totalTasks: number;
    maxTasks: number;
    correctGuesses: number;
    incorrectGuesses: number;
    correctProsecutes: number;
    incorrectProsecutes: number;
    correctDeputyShoots: number;
    incorrectDeputyShoots: number;
    correctJailorExecutes: number;
    incorrectJailorExecutes: number;
    correctMedicShields: number;
    incorrectMedicShields: number;
    correctWardenFortifies: number;
    incorrectWardenFortifies: number;
    janitorCleans: number;
    survivedRounds: number;
    totalRounds: number;
    correctAltruistRevives: number;
    incorrectAltruistRevives: number;
    correctSwaps: number;
    incorrectSwaps: number;
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

// Typy będą importowane z gameDataService

// Funkcja do generowania statystyk roli
function generateRoleStats(allGames: UIGameData[], targetRole: string): RoleStats {
    let totalGamesPlayed = 0;
    let totalAppearances = 0; // Dodane - wszystkie wystąpienia roli
    let totalWins = 0;
    let totalCorrectKills = 0;
    let totalIncorrectKills = 0;
    let totalTasks = 0;
    let maxTasks = 0;
    let correctGuesses = 0;
    let incorrectGuesses = 0;
    let correctProsecutes = 0;
    let incorrectProsecutes = 0;
    let correctDeputyShoots = 0;
    let incorrectDeputyShoots = 0;
    let correctJailorExecutes = 0;
    let incorrectJailorExecutes = 0;
    let correctMedicShields = 0;
    let incorrectMedicShields = 0;
    let correctWardenFortifies = 0;
    let incorrectWardenFortifies = 0;
    let janitorCleans = 0;
    let survivedRounds = 0;
    let totalRounds = 0;
    let correctAltruistRevives = 0;
    let incorrectAltruistRevives = 0;
    let correctSwaps = 0;
    let incorrectSwaps = 0;
    
    const isKiller = isKillerRole(targetRole);

    const playerStats = new Map<string, {
        games: number;
        wins: number;
        correctKills: number;
        incorrectKills: number;
    }>();

    allGames.forEach(game => {
        // Znajdź maksymalną liczbę rund dla tej gry
        let maxRoundsInThisGame = 0;
        game.detailedStats.playersData.forEach(p => {
            if (p.originalStats?.survivedRounds) {
                maxRoundsInThisGame = Math.max(maxRoundsInThisGame, p.originalStats.survivedRounds);
            }
        });

        game.detailedStats.playersData.forEach((player: UIPlayerData) => {
            // Sprawdź wystąpienia roli w całej historii (dla totalAppearances)
            const hasRoleInHistory = player.role === targetRole ||
                (player.roleHistory && player.roleHistory.includes(targetRole));
            
            if (hasRoleInHistory) {
                totalAppearances++;
            }
            
            // Sprawdź czy gracz miał tę rolę tylko jako pierwotną rolę
            const originalRole = player.roleHistory && player.roleHistory.length > 0 
                ? player.roleHistory[0] 
                : player.role;
            const hasRole = originalRole === targetRole;

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

                // Agreguj wszystkie dostępne statystyki bezpośrednio z UIPlayerData
                // Statystyki zabójstw
                const kills = player.correctKills || 0;
                const incorrectKill = player.incorrectKills || 0;
                current.correctKills += kills;
                current.incorrectKills += incorrectKill;
                totalCorrectKills += kills;
                totalIncorrectKills += incorrectKill;

                // Statystyki tasków
                const completedTasks = player.completedTasks || 0;
                totalTasks += completedTasks;
                // Dodaj maxTasks z gry jeśli gracz wykonał jakieś zadania
                if (completedTasks > 0 && game.maxTasks) {
                    maxTasks += game.maxTasks;
                }

                // Statystyki zgadywań
                correctGuesses += player.correctGuesses || 0;
                incorrectGuesses += player.incorrectGuesses || 0;

                // Statystyki Prosecute
                correctProsecutes += player.correctProsecutes || 0;
                incorrectProsecutes += player.incorrectProsecutes || 0;

                // Statystyki Deputy
                correctDeputyShoots += player.correctDeputyShoots || 0;
                incorrectDeputyShoots += player.incorrectDeputyShoots || 0;

                // Statystyki Jailor
                correctJailorExecutes += player.correctJailorExecutes || 0;
                incorrectJailorExecutes += player.incorrectJailorExecutes || 0;

                // Statystyki Medic
                correctMedicShields += player.correctMedicShields || 0;
                incorrectMedicShields += player.incorrectMedicShields || 0;

                // Statystyki Warden
                correctWardenFortifies += player.correctWardenFortifies || 0;
                incorrectWardenFortifies += player.incorrectWardenFortifies || 0;

                // Statystyki Janitor
                janitorCleans += player.janitorCleans || 0;

                // Statystyki przetrwania
                survivedRounds += player.survivedRounds || 0;
                // totalRounds - obliczamy jako sumę maksymalnych rund dla każdej gry gdzie gracz miał tę rolę
                totalRounds += maxRoundsInThisGame;

                // Statystyki Altruist
                correctAltruistRevives += player.correctAltruistRevives || 0;
                incorrectAltruistRevives += player.incorrectAltruistRevives || 0;

                // Statystyki Swapper
                correctSwaps += player.correctSwaps || 0;
                incorrectSwaps += player.incorrectSwaps || 0;

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
                return {
                    ...baseStats,
                    correctKills: stats.correctKills,
                    incorrectKills: stats.incorrectKills
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
        totalAppearances: totalAppearances,
        wins: totalWins,
        winRate: totalGamesPlayed > 0 ? parseFloat(((totalWins / totalGamesPlayed) * 100).toFixed(1)) : 0,
        players,
        isKillerRole: isKiller,
        totalTasks,
        maxTasks,
        correctGuesses,
        incorrectGuesses,
        correctProsecutes,
        incorrectProsecutes,
        correctDeputyShoots,
        incorrectDeputyShoots,
        correctJailorExecutes,
        incorrectJailorExecutes,
        correctMedicShields,
        incorrectMedicShields,
        correctWardenFortifies,
        incorrectWardenFortifies,
        janitorCleans,
        survivedRounds,
        totalRounds,
        correctAltruistRevives,
        incorrectAltruistRevives,
        correctSwaps,
        incorrectSwaps
    };

    // Dodaj statystyki zabójstw jeśli to rola zabijająca
    if (isKiller) {
        return {
            ...baseStats,
            totalCorrectKills,
            totalIncorrectKills
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
    
    // Pobierz wszystkie gry z bazy danych
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
    
    // Znajdź definicję roli z @/roles
    // Próbuj różnych wariantów nazwy
    let roleDefinition: Role | undefined = Roles.find(r => r.name === roleName);
    
    // Jeśli nie znaleziono, spróbuj dopasować role ze złożonymi nazwami (np. "Plaguebearer / Pestilence")
    if (!roleDefinition) {
        roleDefinition = Roles.find(r => {
            // Sprawdź czy nazwa roli w definicji zawiera "/" (złożona nazwa)
            if (r.name.includes(' / ')) {
                const parts = r.name.split(' / ');
                return parts.some(part => part === roleName);
            }
            return false;
        });
    }
    
    // Jeśli nadal nie znaleziono, spróbuj bez spacji i case-insensitive
    if (!roleDefinition) {
        const normalizedRoleName = roleName.toLowerCase().replace(/\s+/g, '');
        roleDefinition = Roles.find(r => r.name.toLowerCase().replace(/\s+/g, '') === normalizedRoleName);
    }
    
    // Debug - wypisz czy znaleziono definicję
    console.log('Role name:', roleName);
    console.log('Role definition found:', !!roleDefinition);
    console.log('Available roles:', Roles.map(r => r.name));

    return (
        <div className="min-h-screen bg-zinc-900/50 text-white">
            {/* Header */}
            <div className="bg-zinc-900/50 backdrop-blur-md border-b border-zinc-700/50 p-6">
                <div className="max-w-4xl mx-auto">
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
                            
                            {/* Podstawowe statystyki roli */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                {/* Wystąpienia */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-cyan-400 mb-1">
                                        {roleStats.totalAppearances}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Wystąpienia
                                    </div>
                                </div>

                                {/* Gry jako pierwotna rola */}
                                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50">
                                    <div className="text-3xl font-bold text-blue-400 mb-1">
                                        {roleStats.gamesPlayed}
                                    </div>
                                    <div className="text-sm text-zinc-400 uppercase tracking-wide">
                                        Gier jako pierwotna rola
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
                        </div>
                    </div>
                </div>

                {/* Opis roli i ustawienia - identyczny układ jak RoleCard */}
                {roleDefinition && (
                    <div className="grid grid-cols-1 gap-y-5 p-5 bg-zinc-900/50 rounded-xl border-l-5 mb-6"
                         style={{borderColor: roleColor}}>
                        <div className="grid grid-cols-1 md:grid-cols-2/1 gap-5">
                            <div className="bg-zinc-900/50 rounded-xl p-4 flex flex-col gap-10 justify-between">
                                <div className="text-xl">{roleDefinition.description}</div>
                                <SettingsList settings={roleDefinition.settings}/>
                            </div>  
                            <div className="bg-zinc-900/50 rounded-xl p-4">
                                <h5 className="font-brook text-5xl mb-5">Umiejętności</h5>
                                <ul className="text-xl">
                                    {roleDefinition.abilities.map(ability => (
                                        <li key={ability.name}
                                            className="my-2.5 font-brook text-3xl bg-zinc-800/75 p-2 rounded flex items-center justify-start gap-2">
                                            <Image src={ability.icon} alt={ability.name} width={64} height={64} className="w-8"/>
                                            {ability.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        {roleDefinition.tip && (
                            <div className="bg-zinc-900/50 p-4 rounded-lg flex gap-5 items-center justify-start">
                                <h5 className="font-brook text-3xl">Porada: {roleDefinition.tip}</h5>
                            </div>
                        )}
                    </div>
                )}

                {/* Szczegółowe statystyki roli */}
                <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-6 mb-6">
                    <h3 className="text-2xl font-bold mb-3 text-center">Szczegółowe statystyki</h3>
                    <div className="text-xs text-zinc-400 tracking-wide mb-4 text-center"> Widzisz statystykę niepasującą do roli? To kwestia zmiany roli w trakcie gry.</div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Wyświetl tylko statystyki różne od zera */}
                        
                        {/* Statystyki zabójstw dla ról zabijających */}
                        {roleStats.isKillerRole && (roleStats.totalCorrectKills! > 0 || roleStats.totalIncorrectKills! > 0) && (
                            <>
                                <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                    <div className="text-xl font-bold text-green-400">
                                        {roleStats.totalCorrectKills}
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        Correct kills
                                    </div>
                                </div>

                                <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                    <div className="text-xl font-bold text-red-400">
                                        {roleStats.totalIncorrectKills}
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        Incorrect kills
                                    </div>
                                </div>
                            </>
                        )}

                        {roleStats.totalTasks > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-pink-400">
                                    {roleStats.maxTasks > 0 ? `${roleStats.totalTasks}/${roleStats.maxTasks}` : roleStats.totalTasks}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Wykonanych tasków
                                </div>
                            </div>
                        )}

                        {roleStats.correctGuesses > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctGuesses}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct guesses
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectGuesses > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectGuesses}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect guesses
                                </div>
                            </div>
                        )}

                        {roleStats.correctProsecutes > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctProsecutes}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct Prosecutes
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectProsecutes > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectProsecutes}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect Prosecutes
                                </div>
                            </div>
                        )}

                        {roleStats.correctDeputyShoots > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctDeputyShoots}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct Deputy shoots
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectDeputyShoots > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectDeputyShoots}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect Deputy shoots
                                </div>
                            </div>
                        )}

                        {roleStats.correctJailorExecutes > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctJailorExecutes}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct executions
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectJailorExecutes > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectJailorExecutes}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect executions
                                </div>
                            </div>
                        )}

                        {roleStats.correctMedicShields > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctMedicShields}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct shields
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectMedicShields > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectMedicShields}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect shields
                                </div>
                            </div>
                        )}

                        {roleStats.correctWardenFortifies > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctWardenFortifies}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct Warden fortifies
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectWardenFortifies > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectWardenFortifies}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect Warden fortifies
                                </div>
                            </div>
                        )}

                        {roleStats.correctAltruistRevives > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctAltruistRevives}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct Altruist revives
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectAltruistRevives > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectAltruistRevives}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect Altruist revives
                                </div>
                            </div>
                        )}

                        {roleStats.correctSwaps > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-green-400">
                                    {roleStats.correctSwaps}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Correct swaps
                                </div>
                            </div>
                        )}

                        {roleStats.incorrectSwaps > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-red-400">
                                    {roleStats.incorrectSwaps}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Incorrect swaps
                                </div>
                            </div>
                        )}

                        {roleStats.janitorCleans > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-purple-400">
                                    {roleStats.janitorCleans}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Janitor cleans
                                </div>
                            </div>
                        )}

                        {roleStats.survivedRounds > 0 && (
                            <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
                                <div className="text-xl font-bold text-cyan-400">
                                    {roleStats.totalRounds > 0 ? `${roleStats.survivedRounds}/${roleStats.totalRounds}` : roleStats.survivedRounds}
                                </div>
                                <div className="text-sm text-zinc-400">
                                    Przeżytych rund
                                </div>
                                {roleStats.totalRounds > 0 && (
                                    <div className="text-xs text-zinc-500 mt-1">
                                        {Math.round((roleStats.survivedRounds / roleStats.totalRounds) * 100)}% przeżywalności
                                    </div>
                                )}
                            </div>
                        )}
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
