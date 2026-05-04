'use client';

import { useState, useMemo, useCallback } from 'react';
import type { RoleRankingStats } from '@/app/dramaafera/_services';
import { getRoleRankingsByDateRange } from '@/app/dramaafera/_actions/roleRankingActions';

interface RoleRankingTableProps {
  roles: RoleRankingStats[];
  seasonId: number;
}

type SortKey = 'totalPoints' | 'gamesPlayed' | 'winRate' | 'averagePoints';

export default function RoleRankingTable({ roles: initialRoles, seasonId }: RoleRankingTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>('totalPoints');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [roles, setRoles] = useState<RoleRankingStats[]>(initialRoles);
  const [isLoading, setIsLoading] = useState(false);

  const handleDateFilter = useCallback(async () => {
    setIsLoading(true);
    try {
      const filteredRoles = await getRoleRankingsByDateRange(seasonId, dateFrom || undefined, dateTo || undefined);
      setRoles(filteredRoles);
    } catch (error) {
      console.error('Błąd ładowania ról:', error);
    } finally {
      setIsLoading(false);
    }
  }, [seasonId, dateFrom, dateTo]);

  const handleReset = useCallback(async () => {
    setDateFrom('');
    setDateTo('');
    setIsLoading(true);
    try {
      const allRoles = await getRoleRankingsByDateRange(seasonId);
      setRoles(allRoles);
    } catch (error) {
      console.error('Błąd ładowania ról:', error);
    } finally {
      setIsLoading(false);
    }
  }, [seasonId]);

  const sortedRoles = useMemo(() => {
    const sorted = [...roles].sort((a, b) => {
      let aVal: number = a[sortBy];
      let bVal: number = b[sortBy];

      if (sortBy === 'winRate') {
        aVal = a.winRate;
        bVal = b.winRate;
      }

      if (sortOrder === 'asc') {
        return aVal - bVal;
      }
      return bVal - aVal;
    });
    return sorted;
  }, [roles, sortBy, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ isActive }: { isActive: boolean }) => {
    if (!isActive) return null;
    return sortOrder === 'asc' ? '▲' : '▼';
  };

  return (
    <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Statystyki ról
          </h2>
          <p className="text-center text-gray-300 mt-4 text-lg">
            Rozkład punktów DAP dla każdej roli
          </p>
        </div>

        {/* Wybór przedziału czasu */}
        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="date-from" className="block text-sm text-gray-300 mb-2">
                Od dnia:
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full p-2 bg-zinc-800 border border-gray-600 rounded text-white"
                disabled={isLoading}
              />
            </div>
            <div className="flex-1">
              <label htmlFor="date-to" className="block text-sm text-gray-300 mb-2">
                Do dnia:
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full p-2 bg-zinc-800 border border-gray-600 rounded text-white"
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDateFilter}
                disabled={isLoading || (!dateFrom && !dateTo)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
              >
                {isLoading ? 'Ładowanie...' : 'Filtruj'}
              </button>
              {(dateFrom || dateTo) && (
                <button
                  onClick={handleReset}
                  disabled={isLoading}
                  className="bg-zinc-700 hover:bg-zinc-600 text-white px-4 py-2 rounded text-sm transition-colors"
                >
                  Resetuj
                </button>
              )}
            </div>
          </div>
          {(dateFrom || dateTo) && (
            <div className="text-center text-sm text-gray-400 mt-4">
              Wyświetlanie: {sortedRoles.length} ról
              {dateFrom && dateTo && ` (${new Date(dateFrom).toLocaleDateString('pl-PL')} - ${new Date(dateTo).toLocaleDateString('pl-PL')})`}
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Pozycja</th>
                  <th className="text-left py-2 px-2 text-yellow-400 font-semibold">Rola</th>
                  <th
                    className="text-center py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none hover:text-yellow-300"
                    onClick={() => handleSort('totalPoints')}
                  >
                    Suma <SortIcon isActive={sortBy === 'totalPoints'} />
                  </th>
                  <th
                    className="text-center py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none hover:text-yellow-300"
                    onClick={() => handleSort('gamesPlayed')}
                  >
                    Gry <SortIcon isActive={sortBy === 'gamesPlayed'} />
                  </th>
                  <th
                    className="text-center py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none hover:text-yellow-300"
                    onClick={() => handleSort('averagePoints')}
                  >
                    Avg <SortIcon isActive={sortBy === 'averagePoints'} />
                  </th>
                  <th
                    className="text-center py-2 px-2 text-yellow-400 font-semibold cursor-pointer select-none hover:text-yellow-300"
                    onClick={() => handleSort('winRate')}
                  >
                    Win Rate <SortIcon isActive={sortBy === 'winRate'} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRoles.map((role, index) => (
                  <tr key={role.name} className="border-b border-gray-700 hover:bg-gray-700/30">
                    <td className="text-left py-3 px-2 text-white font-semibold">{index + 1}</td>
                    <td className="text-left py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: role.color }}
                          title={role.team}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: role.color }}
                        >
                          {role.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-2 text-blue-400 font-semibold">
                      {role.totalPoints.toFixed(1)}
                    </td>
                    <td className="text-center py-3 px-2 text-green-400">
                      {role.gamesPlayed}
                    </td>
                    <td className="text-center py-3 px-2 text-cyan-400">
                      {role.averagePoints.toFixed(2)}
                    </td>
                    <td className="text-center py-3 px-2 text-orange-400">
                      {role.winRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
