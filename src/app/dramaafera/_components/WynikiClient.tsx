"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import PlayerTable from "@/app/_components/PlayerTable";
import RoleTable from "@/app/_components/RoleTable";
import type { GameDateEntry, SessionSummary } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { getSessionResults } from "@/app/dramaafera/_actions/seasonActions";

interface WynikiClientProps {
    initialDates: GameDateEntry[];
    initialResults: SessionSummary | null;
    seasonId: number;
}

export default function WynikiClient({ initialDates, initialResults, seasonId }: WynikiClientProps) {
    const [selectedDate, setSelectedDate] = useState<string>(
        initialResults?.date ?? (initialDates.length > 0 ? initialDates[0].date : "")
    );
    const [resultsData, setResultsData] = useState<SessionSummary | null>(initialResults);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdateHash, setLastUpdateHash] = useState<string>(() =>
        initialResults
            ? JSON.stringify({
                  players: initialResults.players.map(p => ({ name: p.name, wins: p.wins, loses: p.loses })),
                  games: initialResults.games.length,
              })
            : ""
    );
    const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Ref to access lastUpdateHash inside useCallback without making it a dependency
    const lastUpdateHashRef = useRef(lastUpdateHash);
    useEffect(() => { lastUpdateHashRef.current = lastUpdateHash; }, [lastUpdateHash]);

    // Pobieranie wyników przez server action
    const fetchResultsData = useCallback(async (date: string, isAutoRefresh = false) => {
        try {
            if (isAutoRefresh) {
                setIsRefreshing(true);
            } else {
                setDataLoading(true);
            }
            setError(null);

            const data = await getSessionResults(date, seasonId);

            // Oblicz hash danych aby sprawdzić czy się zmieniły
            const dataHash = JSON.stringify({
                players: data.players.map(p => ({ name: p.name, wins: p.wins, loses: p.loses })),
                games: data.games.length
            });

            // Aktualizuj tylko jeśli dane się zmieniły lub to nie jest auto-refresh
            if (dataHash !== lastUpdateHashRef.current || !isAutoRefresh) {
                setResultsData(data);
                setLastUpdateHash(dataHash);
                setLastUpdateTime(new Date());
            }
        } catch (err) {
            console.error('Błąd pobierania wyników:', err);
            setError("Nie udało się pobrać wyników. Spróbuj ponownie później.");
            setResultsData(null);
        } finally {
            setDataLoading(false);
            setIsRefreshing(false);
        }
    }, [seasonId]);

    // Auto-odświeżanie co 30 sekund tylko dla najnowszej daty (bieżący sezon)
    useEffect(() => {
        if (seasonId !== CURRENT_SEASON) return;
        if (!selectedDate || !initialDates.length) return;

        // Sprawdź czy wybrana data to najnowsza
        const isNewestDate = selectedDate === initialDates[0]?.date;
        if (!isNewestDate) return;

        const interval = setInterval(() => {
            fetchResultsData(selectedDate, true);
        }, 30000);

        return () => clearInterval(interval);
    }, [seasonId, selectedDate, initialDates, fetchResultsData]);

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) {
            fetchResultsData(date);
        } else {
            setResultsData(null);
        }
    };

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white container mx-auto px-4 py-8">
            {/* Nagłówek z wyborem daty — zawsze widoczny gdy są dostępne daty */}
            {initialDates.length > 0 && (
                <div className="max-w-7xl mx-auto mb-8">
                    <h1 className="text-4xl font-bold text-white flex items-center justify-center gap-3 flex-wrap mb-2">
                        Wyniki dnia
                        <select
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="bg-zinc-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 font-barlow hover:bg-zinc-700 transition-colors cursor-pointer"
                            style={{ minWidth: '200px' }}
                        >
                            {initialDates.map((dateGroup) => (
                                <option key={dateGroup.date} value={dateGroup.date} className="font-barlow text-base">
                                    {dateGroup.displayDate}
                                </option>
                            ))}
                        </select>
                    </h1>

                    {/* Wskaźnik auto-refresh dla najnowszej daty (tylko bieżący sezon) */}
                    {seasonId === CURRENT_SEASON && selectedDate === initialDates[0]?.date && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></div>
                            <span>
                                {isRefreshing ? 'Odświeżanie...' : lastUpdateTime ? `Ostatnia aktualizacja: ${lastUpdateTime.toLocaleTimeString('pl-PL')}` : 'Auto-odświeżanie włączone'}
                            </span>
                        </div>
                    )}
                </div>
            )}

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
                    <PlayerTable
                        players={resultsData.players}
                        reversedGames={resultsData.games}
                        detailedGames={resultsData.detailedGames}
                        date={selectedDate}
                        hideZeroStats={true}
                        seasonId={seasonId}
                    />

                    {/* Tabela ról */}
                    <h3 className="text-3xl font-bold mb-6 mt-12 text-center">Statystyki ról</h3>
                    <RoleTable
                        roles={resultsData.roles}
                        reversedGames={resultsData.games}
                        detailedGames={resultsData.detailedGames}
                        date={selectedDate}
                        hideZeroStats={true}
                        seasonId={seasonId}
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
