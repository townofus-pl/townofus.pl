"use client";

import { useState, useMemo, useEffect } from 'react';
import type { RankingHistoryPoint } from '../../_services';
import { RankingChart } from '../../_components/RankingChart';
import { loadComparisonRanking } from './rankingHistoryActions';
import { filterRankingHistory } from './filterRankingHistory';
import { RankingComparisonDialog } from './RankingComparisonDialog';
import { getRankingComparisonColor } from '../../_utils/rankingComparisonColors';

interface RankingHistorySectionProps {
  rankingHistory: RankingHistoryPoint[];
  playerName: string;
  seasonId: number;
  playerNames: string[];
}

export function RankingHistorySection({ rankingHistory, playerName, seasonId, playerNames }: RankingHistorySectionProps) {
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [comparisonNames, setComparisonNames] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comparisonHistories, setComparisonHistories] = useState<{ playerName: string; data: RankingHistoryPoint[] }[]>([]);
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setComparisonHistories([]);
    setComparisonError(null);
    setComparisonLoading(comparisonNames.length > 0);
    if (comparisonNames.length > 0) {
      Promise.all(comparisonNames.map(async name => ({ playerName: name, data: await loadComparisonRanking(name, seasonId) })))
        .then(histories => { if (active) setComparisonHistories(histories); })
        .catch(() => { if (active) setComparisonError('Nie udało się wczytać historii graczy. Spróbuj ponownie.'); })
        .finally(() => { if (active) setComparisonLoading(false); });
    }
    return () => { active = false; };
  }, [comparisonNames, seasonId]);

  const filteredComparisons = useMemo(() => comparisonHistories.map(line => ({ ...line, data: filterRankingHistory(line.data, dateFrom, dateTo) })), [comparisonHistories, dateFrom, dateTo]);

  // Filtruj dane na podstawie wybranych dat
  const filteredData = useMemo(() => filterRankingHistory(rankingHistory, dateFrom, dateTo), [rankingHistory, dateFrom, dateTo]);

  // Oblicz zakresy dat dla placeholderów
  const combinedHistory = [...rankingHistory, ...comparisonHistories.flatMap(line => line.data)];
  const minDate = combinedHistory.length > 0
    ? new Date(Math.min(...combinedHistory.map(r => r.date.getTime())))
    : new Date();
  const maxDate = combinedHistory.length > 0
    ? new Date(Math.max(...combinedHistory.map(r => r.date.getTime())))
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
      <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => setDialogOpen(true)} aria-haspopup="dialog"
          className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 rounded-lg px-4 py-2 text-sm transition-colors">
          Porównaj z graczem{comparisonNames.length > 0 ? ` (${comparisonNames.length})` : ''}
        </button>
        {comparisonLoading && <span role="status" className="text-sm text-gray-400">Wczytywanie…</span>}
      </div>
      {dialogOpen && <RankingComparisonDialog playerNames={playerNames.filter(name => name !== playerName)} selected={comparisonNames}
        onClose={() => setDialogOpen(false)} onApply={names => { setComparisonNames(names); setDialogOpen(false); }} />}
      {comparisonError && <p role="alert" className="mb-4 text-center text-sm text-red-400">{comparisonError}</p>}
      {comparisonHistories.filter(line => line.data.length === 0).map(line => (
        <p key={line.playerName} className="mb-4 text-center text-sm text-gray-400">{line.playerName}: brak historii rankingu w tym sezonie.</p>
      ))}
      {filteredComparisons.some(line => line.data.length > 0) && (
        <div className="mb-4 flex flex-wrap justify-center gap-6 text-sm">
          <span className="text-yellow-400">● {playerName}</span>
          {filteredComparisons.filter(line => line.data.length > 0).map((line, index) => (
            <span key={line.playerName} style={{ color: getRankingComparisonColor(index) }}>● {line.playerName}</span>
          ))}
        </div>
      )}
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
          seasonId={seasonId}
          comparison={filteredComparisons}
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
