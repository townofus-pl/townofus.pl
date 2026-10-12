"use client";

import type { PlayerTopGame } from '../../_services';
import Link from 'next/link';
import { useState } from 'react';
import { loadMoreTopGames } from './topGamesActions';
import { buildSeasonUrl } from '../../_utils/seasonHelpers';

interface TopGamesDisplayProps {
  bestGames: PlayerTopGame[];
  seasonId: number;
  playerName: string;
  hasMore: boolean;
}

export function TopGamesDisplay({ bestGames, seasonId, playerName, hasMore: initialHasMore }: TopGamesDisplayProps) {
  const [games, setGames] = useState(bestGames);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMore = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const result = await loadMoreTopGames(playerName, seasonId, games.length);
      setGames(previous => [...previous, ...result.best]);
      setHasMore(result.hasMore);
    } catch {
      setError('Nie udało się wczytać gier. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatDateForUrl = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 1: return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 2: return 'from-orange-600/20 to-orange-700/20 border-orange-600/50';
      default: return 'from-zinc-800/20 to-zinc-900/20 border-zinc-700/50';
    }
  };

  if (games.length === 0) return null;

  return (
    <div className="space-y-4">
      {games.map((game, index) => (
          <Link
            key={game.gameIdentifier}
            href={buildSeasonUrl(`/historia-gier/${formatDateForUrl(game.date)}/${game.gameIdentifier}`, seasonId)}
            className="block"
          >
            <div className={`bg-gradient-to-r ${getMedalColor(index)} rounded-xl border p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
              <div className="flex items-center gap-4">
                {/* Position */}
                <div className="w-14 text-center text-4xl font-bold tabular-nums flex-shrink-0 mx-0.5">
                  {index + 1}
                </div>

                {/* Game Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-white">
                      {formatDate(game.date)}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span 
                      className="font-semibold"
                      style={{ color: game.roleColor }}
                    >
                      {game.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      {game.win ? (
                        <span className="text-green-400">✓ Wygrana</span>
                      ) : (
                        <span className="text-red-400">✗ Przegrana</span>
                      )}
                    </div>
                    <span className="text-gray-500">•</span>
                    <span>{game.map}</span>
                    <span className="text-gray-500">•</span>
                    <span>{game.duration}</span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="text-gray-400 flex-shrink-0">
                  →
                </div>
              </div>
            </div>
          </Link>
        ))}
      
      <div className="mt-4 text-center text-sm text-gray-400">
        Kliknij aby zobaczyć szczegóły gry
      </div>
      {error && <p role="alert" className="text-center text-sm text-red-400">{error}</p>}
      {hasMore && (
        <button
          type="button"
          onClick={loadMore}
          disabled={loading}
          className="w-full rounded-lg bg-zinc-800 px-4 py-3 font-semibold text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
        >
          {loading ? 'Wczytywanie…' : 'Wczytaj więcej'}
        </button>
      )}
    </div>
  );
}

export default TopGamesDisplay;
