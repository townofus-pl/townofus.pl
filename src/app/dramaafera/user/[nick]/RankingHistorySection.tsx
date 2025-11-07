"use client";

import { useState, useMemo } from 'react';
import type { RankingHistoryPoint } from '../../_services/gameDataService';
import { RankingChart } from '../../_components/RankingChart';

interface RankingHistorySectionProps {
  rankingHistory: RankingHistoryPoint[];
  playerName: string;
}

export function RankingHistorySection({ rankingHistory, playerName }: RankingHistorySectionProps) {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  // Filtruj dane na podstawie wybranych dat
  const filteredData = useMemo(() => {
    if (!dateFrom && !dateTo) return rankingHistory;

    const filtered = rankingHistory.filter(point => {
      const pointDate = new Date(point.date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      if (from && pointDate < from) return false;
      if (to && pointDate > to) return false;
      return true;
    });

    // Jeśli filtrujemy i mamy punkty, dodaj ostatni punkt sprzed zakresu jako kontekst
    if (filtered.length > 0 && (dateFrom || dateTo)) {
      const firstFilteredDate = filtered[0].date.getTime();
      
      // Znajdź ostatni punkt przed zakresem
      const pointBefore = rankingHistory
        .filter(p => p.date.getTime() < firstFilteredDate)
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
      
      if (pointBefore) {
        return [pointBefore, ...filtered];
      }
    }

    return filtered;
  }, [rankingHistory, dateFrom, dateTo]);

  // Oblicz zakresy dat dla placeholderów
  const minDate = rankingHistory.length > 0 
    ? new Date(Math.min(...rankingHistory.map(r => r.date.getTime())))
    : new Date();
  const maxDate = rankingHistory.length > 0 
    ? new Date(Math.max(...rankingHistory.map(r => r.date.getTime())))
    : new Date();

  const formatDateInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleReset = () => {
    setDateFrom('');
    setDateTo('');
  };

  return (
    <>
      {/* Kontrolki filtrowania dat */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <label htmlFor="dateFrom" className="text-sm text-gray-400">Od:</label>
          <input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            min={formatDateInput(minDate)}
            max={dateTo || formatDateInput(maxDate)}
            className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="dateTo" className="text-sm text-gray-400">Do:</label>
          <input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            min={dateFrom || formatDateInput(minDate)}
            max={formatDateInput(maxDate)}
            className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(dateFrom || dateTo) && (
          <button
            onClick={handleReset}
            className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            Resetuj
          </button>
        )}
      </div>

      {/* Info o zakresie */}
      {(dateFrom || dateTo) && (
        <div className="text-center text-sm text-gray-400 mb-4">
          Wyświetlanie: {filteredData.length} punktów
          {dateFrom && dateTo && ` (${new Date(dateFrom).toLocaleDateString('pl-PL')} - ${new Date(dateTo).toLocaleDateString('pl-PL')})`}
        </div>
      )}
      
      <div className="w-full h-80 rounded-lg p-2 md:p-4 overflow-visible">
        <RankingChart 
          data={filteredData} 
          playerName={playerName} 
          includeStartingPoint={!dateFrom && !dateTo} 
        />
      </div>
      
      {/* Podsumowanie rankingu */}
      {filteredData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
            <div className="text-xl font-bold text-blue-400">
              {Math.round(filteredData[filteredData.length - 1]?.score) || '0'}
            </div>
            <div className="text-sm text-zinc-400">
              {dateFrom || dateTo ? 'Ranking na koniec zakresu' : 'Obecny ranking'}
            </div>
          </div>
          
          <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
            <div className="text-xl font-bold text-green-400">
              {Math.round(Math.max(...filteredData.map(r => r.score)))}
            </div>
            <div className="text-sm text-zinc-400">
              Najwyższy ranking
            </div>
          </div>
          
          <div className="text-center p-4 bg-zinc-800/30 rounded-lg">
            <div className="text-xl font-bold text-red-400">
              {Math.round(Math.min(...filteredData.map(r => r.score)))}
            </div>
            <div className="text-sm text-zinc-400">
              Najniższy ranking
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default RankingHistorySection;
