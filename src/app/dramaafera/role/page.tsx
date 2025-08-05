'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getAllGamesData } from '@/data/games';
import { generateRoleRankingStats, type UIGameData } from '@/data/games/converter';

// Funkcja pomocnicza do konwersji nazwy roli na format URL-friendly
function convertRoleToUrlSlug(role: string): string {
  return role.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

// Wszystkie gry w formacie UI
type SortField = 'winRate' | 'gamesPlayed' | 'wins' | 'name';
type SortDirection = 'asc' | 'desc';

export default function RolePage() {
    const [sortField, setSortField] = useState<SortField>('winRate');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const [teamFilter, setTeamFilter] = useState<string>('all');
    const [allUIGames, setAllUIGames] = useState<UIGameData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Ładowanie danych z wszystkich gier
    useEffect(() => {
        async function loadGames() {
            try {
                setIsLoading(true);
                const games = await getAllGamesData();
                setAllUIGames(games);
            } catch (error) {
                console.error('Błąd ładowania gier:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadGames();
    }, []);

    // Generuj statystyki ról
    const roleStats = useMemo(() => {
        if (allUIGames.length === 0) return [];
        return generateRoleRankingStats(allUIGames);
    }, [allUIGames]);

    // Filtrowanie i sortowanie
    const filteredAndSortedRoles = useMemo(() => {
        let filtered = roleStats;

        // Filtrowanie według drużyny
        if (teamFilter !== 'all') {
            filtered = roleStats.filter(role => role.team === teamFilter);
        }

        // Sortowanie
        const sorted = [...filtered].sort((a, b) => {
            let valueA: string | number = a[sortField];
            let valueB: string | number = b[sortField];

            // Konwersja do string dla sortowania alfabetycznego
            if (sortField === 'name') {
                valueA = a.displayName.toLowerCase();
                valueB = b.displayName.toLowerCase();
            }

            if (sortDirection === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });

        return sorted;
    }, [roleStats, sortField, sortDirection, teamFilter]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const handleTeamFilter = () => {
        const teamOptions = ['all', 'Crewmate', 'Impostor', 'Neutral'];
        const currentIndex = teamOptions.indexOf(teamFilter);
        const nextIndex = (currentIndex + 1) % teamOptions.length;
        setTeamFilter(teamOptions[nextIndex]);
    };

    const getTeamHeaderText = () => {
        switch (teamFilter) {
            case 'Crewmate': return 'Drużyna (Crewmate)';
            case 'Impostor': return 'Drużyna (Impostor)';
            case 'Neutral': return 'Drużyna (Neutral)';
            default: return 'Drużyna';
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return '';
        return sortDirection === 'asc' ? '▲' : '▼';
    };

    const getRoleIcon = (roleName: string): string => {
        // Mapowanie ról na ikony (używa nazw plików z katalogu roles)
        const roleIconMappings: Record<string, string> = {
            'Crewmate': 'placeholder.png',
            'Impostor': 'placeholder.png',
            'Sheriff': 'sheriff.png',
            'Engineer': 'engineer.png',
            'Medic': 'medic.png',
            'Investigator': 'investigator.png',
            'Mystic': 'mystic.png',
            'Detective': 'detective.png',
            'Seer': 'seer.png',
            'Spy': 'spy.png',
            'Snitch': 'snitch.png',
            'Altruist': 'altruist.png',
            'Medium': 'medium.png',
            'Swapper': 'swapper.png',
            'Transporter': 'transporter.png',
            'Tracker': 'tracker.png',
            'Trapper': 'trapper.png',
            'Mayor': 'politician.png',
            'Politician': 'politician.png',
            'Vigilante': 'vigilante.png',
            'Veteran': 'veteran.png',
            'Hunter': 'hunter.png',
            'Deputy': 'deputy.png',
            'Undertaker': 'undertaker.png',
            'Imitator': 'imitator.png',
            'Prosecutor': 'prosecutor.png',
            'Oracle': 'oracle.png',
            'Aurial': 'aurial.png',
            'Lookout': 'lookout.png',
            'Jailor': 'jailor.png',
            'Morphling': 'morphling.png',
            'Swooper': 'swooper.png',
            'Miner': 'miner.png',
            'Escapist': 'escapist.png',
            'Grenadier': 'grenadier.png',
            'Traitor': 'traitor.png',
            'Blackmailer': 'blackmailer.png',
            'Janitor': 'janitor.png',
            'Vampire': 'vampire.png',
            'Hypnotist': 'hypnotist.png',
            'Bomber': 'bomber.png',
            'Warlock': 'warlock.png',
            'Venerer': 'venerer.png',
            'Jester': 'jester.png',
            'Executioner': 'executioner.png',
            'Arsonist': 'arsonist.png',
            'Plaguebearer': 'plaguebearer.png',
            'Pestilence': 'plaguebearer.png', // Używa ikony Plaguebearer
            'Glitch': 'glitch.png',
            'Juggernaut': 'juggernaut.png',
            'Survivor': 'survivor.png',
            'Guardian Angel': 'guardian_angel.png',
            'GuardianAngel': 'guardian_angel.png',
            'Amnesiac': 'amnesiac.png',
            'Phantom': 'phantom.png',
            'Doomsayer': 'doomsayer.png',
            'Scavenger': 'scavenger.png',
            'Soul Collector': 'soul_collector.png',
            'Mercenary': 'placeholder.png', // Brak ikony mercenary
            'Cleric': 'cleric.png',
            'Warden': 'warden.png',
            'Plumber': 'placeholder.png', // Brak ikony plumber
            'Eclipsal': 'placeholder.png', // Brak ikony eclipsal
            'Haunter': 'haunter.png',
            'Werewolf': 'werewolf.png'
        };

        return roleIconMappings[roleName] || 'placeholder.png';
    };

    const getTeamDisplayName = (team: string): string => {
        switch (team) {
            case 'Crewmate': return 'Crewmate';
            case 'Impostor': return 'Impostor';
            case 'Neutral': return 'Neutral';
            default: return 'Unknown';
        }
    };

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Ranking Ról DramaAfera
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        Statystyki efektywności wszystkich ról w grach DramaAfera
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
                    <>
                        {/* Tabela rankingu */}
                        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full table-fixed">
                                    <thead className="border-b border-gray-600">
                                        <tr>
                                            <th className="text-left py-2 px-2 text-yellow-400 font-semibold w-20">Pozycja</th>
                                            <th className="text-left py-2 px-2 text-yellow-400 font-semibold w-64">Rola</th>
                                            <th 
                                                className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none w-48"
                                                onClick={handleTeamFilter}
                                            >
                                                {getTeamHeaderText()}
                                            </th>
                                            <th 
                                                className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none w-20"
                                                onClick={() => handleSort('gamesPlayed')}
                                            >
                                                Gry {getSortIcon('gamesPlayed')}
                                            </th>
                                            <th 
                                                className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none w-24"
                                                onClick={() => handleSort('wins')}
                                            >
                                                Wygrane {getSortIcon('wins')}
                                            </th>
                                            <th 
                                                className="text-left py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none w-32"
                                                onClick={() => handleSort('winRate')}
                                            >
                                                Win Rate {getSortIcon('winRate')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAndSortedRoles.map((role, index) => {
                                            const position = index + 1;
                                            return (
                                                <tr 
                                                    key={role.name}
                                                    className="border-b border-gray-700 hover:bg-gray-750"
                                                >
                                                    <td className="py-2 px-2 w-20">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-lg">#{position}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-2 w-64">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative w-12 h-12">
                                                                <Image
                                                                    src={`/images/roles/${getRoleIcon(role.name)}`}
                                                                    alt={role.displayName}
                                                                    width={48}
                                                                    height={48}
                                                                    className="rounded-lg border-2"
                                                                    style={{ borderColor: role.color }}
                                                                    onError={(e) => {
                                                                        e.currentTarget.src = '/images/roles/placeholder.png';
                                                                    }}
                                                                />
                                                            </div>
                                                            <div>
                                                                <Link
                                                                    href={`/dramaafera/role/${convertRoleToUrlSlug(role.name)}`}
                                                                    className="font-semibold text-lg hover:underline transition-colors"
                                                                    style={{ color: role.color }}
                                                                >
                                                                    {role.displayName}
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-2 px-2 w-48">
                                                        <span 
                                                            className="font-medium"
                                                            style={{ 
                                                                color: role.team === 'Crewmate' ? '#00FFFF' : 
                                                                       role.team === 'Impostor' ? '#FF0000' : 
                                                                       '#808080' 
                                                            }}
                                                        >
                                                            {getTeamDisplayName(role.team)}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-2 w-20">
                                                        <span className="text-lg font-semibold text-blue-400">
                                                            {role.gamesPlayed}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-2 w-24">
                                                        <span className="text-lg font-semibold text-green-400">
                                                            {role.wins}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-2 w-32">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="text-xl font-bold"
                                                                style={{ 
                                                                    color: role.winRate >= 70 ? '#22C55E' : 
                                                                           role.winRate >= 50 ? '#EAB308' : 
                                                                           role.winRate >= 30 ? '#F97316' : '#EF4444' 
                                                                }}
                                                            >
                                                                {role.winRate}%
                                                            </div>
                                                            <div className="w-20 bg-gray-600 rounded-full h-2">
                                                                <div
                                                                    className="h-2 rounded-full"
                                                                    style={{
                                                                        width: `${role.winRate}%`,
                                                                        backgroundColor: role.winRate >= 70 ? '#22C55E' : 
                                                                                       role.winRate >= 50 ? '#EAB308' : 
                                                                                       role.winRate >= 30 ? '#F97316' : '#EF4444'
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
