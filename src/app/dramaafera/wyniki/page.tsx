"use client";

import { useState, useEffect } from "react";
import PlayerTable from "@/app/_components/PlayerTable";
import RoleTable from "@/app/_components/RoleTable";
import { UIGameData } from "@/data/games/converter";

// Typy dla danych z API
type DateGroup = {
    date: string;
    displayDate: string;
    totalGames: number;
};

type GameSummary = {
    id: string;
    date: string;
    gameNumber: number;
    duration: string;
    players: number;
    winner: string;
    winnerColor: string;
    winCondition: string;
    map: string;
};

type PlayerDayStats = {
    name: string;
    avatar: string;
    games: number;
    wins: number;
    loses: number;
    winRatio: number;
    results: ('W' | 'L' | null)[];
};

type RoleDayStats = {
    name: string;
    displayName: string;
    color: string;
    team: string;
    games: number;
    wins: number;
    loses: number;
    winRatio: number;
    results: ('W' | 'L' | null)[];
};

type ResultsData = {
    date: string;
    displayDate: string;
    players: PlayerDayStats[];
    roles: RoleDayStats[];
    games: GameSummary[];
    detailedGames: unknown[];
    crewmateWins: number;
    impostorWins: number;
    neutralWins: number;
};

export default function WynikiPage() {
    const [availableDates, setAvailableDates] = useState<DateGroup[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resultsData, setResultsData] = useState<ResultsData | null>(null);
    const [lastUpdateHash, setLastUpdateHash] = useState<string>("");
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Pobierz dostępne daty przy ładowaniu strony
    useEffect(() => {
        const fetchDates = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/games/dates');
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const responseData = await response.json() as { data: { dates: DateGroup[] } };
                setAvailableDates(responseData.data.dates);
                
                // Automatycznie załaduj najnowszą datę
                if (responseData.data.dates.length > 0) {
                    const newestDate = responseData.data.dates[0].date;
                    setSelectedDate(newestDate);
                    await fetchResultsData(newestDate);
                }
            } catch (err) {
                console.error('Error fetching dates:', err);
                setError(err instanceof Error ? err.message : 'Błąd pobierania danych');
            } finally {
                setLoading(false);
            }
        };

        fetchDates();
    }, []);

    const fetchResultsData = async (date: string, isAutoRefresh = false) => {
        try {
            if (isAutoRefresh) {
                setIsRefreshing(true);
            } else {
                setDataLoading(true);
            }
            setError(null);
            
            const response = await fetch(`/api/games/by-date?date=${date}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseData = await response.json() as { data: ResultsData };
            
            // Oblicz hash danych aby sprawdzić czy się zmieniły
            const dataHash = JSON.stringify({
                players: responseData.data.players.map(p => ({ name: p.name, wins: p.wins, loses: p.loses })),
                games: responseData.data.games.length
            });
            
            // Aktualizuj tylko jeśli dane się zmieniły lub to nie jest auto-refresh
            if (dataHash !== lastUpdateHash || !isAutoRefresh) {
                setResultsData(responseData.data);
                setLastUpdateHash(dataHash);
                setLastUpdateTime(new Date());
            }
        } catch (err) {
            console.error('Error fetching results:', err);
            setError(err instanceof Error ? err.message : 'Błąd pobierania wyników');
            setResultsData(null);
        } finally {
            setDataLoading(false);
            setIsRefreshing(false);
        }
    };

    // Auto-odświeżanie co 30 sekund tylko dla najnowszej daty
    useEffect(() => {
        if (!selectedDate || !availableDates.length) return;
        
        // Sprawdź czy wybrana data to najnowsza
        const isNewestDate = selectedDate === availableDates[0]?.date;
        
        if (!isNewestDate) return;

        const interval = setInterval(() => {
            fetchResultsData(selectedDate, true);
        }, 30000); // 30 sekund

        return () => clearInterval(interval);
    }, [selectedDate, availableDates, lastUpdateHash]);


    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) {
            fetchResultsData(date);
        } else {
            setResultsData(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-xl text-gray-300">Ładowanie...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white container mx-auto px-4 py-8">
            {/* Błąd */}
            {error && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-center">
                            <p className="text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {/* Ładowanie danych */}
                {dataLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-gray-300">Ładowanie wyników...</p>
                    </div>
                )}

                {/* Wyświetlanie wyników */}
                {resultsData && !dataLoading && resultsData.players.length > 0 && (
                    <div className="max-w-7xl mx-auto bg-zinc-900/80 rounded-xl p-8">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 flex-wrap mb-2">
                                Wyniki dnia
                                <select
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    className="bg-zinc-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-barlow hover:bg-zinc-700 transition-colors cursor-pointer"
                                    style={{ minWidth: '200px' }}
                                >
                                    {availableDates.map((dateGroup) => (
                                        <option key={dateGroup.date} value={dateGroup.date} className="font-barlow text-base">
                                            {dateGroup.displayDate}
                                        </option>
                                    ))}
                                </select>
                            </h1>
                            
                            {/* Wskaźnik auto-refresh dla najnowszej daty */}
                            {selectedDate === availableDates[0]?.date && (
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                                    <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                                    <span>
                                        {isRefreshing ? 'Odświeżanie...' : lastUpdateTime ? `Ostatnia aktualizacja: ${lastUpdateTime.toLocaleTimeString('pl-PL')}` : 'Auto-odświeżanie włączone'}
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <PlayerTable 
                            players={resultsData.players}
                            reversedGames={resultsData.games}
                            detailedGames={resultsData.detailedGames as (UIGameData | null)[]}
                            date={selectedDate}
                            hideZeroStats={true}
                        />

                        {/* Tabela ról */}
                        <h3 className="text-3xl font-bold mb-6 mt-12 text-center">Statystyki ról</h3>
                        <RoleTable 
                            roles={resultsData.roles}
                            reversedGames={resultsData.games}
                            detailedGames={resultsData.detailedGames as (UIGameData | null)[]}
                            date={selectedDate}
                            hideZeroStats={true}
                        />

                        {/* Statystyki zwycięstw */}
                        <div className="mt-8 flex flex-wrap justify-center gap-6 text-lg">
                            <div className="bg-blue-900/60 rounded-lg px-6 py-3 border border-blue-700/50 text-blue-200 font-semibold flex items-center gap-2">
                                <span className="text-blue-400 text-2xl"></span>Wygrane Crewmatów: <span className="text-blue-300 font-bold">{resultsData.crewmateWins}</span>
                            </div>
                            <div className="bg-red-900/60 rounded-lg px-6 py-3 border border-red-700/50 text-red-200 font-semibold flex items-center gap-2">
                                <span className="text-red-400 text-2xl"></span>Wygrane Impostorów: <span className="text-red-300 font-bold">{resultsData.impostorWins}</span>
                            </div>
                            <div className="bg-yellow-900/60 rounded-lg px-6 py-3 border border-yellow-700/50 text-yellow-200 font-semibold flex items-center gap-2">
                                <span className="text-yellow-400 text-2xl"></span>Wygrane Neutrali: <span className="text-yellow-300 font-bold">{resultsData.neutralWins}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Brak wyników */}
                {resultsData && !dataLoading && resultsData.players.length === 0 && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-gray-800/50 rounded-xl p-6 text-center">
                            <p className="text-gray-300 text-lg">Brak gier dla wybranej daty</p>
                        </div>
                    </div>
                )}
            </div>
    );
}
